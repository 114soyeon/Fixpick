import { getDday, formatMoney } from "../../utils/fixFormat";

// item: 항목 정보 (다음 결제일, 금액, 주기 등)
const HeroCard = ({ item }) => {
  return (
    <section className="card hero-card">
      <span className="dday-badge">{getDday(item.date)}</span>
      <p>다음 결제 · {item.date}</p>
      <h2>
        {formatMoney(item.amount)} <small>원</small>
      </h2>
      <p>
        {item.period} 결제 · 월 {formatMoney(item.monthly)}원
      </p>
    </section>
  );
};

export default HeroCard;
