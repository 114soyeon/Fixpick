import { categoryStyle } from "../../constants/categories";
import { formatWon } from "../../utils/fixFormat";

// 카테고리 아이콘 (배경·글자 색은 Fix.css 의 .expense-icon--<key> 에서 정해요)
const ExpenseIcon = ({ categoryKey }) => {
  const { icon: Icon } = categoryStyle(categoryKey);

  return (
    <div className={`expense-icon expense-icon--${categoryKey}`}>
      <Icon size={20} strokeWidth={2} aria-hidden="true" />
    </div>
  );
};

const ExpenseRow = ({ item, onClick }) => {
  return (
    <div className="table-row" onClick={onClick}>
      <div className="expense-name">
        <ExpenseIcon categoryKey={item.categoryKey} />
        <strong>{item.name}</strong>
        {item.expected && <span className="expected-badge">예상</span>}
      </div>
      <span>{item.category}</span>
      <span>{item.period}</span>
      <span>{item.date}</span>
      <strong className="amount">{formatWon(item.amount)}</strong>
      <span className="monthly-amount">{formatWon(item.monthly)}</span>
    </div>
  );
};

export default ExpenseRow;
