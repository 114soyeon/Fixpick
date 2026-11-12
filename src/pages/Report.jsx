/*
 * 지출 리포트 페이지 (시안: 04_지출 리포트 _ 월간 / 연간)
 * - 오른쪽 위 [월간 | 연간] 버튼으로 화면을 바꿔요. 처음엔 "월간"
 * - 이 파일은 제목 + 버튼만 있어요. 화면은 components/report/
 *   MonthlyReport(월간) / YearlyReport(연간)
 *   카드: StatCard(요약, components/common) / CategoryCard(카테고리 비율) / TrendCard(꺾은선) / ChangeCard(달라진 점)
 *   조각: DiffValue(증감 글자) / CatIcon(카테고리 아이콘) / ReportCharts(차트)
 * - 계산은 utils/report.js
 * - class는 다른 페이지와 겹치지 않게 모두 "rpt-" 로 시작 (styles/report.css)
 */
import { useState } from "react";
import "../styles/report.css";

import { useItems } from "../utils/items";
import MonthlyReport from "../components/report/MonthlyReport";
import YearlyReport from "../components/report/YearlyReport";

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
      <span className="gk-rpt-copy">Copyright © 2026. Fixpick All rights reserved.</span>
    </div>    
  );
};

export default Report;
