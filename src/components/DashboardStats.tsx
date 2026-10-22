import React from 'react';
import { AedItem } from '../types/aed';
import { checkAedExpiryHealth } from '../utils/dateUtils';
import { ShieldCheck, BatteryCharging, CheckCircle, ChevronRight } from 'lucide-react';

interface DashboardStatsProps {
  aedList: AedItem[];
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  aedList,
  selectedFilter,
  onSelectFilter,
}) => {
  const currentDate = new Date();

  let needsReplacementCount = 0;
  let normalCount = 0;
  let registeredCount = 0;

  aedList.forEach((aed) => {
    const health = checkAedExpiryHealth(aed, currentDate);
    if (health.needsReplacement) {
      needsReplacementCount++;
    } else {
      normalCount++;
    }

    if (aed.mohwStatus === 'registered') {
      registeredCount++;
    }
  });

  const total = aedList.length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-4 sm:mb-5">
      {/* 1. Total AEDs */}
      <div
        onClick={() => onSelectFilter('all')}
        className={`p-3 bg-white border rounded-2xl transition-all cursor-pointer active:scale-98 ${
          selectedFilter === 'all'
            ? 'border-slate-900 shadow-xs ring-1 ring-slate-900'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="text-[11px] text-slate-500 font-medium mb-0.5">총 관리 AED</div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl sm:text-2xl font-black font-mono tabular-nums text-slate-900">
            {total}
          </span>
          <span className="text-xs text-slate-500">대</span>
        </div>
        <div className="text-[10px] text-slate-400 mt-1 truncate">전체 목록 보기</div>
      </div>

      {/* 2. Needs Replacement (Highlight!) */}
      <div
        onClick={() => onSelectFilter('needs_replacement')}
        className={`p-3 bg-white border rounded-2xl transition-all cursor-pointer active:scale-98 ${
          selectedFilter === 'needs_replacement'
            ? 'border-red-600 shadow-xs ring-1 ring-red-600 bg-red-50/20'
            : 'border-slate-200 hover:border-red-300'
        }`}
      >
        <div className="flex items-center justify-between text-[11px] font-bold mb-0.5">
          <span className="text-red-700">소모품 교체 필요</span>
          <BatteryCharging className="w-3.5 h-3.5 text-red-600" />
        </div>
        <div className="flex items-baseline gap-1">
          <span
            className={`text-xl sm:text-2xl font-black font-mono tabular-nums ${
              needsReplacementCount > 0 ? 'text-red-600' : 'text-slate-900'
            }`}
          >
            {needsReplacementCount}
          </span>
          <span className="text-xs text-red-600 font-semibold">대 (임박/만료)</span>
        </div>
        <div className="text-[10px] text-red-700 font-medium mt-1 truncate">
          {needsReplacementCount > 0 ? '즉시 교체 기록 권장' : '전 기기 양호'}
        </div>
      </div>

      {/* 3. Normal Status */}
      <div
        onClick={() => onSelectFilter('normal')}
        className={`p-3 bg-white border rounded-2xl transition-all cursor-pointer active:scale-98 ${
          selectedFilter === 'normal'
            ? 'border-emerald-600 shadow-xs ring-1 ring-emerald-600'
            : 'border-slate-200 hover:border-emerald-300'
        }`}
      >
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-0.5">
          <span>유효기간 정상</span>
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl sm:text-2xl font-black font-mono tabular-nums text-slate-900">
            {normalCount}
          </span>
          <span className="text-xs text-slate-500">대</span>
        </div>
        <div className="text-[10px] text-emerald-700 font-medium mt-1 truncate">90일 이상 잔여</div>
      </div>

      {/* 4. MOHW Registration */}
      <div
        onClick={() => onSelectFilter('unregistered')}
        className={`p-3 bg-white border rounded-2xl transition-all cursor-pointer active:scale-98 ${
          selectedFilter === 'unregistered'
            ? 'border-blue-600 shadow-xs ring-1 ring-blue-600'
            : 'border-slate-200 hover:border-blue-300'
        }`}
      >
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-0.5">
          <span>보건복지부 등록</span>
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl sm:text-2xl font-black font-mono tabular-nums text-slate-900">
            {registeredCount}
          </span>
          <span className="text-xs text-slate-500">/{total}대</span>
        </div>
        <div className="text-[10px] text-slate-500 mt-1 truncate">
          {total - registeredCount > 0 ? `미등록 ${total - registeredCount}대` : '전체 등록완료'}
        </div>
      </div>
    </div>
  );
};
