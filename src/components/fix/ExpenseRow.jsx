import { categoryStyle } from "../../constants/categories";

const CATEGORY_KEY = {
  "주거·공과": "home",
  통신: "phone",
  구독: "sub",
  가전: "rental",
  보험: "insure",
  "금융·저축": "saving",
  교통: "transit",
  자동차: "car",
  기타: "etc",
};

const ExpenseIcon = ({ item }) => {
  const { icon: Icon, bg, color } = categoryStyle(CATEGORY_KEY[item.category]);
  const style = item.big
    ? { background: "#102f4b", color: "#ffffff" }
    : { background: bg, color };

  return (
    <div className="expense-icon" style={style}>
      <Icon size={20} strokeWidth={2} aria-hidden="true" />
    </div>
  );
};

const formatMoney = (number) => {
  return number.toLocaleString("ko-KR") + "원";
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
      <strong className="amount">{formatMoney(item.amount)}</strong>
      <span className="monthly-amount">{formatMoney(item.monthly)}</span>
    </div>
  );
};

export default ExpenseRow;
