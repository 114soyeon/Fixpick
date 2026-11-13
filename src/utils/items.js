import { useSyncExternalStore } from "react";
import { getUser, useUser } from "./auth";
import { dateKey, getToday, todayKey } from "./date";

/*
 * 사람마다 등록한 고정지출 항목을 브라우저에 따로 저장해요.
 * 저장 위치: localStorage "gk-items:<이메일>" (로그인해야 등록할 수 있어요)
 * 항목 모양: { id, category, name, amount, amountType("fixed"|"variable"), cycle, day, month, weekday, every, unit, start, payMethod, remind }
 *   cycle: "매일" | "매주"(weekday) | "매달"(day) | "매년"(month, day) | "사용자화"(every + unit, unit에 맞는 weekday/day/month)
 *   start: 등록한 날("2026-11-09") — 2주마다·3개월마다처럼 건너뛰는 주기의 기준
 */
const EVENT = "gk-items-change";
const EMPTY = [];
const cache = new Map();
const GUEST = "guest";
const keyOf = (email) => `gk-items:${(email || GUEST).toLowerCase()}`;

// 로그인·로그아웃하면 저장된 목록을 다시 읽어요
window.addEventListener("gk-auth-change", () => { cache.clear(); window.dispatchEvent(new Event(EVENT)); });

function readItems(email) {
  const key = keyOf(email);
  if (!cache.has(key)) {
    try { cache.set(key, JSON.parse(localStorage.getItem(key) || "[]")); } catch { cache.set(key, []); }
  }
  return cache.get(key); 
}

function writeItems(email, list) {
  const key = keyOf(email);
  try { localStorage.setItem(key, JSON.stringify(list)); } catch { /* 저장 실패는 무시 */ }
  cache.set(key, list);
  window.dispatchEvent(new Event(EVENT));
}

const owner = () => getUser()?.email || GUEST;

/** 항목 추가 (로그인해야 할 수 있어요) */
export function addItem(item) {
  if (!getUser()) return false; // 로그인 안 했으면 저장하지 않아요
  const now = new Date();
  const next = [...readItems(owner()), { id: Date.now(), month: now.getMonth() + 1, amountType: "fixed", ...item }];
  writeItems(owner(), next);
  return true;
}

/** 항목 고치기 (예: 변동 금액을 결제 후 실제 금액으로) */
export function updateItem(id, changes) {
  writeItems(owner(), readItems(owner()).map((it) => (it.id === id ? { ...it, ...changes } : it)));
}

/** 항목 지우기 */
export function removeItem(id) {
  writeItems(owner(), readItems(owner()).filter((it) => it.id !== id));
}

/** 지금 로그인한 사람의 항목 목록 (로그인 안 했으면 빈 목록) */
export function useItems() {
  const user = useUser();
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener(EVENT, cb);
      return () => window.removeEventListener(EVENT, cb);
    },
    () => (user ? readItems(user.email) : EMPTY), // 로그인 안 했으면 빈 목록
    () => EMPTY
  );
}

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

/** 오늘 이후로 가장 가까운 결제 count개 */
export function nextPayments(items, today, count = 3) {
  const start = new Date(today.year, today.month - 1, today.day);
  const list = items.map((it) => {
    let y = today.year;
    let m = today.month;
    for (let i = 0; i < 1200; i++) { // 최대 100년 앞까지
      const d = payDaysIn(it, y, m).find((day) => new Date(y, m - 1, day) >= start);
      if (d) {
        const date = new Date(y, m - 1, d);
        return { ...it, date, month: m, payDay: d, dday: Math.round((date - start) / DAY_MS) };
      }
      m += 1;
      if (m > 12) { m = 1; y += 1; }
    }
    return null;
  }).filter(Boolean);
  return list.sort((a, b) => a.date - b.date).slice(0, count);
}

/** 만기일(endDate)이 지난 결제인지 (리포트에서도 써요) */
export const isEnded = (item, date) => {
  if (!item.endDate) return false;
  const [y, m, d] = item.endDate.split("-").map(Number);
  return date > new Date(y, m - 1, d);
};

/** 그 달(year, month: 1~12)에 나가는 결제 목록 → [{ ...항목, date }] */
export function paymentsInMonth(items, year, month) {
  return items
    .filter((it) => paysIn(it, year, month))
    .map((it) => ({ ...it, date: new Date(year, month - 1, payDayIn(it, year, month)) }))
    .filter((it) => !isEnded(it, it.date));
}

/** 오늘부터 3개월 안에 나가는 "매년" 결제 중 금액이 큰 count개 (모자라면 있는 만큼) */
export function bigPayments(items, today, count = 4) {
  const start = new Date(today.year, today.month - 1, today.day);
  const end = new Date(today.year, today.month - 1 + 3, today.day); // 3개월 뒤

  return items
    .filter((it) => it.cycle === "매년") // 매달 결제는 제외 (자주 나가니까)
    .map((it) => {
      // 올해 결제일이 이미 지났으면 내년 결제일
      let y = today.year;
      let date = new Date(y, it.month - 1, payDayIn(it, y, it.month));
      if (date < start) {
        y += 1;
        date = new Date(y, it.month - 1, payDayIn(it, y, it.month));
      }
      return { ...it, date };
    })
    .filter((it) => it.date < end && !isEnded(it, it.date)) // 3개월 안 + 만기 전
    .sort((a, b) => b.amount - a.amount) // 금액 큰 순서
    .slice(0, count);
}

/** 사이드바·대시보드에서 "항목 추가" 창을 열고 싶을 때 (로그인 안 했으면 사이드바가 로그인 페이지로 보내요) */
export const openAddItem = () => window.dispatchEvent(new Event("gk-open-add"));

/* 로그인 페이지로 보낼 때 이유를 잠깐 기억해 둬요 → 로그인하면 바로 항목 추가 창을 열어요 */
const REASON_KEY = "gk-login-reason";
export const setLoginReason = (why) => { try { sessionStorage.setItem(REASON_KEY, why); } catch { /* 무시 */ } };
export const takeLoginReason = () => {
  try { const v = sessionStorage.getItem(REASON_KEY) || ""; sessionStorage.removeItem(REASON_KEY); return v; } catch { return ""; }
};

/** 첫 결제일 키 ("2026-11-20"): 오늘부터 고른 결제일·요일·월에 맞는 가장 가까운 날 (DB start_date로 저장해요) */
export function firstPayKey(item) {
  const today = getToday();
  const start = todayKey();
  const first = nextPayments([{ ...item, start }], today, 1)[0];
  return first ? dateKey(first.date) : start;
}
