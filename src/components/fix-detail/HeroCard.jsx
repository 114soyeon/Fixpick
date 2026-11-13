import { daysUntil, ddayText, toDate } from "@/utils/common/date";
import { comma } from "@/utils/common/format";

// item: 항목 정보 (다음 결제일, 금액, 주기 등)
const HeroCard = ({ item }) => {
  return (
    <section className="card hero-card">
      <span className="dday-badge">{ddayText(daysUntil(toDate(item.date)))}</span>
      <p>다음 결제 · {item.date}</p>
      <h2>
        {comma(item.amount)} <small>원</small>
      </h2>
      <p>
        {item.period} 결제 · 월 {comma(item.monthly)}원
      </p>
    </section>
  );
};

export default HeroCard;
