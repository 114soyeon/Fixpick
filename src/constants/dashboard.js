/* 메인(대시보드)에서 쓰는 데이터
 * 카테고리 색은 dashboard.css의 .gk-dash-cat--<key>에 있어요 */
export const CATEGORIES = [
  { key: "home", name: "주거·공과", desc: "월세·관리비·공과금", icon: "building" },
  { key: "phone", name: "통신", desc: "휴대폰·인터넷·IPTV", icon: "phone" },
  { key: "sub", name: "구독", desc: "OTT·음악·멤버십", icon: "play", highlight: true },
  { key: "rental", name: "가전", desc: "정수기·안마의자·건조기", icon: "washer" },
  { key: "insure", name: "보험", desc: "실손·자동차·운전자", icon: "shield" },
  { key: "saving", name: "금융·저축", desc: "적금·청약·대출이자", icon: "piggy" },
  { key: "transit", name: "교통", desc: "교통카드·주차", icon: "bus" },
  { key: "car", name: "자동차", desc: "할부·주유·자동차보험", icon: "car" },
  { key: "etc", name: "기타", desc: "경조사비·세금·관리", icon: "shapes" },
];

export const BIG = 100000; // 이 금액 이상이면 노란색(큰 지출)으로 표시
export const MAX_CARDS = 3; // 메인에는 카테고리를 최대 3개까지 (금액 큰 순)
export const MAX_LINES = 3; // 카드 한 장에 보여줄 항목 수

/** 선 아이콘 공통 속성 (카테고리·화살표·더하기 아이콘) */
export const LINE_ICON = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
