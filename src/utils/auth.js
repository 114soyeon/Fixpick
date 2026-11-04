import { useSyncExternalStore } from "react";

/*
 * 로그인 정보를 브라우저(localStorage)에 저장하는 간단한 도구예요.
 * 나중에 서버(API)를 붙이면 login / signup 안쪽만 바꾸면 돼요.
 */
const USER_KEY = "gk-user";
const ACCOUNTS_KEY = "gk-accounts";
const EVENT = "gk-auth-change";

const read = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key, value) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* 저장 실패는 무시 */
  }
};

let cached = read(USER_KEY, null);
const notify = () => {
  cached = read(USER_KEY, null);
  window.dispatchEvent(new Event(EVENT));
};

export const getUser = () => cached;

/** 회원가입: 이름을 저장하고 바로 로그인 */
export function signup({ name, email }) {
  const accounts = read(ACCOUNTS_KEY, {});
  accounts[email.toLowerCase()] = { name: name.trim(), email };
  write(ACCOUNTS_KEY, accounts);
  write(USER_KEY, { name: name.trim(), email, subscriptionCount: 5 });
  notify();
}

/** 로그인: 가입할 때 저장한 이름을 찾아서 사용 (없으면 이메일 앞부분) */
export function login({ email }) {
  const accounts = read(ACCOUNTS_KEY, {});
  const saved = accounts[email.toLowerCase()];
  const name = saved?.name || email.split("@")[0];
  write(USER_KEY, { name, email, subscriptionCount: 5 });
  notify();
}

export function logout() {
  write(USER_KEY, null);
  notify();
}

/** 프로필 동그라미 안 글자: 한글 세 글자 이상이면 뒤 두 글자(홍길동 → 길동), 아니면 첫 글자 */
export function initialOf(name = "") {
  const n = name.trim();
  if (/^[가-힣]{3,}$/.test(n)) return n.slice(-2);
  return n.slice(0, 1).toUpperCase();
}

/** 컴포넌트에서 현재 로그인한 사람 정보를 쓰는 훅 (로그아웃 상태면 null) */
export function useUser() {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener(EVENT, cb);
      const onStorage = (e) => { if (e.key === USER_KEY) notify(); };
      window.addEventListener("storage", onStorage);
      return () => { window.removeEventListener(EVENT, cb); window.removeEventListener("storage", onStorage); };
    },
    getUser,
    () => null
  );
}