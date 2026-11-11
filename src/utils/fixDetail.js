// "11월 5일" 또는 "2027년 3월 4일" → 날짜(Date)로 바꾸기
export const toDate = (text) => {
  const match = text.match(/(?:(\d{4})년 )?(\d{1,2})월 (\d{1,2})일/);
  if (!match) return null;
  const year = Number(match[1] || new Date().getFullYear());
  return new Date(year, Number(match[2]) - 1, Number(match[3]));
};

// 오늘부터 결제일까지 남은 날짜
export const getDday = (text) => {
  const target = toDate(text);
  if (!target) return "";
  const diff = Math.ceil((target - new Date()) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? `D-${diff}` : "지남";
};

// "2027년 3월 4일" → "2027-03-04" (팝업의 날짜 칸용)
export const toInputDate = (text) => {
  if (!text) return "";
  const date = toDate(text);
  if (!date) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

export const formatMoney = (number) => {
  return number.toLocaleString("ko-KR");
};

// "2027-03-04" → "2027년 3월 4일" (모달의 날짜를 화면용 글자로 바꾸기)
export const toKoreanDate = (text) => {
  if (!text) return "";
  const [year, month, day] = text.split("-");
  return `${year}년 ${Number(month)}월 ${Number(day)}일`;
};

// 주기에 따라 "월로 나눈 금액" 다시 계산하기
export const getMonthly = (amount, cycle) => {
  if (cycle === "매년") return Math.round(amount / 12);
  if (cycle === "매주") return Math.round((amount * 52) / 12);
  return amount; // 매월
};