/* 내 고정지출(Fix)·상세(FixDetail)에서 쓰는 날짜·금액 변환 함수 */

// 오늘 날짜 → { year, month(1~12), day } (utils/items.js 함수들이 받는 모양)
export const getToday = () => {
  const t = new Date();
  return { year: t.getFullYear(), month: t.getMonth() + 1, day: t.getDate() };
};

// "11월 5일" 또는 "2027년 3월 4일" → Date
export const toDate = (text) => {
  if (!text) return null;
  const match = text.match(/(?:(\d{4})년 )?(\d{1,2})월 (\d{1,2})일/);
  if (!match) return null;
  const year = Number(match[1] || new Date().getFullYear());
  return new Date(year, Number(match[2]) - 1, Number(match[3]));
};

// 정렬용 숫자 (날짜를 못 읽으면 0)
export const getDateValue = (text) => toDate(text)?.getTime() ?? 0;

// "2027-03-04" → Date
export const keyToDate = (key) => {
  if (!key) return null;
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

// Date → "11월 5일" (올해) / "2027년 3월 4일" (다른 해)
export const dateToKorean = (date) => {
  if (!date) return "";
  const md = `${date.getMonth() + 1}월 ${date.getDate()}일`;
  return date.getFullYear() === new Date().getFullYear()
    ? md
    : `${date.getFullYear()}년 ${md}`;
};

// "2027년 3월 4일" → "2027-03-04" (모달의 날짜 칸용)
export const toInputDate = (text) => {
  const date = toDate(text);
  if (!date) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

// 오늘부터 결제일까지 남은 날짜
export const getDday = (text) => {
  const target = toDate(text);
  if (!target) return "";
  const diff = Math.ceil((target - new Date()) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? `D-${diff}` : "지남";
};

// 주기에 따라 "한 달로 환산한 금액" 계산
export const getMonthly = (amount, cycle) => {
  if (cycle === "매년") return Math.round(amount / 12);
  if (cycle === "매주") return Math.round((amount * 52) / 12);
  if (cycle === "매일") return amount * 30;
  return amount; // 매월(매달)
};
