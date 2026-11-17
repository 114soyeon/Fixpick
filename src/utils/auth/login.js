/* 로그인 페이지에서 쓰는 함수들 */

/* 최근에 쓴 로그인 방법 기억하기 ("kakao" | "google" | "email") */
const LAST_KEY = "gk-last-login";
export const readLastLogin = () => { try { return localStorage.getItem(LAST_KEY) || ""; } catch { return ""; } };
export const saveLastLogin = (how) => { try { localStorage.setItem(LAST_KEY, how); } catch { /* 저장 실패는 무시 */ } };

/*
  로그인 실패 오류 → 화면에 보여줄 { field, message }
  Supabase는 이메일이 없을 때와 비밀번호가 틀렸을 때를 구분해 주지 않아서(보안) 둘 다 표시해요.
  field: "both"면 이메일·비밀번호 칸 모두 빨갛게
*/
export function loginError(error) {
  const code = error?.code || "";
  const msg = error?.message || "";
  if (code === "account_disabled") return { field: "email", message: "탈퇴한 계정이에요. 다시 가입해 주세요." };
  if (code === "invalid_credentials" || /invalid login credentials/i.test(msg)) {
    return { field: "both", message: "이메일 또는 비밀번호가 맞지 않아요. 다시 확인해 주세요." };
  }
  if (code === "email_not_confirmed" || /email not confirmed/i.test(msg)) {
    return { field: "email", message: "이메일 인증이 아직 안 됐어요. 메일함을 확인해 주세요." };
  }
  if (code === "over_request_rate_limit" || error?.status === 429) {
    return { field: "", message: "로그인 시도가 너무 많아요. 잠시 뒤에 다시 해 주세요." };
  }
  return { field: "", message: "로그인하지 못했어요. 잠시 뒤에 다시 시도해 주세요." };
}

/* "2026-11-09" → "2026.11.09 가입" */
export const joinedText = (d) => (d ? d.replaceAll("-", ".") + " 가입" : "");

// 아이디 저장
const EMAIL_KEY = "gk-saved-email";
export const readSavedEmail = () => { try { return localStorage.getItem(EMAIL_KEY) || ""; } catch { return ""; } };
export const saveEmail = (email) => { try { localStorage.setItem(EMAIL_KEY, email); } catch { /* 저장 실패는 무시 */ } };
export const clearSavedEmail = () => { try { localStorage.removeItem(EMAIL_KEY); } catch { /* 지우기 실패는 무시 */ } };
