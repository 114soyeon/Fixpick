/* 메인(대시보드)에서 쓰는 데이터
 * 카테고리 목록·이름·아이콘·색은 DB categories 테이블에서 가져와요 (hooks/useCategoryOf.js, queries/subs.js useCategories) */

export const BIG = 100000; // 이 금액 이상이면 노란색(큰 지출)으로 표시
export const MAX_CARDS = 3; // 메인에는 카테고리를 최대 3개까지 (금액 큰 순)
export const MAX_LINES = 3; // 카드 한 장에 보여줄 항목 수

/** 선 아이콘 공통 속성 (화살표·더하기 아이콘) */
export const LINE_ICON = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
