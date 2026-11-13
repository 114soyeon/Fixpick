import { getUser } from "@/utils/auth/auth";

/*
 * 설정(알림·예산·결제 수단)을 사람마다 브라우저에 저장해요.
 * 저장 위치: localStorage "gk-setting:<이메일>" (로그인 안 했으면 "gk-setting:guest")
 * 결제 수단 모양: { id, type("card"|"bank"), name, last4 }
 *   → 카드번호·계좌번호는 끝 4자리만 저장해요
 */
const EVENT = "gk-setting-change";

const DEFAULT = {
  alerts: { pay: true, budget: true, big: true, end: true },
  time: "9",
  budget: 1300000,
  methods: [], // 처음엔 비어 있어요 (결제 수단 추가 창에서 등록)
};

const keyOf = () => `gk-setting:${(getUser()?.email || "guest").toLowerCase()}`;

let cache = { key: null, value: DEFAULT };

/** 지금 사람의 설정 (같은 객체를 다시 돌려줘서 화면이 쓸데없이 다시 그려지지 않아요) */
export function readSetting() {
  const key = keyOf();
  if (cache.key !== key) {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(key)); } catch { /* 읽기 실패는 무시 */ }
    cache = { key, value: { ...DEFAULT, ...saved } };
  }
  return cache.value;
}

/** 설정 일부 바꾸기 (바꾸면 바로 저장) */
export function saveSetting(changes) {
  const value = { ...readSetting(), ...changes };
  try { localStorage.setItem(cache.key, JSON.stringify(value)); } catch { /* 저장 실패는 무시 */ }
  cache = { ...cache, value };
  window.dispatchEvent(new Event(EVENT));
}

/** 결제 수단 추가 */
export function addMethod(method) {
  const { methods } = readSetting();
  saveSetting({ methods: [...methods, { id: Date.now(), ...method }] });
}

/** 설정이 바뀌거나 로그인·로그아웃할 때마다 cb 를 불러요 (hooks/useSetting.js 가 써요) */
export function subscribeSetting(cb) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("gk-auth-change", cb); // 로그인·로그아웃하면 그 사람 설정으로
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("gk-auth-change", cb);
  };
}
