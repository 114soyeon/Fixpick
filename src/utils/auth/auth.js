import { useAuthStore } from "@/store/authStore";
import { signOut } from "@/api/auth";
import { supabase } from "@/lib/supabase";

/*
  로그인 정보를 저장하는 도구예요.
  - 로그인 상태: Supabase (store/authStore.js) — 여기서 읽고 여기로 알려 줘요
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
const notify = () => {
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

/** 지금 로그인한 사람 (Supabase 세션 기준 — 로그인 안 했으면 null) */
export const getUser = () => useAuthStore.getState().user;

/** 이미 가입한 이메일인지 */
export function emailExists(email = "") {
  const accounts = read(ACCOUNTS_KEY, {});
  return Boolean(accounts[email.trim().toLowerCase()]);
}

/** 이메일 일부를 가려요: minji.kim@gmail.com → min*****@gmail.com */
export function maskEmail(email = "") {
  const [id, domain = ""] = email.split("@");
  const show = id.length <= 3 ? id.slice(0, 1) : id.slice(0, 3);
  return `${show}${"*".repeat(Math.max(3, id.length - show.length))}@${domain}`;
}

/** 아이디(이메일) 찾기: 이름 + 휴대폰 번호로 Supabase 에서 찾아요 */
export async function findEmail({ name = "", phone = "" }) {
  const { data, error } = await supabase.rpc("find_email", {
    p_name: name.trim(),
    p_phone: phone,
  });
  if (error) return { ok: false, message: "조회에 실패했어요. 잠시 후 다시 시도해 주세요." };
  if (!data?.length) return { ok: false, message: "입력한 정보로 가입된 계정이 없어요." };
  return { ok: true, accounts: data.map((a) => ({ email: a.email, masked: maskEmail(a.email) })) };
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

/** 로그아웃 (Supabase 세션을 지워요) */
export async function logout() {
  try {
    await signOut(); // Supabase 요청은 api/auth.js
  } catch {
    /* 네트워크가 안 돼도 로컬 세션은 정리돼요 */
  }
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

/** 프로필 동그라미 안 글자: 이름 길이와 상관없이 첫 글자 */
export function initialOf(name = "") {
  const n = name.trim();
  return n.slice(0, 1).toUpperCase();
}