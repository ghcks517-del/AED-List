import React, { useState } from 'react';
import { AedItem, ReplacementRecord } from '../types/aed';
import { formatYearMonth } from '../utils/dateUtils';
import { X, History, Layers, Battery, RefreshCw, ArrowRight, Search } from 'lucide-react';

interface ReplacementHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  aedList: AedItem[];
  selectedAedId?: string | null;
}

export const ReplacementHistoryModal: React.FC<ReplacementHistoryModalProps> = ({
  isOpen,
  onClose,
  aedList,
  selectedAedId,
}) => {
  const [filterAedId, setFilterAedId] = useState<string>(selectedAedId || 'all');
  const [searchWorker, setSearchWorker] = useState('');

  if (!isOpen) return null;

  // Flatten all replacement logs with their parent AED info
  const allLogs: Array<{ aed: AedItem; record: ReplacementRecord }> = [];

  aedList.forEach((aed) => {
    if (aed.replacementHistory) {
      aed.replacementHistory.forEach((record) => {
        allLogs.push({ aed, record });
      });
    }
  });

  // Sort descending by date
  allLogs.sort((a, b) => new Date(b.record.date).getTime() - new Date(a.record.date).getTime());

  // Filter
  const filtered = allLogs.filter(({ aed, record }) => {
    if (filterAedId !== 'all' && aed.id !== filterAedId) return false;
    if (searchWorker.trim()) {
      const q = searchWorker.toLowerCase();
      const match =
        record.worker.toLowerCase().includes(q) ||
        (record.notes && record.notes.toLowerCase().includes(q)) ||
        aed.managementNo.toLowerCase().includes(q) ||
        aed.location.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200">
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">소모품 교체 및 갱신 이력</h3>
              <p className="text-[11px] text-slate-500">Firebase 실시간 동기화 기록 (년·월 단위 유효기간)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-3 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center gap-2 shrink-0">
          <div className="w-full sm:w-1/2">
            <select
              value={filterAedId}
              onChange={(e) => setFilterAedId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none min-h-[40px] font-semibold text-slate-800"
            >
              <option value="all">전체 기기 교체 이력 ({allLogs.length}건)</option>
              {aedList.map((aed) => (
                <option key={aed.id} value={aed.id}>
                  {aed.managementNo} ({aed.location})
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-1/2 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="작업자 성명 또는 비고 검색..."
              value={searchWorker}
              onChange={(e) => setSearchWorker(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none min-h-[40px]"
            />
          </div>
        </div>

        {/* History List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              기록된 교체 이력이 없습니다.
            </div>
          ) : (
            filtered.map(({ aed, record }) => (
              <div
                key={record.id}
                className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:border-slate-300 transition-colors"
              >
                {/* Header row: AED No + Replace Date */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-red-600">
                      {aed.managementNo}
                    </span>
                    <span className="text-xs text-slate-600 font-medium truncate max-w-[200px]">
                      {aed.location}
                    </span>
                  </div>

                  <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {record.date} 교체
                  </span>
                </div>

                {/* Replaced item and Expiry comparison */}
                <div className="p-2.5 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      {record.itemType === 'pad' ? (
                        <>
                          <Layers className="w-3.5 h-3.5 text-emerald-600" />
                          <span>패드 유효기간 갱신</span>
                        </>
                      ) : record.itemType === 'battery' ? (
                        <>
                          <Battery className="w-3.5 h-3.5 text-blue-600" />
                          <span>배터리 유효기간 갱신</span>
                        </>
                      ) : record.itemType === 'both' ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                          <span>패드 & 배터리 일괄 갱신</span>
                        </>
                      ) : (
                        <span>본체 유효기간 갱신</span>
                      )}
                    </span>
                    <span className="text-slate-500 text-[11px]">작업자: <strong>{record.worker}</strong></span>
                  </div>

                  <div className="flex items-center gap-2 text-xs pt-1 border-t border-slate-200/60">
                    <span className="text-slate-400 line-through">{formatYearMonth(record.previousExpiryDate)}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-emerald-700">{formatYearMonth(record.newExpiryDate)}</span>
                  </div>

                  {record.batteryNewExpiry && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="text-[11px] text-slate-500">배터리:</span>
                      <span className="text-slate-400 line-through">{formatYearMonth(record.batteryPreviousExpiry || '')}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="font-bold text-blue-700">{formatYearMonth(record.batteryNewExpiry)}</span>
                    </div>
                  )}
                </div>

                {/* Notes (if present) */}
                {record.notes && (
                  <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
                    <span className="text-slate-400 font-medium">비고:</span>
                    <span className="text-slate-600">{record.notes}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-200 flex justify-end shrink-0 bg-white">
          <button
            onClick={onClose}
            className="min-h-[44px] px-6 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
