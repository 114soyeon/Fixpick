/*
 * 지출 리포트(pages/Report.jsx)에서 쓰는 카드 조각들
 * class는 모두 "rpt-" 로 시작 (styles/report.css)
 */
import { percent, won } from "../../utils/format";
import { categoryStyle } from "../../constants/categories";
import { catClass } from "../../utils/category";
import { CategoryDonut, TrendLine } from "./ReportCharts";

// 카테고리 아이콘 박스 (size: 24 | 26 | 30, 크기·색은 report.css의 .rpt-cat-icon)
export const CatIcon = ({ category, size = 26 }) => {
  const { icon: Icon } = categoryStyle(category);
  return (
    <span className={`rpt-cat-icon ${size === 26 ? "" : `rpt-cat-icon--${size}`} ${catClass(category)}`}>
      {Icon && <Icon size={Math.round(size * 0.55)} strokeWidth={2} />}
    </span>
  );
};

// 맨 위 요약 카드 3개 중 하나
// period: 소제목 오른쪽에 붙는 비교 기간 (예: "(2025년 1~11월)")
export const StatCard = ({ label, period, value, sub, highlight, tone }) => (
  <div className={`rpt-card rpt-stat${highlight ? " is-highlight" : ""}`}>
    <p className="rpt-stat-label">
      {label}
      {period && <span className="rpt-stat-period">{period}</span>}
    </p>
    <p className={`rpt-stat-value${tone ? ` is-${tone}` : ""}`}>{value}</p>
    {sub && <p className="rpt-stat-sub">{sub}</p>}
  </div>
);

// "10월보다" 카드 값: ↘ 7,810원 감소 / ↗ 5,000원 증가 / 그대로
export const DiffValue = ({ diff }) => {
  if (diff === 0) return "그대로";
  return (
    <>
      <span className="rpt-arrow" aria-hidden>{diff < 0 ? "↘" : "↗"}</span>
      {won(Math.abs(diff))} {diff < 0 ? "감소" : "증가"}
    </>
  );
};

// 카테고리 비율 카드 (도넛 + 오른쪽 목록) — 월간·연간 같이 써요
export const CategoryCard = ({ title, cats, total }) => {
  const top = cats[0];
  return (
    <section className="rpt-card rpt-chart-card">
      <div className="rpt-card-head">
        <div>
          <h2 className="rpt-card-title">{title}</h2>
          <p className="rpt-card-desc">금액이 큰 순서로 보여줘요</p>
        </div>
      </div>

      {cats.length === 0 ? (
        <p className="rpt-empty">등록한 고정지출이 없어요</p>
      ) : (
        <div className="rpt-category">
          <div className="rpt-donut">
            <CategoryDonut cats={cats} />
            {/* 가운데 글자 (예: 주거 48.5%) — 차트 위에 겹쳐서 보여줘요 */}
            <div className="rpt-donut-center">
              <span className="rpt-donut-label">{categoryStyle(top.key).name}</span>
              <strong className="rpt-donut-value">{percent(top.value, total)}</strong>
            </div>
          </div>
          <ul className="rpt-legend">
            {cats.map((c) => (
              <li key={c.key} className="rpt-legend-row">
                <span className={`rpt-legend-dot ${catClass(c.key)}`} />
                <CatIcon category={c.key} size={24} />
                <span className="rpt-legend-name">{categoryStyle(c.key).name}</span>
                <strong className="rpt-legend-pct">{percent(c.value, total)}</strong>
                <span className="rpt-legend-amount">{won(c.value)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

// 꺾은선 차트 카드 — 월간·연간 같이 써요
export const TrendCard = ({ title, desc, sideLabel, sideValue, points, highlight, average }) => (
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

// "올해 달라진 점" 안의 작은 카드 (제목 + 큰 값 + 목록 3줄)
export const ChangeCard = ({ label, value, tone, rows, empty }) => (
  <div className="rpt-change">
    <p className="rpt-stat-label">{label}</p>
    <p className={`rpt-change-value${tone ? ` is-${tone}` : ""}`}>{value}</p>
    {rows.length === 0 ? (
      <p className="rpt-empty rpt-empty-small">{empty}</p>
    ) : (
      <ul className="rpt-change-list">
        {rows.map((r) => (
          <li key={r.key} className="rpt-change-row">
            <CatIcon category={r.category} size={30} />
            <div className="rpt-change-info">
              <p className="rpt-change-name">{r.name}</p>
              <p className="rpt-change-sub">{r.sub}</p>
            </div>
            <strong className={`rpt-change-amount${r.amountTone ? ` is-${r.amountTone}` : ""}`}>{r.amount}</strong>
          </li>
        ))}
      </ul>
    )}
  </div>
);
