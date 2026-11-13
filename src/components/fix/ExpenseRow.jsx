import { categoryIcons } from "../../constants/categories";
import { monthAmount } from "../../utils/items";
import { fromDbRow } from "../../utils/dbItem";
import { dateToKorean, getToday } from "../../utils/date";
import { won } from "../../utils/format";
import { getNextPaymentDate } from "../../utils/cycle";

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

/* 주기 칸에 보여줄 글자 */
const cycleLabel = (it) => {
  const n = Math.max(1, Number(it.custom_number) || 1);
  const wd = `${WEEK[Number(it.week ?? 1)]}요일`;
  switch (it.cycle) {
    case "매일": return "매일";
    case "매주": return `매주 ${wd}`;
    case "매달":
    case "매월": return it.day != null ? `매달 ${it.day}일` : "매달";
    case "매년": return `매년 ${it.month}월 ${it.day}일`;
    case "사용자화":
      return {
        day:   `${n}일`,
        week:  `${n}주 ${wd}`,
        month: `${n}개월 ${it.day}일`,
        year:  `${n}년 ${it.month}월 ${it.day}일`,
      }[it.custom_text] ?? "";
    default: return it.cycle;
  }
};

const ExpenseRow = ({ item, onClick }) => {
  const CategoryIcon = categoryIcons[item.categories.id];

  return (
    <div className="table-row" onClick={onClick}>
      <div className="expense-name">
        <div
          className={`expense-icon expense-icon--${item.categories.key}`}
          style={{ background: item.categories.bg, color: item.categories.color }} // DB 색
        >
          <CategoryIcon size={20} strokeWidth={2} aria-hidden="true" />
        </div>
        <strong>{item.name}</strong>
        {item.amount_type === "변동" && <span className="expected-badge">예상</span>}
      </div>
      <span>{item.categories.name}</span>
      <span>{cycleLabel(item)}</span>
      <span>{dateToKorean(getNextPaymentDate(item))}</span>
      <strong className="amount">{won(item.amount)}</strong>
      <span className="monthly-amount">{won(monthAmount(fromDbRow(item), getToday().year, getToday().month))} {/* 이번 달 금액 (매년은 ÷12) */}</span>
    </div>
  );
};

export default ExpenseRow;
