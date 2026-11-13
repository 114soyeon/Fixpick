/*
 * 지출 리포트: 꺾은선 차트 카드 — 월간("최근 6개월 흐름")·연간("월별 지출 흐름") 같이 써요
 * - sideLabel / sideValue: 오른쪽 위 작은 글자 (예: "11월" / "가장 많이 나간 달")
 * - points / highlight / average: 꺾은선에 넘기는 값 (ReportCharts.jsx TrendLine)
 */
import { TrendLine } from "@/components/report/ReportCharts";

const TrendCard = ({ title, desc, sideLabel, sideValue, points, highlight, average }) => (
  <section className="rpt-card rpt-chart-card">
    <div className="rpt-card-head">
      <div>
        <h2 className="rpt-card-title">{title}</h2>
        <p className="rpt-card-desc">{desc}</p>
      </div>
      <div className="rpt-trend-side">
        <span className="rpt-trend-side-label">{sideLabel}</span>
        <strong className="rpt-trend-side-value">{sideValue}</strong>
      </div>
    </div>
    <div className="rpt-line">
      <TrendLine points={points} highlight={highlight} average={average} />
    </div>
  </section>
);

export default TrendCard;
