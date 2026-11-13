/*
 * 결제 캘린더 오른쪽 위: 그 달 결제 요약
 * - payments: 그 달에 나가는 결제 전체
 * - todayStart: 오늘 0시. 결제일이 이보다 앞이면 "결제된" 것으로 봐요 (오늘은 아직 남은 결제)
 */
import { won } from "@/utils/common/format";

// 목록 금액 합계
const sumAmount = (list) => list.reduce((sum, item) => sum + item.amount, 0);

const SummaryCard = ({ month, payments, todayStart }) => {
  const paidList = payments.filter((p) => p.date < todayStart);
  const paidAmount = sumAmount(paidList);
  const totalAmount = sumAmount(payments);
  const progress = payments.length ? (paidList.length / payments.length) * 100 : 0;

  return (
    <div className="paycal-card paycal-summary">
      <p className="paycal-summary-label">{month}월에 남은 결제</p>
      <p className="paycal-summary-amount">{won(totalAmount - paidAmount)}</p>

      {/* 결제 진행률: [진행 바] 결제된 건수/이번 달 전체 건수 (시안: 같은 줄) */}
      <div className="paycal-progress-row">
        <div className="paycal-progress">
          <div className="paycal-progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <p className="paycal-progress-text">
          {paidList.length}/{payments.length}건
        </p>
      </div>

      <hr className="paycal-divider" />

      <div className="paycal-summary-row">
        <span>결제된 금액</span>
        <strong>{won(paidAmount)}</strong>
      </div>
      <div className="paycal-summary-row">
        <span>이번 달 전체</span>
        <strong>{won(totalAmount)}</strong>
      </div>
    </div>
  );
};

export default SummaryCard;
