/*
  "항목 추가" 창 열기 흐름 (사이드바·로그인·대시보드가 같이 써요)
  로그인 안 한 사람이 항목 추가를 누르면 → 로그인 페이지로 보내고 이유를 기억 → 로그인 뒤 바로 창을 열어요
*/

// 사이드바·대시보드에서 "항목 추가" 창을 열고 싶을 때(로그인 안 했으면 사이드바가 로그인 페이지로 보냄)
export const openAddItem = () => window.dispatchEvent(new Event("gk-open-add"));

// 로그인 페이지로 보낼 때 이유를 잠깐 기억 → 로그인하면 바로 항목 추가 창을 연다
const REASON_KEY = "gk-login-reason";
export const setLoginReason = (why) => { try { sessionStorage.setItem(REASON_KEY, why); } catch { /* 무시 */ } };
export const takeLoginReason = () => {
  try { const v = sessionStorage.getItem(REASON_KEY) || ""; sessionStorage.removeItem(REASON_KEY); return v; } catch { return ""; }
};

// 이유를 지우지 않고 그냥 읽기만 (로그인 페이지가 안내 문구용)
export const peekLoginReason = () => {
  try { return sessionStorage.getItem(REASON_KEY) || ""; } catch { return ""; }
};