/*
 * 결제 캘린더 오른쪽 가운데: 선택한 날짜의 결제 목록 (5개가 넘으면 스크롤)
 * - date: 선택한 날짜
 * - payments: 그날 결제 목록 (이름순으로 정렬해서 넘겨줘요)
 */
import { monthDay, won } from "../../utils/format";
import PayItem from "./PayItem";

const DayCard = ({ date, payments }) => {
  const total = payments.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="paycal-card paycal-detail paycal-day-card">
      <div className="paycal-detail-head">
        <h3 className="paycal-detail-title">{monthDay(date)}</h3>
        <span className="paycal-detail-total">
          {payments.length}건 · {won(total)}
        </span>
      </div>
      {payments.length > 0 ? (
        <ul className="paycal-list paycal-list-scroll">
          {payments.map((item) => (
            <PayItem key={item.id} item={item} />
          ))}
        </ul>
      ) : (
        <p className="paycal-empty">이 날은 결제 일정이 없어요</p>
      )}
    </div>
  );
};

export default DayCard;
