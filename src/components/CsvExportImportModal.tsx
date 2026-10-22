import React, { useState } from 'react';
import { AedItem } from '../types/aed';
import { X, Download, Upload, RotateCcw, Check } from 'lucide-react';

interface CsvExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  aedList: AedItem[];
  onImportData: (newList: AedItem[]) => void;
  onResetData: () => void;
}

export const CsvExportImportModal: React.FC<CsvExportImportModalProps> = ({
  isOpen,
  onClose,
  aedList,
  onImportData,
  onResetData,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  // Export to CSV with UTF-8 BOM
  const handleExportCsv = () => {
    const headers = [
      '관리번호',
      '설치위치',
      '건물',
      '상품기입날짜(패드)',
      '배터리유효기간',
      '본체유효기간(10년)',
      '보건복지부등록상태',
      '보건복지부등록번호',
      '최근소모품교체일',
      '관리책임자',
      '연락처',
      '모델명',
      '특이사항',
    ];

    const rows = aedList.map((aed) => [
      `"${aed.managementNo}"`,
      `"${aed.location.replace(/"/g, '""')}"`,
      `"${aed.building || ''}"`,
      `"${aed.padExpiryDate}"`,
      `"${aed.batteryExpiryDate}"`,
      `"${aed.bodyExpiryDate}"`,
      `"${aed.mohwStatus === 'registered' ? '등록완료' : aed.mohwStatus === 'pending' ? '심사중' : '미등록'}"`,
      `"${aed.mohwRegNumber || ''}"`,
      `"${aed.lastReplacedDate || ''}"`,
      `"${aed.managerName || ''}"`,
      `"${aed.managerContact || ''}"`,
      `"${aed.modelName || ''}"`,
      `"${(aed.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `AED_소모품_유효기간_관리대장_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON
  const handleExportJson = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(aedList, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `aed_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].managementNo) {
            onImportData(parsed);
            setImportStatus(`성공적으로 ${parsed.length}건의 데이터를 가져왔습니다.`);
            return;
          }
        }
        setImportStatus('JSON 백업 파일을 선택해주세요.');
      } catch (err) {
        setImportStatus('파일 파싱 중 오류가 발생했습니다.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200">
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between shrink-0">
          <h3 className="text-base font-bold text-slate-900">엑셀 내보내기 & 데이터 백업</h3>
          <button
            onClick={onClose}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {importStatus && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-2">데이터 파일 다운로드</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={handleExportCsv}
                className="min-h-[52px] flex items-center justify-center gap-2 p-3 border border-slate-200 rounded-2xl hover:bg-slate-50 active:bg-slate-100 text-xs font-bold text-slate-800 cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="text-left">
                  <div>Excel (CSV) 다운로드</div>
                  <div className="text-[10px] text-slate-500 font-normal">한글 호환 UTF-8 BOM</div>
                </div>
              </button>

              <button
                onClick={handleExportJson}
                className="min-h-[52px] flex items-center justify-center gap-2 p-3 border border-slate-200 rounded-2xl hover:bg-slate-50 active:bg-slate-100 text-xs font-bold text-slate-800 cursor-pointer"
              >
                <Download className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="text-left">
                  <div>전체 JSON 백업 파일</div>
                  <div className="text-[10px] text-slate-500 font-normal">교체 이력 포함 백업</div>
                </div>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 mb-2">백업 파일 불러오기</h4>
            <label className="min-h-[52px] flex items-center justify-center gap-2 p-3.5 border border-dashed border-slate-300 rounded-2xl hover:bg-slate-50 active:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer">
              <Upload className="w-4 h-4 text-slate-500" />
              <span>백업 JSON 파일 업로드</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-slate-900">샘플 데이터로 리셋</h4>
                <p className="text-[10px] text-slate-500">기본 6대 기기 데이터로 복구</p>
              </div>
              <button
                onClick={() => {
                  if (confirm('현재 데이터를 초기 표준 데이터로 초기화하시겠습니까?')) {
                    onResetData();
                    setImportStatus('초기 데이터로 초기화되었습니다.');
                  }
                }}
                className="min-h-[44px] px-3 flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>데이터 초기화</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-3.5 border-t border-slate-200 flex justify-end shrink-0 bg-white">
          <button
            onClick={onClose}
            className="min-h-[44px] w-full sm:w-auto px-6 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
