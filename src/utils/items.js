import { useSyncExternalStore } from "react";
import { getUser, useUser } from "./auth";

/*
 * 사람마다 등록한 고정지출 항목을 브라우저에 따로 저장해요.
 * 저장 위치: localStorage "gk-items:<이메일>"
 * 항목 모양: { id, category, name, amount, day, cycle("매달"|"매년"), month(매년일 때), payMethod, remind }
 */
const EVENT = "gk-items-change";
const EMPTY = [];
const cache = new Map();
const keyOf = (email) => `gk-items:${email.toLowerCase()}`;

function readItems(email) {
  if (!email) return EMPTY;
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

/** 항목 추가 (로그인 안 했으면 false) */
export function addItem(item) {
  const user = getUser();
  if (!user) return false;
  const now = new Date();
  const next = [...readItems(user.email), { id: Date.now(), month: now.getMonth() + 1, ...item }];
  writeItems(user.email, next);
  return true;
}

/** 항목 지우기 */
export function removeItem(id) {
  const user = getUser();
  if (!user) return;
  writeItems(user.email, readItems(user.email).filter((it) => it.id !== id));
}

/** 지금 로그인한 사람의 항목 목록 (로그아웃 상태면 빈 배열) */
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

/** 사이드바·대시보드에서 "항목 추가" 창을 열고 싶을 때 */
export const openAddItem = () => window.dispatchEvent(new Event("gk-open-add"));
