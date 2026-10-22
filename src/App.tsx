import React, { useState, useEffect } from 'react';
import { AedItem, ConsumableType, ReplacementRecord } from './types/aed';
import { INITIAL_AED_LIST } from './data/initialAedData';
import { checkAedExpiryHealth } from './utils/dateUtils';
import {
  subscribeToAeds,
  saveAedToFirestore,
  deleteAedFromFirestore,
  seedInitialAedsIfEmpty,
  testFirestoreConnection,
} from './lib/firebase';
import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { AedTable } from './components/AedTable';
import { ConsumableReplaceModal } from './components/ConsumableReplaceModal';
import { ReplacementHistoryModal } from './components/ReplacementHistoryModal';
import { AedFormModal } from './components/AedFormModal';
import { CsvExportImportModal } from './components/CsvExportImportModal';
import { BottomNavBar } from './components/BottomNavBar';
import { Cloud } from 'lucide-react';

const STORAGE_KEY = 'corporate_aed_consumables_v2';

export default function App() {
  const [aedList, setAedList] = useState<AedItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse AED data from localStorage', e);
    }
    return INITIAL_AED_LIST;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isFirebaseLive, setIsFirebaseLive] = useState(true);

  // Filter state
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Modals state
  const [replacingAed, setReplacingAed] = useState<AedItem | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyTargetAedId, setHistoryTargetAedId] = useState<string | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAed, setEditingAed] = useState<AedItem | null>(null);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  // 1. Initial Firestore connection & Realtime listener setup
  useEffect(() => {
    testFirestoreConnection();

    // Check & seed if empty
    seedInitialAedsIfEmpty(INITIAL_AED_LIST);

    // Subscribe to real-time changes
    const unsubscribe = subscribeToAeds(
      (items) => {
        if (items.length > 0) {
          setAedList(items);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
          } catch (e) {
            // ignore
          }
        }
        setIsLoading(false);
        setIsFirebaseLive(true);
      },
      (error) => {
        console.warn('Firebase sync error, falling back to local cache:', error);
        setIsFirebaseLive(false);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const currentDate = new Date();
  const warningCount = aedList.filter(
    (a) => checkAedExpiryHealth(a, currentDate).needsReplacement
  ).length;

  // Handle consumable replacement submission (Realtime Firestore + Local cache)
  const handleConsumableReplacement = async (
    aedId: string,
    itemType: ConsumableType,
    newPadExpiry: string,
    newBatteryExpiry: string,
    newBodyExpiry: string,
    record: Omit<ReplacementRecord, 'id'>
  ) => {
    const newRecord: ReplacementRecord = {
      ...record,
      id: `rep-${Date.now()}`,
    };

    const target = aedList.find((a) => a.id === aedId);
    if (!target) return;

    const updatedAed: AedItem = {
      ...target,
      padExpiryDate: newPadExpiry,
      batteryExpiryDate: newBatteryExpiry,
      bodyExpiryDate: newBodyExpiry,
      lastReplacedDate: record.date,
      replacementHistory: [newRecord, ...(target.replacementHistory || [])],
    };

    // Optimistic UI update
    setAedList((prev) => prev.map((item) => (item.id === aedId ? updatedAed : item)));

    // Save to Firestore
    await saveAedToFirestore(updatedAed);
  };

  // Handle AED Create or Edit
  const handleSaveAed = async (
    data: Omit<AedItem, 'id' | 'replacementHistory'>,
    editId?: string
  ) => {
    let savedItem: AedItem;

    if (editId) {
      const existing = aedList.find((a) => a.id === editId);
      savedItem = {
        ...(existing || {}),
        ...data,
        id: editId,
        replacementHistory: existing?.replacementHistory || [],
      };
      setAedList((prev) => prev.map((item) => (item.id === editId ? savedItem : item)));
    } else {
      const newId = `aed-${Date.now()}`;
      savedItem = {
        ...data,
        id: newId,
        replacementHistory: [],
      };
      setAedList((prev) => [savedItem, ...prev]);
    }

    setIsFormModalOpen(false);
    setEditingAed(null);

    // Save to Firestore
    await saveAedToFirestore(savedItem);
  };

  // Handle Delete
  const handleDeleteAed = async (aedId: string) => {
    const target = aedList.find((a) => a.id === aedId);
    if (!target) return;
    if (confirm(`'${target.managementNo}' (${target.location}) 기기를 삭제하시겠습니까?`)) {
      setAedList((prev) => prev.filter((a) => a.id !== aedId));
      await deleteAedFromFirestore(aedId);
    }
  };

  const handleOpenHistory = (targetAed?: AedItem) => {
    setHistoryTargetAedId(targetAed ? targetAed.id : null);
    setIsHistoryModalOpen(true);
  };

  // Handle Import or Reset
  const handleImportData = async (newList: AedItem[]) => {
    setAedList(newList);
    for (const item of newList) {
      await saveAedToFirestore(item);
    }
  };

  const handleResetData = async () => {
    setAedList(INITIAL_AED_LIST);
    for (const item of INITIAL_AED_LIST) {
      await saveAedToFirestore(item);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 1. Header */}
      <Header
        onOpenCreateModal={() => {
          setEditingAed(null);
          setIsFormModalOpen(true);
        }}
        onOpenHistoryModal={() => handleOpenHistory()}
        onOpenCsvModal={() => setIsCsvModalOpen(true)}
        warningCount={warningCount}
        onFilterWarnings={() => setActiveFilter('needs_replacement')}
        isFirebaseConnected={isFirebaseLive}
      />

      {/* 2. Main Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24 md:pb-8">
        {/* 3. Simple Expiry Overview KPI */}
        <DashboardStats
          aedList={aedList}
          selectedFilter={activeFilter}
          onSelectFilter={(filter) => setActiveFilter(filter)}
        />

        {/* 4. AED Simple List Table with Year-Month Precision */}
        <AedTable
          aedList={aedList}
          onOpenReplaceModal={(aed) => setReplacingAed(aed)}
          onOpenHistoryModal={(aed) => handleOpenHistory(aed)}
          onEditAed={(aed) => {
            setEditingAed(aed);
            setIsFormModalOpen(true);
          }}
          onDeleteAed={handleDeleteAed}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          isLoading={isLoading}
        />
      </main>

      {/* 5. Desktop Footer */}
      <footer className="hidden md:block mt-auto border-t border-slate-200 bg-white py-4">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>사내 AED 소모품(패드·배터리) 유효기간 이력관리</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <Cloud className="w-3.5 h-3.5" />
              <span>Firebase Firestore 실시간 클라우드 연동</span>
            </span>
          </div>
          <span>응급의료에 관한 법률 준수</span>
        </div>
      </footer>

      {/* 6. Mobile Bottom Navigation */}
      <BottomNavBar
        onOpenCreate={() => {
          setEditingAed(null);
          setIsFormModalOpen(true);
        }}
        onOpenHistory={() => handleOpenHistory()}
        onOpenCsv={() => setIsCsvModalOpen(true)}
        onFilterAll={() => setActiveFilter('all')}
        onFilterNeedsReplacement={() => setActiveFilter('needs_replacement')}
        warningCount={warningCount}
        activeFilter={activeFilter}
      />

      {/* Modals */}
      {/* 1. Consumable Replace & Expiry Renewal Modal (Year-Month) */}
      <ConsumableReplaceModal
        aed={replacingAed}
        isOpen={!!replacingAed}
        onClose={() => setReplacingAed(null)}
        onSubmitReplacement={handleConsumableReplacement}
      />

      {/* 2. Replacement History Timeline Modal */}
      <ReplacementHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setHistoryTargetAedId(null);
        }}
        aedList={aedList}
        selectedAedId={historyTargetAedId}
      />

      {/* 3. Register / Edit AED Modal (Year-Month) */}
      <AedFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingAed(null);
        }}
        onSubmit={handleSaveAed}
        editingAed={editingAed}
        existingManagementNos={aedList.map((a) => a.managementNo)}
      />

      {/* 4. CSV & JSON Export / Import Modal */}
      <CsvExportImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        aedList={aedList}
        onImportData={handleImportData}
        onResetData={handleResetData}
      />
    </div>
  );
}
