import { won } from "@/utils/common/format";

// 막대 최대 높이 (가장 큰 금액 = 160px, FixDetail.css 의 .chart-bar--10 과 같은 높이)
const MAX_BAR_HEIGHT = 160;

// history: [{ year: 숫자, amount: 숫자 }, ...] 형태의 배열을 받아서 그리기만 해요
// 막대 높이는 금액에 정확히 비례해요 (반올림 단계 없이, 0원이면 0px)
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
              {won(h.amount)}
            </span>
            <div
              className={[
                "chart-bar",
                h.year === currentYear && "current",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{
                // 금액 ÷ 가장 큰 금액 × 160px
                height: maxAmount > 0 ? (h.amount / maxAmount) * MAX_BAR_HEIGHT : 0,
              }}
            />
            <span className="chart-year">{h.year}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AmountChart;
