/*
 * 지출 리포트 연간 화면: "올해 달라진 점" 안의 작은 카드 (제목 + 큰 값 + 목록 3줄)
 * - rows: 목록 줄 [{ key, category, name, sub, amount, amountTone }]
 * - empty: 목록이 비었을 때 보여줄 문구
 */
import CatIcon from "@/components/report/CatIcon";

const ChangeCard = ({ label, value, tone, rows, empty }) => (
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

export default ChangeCard;
