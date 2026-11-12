import { bigPayments } from "./items";
import { ALL_CATEGORY, SAVING_CATEGORY } from "./fixConstants";
import { getDateValue, getToday } from "./fixFormat";

/** 한 달 고정지출 합계 (금융·저축 카테고리는 제외) */
export const calculateFixedExpense = (items) =>
  items
    .filter((item) => item.category !== SAVING_CATEGORY)
    .reduce((total, item) => total + (Number(item.monthly) || 0), 0);

/** 자동이체 저축 합계 (금융·저축 카테고리만) */
export const calculateMonthlySavings = (items) =>
  items
    .filter((item) => item.category === SAVING_CATEGORY)
    .reduce((total, item) => total + (Number(item.monthly) || 0), 0);

/**
 * 다가오는 큰 지출 1건 → { title, amount, month } (없으면 null)
 * rawItems: utils/items.js 의 useItems() 결과 (항목 추가 창에서 저장한 원본)
 */
export const getUpcomingExpense = (rawItems) => {
  const [big] = bigPayments(rawItems, getToday(), 1);
  if (!big) return null;
  return {
    title: big.name,
    amount: big.amount,
    month: `${big.date.getMonth() + 1}월`,
  };
};

/** 카테고리 필터 */
export const filterByCategory = (items, category) =>
  category === ALL_CATEGORY
    ? items
    : items.filter((item) => item.category === category);

/** 정렬 (원본 배열은 건드리지 않아요) */
export const sortExpenses = (items, sortOrder) =>
  [...items].sort((a, b) => {
    switch (sortOrder) {
      case "high":
        return b.amount - a.amount;
      case "low":
        return a.amount - b.amount;
      case "latest":
        return getDateValue(b.date) - getDateValue(a.date);
      case "oldest":
        return getDateValue(a.date) - getDateValue(b.date);
      default:
        return 0;
    }
  });

/** 내 항목들에서 쓴 결제 수단 목록 (중복 제거) — 수정 모달의 선택지 */
export const getPayMethods = (items) => [
  ...new Set(items.map((item) => item.method).filter(Boolean)),
];

/**
 * 상세 > 금액 변화 그래프 데이터
 * 아직 지난 금액 기록이 저장되지 않아서 올해 금액 1건만 있어요.
 * (기록 데이터가 생기면 여기서 [{ year, amount }, ...] 로 돌려주면 돼요)
 */
export const getAmountHistory = (item) => [
  { year: new Date().getFullYear(), amount: item.amount },
];

/** 그래프 막대 높이 단계 1~10 (가장 큰 금액 = 10) → CSS .chart-bar--<단계> */
export const getBarLevel = (amount, maxAmount) =>
  maxAmount > 0 ? Math.max(1, Math.round((amount / maxAmount) * 10)) : 1;
