/* 내 고정지출(Fix)·상세(FixDetail)에서 쓰는 고정 값들 */

// 목록 상단 카테고리 필터: 맨 앞 "전체" 버튼 (나머지 버튼은 DB 카테고리 이름, pages/Fix.jsx)
export const ALL_CATEGORY = "전체";

// 정렬 셀렉트 옵션
export const SORT_OPTIONS = [
  { value: "created", label: "등록순" },
  { value: "latest", label: "결제일 느린순" },
  { value: "oldest", label: "결제일 빠른순" },
  { value: "high", label: "금액 높은순" },
  { value: "low", label: "금액 낮은순" },
];
export const DEFAULT_SORT = "created";

// 상세 > 알림 선택 버튼
export const ALERT_OPTIONS = ["30일 전", "7일 전", "3일 전", "1일 전"];
export const DEFAULT_PAY_ALERT = "1일 전";
export const DEFAULT_END_ALERT = "7일 전";

// 결제 정보 수정 모달 토글
export const CYCLE_OPTIONS = ["매년", "매월", "매주"];
export const AMOUNT_TYPE_OPTIONS = ["고정", "변동"];
export const DEFAULT_AMOUNT_TYPE = "고정";
