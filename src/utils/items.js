import { useSyncExternalStore } from "react";
import { getUser, useUser } from "./auth";

/*
 * 사람마다 등록한 고정지출 항목을 브라우저에 따로 저장해요.
 * 저장 위치: localStorage "gk-items:<이메일>" (로그인 안 했으면 "gk-items:guest")
 *   → 로그인 안 하고 등록한 항목은 가입·로그인할 때 그 계정으로 옮겨져요 (auth.js)
 * 항목 모양: { id, category, name, amount, amountType("fixed"|"variable"), day, cycle("매달"|"매년"), month(매년일 때), payMethod, remind }
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

/** 항목 추가 (로그인 안 해도 돼요) */
export function addItem(item) {
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

/** 지금 쓰는 사람의 항목 목록 (로그인 안 했으면 이 브라우저에서 등록한 항목) */
export function useItems() {
  const user = useUser();
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener(EVENT, cb);
      return () => window.removeEventListener(EVENT, cb);
    },
    () => readItems(user?.email),
    () => EMPTY
  );
}

const daysIn = (y, m) => new Date(y, m, 0).getDate(); // m: 1~12

/** 그 달에 실제로 나가는 날 (31일 결제인데 30일까지 있는 달이면 30일) */
export const payDayIn = (item, year, month) => Math.min(item.day, daysIn(year, month));

/** 이 항목이 그 달에 나가는지 */
export const paysIn = (item, month) => item.cycle !== "매년" || item.month === month;

/** 오늘 이후로 가장 가까운 결제 count개 */
export function nextPayments(items, today, count = 3) {
  const start = new Date(today.year, today.month - 1, today.day);
  const list = items.map((it) => {
    let y = today.year;
    let m = it.cycle === "매년" ? it.month : today.month;
    let date = new Date(y, m - 1, payDayIn(it, y, m));
    if (date < start) {
      if (it.cycle === "매년") y += 1;
      else { m += 1; if (m > 12) { m = 1; y += 1; } }
      date = new Date(y, m - 1, payDayIn(it, y, m));
    }
    const dday = Math.round((date - start) / 86400000);
    return { ...it, date, month: date.getMonth() + 1, payDay: date.getDate(), dday };
  });
  return list.sort((a, b) => a.date - b.date).slice(0, count);
}

/** 만기일(endDate)이 지난 결제인지 */
const isEnded = (item, date) => {
  if (!item.endDate) return false;
  const [y, m, d] = item.endDate.split("-").map(Number);
  return date > new Date(y, m - 1, d);
};

/** 그 달(year, month: 1~12)에 나가는 결제 목록 → [{ ...항목, date }] */
export function paymentsInMonth(items, year, month) {
  return items
    .filter((it) => paysIn(it, month))
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

/** 사이드바·대시보드에서 "항목 추가" 창을 열고 싶을 때 */
export const openAddItem = () => window.dispatchEvent(new Event("gk-open-add"));
