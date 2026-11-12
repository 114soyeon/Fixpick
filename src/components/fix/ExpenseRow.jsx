import { categoryStyle } from "../../constants/categories";
import { catClass, categoryKeyOf } from "../../utils/category";
import { won } from "../../utils/format";

// 아이콘 색은 카테고리 색(common.css의 .gk-cat--<key>), 큰 지출은 진한 남색(Fix.css의 .expense-icon.is-big)
const ExpenseIcon = ({ item }) => {
  const key = categoryKeyOf(item.category);
  const { icon: Icon } = categoryStyle(key);
  return (
    <div className={`expense-icon ${catClass(key)} ${item.big ? "is-big" : ""}`}>
      <Icon size={20} strokeWidth={2} aria-hidden="true" />
    </div>
  );
};

const ExpenseRow = ({ item, onClick }) => {
  return (
    <div className="table-row" onClick={onClick}>
      <div className="expense-name">
        <ExpenseIcon item={item} />
        <strong>{item.name}</strong>
        {item.expected && <span className="expected-badge">예상</span>}
        {item.big && <span className="big-badge">큰 지출</span>}
      </div>
      <span>{item.category}</span>
      <span>{item.period}</span>
      <span>{item.date}</span>
      <strong className="amount">{won(item.amount)}</strong>
      <span className="monthly-amount">{won(item.monthly)}</span>
    </div>
  );
};

export default ExpenseRow;
