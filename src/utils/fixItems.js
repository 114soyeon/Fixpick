import { nextPayments } from "./items";
import { CATEGORY_NAMES } from "./fixConstants";
import { dateToKorean, getMonthly, getToday, keyToDate } from "./fixFormat";
import { categoryKeyOf } from "./category";
import { useMySub } from "../queries/subs";

/* 내 고정지출 목록(Fix)과 상세(FixDetail)가 같이 쓰는 데이터 */

/** DB 행(subscriptions) → 항목 추가 창이 저장하는 폼 */
const fromDb = (row) => {
  const cat = row.categories; // select 의 categories ( id, name )
  return {
    id: Number(row.id),
    category: categoryKeyOf(cat?.name), // "구독 서비스" → "sub"
    name: row.name,
    amount: row.amount,
    amountType: row.amount_type === "변동" ? "variable" : "fixed",
    cycle: row.cycle,
    day: row.day,        // 매달 며칠 / 매년 며칠
    month: row.month,    // 매년 결제월
    weekday: row.week,           // 0~6 (일~토)
    every: row.custom_number,    // 사용자화 간격
    unit: row.custom_text,       // 사용자화 단위 ("day" | "week" | "month" | "year")
    start: row.start_date,   // "YYYY-MM-DD"
    endDate: row.expiry_date,
    memo: row.memo ?? "",
    payMethod: row.pay_method,
    remind: row.remind,
  };
};

/** DB 에서 내 고정지출 "원본" 목록 (다가오는 결제 카드가 써요) */
export const useRawFixItems = () => {
  const { data: rows } = useMySub();
  return (rows ?? []).map(fromDb);
};

/** 항목 추가 창에서 저장한 항목 → 목록 페이지에서 쓰는 모양으로 바꾸기 */
function toFixItem(item) {
  const next = nextPayments([item], getToday(), 1)[0];
  const categoryKey = CATEGORY_NAMES[item.category] ? item.category : "etc";

  return {
    id: item.id,
    name: item.name,
    categoryKey, // 아이콘·색 찾을 때 사용 (home, phone, ...)
    category: CATEGORY_NAMES[categoryKey], // 화면에 보이는 이름
    period: item.cycle === "매달" ? "매월" : item.cycle,
    date: next ? dateToKorean(next.date) : "",
    amount: item.amount,
    monthly: getMonthly(item.amount, item.cycle),
    amountType: item.amountType === "variable" ? "변동" : "고정",
    expected: item.amountType === "variable",
    method: item.payMethod || "",
    startDate: dateToKorean(keyToDate(item.start) || new Date(item.id)),
    endDate: dateToKorean(keyToDate(item.endDate)),
    memo: item.memo ?? "",
  };
}

/* 목록·상세에서 보여줄 전체 고정지출 */
export function useFixItems() {
  const added = useRawFixItems();

  return added.map(toFixItem);
}
