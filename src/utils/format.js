/*
 * 화면에 보여줄 글자 만들기 (숫자·금액·날짜)
 * 여러 페이지가 같이 써요 → 표시 방법을 바꿀 땐 여기만 고치면 돼요
 */

/** 1300000 → "1,300,000" (소수는 반올림) */
export const comma = (n) => Math.round(n).toLocaleString("ko-KR");

/** 1426211 → "1,426,211원" */
export const won = (n) => `${comma(n)}원`;

/** 부호 붙이기: +5,000원 / −5,000원 (시안의 빼기 기호 "−") */
export const signedWon = (n) => (n > 0 ? `+${won(n)}` : n < 0 ? `−${won(-n)}` : won(0));

/** 변동 금액(amountType "variable")이면 앞에 "약" → "약 55,000원" */
export const amountText = (item) => `${item.amountType === "variable" ? "약 " : ""}${won(item.amount)}`;

/** 비율 → "48.5%" (전체가 0이면 "0.0%") */
export const percent = (part, total) => `${total ? ((part / total) * 100).toFixed(1) : "0.0"}%`;

/** 언제 나가는지: "매달 25일에 나가요" / "매년 3월 25일에 나가요" */
export const scheduleText = (item) =>
  item.cycle === "매년" ? `매년 ${item.month}월 ${item.day}일에 나가요` : `매달 ${item.day}일에 나가요`;

/** Date → "11월 25일" */
export const monthDay = (date) => `${date.getMonth() + 1}월 ${date.getDate()}일`;

/** 목록의 금액(amount) 합계 */
export const sumAmount = (list) => list.reduce((sum, item) => sum + item.amount, 0);

/** 숫자만 남기기 ("1234-5678" → "12345678") */
export const onlyDigits = (text) => text.replace(/[^0-9]/g, "");
