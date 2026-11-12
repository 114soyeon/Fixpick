import { formatWon } from "../../utils/fixFormat";

// fixedExpense: 한 달 고정지출, monthlySavings: 저축 합계
// upcomingExpense: { title, amount, month } 또는 null
const SummaryCards = ({ fixedExpense, monthlySavings, upcomingExpense }) => {
  return (
    <section className="summary-cards">
      <div className="summary-card primary">
        <p>한 달 고정지출 (월 환산)</p>
        <h2>{formatWon(fixedExpense)}</h2>
      </div>

      <div className="summary-card">
        <p>자동으로 빠지는 저축 (별도)</p>
        <h2>{formatWon(monthlySavings)}</h2>
      </div>

      <div className="summary-card upcoming-card">
        <div>
          <p>다가오는 큰 지출</p>
          <h2>
            {upcomingExpense
              ? `${upcomingExpense.title} ${formatWon(upcomingExpense.amount)}`
              : "예정된 지출이 없습니다."}
          </h2>
        </div>

        {upcomingExpense && (
          <span className="month-badge">{upcomingExpense.month}</span>
        )}
      </div>
    </section>
  );
};

export default SummaryCards;
