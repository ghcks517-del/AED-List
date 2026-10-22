import React, { useState, useMemo } from 'react';
import { AedItem } from '../types/aed';
import { calculateExpiryYM, formatDDay, checkAedExpiryHealth, formatYearMonth } from '../utils/dateUtils';
import {
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  AlertCircle,
  MapPin,
  CheckCircle2,
  ShieldAlert,
  History,
} from 'lucide-react';

interface AedTableProps {
  aedList: AedItem[];
  onOpenReplaceModal: (aed: AedItem) => void;
  onOpenHistoryModal: (aed?: AedItem) => void;
  onEditAed: (aed: AedItem) => void;
  onDeleteAed: (aedId: string) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  isLoading?: boolean;
}

export const AedTable: React.FC<AedTableProps> = ({
  aedList,
  onOpenReplaceModal,
  onOpenHistoryModal,
  onEditAed,
  onDeleteAed,
  activeFilter,
  setActiveFilter,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const currentDate = new Date();

  // Filter list
  const filteredList = useMemo(() => {
    return aedList.filter((aed) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          aed.managementNo.toLowerCase().includes(q) ||
          aed.location.toLowerCase().includes(q) ||
          (aed.building && aed.building.toLowerCase().includes(q)) ||
          (aed.modelName && aed.modelName.toLowerCase().includes(q));
        if (!match) return false;
      }

      const health = checkAedExpiryHealth(aed, currentDate);
      if (activeFilter === 'needs_replacement') {
        return health.needsReplacement;
      }
      if (activeFilter === 'normal') {
        return !health.needsReplacement;
      }
      if (activeFilter === 'unregistered') {
        return aed.mohwStatus !== 'registered';
      }

      return true;
    });
  }, [aedList, searchQuery, activeFilter]);

  const needsReplaceCount = useMemo(() => {
    return aedList.filter((a) => checkAedExpiryHealth(a, currentDate).needsReplacement).length;
  }, [aedList]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
      {/* Top Search & Filter Bar */}
      <div className="p-3 sm:p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="관리번호 또는 설치위치 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-colors min-h-[42px]"
          />
        </div>

        {/* Filter Segmented Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer min-h-[36px] ${
              activeFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            전체 ({aedList.length})
          </button>
          <button
            onClick={() => setActiveFilter('needs_replacement')}
            className={`px-3 py-1.5 font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer min-h-[36px] ${
              activeFilter === 'needs_replacement'
                ? 'bg-white text-red-600 shadow-xs'
                : 'text-slate-600 hover:text-red-600'
            }`}
          >
            교체 필요 ({needsReplaceCount})
          </button>
          <button
            onClick={() => setActiveFilter('normal')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer min-h-[36px] ${
              activeFilter === 'normal'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            정상 ({aedList.length - needsReplaceCount})
          </button>
          <button
            onClick={() => setActiveFilter('unregistered')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer min-h-[36px] ${
              activeFilter === 'unregistered'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-blue-700'
            }`}
          >
            미등록
          </button>
        </div>
      </div>

      {/* MOBILE LIST VIEW (< md): Simple, uncluttered touch cards with Year-Month */}
      <div className="block md:hidden divide-y divide-slate-100">
        {isLoading ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            Firebase 클라우드 데이터 불러오는 중...
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-12 px-4 text-center text-slate-500">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700 text-sm">해당하는 AED가 없습니다.</p>
          </div>
        ) : (
          filteredList.map((aed) => {
            const pad = calculateExpiryYM(aed.padExpiryDate, currentDate);
            const battery = calculateExpiryYM(aed.batteryExpiryDate, currentDate);
            const body = calculateExpiryYM(aed.bodyExpiryDate, currentDate);
            const health = checkAedExpiryHealth(aed, currentDate);

            return (
              <div key={aed.id} className="p-4 hover:bg-slate-50 transition-colors">
                {/* 1. Header: Management No, Location, MOHW */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-lg font-black text-red-600 tracking-tight">
                        {aed.managementNo}
                      </span>
                      {health.isExpired ? (
                        <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                          만료 소모품 있음
                        </span>
                      ) : health.needsReplacement ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                          만료 임박
                        </span>
                      ) : null}
                    </div>
                    <div className="text-xs font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{aed.location}</span>
                    </div>
                  </div>

                  {/* MOHW */}
                  <div className="shrink-0 text-right">
                    {aed.mohwStatus === 'registered' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>복지부 등록</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        <ShieldAlert className="w-3 h-3" />
                        <span>미등록</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. 3 Consumable Expiration Grid (Year-Month Level) */}
                <div className="grid grid-cols-3 gap-1.5 p-2.5 bg-slate-50 rounded-xl mb-3 text-center">
                  {/* Pad */}
                  <div className="border-r border-slate-200 pr-1">
                    <span className="text-[10px] text-slate-500 font-medium block">상품 기입 날짜(패드)</span>
                    <span
                      className={`text-xs font-mono font-black block mt-0.5 ${
                        pad.status === 'expired'
                          ? 'text-red-600'
                          : pad.status === 'warning'
                          ? 'text-amber-600'
                          : 'text-slate-800'
                      }`}
                    >
                      {formatDDay(pad.daysLeft)}
                    </span>
                    <span className="text-[11px] font-bold text-slate-700 block">
                      {pad.formattedDate}
                    </span>
                  </div>

                  {/* Battery */}
                  <div className="border-r border-slate-200 pr-1">
                    <span className="text-[10px] text-slate-500 font-medium block">배터리 유효기간</span>
                    <span
                      className={`text-xs font-mono font-black block mt-0.5 ${
                        battery.status === 'expired'
                          ? 'text-red-600'
                          : battery.status === 'warning'
                          ? 'text-amber-600'
                          : 'text-slate-800'
                      }`}
                    >
                      {formatDDay(battery.daysLeft)}
                    </span>
                    <span className="text-[11px] font-bold text-slate-700 block">
                      {battery.formattedDate}
                    </span>
                  </div>

                  {/* Main Body */}
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block">본체 유효기간(10년)</span>
                    <span className="text-xs font-mono font-bold text-slate-800 block mt-0.5">
                      {formatDDay(body.daysLeft)}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-700 block">
                      {body.formattedDate}
                    </span>
                  </div>
                </div>

                {/* 3. Actions Row */}
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => onOpenReplaceModal(aed)}
                    className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>소모품 교체 기록</span>
                  </button>

                  <button
                    onClick={() => onOpenHistoryModal(aed)}
                    className="min-h-[44px] px-3 flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                    title="교체 이력"
                  >
                    <History className="w-4 h-4 text-slate-500" />
                    <span className="text-[11px]">이력 ({aed.replacementHistory?.length || 0})</span>
                  </button>

                  <button
                    onClick={() => onEditAed(aed)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl cursor-pointer"
                    title="정보 수정"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteAed(aed.id)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-xl cursor-pointer"
                    title="기기 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP TABLE VIEW (>= md): Clear inventory table with Year-Month */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-xs font-semibold border-b border-slate-200">
              <th className="py-3 px-4 whitespace-nowrap">관리번호</th>
              <th className="py-3 px-4 min-w-[180px]">설치위치</th>
              <th className="py-3 px-3 text-center whitespace-nowrap">보건복지부 등록</th>
              <th className="py-3 px-3 whitespace-nowrap">상품 기입 날짜(패드)</th>
              <th className="py-3 px-3 whitespace-nowrap">배터리 유효기간(년·월)</th>
              <th className="py-3 px-3 whitespace-nowrap">본체 유효기간(10년)</th>
              <th className="py-3 px-3 whitespace-nowrap">최근 교체일</th>
              <th className="py-3 px-4 text-right whitespace-nowrap">소모품 관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500 text-xs">
                  Firebase 실시간 데이터 로딩 중...
                </td>
              </tr>
            ) : filteredList.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">해당하는 AED가 없습니다.</p>
                </td>
              </tr>
            ) : (
              filteredList.map((aed) => {
                const pad = calculateExpiryYM(aed.padExpiryDate, currentDate);
                const battery = calculateExpiryYM(aed.batteryExpiryDate, currentDate);
                const body = calculateExpiryYM(aed.bodyExpiryDate, currentDate);

                return (
                  <tr key={aed.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* 관리번호 */}
                    <td className="py-3.5 px-4 font-mono font-black text-red-600 text-base whitespace-nowrap">
                      {aed.managementNo}
                    </td>

                    {/* 설치위치 */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{aed.location}</div>
                      {aed.building && (
                        <div className="text-xs text-slate-500 mt-0.5">{aed.building}</div>
                      )}
                    </td>

                    {/* 보건복지부 등록 여부 */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      {aed.mohwStatus === 'registered' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>등록완료</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>미등록</span>
                        </span>
                      )}
                    </td>

                    {/* 패드 유효기간 */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-mono text-xs tabular-nums text-slate-900 font-bold">
                        {pad.formattedDate}
                      </div>
                      <div
                        className={`text-[11px] font-mono font-bold mt-0.5 ${
                          pad.status === 'expired'
                            ? 'text-red-700'
                            : pad.status === 'warning'
                            ? 'text-amber-700'
                            : 'text-slate-500'
                        }`}
                      >
                        {formatDDay(pad.daysLeft)}
                      </div>
                    </td>

                    {/* 배터리 유효기간 */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-mono text-xs tabular-nums text-slate-900 font-bold">
                        {battery.formattedDate}
                      </div>
                      <div
                        className={`text-[11px] font-mono font-bold mt-0.5 ${
                          battery.status === 'expired'
                            ? 'text-red-700'
                            : battery.status === 'warning'
                            ? 'text-amber-700'
                            : 'text-slate-500'
                        }`}
                      >
                        {formatDDay(battery.daysLeft)}
                      </div>
                    </td>

                    {/* 본체 유효기간 */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-mono text-xs tabular-nums text-slate-900">
                        {body.formattedDate}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                        {formatDDay(body.daysLeft)}
                      </div>
                    </td>

                    {/* 최근 교체일 */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-xs font-mono text-slate-600">
                      {aed.lastReplacedDate || '-'}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenReplaceModal(aed)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>소모품 교체</span>
                        </button>
                        <button
                          onClick={() => onOpenHistoryModal(aed)}
                          title="교체 이력"
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditAed(aed)}
                          title="수정"
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteAed(aed.id)}
                          title="삭제"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer bar */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
        <span>총 {aedList.length}대 중 {filteredList.length}대 표시</span>
        <button
          onClick={() => onOpenHistoryModal()}
          className="text-xs font-semibold text-slate-700 hover:text-slate-900 underline cursor-pointer"
        >
          전체 교체 이력 보기
        </button>
      </div>
    </div>
  );
};
