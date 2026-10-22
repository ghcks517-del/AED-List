export type ExpiryStatusType = 'normal' | 'warning' | 'expired';

export type MohwRegistrationStatus = 'registered' | 'unregistered' | 'pending';

export type ConsumableType = 'pad' | 'battery' | 'both' | 'body';

export interface ReplacementRecord {
  id: string;
  date: string; // 교체 작업일 (YYYY-MM-DD)
  itemType: ConsumableType; // 교체 항목
  previousExpiryDate: string; // 교체 전 유효기간 (YYYY-MM)
  newExpiryDate: string; // 교체 후 새 유효기간 (YYYY-MM)
  batteryPreviousExpiry?: string; // 동시 교체 시 배터리 이전 유효기간 (YYYY-MM)
  batteryNewExpiry?: string; // 동시 교체 시 배터리 새 유효기간 (YYYY-MM)
  worker: string; // 교체 담당자
  notes?: string; // 비고
}

export interface AedItem {
  id: string;
  managementNo: string; // 필수: AED 관리번호 (예: AED-01)
  location: string; // 필수: 설치위치 (예: 본관 1층 로비)
  building?: string; // 건물명
  bodyExpiryDate: string; // 필수: 본체 유효기간 (YYYY-MM)
  batteryExpiryDate: string; // 필수: 배터리 유효기간 (YYYY-MM)
  padExpiryDate: string; // 필수: 패드 유효기간 (YYYY-MM)
  mohwStatus: MohwRegistrationStatus; // 필수: 보건복지부 등록 여부
  mohwRegNumber?: string; // 보건복지부 등록번호
  
  // 소모품 관리 부가정보
  modelName?: string;
  managerName?: string;
  managerContact?: string;
  lastReplacedDate?: string;
  replacementHistory: ReplacementRecord[];
  notes?: string;
}

export interface ExpiryCalculation {
  daysLeft: number;
  status: ExpiryStatusType;
  formattedDate: string;
}
