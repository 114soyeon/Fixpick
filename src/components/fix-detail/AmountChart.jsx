import { getBarLevel } from "@/utils/fix/fixCalculations";

// history: [{ year: 숫자, amount: 숫자 }, ...] 형태의 배열을 받아서 그리기만 해요
// 막대 높이는 FixDetail.css 의 .chart-bar--<1~10> 클래스로 정해요
const AmountChart = ({ history }) => {
  const maxAmount = Math.max(...history.map((h) => h.amount));
  const currentYear = history[history.length - 1]?.year;

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
              className={[
                "chart-bar",
                `chart-bar--${getBarLevel(h.amount, maxAmount)}`,
                h.year === currentYear && "current",
              ]
                .filter(Boolean)
                .join(" ")}
            />
            <span className="chart-year">{h.year}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AmountChart;
