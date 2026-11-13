/*
 * 결제 캘린더 오른쪽 아래: 큰 지출 미리 보기
 * - list: 오늘부터 3개월 안 "매년" 결제 중 큰 순서 최대 4개 (utils/items.js bigPayments)
 */
import { monthDay } from "../../utils/format";
import { daysUntil, ddayText } from "../../utils/date";
import PayItem from "./PayItem";

const BigCard = ({ list }) => (
  <div className="paycal-card paycal-detail paycal-big-card">
    <div className="paycal-detail-head paycal-detail-head-col">
      <h3 className="paycal-detail-title">큰 지출 미리 보기</h3>
      <p className="paycal-detail-desc">자주 안 나가서 놓치기 쉬운 돈이에요</p>
    </div>
    {list.length > 0 ? (
      <ul className="paycal-list">
        {list.map((item) => (
          <PayItem
            key={`${item.id}-${item.date}`}
            item={item}
            sub={`${monthDay(item.date)} · ${ddayText(daysUntil(item.date))}`}
          />
        ))}
      </ul>
    ) : (
      <p className="paycal-empty">예정된 큰 지출이 없어요</p>
    )}
  </div>
);

export default BigCard;
