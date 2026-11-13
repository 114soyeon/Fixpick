import {
  getDaysUntilEnd,
  getEndProgressLevel,
} from "../../utils/fix/fixCalculations";

// startDate: 시작일, endDate: 만기일 ("2027년 3월 4일" 형태 글자)
// 진행 막대 길이는 FixDetail.css 의 .end-progress-fill--<0~10> 클래스로 정해요
const EndDateCard = ({ startDate, endDate }) => {
  const daysLeft = getDaysUntilEnd(endDate);
  const level = getEndProgressLevel(startDate, endDate);

  return (
    <section className="card end-date-card">
      <h3>만기일까지</h3>

      <p className="end-days">
        {daysLeft ?? "-"}
        <small>일</small>
      </p>

      <div className="end-progress">
        <div className={`end-progress-fill end-progress-fill--${level}`} />
      </div>

      <p className="end-caption">{endDate ? `${endDate} 만기` : "만기일 없음"}</p>
    </section>
  );
};

export default EndDateCard;
