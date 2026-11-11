const SummaryCards = () => {
  return (
    <section className="summary-cards">
      <div className="summary-card primary">
        <p>한 달 고정지출 (월 환산)</p>
        <h2>1,125,857원</h2>
      </div>

      <div className="summary-card">
        <p>자동 이체 되는 저축</p>
        <h2>300,000원</h2>
      </div>

      <div className="summary-card upcoming-card">
        <div>
          <p>다가오는 큰 지출</p>
          <h2>자동차세 130,000원</h2>
        </div>
        <span className="month-badge">12월</span>
      </div>
    </section>
  );
};

export default SummaryCards;
