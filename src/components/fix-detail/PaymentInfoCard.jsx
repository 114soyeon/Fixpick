// item: 항목 정보, onEdit: "수정" 버튼을 눌렀을 때 실행할 함수
const PaymentInfoCard = ({ item, onEdit }) => {
  return (
    <section className="card">
      <div className="card-head">
        <h3>결제 정보</h3>
        <button className="outline-button" onClick={onEdit}>
          수정
        </button>
      </div>

      <div className="info-grid">
        <div>
          <span>주기</span>
          <strong>{item.period}</strong>
        </div>
        <div>
          <span>금액 유형</span>
          <strong>{item.amountType || "고정"}</strong>
        </div>
        <div>
          <span>결제 수단</span>
          <strong>{item.method || "-"}</strong>
        </div>
        <div>
          <span>시작일</span>
          <strong>{item.startDate || "-"}</strong>
        </div>
        <div>
          <span>다음 결제일</span>
          <strong>{item.date}</strong>
        </div>
        <div>
          <span>만기일</span>
          <strong>{item.endDate || "-"}</strong>
        </div>
      </div>
    </section>
  );
};

export default PaymentInfoCard;