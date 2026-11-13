/*
 * 지출 리포트 — 월간 화면 (pages/Report.jsx에서 "월간"일 때 보여줘요)
 * 매년 결제는 ÷12 해서 넣어요 (utils/report/report.js monthShare)
 */
import { byCategory, byItem, monthShare, monthsAgo, prevMonthOf, sumValue } from "@/utils/report/report";
import { scheduleText, signedWon, won } from "@/utils/common/format";
import { useCategoryOf } from "@/hooks/useCategoryOf";
import StatCard from "@/components/common/StatCard";
import DiffValue from "@/components/report/DiffValue";
import CategoryCard from "@/components/report/CategoryCard";
import TrendCard from "@/components/report/TrendCard";
import CatIcon from "@/components/report/CatIcon";

// loading: DB에서 아직 불러오는 중이면 true → 금액 대신 "-" (0원이 잠깐 보이지 않게)
const MonthlyReport = ({ items, year, month, loading }) => {
  const catOf = useCategoryOf(); // DB 카테고리 이름
  const [py, pm] = prevMonthOf(year, month);

  // 이번 달·지난달 금액 (매년 결제는 ÷12 해서 넣어요)
  const cur = monthShare(items, year, month);
  const prev = monthShare(items, py, pm);
  const total = sumValue(cur);
  const diff = total - sumValue(prev);

  const cats = byCategory(cur);
  const biggest = byItem(cur)[0]; // 이번 달 가장 큰 항목

  // 최근 6개월 (5달 전 ~ 이번 달)
  const points = [5, 4, 3, 2, 1, 0].map((n) => {
    const [y, m] = monthsAgo(year, month, n);
    return { label: `${m}월`, value: sumValue(monthShare(items, y, m)) };
  });
  const average = Math.round(points.reduce((s, p) => s + p.value, 0) / points.length);

  // 지난달과 비교 표: 두 달 중 한 번이라도 나간 카테고리 (이번 달 금액 큰 순서)
  const curByCat = Object.fromEntries(cats.map((c) => [c.key, c.value]));
  const prevByCat = Object.fromEntries(byCategory(prev).map((c) => [c.key, c.value]));
  const keys = [...new Set([...Object.keys(curByCat), ...Object.keys(prevByCat)])].sort(
    (a, b) => (curByCat[b] ?? 0) - (curByCat[a] ?? 0) || (prevByCat[b] ?? 0) - (prevByCat[a] ?? 0)
  );
  const curIds = new Set(cur.map((it) => it.id));
  const rows = keys.map((key) => {
    const before = prevByCat[key] ?? 0;
    const now = curByCat[key] ?? 0;
    // 지난달엔 있었는데 이번 달엔 끝난(만기) 항목 → "왓챠 해지로 줄었어요"
    const endedNames = prev.filter((it) => it.category === key && !curIds.has(it.id)).map((it) => it.name);
    return {
      key,
      before,
      now,
      change: now - before,
      note: endedNames.length ? `${endedNames.join(", ")} 해지로 줄었어요` : "",
    };
  });

  return (
    <>
      {/* ── 요약 카드 3개 ── */}
      <div className="rpt-stats">
        <StatCard highlight label={`${month}월 고정지출`} value={loading ? "-" : won(total)} sub="연납·세금은 월 평균으로 넣었어요" />
        <StatCard
          label={`${pm}월보다`}
          value={<DiffValue diff={diff} />}
          tone={diff < 0 ? "down" : undefined}
        />
        <StatCard
          label="가장 큰 고정지출"
          value={biggest ? `${biggest.name} ${won(biggest.amount)}` : "없음"}
          sub={biggest && scheduleText(biggest)}
        />
      </div>

      {/* ── 차트 2개 ── */}
      <div className="rpt-charts">
        <CategoryCard title="카테고리 비율" cats={cats} total={total} />
        <TrendCard
          title="최근 6개월 흐름"
          desc={`월평균 ${won(average)}`}
          sideLabel={`${month}월`}
          sideValue={won(total)}
          points={points}
          highlight={points.length - 1}
          average={average}
        />
      </div>

      {/* ── 지난달과 비교 표 (좁은 화면에선 표만 옆으로 밀어서 봐요) ── */}
      <section className="rpt-card rpt-compare">
        <h2 className="rpt-card-title">지난달과 비교</h2>
        {rows.length === 0 ? (
          <p className="rpt-empty">비교할 고정지출이 없어요</p>
        ) : (
          <div className="rpt-table-wrap">
            {/* --rpt-rows: 줄 수 → 창이 낮으면 CSS가 줄 높이를 나눠서 줄여요 */}
            <table className="rpt-table" style={{ "--rpt-rows": rows.length }}>
              <thead>
                <tr>
                  <th className="rpt-col-cat">카테고리</th>
                  <th className="rpt-col-num">{pm}월</th>
                  <th className="rpt-col-num">{month}월</th>
                  <th className="rpt-col-num">변화</th>
                  <th className="rpt-col-note">내용</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.key}>
                    <td className="rpt-col-cat">
                      <span className="rpt-table-cat">
                        <CatIcon category={r.key} size={26} />
                        {catOf(r.key).name}
                      </span>
                    </td>
                    <td className="rpt-col-num rpt-muted">{won(r.before)}</td>
                    <td className="rpt-col-num rpt-strong">{won(r.now)}</td>
                    <td className={`rpt-col-num ${r.change < 0 ? "rpt-down" : r.change > 0 ? "rpt-strong" : "rpt-muted"}`}>
                      {r.change === 0 ? "그대로" : signedWon(r.change)}
                    </td>
                    <td className="rpt-col-note">{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
};

export default MonthlyReport;
