import { monthAmount, nextPayments } from "@/utils/common/payment";
import { CATEGORY_NAMES } from "@/constants/fix";
import { dateToKorean, getToday, keyToDate } from "@/utils/common/date";

/* 내 고정지출 목록(Fix)과 상세(FixDetail)가 같이 쓰는 데이터 모양 바꾸기
 * 컴포넌트에서 쓸 땐 hooks/useFixItems.js (useFixItems, useRawFixItems) */

/** 항목 추가 창에서 저장한 항목 → 목록 페이지에서 쓰는 모양으로 바꾸기 */
export function toFixItem(item) {
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
    monthly: monthAmount(item, getToday().year, getToday().month), // 이번 달 금액 (매년은 ÷12)
    amountType: item.amountType === "variable" ? "변동" : "고정",
    expected: item.amountType === "variable",
    method: item.payMethod || "",
    startDate: dateToKorean(keyToDate(item.start) || new Date(item.id)),
    endDate: dateToKorean(keyToDate(item.endDate)),
    memo: item.memo ?? "",
  };
}

