/* 항목 추가 창에서 쓰는 데이터
 * 카테고리 색과 카드 배지 색은 styles/sidebar.css에 있어요. */

/* 카테고리 목록(이름·색·아이콘)은 DB categories 테이블에서 가져와요 (queries/subs.js useCategories) */

/** 카테고리를 고르면 항목 이름 칸 안에 그 카테고리 예시가 보여요 (key = DB categories.key) */
export const NAME_HINTS = {
  home: "월세, 관리비, 전기요금",
  phone: "휴대폰 요금, 인터넷, IPTV",
  sub: "넷플릭스, 유튜브 프리미엄, 쿠팡 와우",
  rental: "정수기, 공기청정기, 안마의자",
  insure: "실손보험, 자동차보험, 운전자보험",
  saving: "적금, 주택청약, 대출 이자",
  transit: "교통카드, 기후동행카드, 정기권",
  car: "자동차 할부, 주유비, 주차비",
  etc: "모임 회비, 학원비, 경조사비",
};

/** 카드마다 이름 첫 글자 배지 [글자, 색 번호] (실제 회사 로고 대신, 고정콕 색으로) */
export const BADGE = {
  국민카드: ["국", 0], 신한카드: ["신", 1], 삼성카드: ["삼", 2], 현대카드: ["현", 3], 롯데카드: ["롯", 4], 우리카드: ["우", 5],
  하나카드: ["하", 6], BC카드: ["BC", 7], NH농협카드: ["NH", 8], 카카오뱅크: ["카", 9], 토스뱅크: ["토", 0], 케이뱅크: ["K", 4],
};
/** 배지 색 개수 (sidebar.css의 .gk-card-badge.is-c0 ~ is-c9) */
export const BADGE_COLOR_COUNT = 10;

export const CYCLE_OPTIONS = ["매일", "매주", "매달", "매년", "사용자화"].map((v) => ({ value: v, label: v }));
/** 사용자화: N + 단위 + "마다" */
export const UNIT_OPTIONS = [{ value: "day", label: "일" }, { value: "week", label: "주" }, { value: "month", label: "개월" }, { value: "year", label: "년" }];
/** 매주: 월요일부터 (값은 Date.getDay() 번호, 일요일 = 0) */
export const WEEKDAY_OPTIONS = [1, 2, 3, 4, 5, 6, 0].map((v) => ({ value: v, label: `${"일월화수목금토"[v]}요일` }));
export const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `${i + 1}월` }));
export const AMOUNT_TYPES = [["fixed", "고정"], ["variable", "변동"]];
export const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
export const QUICK_END_DATES = [["1년 뒤", 1], ["2년 뒤", 2], ["3년 뒤", 3]];
