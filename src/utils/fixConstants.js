/* 내 고정지출(Fix)·상세(FixDetail)에서 쓰는 고정 값들 */

// 항목 추가 창의 카테고리 key → 목록 페이지에 보이는 카테고리 이름
// key는 constants/categories.js 의 CATEGORY_STYLE 과 같아요
export const CATEGORY_NAMES = {
  home: "주거·공과",
  phone: "통신",
  sub: "구독",
  rental: "가전 구독",
  insure: "보험",
  saving: "금융·저축",
  transit: "교통",
  car: "자동차",
  etc: "기타",
};

// 목록 상단 카테고리 필터 버튼
export const ALL_CATEGORY = "전체";
export const FIX_CATEGORIES = [ALL_CATEGORY, ...Object.values(CATEGORY_NAMES)];

// 저축으로 따로 계산하는 카테고리
export const SAVING_CATEGORY = CATEGORY_NAMES.saving;

// 정렬 셀렉트 옵션
export const SORT_OPTIONS = [
  { value: "created", label: "등록순" },
  { value: "latest", label: "결제일 느린순" },
  { value: "oldest", label: "결제일 빠른순" },
  { value: "high", label: "금액 높은순" },
  { value: "low", label: "금액 낮은순" },
];
export const DEFAULT_SORT = "created";

// 목록에서 처음에 보여줄 개수
export const PAGE_SIZE = 8;

// 상세 > 알림 선택 버튼
export const ALERT_OPTIONS = ["30일 전", "7일 전", "3일 전", "1일 전"];
export const DEFAULT_PAY_ALERT = "1일 전";
export const DEFAULT_END_ALERT = "7일 전";

// 결제 정보 수정 모달 토글
export const CYCLE_OPTIONS = ["매년", "매월", "매주"];
export const AMOUNT_TYPE_OPTIONS = ["고정", "변동"];
export const DEFAULT_AMOUNT_TYPE = "고정";
