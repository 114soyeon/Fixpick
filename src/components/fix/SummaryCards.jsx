import { won } from "../../utils/format";
import { fixSummary } from "../../utils/fixItems";

/** 내 고정지출 위쪽 요약 카드 3개 (items: 목록에 보이는 전체 항목) */
const SummaryCards = ({ items }) => {
  const { monthlyTotal, saving, big, bigMonth } = fixSummary(items);
  return (
    <section className="summary-cards">
      <div className="summary-card primary">
        <p>한 달 고정지출 (월 환산)</p>
        <h2>{won(monthlyTotal)}</h2>
      </div>

      <div className="summary-card">
        <p>자동 이체 되는 저축</p>
        <h2>{won(saving)}</h2>
      </div>

      <div className="summary-card upcoming-card">
        <div>
          <p>다가오는 큰 지출</p>
          <h2>{big ? `${big.name} ${won(big.amount)}` : "없어요"}</h2>
        </div>
        {big && <span className="month-badge">{bigMonth}월</span>}
      </div>
    </section>
  );
};

export default SummaryCards;
