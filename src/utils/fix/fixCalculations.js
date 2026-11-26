import { bigPayments } from "@/utils/common/payment";
import { getToday, toDate } from "@/utils/common/date";

// 저축으로 따로 계산하는 카테고리 (DB categories.key)
const SAVING_KEY = "saving";

/** 한 달 고정지출 합계 (금융·저축 카테고리는 제외) */
export const calculateFixedExpense = (items) =>
  items
    .filter((item) => item.categoryKey !== SAVING_KEY)
    .reduce((total, item) => total + (Number(item.monthly) || 0), 0);

/** 자동이체 저축 합계 (금융·저축 카테고리만) */
export const calculateMonthlySavings = (items) =>
  items
    .filter((item) => item.categoryKey === SAVING_KEY)
    .reduce((total, item) => total + (Number(item.monthly) || 0), 0);

/**
 * 다가오는 큰 지출 1건 → { title, amount, month } (없으면 null)
 * rawItems: hooks/useFixItems.js useRawFixItems() 결과 (DB 내 고정지출)
 * 기준: 오늘부터 3개월 안 + BIG_AMOUNT(30만원) 이상 중 금액 큰 순 (utils/common/payment.js)
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

/** 내 항목들에서 쓴 결제 수단 목록 (중복 제거) — 수정 모달의 선택지 */
export const getPayMethods = (items) => [
  ...new Set(items.map((item) => item.method).filter(Boolean)),
];

/**
 * 상세 > 금액 변화 그래프 데이터 — 이번달 포함 전 3개월 (예: 26.09 / 26.10 / 26.11)
 * 과거 금액 이력이 저장되지 않아서 세 달 다 "지금 금액"을 줘요.
 * (이력 테이블을 쓰게 되면 그 시점 금액으로 갈아끼우면 돼요)
 */
export const getAmountHistory = (item) => {
  const now = new Date();
  return Array.from({ length: 3 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 2 + i, 1);
    return {
      year: `${String(d.getFullYear()).slice(2)}.${String(d.getMonth() + 1).padStart(2, "0")}`,
      amount: item.amount,
    };
  });
};

/** 그래프 막대 높이 단계 1~10 (가장 큰 금액 = 10) → CSS .chart-bar--<단계> */
export const getBarLevel = (amount, maxAmount) =>
  maxAmount > 0 ? Math.max(1, Math.round((amount / maxAmount) * 10)) : 1;

/**
 * 상세 > 만기일 카드: 오늘부터 만기일까지 남은 일수
 * endDate: "2027년 3월 4일" 형태 글자 → 숫자(일) / 못 읽으면 null
 */
export const getDaysUntilEnd = (endDate) => {
  const end = toDate(endDate);
  if (!end) return null;
  const t = new Date();
  const today = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  return Math.max(0, Math.round((end - today) / (1000 * 60 * 60 * 24)));
};

/**
 * 상세 > 만기일 카드: 시작일~만기일 중 지나간 정도 0~10단계
 * → CSS .end-progress-fill--<단계> (10단계 = 100%)
 */
export const getEndProgressLevel = (startDate, endDate) => {
  const start = toDate(startDate);
  const end = toDate(endDate);
  if (!start || !end || end <= start) return 0;
  const ratio = (Date.now() - start) / (end - start);
  return Math.min(10, Math.max(0, Math.round(ratio * 10)));
};
