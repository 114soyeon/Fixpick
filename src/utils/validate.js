/* 입력값 검사·변환 함수들 */

/** 이메일 모양이 맞는지 */
export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/** 010-1234-5678 모양의 휴대폰 번호인지 */
export const isValidPhone = (phone) => /^01[016789]-\d{3,4}-\d{4}$/.test(phone);

/** 숫자만 받아서 010-1234-5678 모양으로 */
export function formatPhone(v) {
  const d = v.replace(/[^0-9]/g, "").slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

/** 비밀번호 강도: 0(빈칸) ~ 3(안전) */
export function strengthOf(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[0-9]/.test(pw) && /[a-zA-Z]/.test(pw)) s++;
  if (/[^a-zA-Z0-9]/.test(pw)) s++;
  return pw ? Math.max(s, 1) : 0;
}
