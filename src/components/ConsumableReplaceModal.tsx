import React, { useState, useEffect } from 'react';
import { AedItem, ConsumableType, ReplacementRecord } from '../types/aed';
import { getTodayDateString, getYearMonthPlusYears, formatYearMonth, toYearMonthString } from '../utils/dateUtils';
import { X, RefreshCw, Layers, Battery, Save, CheckCircle2 } from 'lucide-react';

interface ConsumableReplaceModalProps {
  aed: AedItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitReplacement: (
    aedId: string,
    itemType: ConsumableType,
    newPadExpiry: string,
    newBatteryExpiry: string,
    newBodyExpiry: string,
    record: Omit<ReplacementRecord, 'id'>
  ) => void;
}

export const ConsumableReplaceModal: React.FC<ConsumableReplaceModalProps> = ({
  aed,
  isOpen,
  onClose,
  onSubmitReplacement,
}) => {
  if (!isOpen || !aed) return null;

  const [itemType, setItemType] = useState<ConsumableType>('pad');
  const [padExpiry, setPadExpiry] = useState(toYearMonthString(aed.padExpiryDate));
  const [batteryExpiry, setBatteryExpiry] = useState(toYearMonthString(aed.batteryExpiryDate));
  const [bodyExpiry, setBodyExpiry] = useState(toYearMonthString(aed.bodyExpiryDate));
  const [replaceDate, setReplaceDate] = useState(getTodayDateString());
  const [worker, setWorker] = useState(aed.managerName || '안전관리자');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (aed) {
      setItemType('pad');
      setPadExpiry(getYearMonthPlusYears(2));
      setBatteryExpiry(toYearMonthString(aed.batteryExpiryDate));
      setBodyExpiry(toYearMonthString(aed.bodyExpiryDate));
      setReplaceDate(getTodayDateString());
      setWorker(aed.managerName || '안전관리자');
      setNotes('');
    }
  }, [aed, isOpen]);

  const handleTypeChange = (type: ConsumableType) => {
    setItemType(type);
    if (type === 'pad') {
      setPadExpiry(getYearMonthPlusYears(2));
    } else if (type === 'battery') {
      setBatteryExpiry(getYearMonthPlusYears(4));
    } else if (type === 'both') {
      setPadExpiry(getYearMonthPlusYears(2));
      setBatteryExpiry(getYearMonthPlusYears(4));
    } else if (type === 'body') {
      setBodyExpiry(getYearMonthPlusYears(10));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let previousExpiryDate = toYearMonthString(aed.padExpiryDate);
    let newExpiryDate = padExpiry;
    let batteryPreviousExpiry: string | undefined;
    let batteryNewExpiry: string | undefined;

    if (itemType === 'battery') {
      previousExpiryDate = toYearMonthString(aed.batteryExpiryDate);
      newExpiryDate = batteryExpiry;
    } else if (itemType === 'body') {
      previousExpiryDate = toYearMonthString(aed.bodyExpiryDate);
      newExpiryDate = bodyExpiry;
    } else if (itemType === 'both') {
      previousExpiryDate = toYearMonthString(aed.padExpiryDate);
      newExpiryDate = padExpiry;
      batteryPreviousExpiry = toYearMonthString(aed.batteryExpiryDate);
      batteryNewExpiry = batteryExpiry;
    }

    const record: Omit<ReplacementRecord, 'id'> = {
      date: replaceDate,
      itemType,
      previousExpiryDate,
      newExpiryDate,
      batteryPreviousExpiry,
      batteryNewExpiry,
      worker: worker.trim() || '관리자',
      notes: notes.trim(),
    };

    onSubmitReplacement(
      aed.id,
      itemType,
      itemType === 'pad' || itemType === 'both' ? padExpiry : toYearMonthString(aed.padExpiryDate),
      itemType === 'battery' || itemType === 'both' ? batteryExpiry : toYearMonthString(aed.batteryExpiryDate),
      itemType === 'body' ? bodyExpiry : toYearMonthString(aed.bodyExpiryDate),
      record
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200">
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-slate-900">소모품 교체 (년/월 단위)</span>
                <span className="font-mono font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded text-xs">
                  {aed.managementNo}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">{aed.location}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Step 1: Select Item to Replace */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              교체할 소모품 선택
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('pad')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer min-h-[56px] flex flex-col items-center justify-center ${
                  itemType === 'pad'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-4 h-4 mb-1 text-emerald-600" />
                <span className="text-xs">패드 교체</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('battery')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer min-h-[56px] flex flex-col items-center justify-center ${
                  itemType === 'battery'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Battery className="w-4 h-4 mb-1 text-emerald-600" />
                <span className="text-xs">배터리 교체</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('both')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer min-h-[56px] flex flex-col items-center justify-center ${
                  itemType === 'both'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1 mb-1 text-emerald-600">
                  <Layers className="w-3.5 h-3.5" />
                  <Battery className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs">패드+배터리</span>
              </button>
            </div>
          </div>

          {/* Step 2: Year-Month Picker for Pad */}
          {(itemType === 'pad' || itemType === 'both') && (
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  새 패드 상품 기입 날짜 (년·월)
                </span>
                <span className="text-[11px] text-slate-500">
                  기존: <strong className="font-mono text-slate-700">{formatYearMonth(aed.padExpiryDate)}</strong>
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 bg-emerald-50/80 px-2 py-1 rounded-lg border border-emerald-100">
                패드 포장지/상품에 기입된 날짜(년·월)를 확인하여 입력하세요.
              </p>

              {/* Native Year-Month input */}
              <input
                type="month"
                required
                value={padExpiry}
                onChange={(e) => setPadExpiry(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600 min-h-[44px]"
              />

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[10px] text-slate-400">빠른선택:</span>
                <button
                  type="button"
                  onClick={() => setPadExpiry(getYearMonthPlusYears(2))}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 rounded-lg text-[11px] font-semibold cursor-pointer"
                >
                  +2년 (표준 젤)
                </button>
                <button
                  type="button"
                  onClick={() => setPadExpiry(getYearMonthPlusYears(3))}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 rounded-lg text-[11px] font-semibold cursor-pointer"
                >
                  +3년
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Year-Month Picker for Battery */}
          {(itemType === 'battery' || itemType === 'both') && (
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Battery className="w-3.5 h-3.5 text-slate-500" />
                  새 배터리 유효기간 (년·월)
                </span>
                <span className="text-[11px] text-slate-500">
                  기존: <strong className="font-mono text-slate-700">{formatYearMonth(aed.batteryExpiryDate)}</strong>
                </span>
              </div>

              {/* Native Year-Month input */}
              <input
                type="month"
                required
                value={batteryExpiry}
                onChange={(e) => setBatteryExpiry(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600 min-h-[44px]"
              />

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[10px] text-slate-400">빠른선택:</span>
                <button
                  type="button"
                  onClick={() => setBatteryExpiry(getYearMonthPlusYears(4))}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 rounded-lg text-[11px] font-semibold cursor-pointer"
                >
                  +4년 (표준 배터리)
                </button>
                <button
                  type="button"
                  onClick={() => setBatteryExpiry(getYearMonthPlusYears(5))}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 rounded-lg text-[11px] font-semibold cursor-pointer"
                >
                  +5년
                </button>
              </div>
            </div>
          )}

          {/* Replacement Date & Worker */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                교체 작업일
              </label>
              <input
                type="date"
                required
                value={replaceDate}
                onChange={(e) => setReplaceDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono min-h-[42px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                교체 담당자
              </label>
              <input
                type="text"
                required
                placeholder="담당자 이름"
                value={worker}
                onChange={(e) => setWorker(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl min-h-[42px]"
              />
            </div>
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              비고 (선택 사항)
            </label>
            <input
              type="text"
              placeholder="특이사항 또는 메모 (선택)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl min-h-[42px]"
            />
          </div>

          {/* Confirmation Notice */}
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2 text-[11px] text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              저장 시 <strong>{aed.managementNo}</strong>의 유효기간이 <strong>년·월 단위</strong>로 갱신되며, Firebase 클라우드 DB에 실시간 저장됩니다.
            </span>
          </div>

          {/* Sticky Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5 sticky bottom-0 bg-white py-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="min-h-[44px] flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-6 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer active:scale-98"
            >
              <Save className="w-4 h-4" />
              <span>교체 기록 저장 (Firebase 연동)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
