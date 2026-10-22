import React from 'react';
import { HeartPulse, Plus, History, Download, AlertTriangle, CloudCheck } from 'lucide-react';

interface HeaderProps {
  onOpenCreateModal: () => void;
  onOpenHistoryModal: () => void;
  onOpenCsvModal: () => void;
  warningCount: number;
  onFilterWarnings: () => void;
  isFirebaseConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCreateModal,
  onOpenHistoryModal,
  onOpenCsvModal,
  warningCount,
  onFilterWarnings,
  isFirebaseConnected = true,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between gap-3 h-14 sm:h-16">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-tight">
                  사내 AED 소모품 관리
                </span>
                {isFirebaseConnected && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                    <span>Firebase 연동</span>
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-medium hidden sm:block">
                패드·배터리 유효기간(년·월) 및 교체 기록
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-5 text-xs font-bold text-slate-600">
            <button
              onClick={onOpenHistoryModal}
              className="hover:text-slate-900 transition-colors flex items-center gap-1.5 cursor-pointer py-1"
            >
              <History className="w-4 h-4 text-slate-400" />
              <span>소모품 교체 이력</span>
            </button>
            <button
              onClick={onOpenCsvModal}
              className="hover:text-slate-900 transition-colors flex items-center gap-1.5 cursor-pointer py-1"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>엑셀(CSV) 다운로드</span>
            </button>
          </nav>

          {/* Action buttons (Desktop only; mobile uses BottomNavBar) */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {warningCount > 0 && (
              <button
                onClick={onFilterWarnings}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors cursor-pointer min-h-[38px]"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                <span>교체필요 {warningCount}</span>
              </button>
            )}

            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors cursor-pointer min-h-[38px] active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>AED 등록</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
