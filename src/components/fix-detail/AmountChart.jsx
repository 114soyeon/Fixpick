// history: [{ year: 숫자, amount: 숫자 }, ...] 형태의 배열을 받아서 그리기만 해요
const AmountChart = ({ history }) => {
  const maxAmount = Math.max(...history.map((h) => h.amount));

  return (
    <section className="card">
      <h3>금액 변화</h3>
      <div className="chart">
        {history.map((h) => (
          <div className="chart-col" key={h.year}>
            <span className="chart-value">
              {Math.round(h.amount / 10000)}만
            </span>
            <div
              className={h.year === new Date().getFullYear() ? "chart-bar current" : "chart-bar"}
              style={{ "--bar-h": `${(h.amount / maxAmount) * 160}px` }} // 높이는 금액 비율이라 CSS 변수로만 넘겨요
            />
            <span className="chart-year">{h.year}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AmountChart;