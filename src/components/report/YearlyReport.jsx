/*
 * 지출 리포트 — 연간 화면 (pages/Report.jsx에서 "연간"일 때 보여줘요)
 * 올해 1월 ~ 이번 달에 실제로 나간 금액 (매년 결제는 결제한 달에 전액)
 */
import { paymentsInMonth } from "../../utils/items";
import {
  byCategory,
  byItem,
  categoryChanges,
  endDateOf,
  endedInYear,
  paymentsInYear,
  perMonth,
  sumValue,
} from "../../utils/report";
import { scheduleText, signedWon, won } from "../../utils/format";
import { categoryStyle } from "../../constants/categories";
import { CategoryCard, ChangeCard, DiffValue, StatCard, TrendCard } from "./ReportCards";

const YearlyReport = ({ items, year, month, today }) => {
  // 올해 1월 ~ 이번 달 / 작년 같은 기간
  const thisYear = paymentsInYear(items, year, month);
  const lastYear = paymentsInYear(items, year - 1, month);
  const total = sumValue(thisYear);
  const diff = total - sumValue(lastYear);

  const cats = byCategory(thisYear);
  const itemTotals = byItem(thisYear); // 항목별 올해 합계 (큰 순서)
  const biggest = itemTotals[0];

  // 월별 흐름 (1~12월, 아직 안 온 달은 점 없음)
  const points = Array.from({ length: 12 }, (_, i) => ({
    label: `${i + 1}월`,
    value: i + 1 <= month ? sumValue(paymentsInMonth(items, year, i + 1).map((p) => ({ value: p.amount }))) : null,
  }));
  const average = Math.round(total / month); // 월평균 = 올해 합계 ÷ 지난 달 수
  const maxIndex = points.reduce((best, p, i) => (p.value != null && p.value > (points[best].value ?? -1) ? i : best), 0);

  // ── 올해 달라진 점: 카테고리마다 (올해 − 작년 같은 기간)
  const catDiffs = categoryChanges(thisYear, lastYear).map((c) => ({
    ...c,
    category: c.key,
    name: categoryStyle(c.key).name,
    sub: c.endedName
      ? `${c.endedName} 해지로 줄었어요`
      : c.change > 0
        ? "작년보다 늘었어요"
        : "작년보다 줄었어요",
  }));
  const more = catDiffs.filter((c) => c.change > 0).sort((a, b) => b.change - a.change);
  const less = catDiffs.filter((c) => c.change < 0).sort((a, b) => a.change - b.change);
  const toRows = (list, tone) =>
    list.slice(0, 3).map((c) => ({ ...c, amount: signedWon(c.change), amountTone: tone }));

  // 가장 많이 쓴 카테고리와 그 안의 큰 항목 3개
  const topCat = cats[0];
  const topItems = topCat
    ? itemTotals
        .filter((it) => it.category === topCat.key)
        .slice(0, 3)
        .map((it, i) => ({
          key: it.id,
          category: it.category,
          name: it.name,
          sub:
            i === 0
              ? `${categoryStyle(it.category).name}에서 가장 커요`
              : it.amountType === "variable"
                ? "달마다 금액이 달라져요"
                : it.cycle === "매년"
                  ? `매년 ${it.month}월에 나가요`
                  : "매달 나가요",
          amount: won(it.value),
        }))
    : [];

  // 올해 해지한 항목 (만기일이 올해이고 오늘까지 지난 것)
  const endedThisYear = endedInYear(items, year, today);
  const endedRows = endedThisYear.slice(0, 3).map((it) => ({
    key: it.id,
    category: it.category,
    name: it.name,
    sub: `${endDateOf(it).getMonth() + 1}월에 해지했어요`,
    amount: `${signedWon(-perMonth(it))}/월`,
    amountTone: "down",
  }));

  return (
    <>
      {/* ── 요약 카드 3개 ── */}
      <div className="rpt-stats">
        <StatCard highlight label="올해 낸 고정지출" value={won(total)} sub={`1~${month}월에 실제로 나간 금액이에요`} />
        <StatCard
          label="작년보다"
          period={`(${year - 1}년 1~${month}월)`}
          value={<DiffValue diff={diff} />}
          tone={diff < 0 ? "down" : undefined}
        />
        <StatCard
          label="올해 가장 큰 고정지출"
          value={biggest ? `${biggest.name} ${won(biggest.value)}` : "없음"}
          sub={biggest && scheduleText(biggest)}
        />
      </div>

      {/* ── 차트 2개 ── */}
      <div className="rpt-charts">
        <CategoryCard title="올해 카테고리 비율" cats={cats} total={total} />
        <TrendCard
          title="월별 지출 흐름"
          desc={`월평균 ${won(average)}`}
          sideLabel="가장 많이 나간 달"
          sideValue={`${maxIndex + 1}월 ${won(points[maxIndex].value ?? 0)}`}
          points={points}
          highlight={month - 1}
          average={average}
        />
      </div>

      {/* ── 올해 달라진 점 ── */}
      <section className="rpt-card rpt-changes-card">
        <h2 className="rpt-card-title">올해 달라진 점</h2>
        <div className="rpt-changes">
          <ChangeCard
            label="작년보다 더 쓴 곳"
            value={signedWon(more.reduce((s, c) => s + c.change, 0))}
            rows={toRows(more)}
            empty="작년보다 더 쓴 곳이 없어요"
          />
          <ChangeCard
            label="작년보다 아낀 곳"
            value={signedWon(less.reduce((s, c) => s + c.change, 0))}
            tone={less.length ? "down" : undefined}
            rows={toRows(less, "down")}
            empty="작년보다 아낀 곳이 없어요"
          />
          <ChangeCard
            label="가장 많이 쓴 카테고리"
            value={topCat ? `${categoryStyle(topCat.key).name} ${won(topCat.value)}` : "없음"}
            rows={topItems}
            empty="등록한 고정지출이 없어요"
          />
          <ChangeCard
            label="올해 생기고 없어진 항목"
            value={`시작 0개 · 해지 ${endedThisYear.length}개`}
            rows={endedRows}
            empty="올해 해지한 항목이 없어요"
          />
        </div>
      </section>
    </>
  );
};

export default YearlyReport;
