/*
 * 지출 리포트 페이지 (시안: 04_지출 리포트 _ 월간 / 연간)
 * - 오른쪽 위 [월간 | 연간] 버튼으로 화면을 바꿔요. 처음엔 "월간"
 * - 계산은 utils/report.js, 차트는 components/report/ 에 있어요
 * - class는 다른 페이지와 겹치지 않게 모두 "rpt-" 로 시작 (styles/report.css)
 */
import { useState } from "react";
import "../styles/report.css";

import { useItems, paymentsInMonth } from "../utils/items";
import {
  byCategory,
  byItem,
  endDateOf,
  monthShare,
  monthsAgo,
  paymentsInYear,
  perMonth,
  prevMonthOf,
  sumValue,
} from "../utils/report";
import { categoryStyle } from "../constants/categories";
import { CategoryDonut, TrendLine } from "../components/report/ReportCharts";

/* ───────── 글자 만들기 도우미 ───────── */

// 1426211 → "1,426,211원"
const won = (n) => `${Math.round(n).toLocaleString("ko-KR")}원`;

// 부호 붙이기: +5,000원 / −5,000원 (시안의 빼기 기호 "−")
const signedWon = (n) => (n > 0 ? `+${won(n)}` : n < 0 ? `−${won(-n)}` : won(0));

// 비율 "48.5%"
const percent = (part, total) => `${total ? ((part / total) * 100).toFixed(1) : "0.0"}%`;

// 언제 나가는지: "매달 25일에 나가요" / "매년 3월 25일에 나가요"
const scheduleText = (item) =>
  item.cycle === "매년" ? `매년 ${item.month}월 ${item.day}일에 나가요` : `매달 ${item.day}일에 나가요`;

/* ───────── 작은 화면 조각들 ───────── */

// 카테고리 아이콘 박스
const CatIcon = ({ category, size = 26 }) => {
  const { icon: Icon, bg, color } = categoryStyle(category);
  return (
    <span className="rpt-cat-icon" style={{ background: bg, width: size, height: size }}>
      {Icon && <Icon size={Math.round(size * 0.55)} strokeWidth={2} color={color} />}
    </span>
  );
};

// 맨 위 요약 카드 3개 중 하나
const StatCard = ({ label, value, sub, highlight, tone }) => (
  <div className={`rpt-card rpt-stat${highlight ? " is-highlight" : ""}`}>
    <p className="rpt-stat-label">{label}</p>
    <p className={`rpt-stat-value${tone ? ` is-${tone}` : ""}`}>{value}</p>
    {sub && <p className="rpt-stat-sub">{sub}</p>}
  </div>
);

// "10월보다" 카드 값: ↘ 7,810원 감소 / ↗ 5,000원 증가 / 그대로
const DiffValue = ({ diff }) => {
  if (diff === 0) return "그대로";
  return (
    <>
      <span className="rpt-arrow" aria-hidden>{diff < 0 ? "↘" : "↗"}</span>
      {won(Math.abs(diff))} {diff < 0 ? "감소" : "증가"}
    </>
  );
};

// 카테고리 비율 카드 (도넛 + 오른쪽 목록) — 월간·연간 같이 써요
const CategoryCard = ({ title, cats, total }) => {
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
                <span className="rpt-legend-dot" style={{ background: categoryStyle(c.key).bar }} />
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

/* ═════════════════════════ 월간 리포트 ═════════════════════════ */
const MonthlyReport = ({ items, year, month }) => {
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
  const curByCat = Object.fromEntries(byCategory(cur).map((c) => [c.key, c.value]));
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
        <StatCard highlight label={`${month}월 고정지출`} value={won(total)} sub="연납·세금은 월 평균으로 넣었어요" />
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
                      {categoryStyle(r.key).name}
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

/* ═════════════════════════ 연간 리포트 ═════════════════════════ */

// "올해 달라진 점" 안의 작은 카드 (제목 + 큰 값 + 목록 3줄)
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
  const curByCat = Object.fromEntries(cats.map((c) => [c.key, c.value]));
  const lastByCat = Object.fromEntries(byCategory(lastYear).map((c) => [c.key, c.value]));
  const lastItems = byItem(lastYear);
  const thisItemMap = Object.fromEntries(itemTotals.map((it) => [it.id, it.value]));
  const catDiffs = [...new Set([...Object.keys(curByCat), ...Object.keys(lastByCat)])].map((key) => {
    // 작년보다 줄어든 항목 중 만기로 끝난 것 → "왓챠 해지로 줄었어요"
    const ended = lastItems.find(
      (it) => it.category === key && (thisItemMap[it.id] ?? 0) < it.value && endDateOf(it)
    );
    const change = (curByCat[key] ?? 0) - (lastByCat[key] ?? 0);
    return {
      key,
      category: key,
      name: categoryStyle(key).name,
      change,
      sub: ended ? `${ended.name} 해지로 줄었어요` : change > 0 ? "작년보다 늘었어요" : "작년보다 줄었어요",
    };
  });
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
  const endedThisYear = items
    .filter((it) => {
      const end = endDateOf(it);
      return end && end.getFullYear() === year && end <= today;
    })
    .sort((a, b) => endDateOf(b) - endDateOf(a));
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
          label="작년 같은 기간보다"
          value={<DiffValue diff={diff} />}
          tone={diff < 0 ? "down" : undefined}
          sub={`${year - 1}년 1~${month}월과 비교했어요`}
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

/* ═════════════════════════ 페이지 ═════════════════════════ */
const VIEWS = [
  { key: "monthly", label: "월간" },
  { key: "yearly", label: "연간" },
];

const Report = () => {
  const [view, setView] = useState("monthly"); // 처음엔 월간
  const items = useItems();

  // 오늘 기준 (이번 달 / 올해)
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  return (
    <div className="rpt-page">
      {/* ───── 제목 + 월간/연간 버튼 ───── */}
      <header className="rpt-header">
        <div>
          <h1 className="rpt-header-title">지출 리포트</h1>
          <p className="rpt-header-desc">고정지출이 어디로, 얼마나 나가는지 살펴봐요</p>
        </div>
        <div className="rpt-toggle" role="tablist" aria-label="리포트 기간">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              type="button"
              role="tab"
              aria-selected={view === v.key}
              className={`rpt-toggle-btn${view === v.key ? " is-active" : ""}`}
              onClick={() => setView(v.key)}
            >
              {v.label}
            </button>
          ))}
        </div>
      </header>

      {view === "monthly" ? (
        <MonthlyReport items={items} year={year} month={month} />
      ) : (
        <YearlyReport items={items} year={year} month={month} today={today} />
      )}
    </div>
  );
};

export default Report;
