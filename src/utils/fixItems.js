import { nextPayments, useItems } from "./items";
import { CATEGORY_NAMES } from "./fixConstants";
import { dateToKorean, getMonthly, getToday, keyToDate } from "./fixFormat";
import { loadEdits } from "./fixStorage";

/* 내 고정지출 목록(Fix)과 상세(FixDetail)가 같이 쓰는 데이터 */

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
  };
}

/** 목록·상세에서 보여줄 전체 고정지출 (추가·수정·삭제가 모두 반영돼요) */
export function useFixItems() {
  const added = useItems(); // 항목을 추가·삭제하면 자동으로 다시 그려져요
  const edits = loadEdits();

  return added
    .map(toFixItem)
    .map((item) => ({ ...item, ...edits[item.id] })); // 수정본이 있으면 덮어쓰기
}
