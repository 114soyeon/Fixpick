/*
 * DB 한 줄(subscriptions, useMySub 결과) → 화면·계산에서 쓰는 항목 모양
 * 리포트·캘린더·내 고정지출이 같이 써요
 * 컬럼 이름이 달라서 바꿔 줘요 (예: expiry_date → endDate, week → weekday)
 */
export const fromDbRow = (row) => ({
  id: Number(row.id),
  // DB 카테고리 key("home", "sub" ...) — 아이콘·색·이름은 이 key로 찾아요 (hooks/useCategoryOf.js)
  category: row.categories?.key ?? "etc",
  categoryName: row.categories?.name ?? "", // DB 카테고리 이름 ("주거·공과" ...)
  name: row.name,
  amount: row.amount,
  amountType: row.amount_type === "변동" ? "variable" : "fixed",
  cycle: row.cycle,          // 매일 / 매주 / 매달 / 매년 / 사용자화
  day: row.day,              // 매달·매년 며칠
  month: row.month,          // 매년 몇 월
  weekday: row.week,         // 매주 요일 (0=일 ~ 6=토)
  every: row.custom_number,  // 사용자화: 몇 번마다
  unit: row.custom_text,     // 사용자화: day | week | month | year
  start: row.start_date,     // "YYYY-MM-DD"
  endDate: row.expiry_date,  // 만기일 (리포트에선 "해지")
  payMethod: row.pay_method, // 결제 수단 이름
  remind: row.remind,        // 결제 알림 받기
});
