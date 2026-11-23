import { dateKey, getToday, todayKey } from "@/utils/common/date";

/*
 * 결제 날짜·금액 계산 (모든 페이지 공통)
 * - 항목 규칙("매달 25일" 같은)을 실제 날짜·금액으로 바꿔요
 * - 입력값만 보고 계산해요 (브라우저 저장소·화면은 건드리지 않아요)
 * - 항목 모양: { id, category, name, amount, amountType, cycle, day, month, weekday, every, unit, start, endDate }
 *   cycle: "매일" | "매주"(weekday) | "매달"(day) | "매년"(month, day) | "사용자화"(every + unit, unit에 맞는 weekday/day/month)
 *   start: 시작일("2026-11-09") — 2주마다·3개월마다처럼 건너뛰는 주기의 기준
 *   DB 데이터는 utils/dbItem.js fromDbRow 로 이 모양으로 바꿔서 넣어요
 */

const daysIn = (y, m) => new Date(y, m, 0).getDate(); // m: 1~12

/** 그 달에 실제로 나가는 날 (31일 결제인데 30일까지 있는 달이면 30일) */
export const payDayIn = (item, year, month) => Math.min(item.day, daysIn(year, month));

const DAY_MS = 86400000;
const mod = (a, n) => ((a % n) + n) % n;
const dayNo = (y, m, d) => Math.round(Date.UTC(y, m - 1, d) / DAY_MS); // 날짜 → 일련번호
const weekdayOf = (no) => mod(no + 4, 7); // 1970-01-01은 목요일(4)

/** 결제 주기 → { unit: "day"|"week"|"month"|"year", every: 몇 번째마다 } */
export function ruleOf(item) {
  switch (item.cycle) {
    case "매일": return { unit: "day", every: 1 };
    case "매주": return { unit: "week", every: 1 };
    case "매년": return { unit: "year", every: 1 };
    case "사용자화": return { unit: item.unit || "month", every: Math.max(1, Number(item.every) || 1) };
    default: return { unit: "month", every: 1 };
  }
}

/** 기준일 (예전 항목은 start가 없어서 id(만든 시각)로) */
const startOf = (item) => {
  if (item.start) { const [y, m, d] = item.start.split("-").map(Number); return { y, m, d }; }
  const t = new Date(item.id || Date.now());
  return { y: t.getFullYear(), m: t.getMonth() + 1, d: t.getDate() };
};

/** 그 달에 결제하는 날짜들 (m: 1~12) */
export function payDaysIn(item, y, m) {
  const { unit, every } = ruleOf(item);
  const s = startOf(item);
  const all = Array.from({ length: daysIn(y, m) }, (_, i) => i + 1);
  if (unit === "day") {
    const base = dayNo(s.y, s.m, s.d);
    return all.filter((d) => mod(dayNo(y, m, d) - base, every) === 0);
  }
  if (unit === "week") {
    const wd = Number(item.weekday ?? 1);
    const s0 = dayNo(s.y, s.m, s.d);
    const base = s0 + mod(wd - weekdayOf(s0), 7); // 등록한 날 이후 첫 그 요일
    return all.filter((d) => { const no = dayNo(y, m, d); return weekdayOf(no) === wd && mod(no - base, 7 * every) === 0; });
  }
  if (unit === "month") {
    const first = s.y * 12 + s.m - 1 + (item.day < s.d ? 1 : 0); // 등록한 날 이후 첫 결제 달
    return mod(y * 12 + m - 1 - first, every) === 0 ? [payDayIn(item, y, m)] : [];
  }
  if (m !== Number(item.month)) return [];
  const firstYear = s.y + (m < s.m || (m === s.m && item.day < s.d) ? 1 : 0);
  return mod(y - firstYear, every) === 0 ? [payDayIn(item, y, m)] : [];
}

/** 이 항목이 그 달에 나가는지 */
export const paysIn = (item, y, m) => payDaysIn(item, y, m).length > 0;

/** 그 달에 나가는 돈 (매일·매주는 횟수만큼) */
export const amountIn = (item, y, m) => item.amount * payDaysIn(item, y, m).length;

/**
 * 한 달 금액 (월 환산) — 모든 페이지 공통
 * - 매년: 1년 금액 ÷ 12 (시안: "연납·세금은 월 평균으로 넣었어요")
 * - 매달·매주·매일·사용자화: 그 달에 실제로 결제하는 횟수 × 금액
 *   (예: 매주 월요일 1만원 → 11월은 월요일 5번이라 5만원 / 2개월마다 6만원 → 결제하는 달만 6만원)
 */
export const monthAmount = (item, y, m) =>
  item.cycle === "매년" ? Math.round(item.amount / 12) : amountIn(item, y, m);

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];
/** "매주 월요일", "2개월마다 10일" 같은 결제 주기 글자 */
export function cycleText(item) {
  const { unit, every } = ruleOf(item);
  const when = {
    day: "",
    week: `${WEEK[Number(item.weekday ?? 1)]}요일`,
    month: `${item.day}일`,
    year: `${item.month}월 ${item.day}일`,
  }[unit];
  if (item.cycle === "사용자화") {
    const per = { day: "일", week: "주", month: "개월", year: "년" }[unit];
    return `${every}${per}마다${when ? ` ${when}` : ""}`;
  }
  return item.cycle === "매일" ? "매일" : `${item.cycle} ${when}`;
}

/** 오늘(포함) 이후로 가장 가까운 결제 count개 (만기일 지난 항목은 빠져요) */
export function nextPayments(items, today, count = 3) {
  const start = new Date(today.year, today.month - 1, today.day);
  const list = items.map((it) => {
    // "매일" 항목은 오늘 결제를 이미 지났다고 보고 내일부터 찾아요
    // (시작일·매주·매달·매년·사용자화 계산은 그대로. dday는 오늘 기준이라 내일이면 D-1)
    const from = it.cycle === "매일" ? new Date(start.getTime() + DAY_MS) : start;
    let y = today.year;
    let m = today.month;
    for (let i = 0; i < 1200; i++) { // 최대 100년 앞까지
      const d = payDaysIn(it, y, m).find((day) => new Date(y, m - 1, day) >= from);
      if (d) {
        const date = new Date(y, m - 1, d);
        if (isEnded(it, date)) return null; // 만기일이 지나면 다음 결제 없음
        return { ...it, date, month: m, payDay: d, dday: Math.round((date - start) / DAY_MS) };
      }
      m += 1;
      if (m > 12) { m = 1; y += 1; }
    }
    return null;
  }).filter(Boolean);
  return list.sort((a, b) => a.date - b.date).slice(0, count);
}

/** 다음 결제일 하나 → Date (오늘이 결제일이면 오늘, 만기일이 지났으면 null) */
export const nextPayDate = (item, today = getToday()) => nextPayments([item], today, 1)[0]?.date ?? null;

/** 만기일(endDate)이 지난 결제인지 (리포트에서도 써요) */
export const isEnded = (item, date) => {
  if (!item.endDate) return false;
  const [y, m, d] = item.endDate.split("-").map(Number);
  return date > new Date(y, m - 1, d);
};

/**
 * 그 달(year, month: 1~12)에 나가는 결제 목록 → [{ ...항목, date }]
 * - 매주·매일 결제는 결제하는 날마다 한 줄씩 들어가요 (예: 매주 월요일 → 4~5줄)
 * - 만기일 지난 날은 빼요
 */
export function paymentsInMonth(items, year, month) {
  return items
    .flatMap((it) => payDaysIn(it, year, month).map((day) => ({ ...it, date: new Date(year, month - 1, day) })))
    .filter((it) => !isEnded(it, it.date));
}

/**
 * "큰 지출"로 보는 최소 금액 (원) — 앱 전체 공통 기준
 * 상단 "다가오는 큰 지출" 카드 · 캘린더 "큰 지출 미리 보기" · 목록 "큰 지출" 뱃지 · 사이드바 "큰 지출이 다가와요" 알림
 * 전부 이 값으로 판단해요 (한 곳만 고치면 전부 바뀌어요)
 */
export const BIG_AMOUNT = 300000;

/**
 * 오늘부터 3개월 안에 나가는 결제 중 금액 BIG_AMOUNT 이상인 것 큰 순서로 count개 (모자라면 있는 만큼)
 * - 주기 상관없이 전부 봐요 (매달·매년·매주·매일·사용자화)
 * - 같은 항목이 매주·매일로 여러 번 나가면 "결제 한 번" 금액으로 각각 비교해요
 */
export function bigPayments(items, today, count = 4) {
  const start = new Date(today.year, today.month - 1, today.day);
  const end = new Date(today.year, today.month - 1 + 3, today.day); // 3개월 뒤

  // 3개월 구간이 걸치는 달 (오늘 달 ~ 3개월 뒤 달, 연말·연초 넘어가는 달까지)
  const months = [];
  for (let i = 0; i < 4; i++) {
    const m0 = today.month - 1 + i;
    months.push([today.year + Math.floor(m0 / 12), (m0 % 12) + 1]);
  }

  const seen = new Set();
  return months
    .flatMap(([y, m]) => paymentsInMonth(items, y, m)) // 그 달에 실제로 나가는 날
    .filter((it) => it.date >= start && it.date < end && Number(it.amount) >= BIG_AMOUNT) // 오늘부터 3개월 안 + 큰 지출 기준 금액
    .sort((a, b) => a.date - b.date) // 같은 항목은 가장 가까운 결제일부터
    .filter((it) => { // 항목당 한 번만 (매달·매주는 3개월치로 여러 번 나가지만 "이 항목" 하나로 세요)
      if (seen.has(it.id)) return false;
      seen.add(it.id);
      return true;
    })
    .sort((a, b) => Number(b.amount) - Number(a.amount)) // 금액 큰 순서
    .slice(0, count);
}

/** 첫 결제일 키 ("2026-11-20"): 오늘부터 고른 결제일·요일·월에 맞는 가장 가까운 날 (DB start_date로 저장해요) */
export function firstPayKey(item) {
  const today = getToday();
  const start = todayKey();
  // "매일"은 시작일을 오늘으로 (첫 결제일은 nextPayments가 내일을 줘요 → 시작일 오늘 / 다음 결제일 내일)
  if (item.cycle === "매일") return start;
  const first = nextPayments([{ ...item, start }], today, 1)[0];
  return first ? dateKey(first.date) : start;
}
