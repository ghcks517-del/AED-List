import React, { useState, useEffect } from 'react';
import { AedItem, MohwRegistrationStatus } from '../types/aed';
import { X, Save, AlertCircle } from 'lucide-react';
import { getTodayDateString, getYearMonthPlusYears, toYearMonthString } from '../utils/dateUtils';

interface AedFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (aedData: Omit<AedItem, 'id' | 'replacementHistory'>, editId?: string) => void;
  editingAed?: AedItem | null;
  existingManagementNos: string[];
}

export const AedFormModal: React.FC<AedFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingAed,
  existingManagementNos,
}) => {
  const [managementNo, setManagementNo] = useState('');
  const [location, setLocation] = useState('');
  const [building, setBuilding] = useState('본관');
  const [bodyExpiryDate, setBodyExpiryDate] = useState('');
  const [batteryExpiryDate, setBatteryExpiryDate] = useState('');
  const [padExpiryDate, setPadExpiryDate] = useState('');
  const [mohwStatus, setMohwStatus] = useState<MohwRegistrationStatus>('registered');
  const [mohwRegNumber, setMohwRegNumber] = useState('');
  const [modelName, setModelName] = useState('메디아나 HeartOn A15');
  const [managerName, setManagerName] = useState('안전관리자');
  const [managerContact, setManagerContact] = useState('');
  const [notes, setNotes] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (editingAed) {
      setManagementNo(editingAed.managementNo);
      setLocation(editingAed.location);
      setBuilding(editingAed.building || '본관');
      setBodyExpiryDate(toYearMonthString(editingAed.bodyExpiryDate));
      setBatteryExpiryDate(toYearMonthString(editingAed.batteryExpiryDate));
      setPadExpiryDate(toYearMonthString(editingAed.padExpiryDate));
      setMohwStatus(editingAed.mohwStatus);
      setMohwRegNumber(editingAed.mohwRegNumber || '');
      setModelName(editingAed.modelName || '메디아나 HeartOn A15');
      setManagerName(editingAed.managerName || '안전관리자');
      setManagerContact(editingAed.managerContact || '');
      setNotes(editingAed.notes || '');
    } else {
      const count = existingManagementNos.length + 1;
      setManagementNo(`AED-${String(count).padStart(2, '0')}`);
      setLocation('');
      setBuilding('본관');
      setPadExpiryDate(getYearMonthPlusYears(2));
      setBatteryExpiryDate(getYearMonthPlusYears(4));
      setBodyExpiryDate(getYearMonthPlusYears(10));
      setMohwStatus('registered');
      setMohwRegNumber(`MOHW-2026-AED-${String(count).padStart(4, '0')}`);
      setModelName('메디아나 HeartOn A15');
      setManagerName('안전관리자');
      setManagerContact('02-1234-5670');
      setNotes('');
    }
    setErrorMsg(null);
  }, [editingAed, isOpen, existingManagementNos.length]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Mandatory Checks
    if (!managementNo.trim()) {
      setErrorMsg('AED 관리번호는 필수 입력 항목입니다. (예: AED-01)');
      return;
    }
    if (!location.trim()) {
      setErrorMsg('설치위치는 필수 입력 항목입니다. (예: 본관 1층 로비)');
      return;
    }
    if (!bodyExpiryDate) {
      setErrorMsg('본체 유효기간(10년, 년·월)을 입력해주세요.');
      return;
    }
    if (!batteryExpiryDate) {
      setErrorMsg('배터리 유효기간(년·월)을 입력해주세요.');
      return;
    }
    if (!padExpiryDate) {
      setErrorMsg('패드 유효기간(상품 기입 날짜, 년·월)을 입력해주세요.');
      return;
    }

    const isDuplicate = existingManagementNos.some(
      (no) => no.toLowerCase() === managementNo.trim().toLowerCase() && (!editingAed || editingAed.managementNo !== no)
    );
    if (isDuplicate) {
      setErrorMsg(`관리번호 '${managementNo}'는 이미 등록되어 있습니다.`);
      return;
    }

    onSubmit(
      {
        managementNo: managementNo.trim(),
        location: location.trim(),
        building,
        bodyExpiryDate: toYearMonthString(bodyExpiryDate),
        batteryExpiryDate: toYearMonthString(batteryExpiryDate),
        padExpiryDate: toYearMonthString(padExpiryDate),
        mohwStatus,
        mohwRegNumber: mohwStatus === 'registered' ? mohwRegNumber.trim() : '',
        modelName: modelName.trim(),
        managerName: managerName.trim() || '관리자',
        managerContact: managerContact.trim(),
        lastReplacedDate: editingAed ? editingAed.lastReplacedDate : getTodayDateString(),
        notes: notes.trim(),
      },
      editingAed ? editingAed.id : undefined
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200">
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {editingAed ? 'AED 정보 수정' : '신규 AED 기기 등록'}
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              유효기간은 년, 월 단위까지만 기입합니다 (Firebase 실시간 연동)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-medium shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Section 1: Mandatory Fields */}
          <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl space-y-3.5">
            <div className="text-xs font-bold text-red-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              <span>필수 기입 사항 (6대 항목)</span>
            </div>

            {/* 1. 관리번호 & 보건복지부 등록여부 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  AED 관리번호 <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: AED-01"
                  value={managementNo}
                  onChange={(e) => setManagementNo(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-red-600 min-h-[42px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  보건복지부 등록 여부 <span className="text-red-600">*</span>
                </label>
                <select
                  value={mohwStatus}
                  onChange={(e) => setMohwStatus(e.target.value as MohwRegistrationStatus)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl cursor-pointer min-h-[42px] font-semibold"
                >
                  <option value="registered">등록 완료</option>
                  <option value="unregistered">미등록 (신규)</option>
                  <option value="pending">심사진행 중</option>
                </select>
              </div>
            </div>

            {/* 2. 설치위치 */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                설치위치 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="예: 본관 1층 로비 안내데스크 옆"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-600 min-h-[42px]"
              />
            </div>

            {/* 3. 3대 유효기간 (년·월 단위 type="month") */}
            <div className="pt-2 border-t border-red-100">
              <span className="text-xs font-bold text-slate-800 block mb-2">
                소모품 및 본체 유효기간 (년·월 단위) <span className="text-red-600">*</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 패드 (상품 기입 날짜) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      상품 기입 날짜 (패드) <span className="text-red-600">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setPadExpiryDate(getYearMonthPlusYears(2))}
                      className="text-[10px] text-red-600 font-semibold"
                    >
                      +2년
                    </button>
                  </div>
                  <input
                    type="month"
                    required
                    value={padExpiryDate}
                    onChange={(e) => setPadExpiryDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-xl font-mono min-h-[40px]"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">패드 포장 표기일 (YYYY-MM)</span>
                </div>

                {/* 배터리 */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      배터리 유효기간 <span className="text-red-600">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setBatteryExpiryDate(getYearMonthPlusYears(4))}
                      className="text-[10px] text-red-600 font-semibold"
                    >
                      +4년
                    </button>
                  </div>
                  <input
                    type="month"
                    required
                    value={batteryExpiryDate}
                    onChange={(e) => setBatteryExpiryDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-xl font-mono min-h-[40px]"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">YYYY-MM</span>
                </div>

                {/* 본체 (10년) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      본체 유효기간 (10년) <span className="text-red-600">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setBodyExpiryDate(getYearMonthPlusYears(10))}
                      className="text-[10px] text-red-600 font-semibold"
                    >
                      +10년
                    </button>
                  </div>
                  <input
                    type="month"
                    required
                    value={bodyExpiryDate}
                    onChange={(e) => setBodyExpiryDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-xl font-mono min-h-[40px]"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">내구연수 10년 (YYYY-MM)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Supplementary Info */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">건물구분</label>
                <input
                  type="text"
                  placeholder="예: 본관, 연구동, 공장"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl min-h-[40px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">모델명</label>
                <input
                  type="text"
                  placeholder="예: 메디아나 A15"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl min-h-[40px]"
                />
              </div>
            </div>

            {mohwStatus === 'registered' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  보건복지부 등록번호
                </label>
                <input
                  type="text"
                  placeholder="예: MOHW-2024-AED-0104"
                  value={mohwRegNumber}
                  onChange={(e) => setMohwRegNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono min-h-[40px]"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">관리책임자</label>
                <input
                  type="text"
                  placeholder="담당자 이름"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl min-h-[40px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">연락처</label>
                <input
                  type="text"
                  placeholder="연락처"
                  value={managerContact}
                  onChange={(e) => setManagerContact(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl min-h-[40px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">메모</label>
              <input
                type="text"
                placeholder="비고 메모"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl min-h-[40px]"
              />
            </div>
          </div>

          {/* Sticky Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5 sticky bottom-0 bg-white py-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="min-h-[44px] flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-6 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs cursor-pointer active:scale-98"
            >
              <Save className="w-4 h-4" />
              <span>{editingAed ? '수정사항 저장' : '등록 완료 (Firebase)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
