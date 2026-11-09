/*
 * 지출 리포트 계산 (pages/Report.jsx에서 사용)
 *
 * 앱에는 "실제 결제 기록"이 없고 "매달 25일 55만원" 같은 규칙만 저장돼 있어요.
 * 그래서 지난달·작년 금액도 같은 규칙으로 계산해요.
 *  → 지난달/작년과 달라지는 건 만기일(endDate)이 지나서 끝난 항목 때문이에요.
 *
 * 계산 결과 목록의 한 줄 모양: { ...항목, value: 금액 }
 */
import { isEnded, paymentsInMonth } from "./items";

/** 지난달 [년, 월] (1월이면 작년 12월) */
export const prevMonthOf = (year, month) => (month === 1 ? [year - 1, 12] : [year, month - 1]);

/** n달 전 [년, 월] */
export const monthsAgo = (year, month, n) => {
  const d = new Date(year, month - 1 - n, 1);
  return [d.getFullYear(), d.getMonth() + 1];
};

/** 목록 금액(value) 합계 */
export const sumValue = (list) => list.reduce((sum, it) => sum + it.value, 0);

/**
 * 월간 리포트용 "그 달 금액"
 * - 매달 결제: 그 달에 나가는 금액 그대로
 * - 매년 결제(연납·세금): 1년 금액 ÷ 12 (시안: "연납·세금은 월 평균으로 넣었어요")
 */
export function monthShare(items, year, month) {
  const monthly = paymentsInMonth(
    items.filter((it) => it.cycle !== "매년"),
    year,
    month
  ).map((it) => ({ ...it, value: it.amount }));

  const monthStart = new Date(year, month - 1, 1);
  const yearly = items
    .filter((it) => it.cycle === "매년" && !isEnded(it, monthStart)) // 그 달 1일 전에 끝난 건 빼기
    .map((it) => ({ ...it, value: Math.round(it.amount / 12) }));

  return [...monthly, ...yearly];
}

/** 그 해 1월 ~ lastMonth월에 나간 결제 전부 (매년 결제는 결제한 달에 전액) */
export function paymentsInYear(items, year, lastMonth) {
  const list = [];
  for (let m = 1; m <= lastMonth; m++) {
    paymentsInMonth(items, year, m).forEach((p) => list.push({ ...p, value: p.amount }));
  }
  return list;
}

/** 카테고리별 합계, 큰 순서 → [{ key, value }] */
export function byCategory(list) {
  const map = new Map();
  list.forEach((it) => map.set(it.category, (map.get(it.category) ?? 0) + it.value));
  return [...map]
    .map(([key, value]) => ({ key, value }))
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);
}

/** 항목별 합계 (같은 항목이 여러 달 나갔으면 합쳐요), 큰 순서 */
export function byItem(list) {
  const map = new Map();
  list.forEach((it) => {
    const before = map.get(it.id);
    map.set(it.id, before ? { ...before, value: before.value + it.value } : { ...it });
  });
  return [...map.values()].sort((a, b) => b.value - a.value);
}

/** 한 달에 나가는 금액으로 바꾸기 (매년 결제는 ÷ 12) */
export const perMonth = (item) => (item.cycle === "매년" ? Math.round(item.amount / 12) : item.amount);

/** 만기일(endDate) 문자열 → Date (없으면 null) */
export const endDateOf = (item) => {
  if (!item.endDate) return null;
  const [y, m, d] = item.endDate.split("-").map(Number);
  return new Date(y, m - 1, d);
};
