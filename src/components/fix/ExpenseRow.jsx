import { categoryIcons } from "../../constants/categories";
import { formatWon } from "../../utils/fixFormat";
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
        {item.expected && <span className="expected-badge">예상</span>}
      </div>
      <span>{item.categories.name}</span>
      <span>{item.cycle}</span>
      <span>{getNextPaymentDate(item)}</span>
      <strong className="amount">{formatWon(item.amount)}</strong>
      <span className="monthly-amount">{formatWon(item.monthly)}</span>
    </div>
  );
};

export default ExpenseRow;

/*const fromDb = (row) => {
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
    weekday: row.weekday,
    every: row.every,
    unit: row.unit,
    start: row.start_date,   // "YYYY-MM-DD"
    endDate: row.expiry_date,
    payMethod: row.pay_method,
    remind: row.remind,
  };
};*/