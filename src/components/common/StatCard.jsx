/*
 * 요약 카드 (여러 화면에서 같이 써요)
 * - 지출 리포트 맨 위 카드 3개 / 내 고정지출 맨 위 카드 3개
 * - 모양은 styles/StatCard.css (class는 모두 "stat-card" 로 시작)
 *   화면마다 크기가 다르면 그 화면 CSS에서 덮어써요 (예: Fix.css의 .summary-cards .stat-card)
 *
 * - label: 소제목 / value: 큰 값 / sub: 아래 작은 설명
 * - period: 소제목 오른쪽에 붙는 비교 기간 (예: "(2025년 1~11월)")
 * - badge: 오른쪽에 붙는 작은 배지 (예: "1월")
 * - highlight: 연한 파란 강조 카드
 * - tone: "down"이면 값을 줄어든 색(초록)으로
 * - className: 이 카드만 따로 꾸밀 때 붙이는 class (예: "is-compact")
 */
import "../../styles/StatCard.css";

const StatCard = ({ label, period, value, sub, badge, highlight, tone, className }) => (
  <div className={`stat-card${highlight ? " is-highlight" : ""}${className ? ` ${className}` : ""}`}>
    <div className="stat-card-body">
      <p className="stat-card-label">
        {label}
        {period && <span className="stat-card-period">{period}</span>}
      </p>
      <p className={`stat-card-value${tone ? ` is-${tone}` : ""}`}>{value}</p>
      {sub && <p className="stat-card-sub">{sub}</p>}
    </div>
    {badge && <span className="stat-card-badge">{badge}</span>}
  </div>
);

export default StatCard;
