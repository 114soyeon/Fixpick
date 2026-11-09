/* 날짜 키("2026-11-09") 만들기·보여주기 */

export const pad2 = (n) => String(n).padStart(2, "0");

/** m: 1~12 */
export const toKey = (y, m, d) => `${y}-${pad2(m)}-${pad2(d)}`;

export const todayKey = () => { const t = new Date(); return toKey(t.getFullYear(), t.getMonth() + 1, t.getDate()); };

/** 오늘부터 n년 뒤 (그 달에 없는 날이면 말일로) */
export const addYears = (n) => { const t = new Date(); const y = t.getFullYear() + n, m = t.getMonth() + 1; return toKey(y, m, Math.min(t.getDate(), new Date(y, m, 0).getDate())); };

/** "2026년 11월 9일" */
export const prettyDate = (key) => { if (!key) return ""; const [y, m, d] = key.split("-").map(Number); return `${y}년 ${m}월 ${d}일`; };

/** 만기까지 남은 기간 ("3개월 남음", "1년 2개월 남음") */
export const leftText = (key) => {
  if (!key) return "";
  const [y, m, d] = key.split("-").map(Number);
  const t = new Date(); const days = Math.round((new Date(y, m - 1, d) - new Date(t.getFullYear(), t.getMonth(), t.getDate())) / 86400000);
  if (days <= 0) return "오늘 만기";
  if (days < 31) return `${days}일 남음`;
  const months = (y - t.getFullYear()) * 12 + (m - 1 - t.getMonth()) - (d < t.getDate() ? 1 : 0);
  return months >= 12 ? `${Math.floor(months / 12)}년${months % 12 ? ` ${months % 12}개월` : ""} 남음` : `${months}개월 남음`;
};
