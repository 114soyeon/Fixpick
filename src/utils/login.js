/* 로그인 페이지에서 쓰는 함수들 */

/* 최근에 쓴 로그인 방법 기억하기 ("kakao" | "google" | "email") */
const LAST_KEY = "gk-last-login";
export const readLastLogin = () => { try { return localStorage.getItem(LAST_KEY) || ""; } catch { return ""; } };
export const saveLastLogin = (how) => { try { localStorage.setItem(LAST_KEY, how); } catch { /* 저장 실패는 무시 */ } };

/** "2026-11-09" → "2026.11.09 가입" */
export const joinedText = (d) => (d ? d.replaceAll("-", ".") + " 가입" : "");
