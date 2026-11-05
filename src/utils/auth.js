import { useSyncExternalStore } from "react";

/*
 * 로그인 정보를 브라우저에 저장하는 간단한 도구예요.
 * - 가입한 계정 목록: localStorage "gk-accounts"
 * - 지금 로그인한 사람: "로그인 상태 유지"를 켜면 localStorage, 끄면 sessionStorage(브라우저를 닫으면 로그아웃)
 * ⚠️ 포트폴리오용 연습 코드예요. 실제 서비스는 서버(예: Supabase)에서 비밀번호를 관리해야 해요.
 */
const USER_KEY = "gk-user";
const ACCOUNTS_KEY = "gk-accounts";
const EVENT = "gk-auth-change";

const store = (kind) => {
  try { return kind === "session" ? window.sessionStorage : window.localStorage; } catch { return null; }
};
const read = (key, fallback, kind = "local") => {
  try {
    const v = store(kind)?.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key, value, kind = "local") => {
  try {
    const s = store(kind);
    if (!s) return;
    if (value === null) s.removeItem(key);
    else s.setItem(key, JSON.stringify(value));
  } catch {
    /* 저장 실패는 무시 */
  }
};

/** 비밀번호를 그대로 저장하지 않도록 간단히 바꿔서 저장 (연습용) */
const hash = (text) => {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) >>> 0;
  return `h${h.toString(36)}`;
};

const readUser = () => read(USER_KEY, null, "session") || read(USER_KEY, null, "local");
let cached = readUser();
const notify = () => {
  cached = readUser();
  window.dispatchEvent(new Event(EVENT));
};
const saveUser = (user, keep = true) => {
  write(USER_KEY, null, "session");
  write(USER_KEY, null, "local");
  write(USER_KEY, user, keep ? "local" : "session");
};
const publicUser = (a) => ({ name: a.name, phone: a.phone || "", email: a.email, subscriptionCount: 5 });

/** 로그인 없이 등록한 항목(gk-items:guest)을 그 계정으로 옮겨요 */
const moveGuestItems = (email) => {
  const guest = read("gk-items:guest", []);
  if (!guest.length) return;
  const key = `gk-items:${email.toLowerCase()}`;
  write(key, [...read(key, []), ...guest]);
  write("gk-items:guest", null);
};

export const getUser = () => cached;

/** 이미 가입한 이메일인지 */
export function emailExists(email = "") {
  const accounts = read(ACCOUNTS_KEY, {});
  return Boolean(accounts[email.trim().toLowerCase()]);
}

/** 회원가입: 계정을 저장하고 바로 로그인 */
export function signup({ name, phone = "", email, password }) {
  const key = email.trim().toLowerCase();
  const accounts = read(ACCOUNTS_KEY, {});
  if (accounts[key]) return { ok: false, field: "email", message: "이미 가입된 이메일이에요." };
  const account = { name: name.trim(), phone, email: email.trim(), pw: hash(password) };
  accounts[key] = account;
  write(ACCOUNTS_KEY, accounts);
  moveGuestItems(account.email);
  saveUser(publicUser(account), true);
  notify();
  return { ok: true };
}

/** 로그인: 가입한 이메일인지, 비밀번호가 맞는지 확인 */
export function login({ email, password, keep = true }) {
  const key = email.trim().toLowerCase();
  const accounts = read(ACCOUNTS_KEY, {});
  const account = accounts[key];
  if (!account) return { ok: false, field: "email", message: "가입되지 않은 이메일이에요. 회원가입을 먼저 해 주세요." };
  if (account.pw && account.pw !== hash(password)) return { ok: false, field: "pw", message: "비밀번호가 맞지 않아요. 다시 확인해 주세요." };
  if (!account.pw) { // 예전에 비밀번호 없이 만든 연습 계정
    accounts[key] = { ...account, pw: hash(password) };
    write(ACCOUNTS_KEY, accounts);
  }
  moveGuestItems(account.email);
  saveUser(publicUser(account), keep);
  notify();
  return { ok: true };
}

export function logout() {
  write(USER_KEY, null, "session");
  write(USER_KEY, null, "local");
  notify();
}

/** 이름 바꾸기 (설정 페이지에서 사용) */
export function updateUser(changes) {
  const user = readUser();
  if (!user) return;
  const next = { ...user, ...changes };
  const inSession = Boolean(read(USER_KEY, null, "session"));
  saveUser(next, !inSession);
  const accounts = read(ACCOUNTS_KEY, {});
  const key = user.email.toLowerCase();
  if (accounts[key]) accounts[key] = { ...accounts[key], name: next.name };
  write(ACCOUNTS_KEY, accounts);
  notify();
}

/** 회원 탈퇴: 저장된 계정을 지우고 로그아웃 */
export function deleteAccount() {
  const user = readUser();
  if (user) {
    const accounts = read(ACCOUNTS_KEY, {});
    delete accounts[user.email.toLowerCase()];
    write(ACCOUNTS_KEY, accounts);
  }
  logout();
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
