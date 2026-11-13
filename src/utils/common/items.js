import { getUser } from "@/utils/auth/auth";

/*
 * 사람마다 등록한 고정지출 항목을 브라우저에 따로 저장해요.
 * 저장 위치: localStorage "gk-items:<이메일>" (로그인해야 등록할 수 있어요)
 * 항목 모양은 utils/payment.js 설명 참고
 * 결제 날짜·금액 계산은 utils/payment.js, 항목 추가 창 열기는 utils/addItemFlow.js 에 있어요
 * 컴포넌트에서 목록을 쓸 땐 hooks/useItems.js
 */
const EVENT = "gk-items-change";
const EMPTY = [];
const cache = new Map();
const GUEST = "guest";
const keyOf = (email) => `gk-items:${(email || GUEST).toLowerCase()}`;

// 로그인·로그아웃하면 저장된 목록을 다시 읽어요
window.addEventListener("gk-auth-change", () => { cache.clear(); window.dispatchEvent(new Event(EVENT)); });

/** 그 사람의 저장된 항목 목록 (같은 배열을 다시 돌려줘서 화면이 쓸데없이 다시 그려지지 않아요) */
export function readItems(email) {
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

/** 항목 지우기 */
export function removeItem(id) {
  writeItems(owner(), readItems(owner()).filter((it) => it.id !== id));
}

/** 항목 목록이 바뀔 때마다 cb 를 불러요 → 그만 듣는 함수를 돌려줘요 (hooks/useItems.js 가 써요) */
export function subscribeItems(cb) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

/** 빈 목록 (매번 같은 배열) */
export const NO_ITEMS = EMPTY;
