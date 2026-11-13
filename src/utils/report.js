/*
 * 지출 리포트 계산 (pages/Report.jsx에서 사용)
 *
 * 앱에는 "실제 결제 기록"이 없고 "매달 25일 55만원" 같은 규칙만 저장돼 있어요.
 * 그래서 지난달·작년 금액도 같은 규칙으로 계산해요.
 *  → 지난달/작년과 달라지는 건 만기일(endDate)이 지나서 끝난 항목 때문이에요.
 *
 * 계산 결과 목록의 한 줄 모양: { ...항목, value: 금액 }
 */
import { isEnded, payDaysIn, paymentsInMonth } from "./items";

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
  // 매일·매주 결제는 그 달에 나간 횟수만큼 (예: 매주 월요일 1만원 → 월요일 5번이면 5만원)
  // 만기일이 지난 날은 세지 않아요
  const monthly = items
    .filter((it) => it.cycle !== "매년")
    .map((it) => {
      const times = payDaysIn(it, year, month).filter((d) => !isEnded(it, new Date(year, month - 1, d))).length;
      return { ...it, value: it.amount * times };
    })
    .filter((it) => it.value > 0);

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

/** 만기일(endDate) 문자열 → Date (없으면 null) */
export const endDateOf = (item) => {
  if (!item.endDate) return null;
  const [y, m, d] = item.endDate.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/**
 * 카테고리마다 (올해 − 작년 같은 기간) 금액 차이
 * → [{ key, change, endedName }]
 *   endedName: 작년보다 줄어든 항목 중 만기로 끝난 것의 이름 ("왓챠 해지로 줄었어요"에 써요). 없으면 null
 */
export function categoryChanges(thisYear, lastYear) {
  const curByCat = Object.fromEntries(byCategory(thisYear).map((c) => [c.key, c.value]));
  const lastByCat = Object.fromEntries(byCategory(lastYear).map((c) => [c.key, c.value]));
  const thisItemMap = Object.fromEntries(byItem(thisYear).map((it) => [it.id, it.value]));
  const lastItems = byItem(lastYear);

  return [...new Set([...Object.keys(curByCat), ...Object.keys(lastByCat)])].map((key) => {
    const ended = lastItems.find(
      (it) => it.category === key && (thisItemMap[it.id] ?? 0) < it.value && endDateOf(it)
    );
    return {
      key,
      change: (curByCat[key] ?? 0) - (lastByCat[key] ?? 0),
      endedName: ended ? ended.name : null,
    };
  });
}

/** 그 해에 해지한 항목 (만기일이 그 해이고 today까지 지난 것), 최근에 끝난 순서 */
export function endedInYear(items, year, today) {
  return items
    .filter((it) => {
      const end = endDateOf(it);
      return end && end.getFullYear() === year && end <= today;
    })
    .sort((a, b) => endDateOf(b) - endDateOf(a));
}
