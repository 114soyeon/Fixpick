import { categoryIcons } from "../../constants/categories";
import { dateToKorean, formatWon, getMonthly } from "../../utils/fixFormat";
import { getNextPaymentDate } from "../../utils/cycle";

const ExpenseRow = ({ item, onClick }) => {
  const CategoryIcon = categoryIcons[item.categories.id];

  return (
    <div className="table-row" onClick={onClick}>
      <div className="expense-name">
        <div className={`expense-icon expense-icon--${item.categories.key}`}>
          <CategoryIcon size={20} strokeWidth={2} aria-hidden="true" />
        </div>
        <strong>{item.name}</strong>
        {item.amount_type === "변동" && <span className="expected-badge">예상</span>}
      </div>
      <span>{item.categories.name}</span>
      <span>{item.cycle}</span>
      <span>{dateToKorean(getNextPaymentDate(item))}</span>
      <strong className="amount">{formatWon(item.amount)}</strong>
      <span className="monthly-amount">{formatWon(getMonthly(item.amount, item.cycle))}</span>
    </div>
  );
};

export default ExpenseRow;
