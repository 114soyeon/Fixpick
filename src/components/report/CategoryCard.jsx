/*
 * 지출 리포트: 카테고리 비율 카드 (왼쪽 도넛 + 오른쪽 목록) — 월간·연간 같이 써요
 * - cats: 카테고리별 합계, 큰 순서 [{ key, value }] (utils/report.js byCategory)
 * - total: 전체 합계 (비율 계산용)
 */
import { percent, won } from "../../utils/format";
import { categoryStyle } from "../../constants/categories";
import { useCategoryColors } from "../../hooks/useCategoryColors";
import { CategoryDonut } from "./ReportCharts";
import CatIcon from "./CatIcon";

const CategoryCard = ({ title, cats, total }) => {
  const top = cats[0];
  const colorOf = useCategoryColors(); // DB 색
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
                <span className="rpt-legend-dot" style={{ background: colorOf(c.key).chart }} />
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

export default CategoryCard;
