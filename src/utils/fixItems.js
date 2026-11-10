import { expenses } from "./expenses";
import { nextPayments, useItems } from "./items";

/*
 * 내 고정지출 목록(Fix)과 상세(FixDetail)가 같이 쓰는 데이터
 *   = 기본 예시 데이터(expenses) + 사이드바 "항목 추가"로 등록한 항목(items.js)
 *   + 상세 페이지에서 수정한 내용("expense-edits") − 삭제한 항목("expense-deleted")
 */

// 항목 추가 창의 카테고리 key → 목록 페이지의 카테고리 이름과 아이콘
const CATEGORY_MAP = {
  home: { category: "주거·공과", icon: "/rent.svg" },
  phone: { category: "통신", icon: "/phone.svg" },
  sub: { category: "구독", icon: "/ott.svg" },
  rental: { category: "가전", icon: "/living.svg" },
  insure: { category: "보험", icon: "/insurance.svg" },
  saving: { category: "금융·저축", icon: "/save.svg" },
  transit: { category: "교통", icon: "/trans.svg" },
  car: { category: "자동차", icon: "/car.svg" },
  etc: { category: "생활·기타", icon: "/etc.svg" },
};

// Date → "11월 5일" (올해) / "2027년 3월 4일" (다른 해)
function toKoreanDate(date) {
  if (!date) return "";
  const md = `${date.getMonth() + 1}월 ${date.getDate()}일`;
  return date.getFullYear() === new Date().getFullYear()
    ? md
    : `${date.getFullYear()}년 ${md}`;
}

// "2027-03-04" → Date
function fromKey(key) {
  if (!key) return null;
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toMonthly(amount, cycle) {
  if (cycle === "매년") return Math.round(amount / 12);
  if (cycle === "매주") return Math.round((amount * 52) / 12);
  if (cycle === "매일") return amount * 30;
  return amount; // 매달
}

/** 항목 추가 창에서 저장한 항목 → 목록 페이지에서 쓰는 모양으로 바꾸기 */
function toFixItem(item) {
  const t = new Date();
  const today = { year: t.getFullYear(), month: t.getMonth() + 1, day: t.getDate() };
  const next = nextPayments([item], today, 1)[0];
  const { category, icon } = CATEGORY_MAP[item.category] || CATEGORY_MAP.etc;

  return {
    id: item.id,
    name: item.name,
    category,
    icon,
    period: item.cycle === "매달" ? "매월" : item.cycle,
    date: next ? toKoreanDate(next.date) : "",
    amount: item.amount,
    monthly: toMonthly(item.amount, item.cycle),
    amountType: item.amountType === "variable" ? "변동" : "고정",
    expected: item.amountType === "variable",
    method: item.payMethod || "",
    startDate: toKoreanDate(fromKey(item.start) || new Date(item.id)),
    endDate: toKoreanDate(fromKey(item.endDate)),
  };
}

/** 목록·상세에서 보여줄 전체 고정지출 (추가·수정·삭제가 모두 반영돼요) */
export function useFixItems() {
  const added = useItems(); // 항목을 추가하면 자동으로 다시 그려져요

  const saved = JSON.parse(localStorage.getItem("expense-edits") || "{}");
  const deleted = JSON.parse(localStorage.getItem("expense-deleted") || "[]");

  return [...expenses, ...added.map(toFixItem)]
    .map((e) => ({ ...e, ...saved[e.id] })) // 수정본이 있으면 덮어쓰기
    .filter((e) => !deleted.includes(e.id)); // 삭제된 건 빼기
}
