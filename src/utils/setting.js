import { useSyncExternalStore } from "react";
import { getUser } from "./auth";

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

function readSetting() {
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

/** 컴포넌트에서 설정을 쓰는 훅 */
export function useSetting() {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener(EVENT, cb);
      window.addEventListener("gk-auth-change", cb); // 로그인·로그아웃하면 그 사람 설정으로
      return () => {
        window.removeEventListener(EVENT, cb);
        window.removeEventListener("gk-auth-change", cb);
      };
    },
    readSetting
  );
}
