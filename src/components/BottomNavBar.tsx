import React from 'react';
import { ListFilter, AlertTriangle, Plus, History, Download } from 'lucide-react';

interface BottomNavBarProps {
  onOpenCreate: () => void;
  onOpenHistory: () => void;
  onOpenCsv: () => void;
  onFilterAll: () => void;
  onFilterNeedsReplacement: () => void;
  warningCount: number;
  activeFilter: string;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  onOpenCreate,
  onOpenHistory,
  onOpenCsv,
  onFilterAll,
  onFilterNeedsReplacement,
  warningCount,
  activeFilter,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1.5">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center">
        {/* 1. All List */}
        <button
          onClick={onFilterAll}
          className={`min-h-[48px] flex flex-col items-center justify-center transition-colors cursor-pointer ${
            activeFilter === 'all' ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <ListFilter className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">전체목록</span>
        </button>

        {/* 2. Needs Replacement Filter */}
        <button
          onClick={onFilterNeedsReplacement}
          className={`min-h-[48px] flex flex-col items-center justify-center relative transition-colors cursor-pointer ${
            activeFilter === 'needs_replacement' ? 'text-red-600 font-bold' : 'text-slate-500 hover:text-red-600'
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">교체필요</span>
          {warningCount > 0 && (
            <span className="absolute top-1.5 right-3 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white" />
          )}
        </button>

        {/* 3. Center FAB: Register New AED */}
        <div className="flex items-center justify-center">
          <button
            onClick={onOpenCreate}
            className="w-12 h-12 rounded-full bg-red-600 text-white shadow-md active:scale-95 flex items-center justify-center transition-transform cursor-pointer -mt-4 border-4 border-white"
            aria-label="신규 AED 등록"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* 4. Replacement History */}
        <button
          onClick={onOpenHistory}
          className="min-h-[48px] flex flex-col items-center justify-center text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">교체이력</span>
        </button>

        {/* 5. CSV / Backup */}
        <button
          onClick={onOpenCsv}
          className="min-h-[48px] flex flex-col items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <Download className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">엑셀저장</span>
        </button>
      </div>
    </div>
  );
};
