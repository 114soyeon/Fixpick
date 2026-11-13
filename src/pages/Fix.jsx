import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Fix.css";
import StatCard from "../components/common/StatCard";
import ExpenseRow from "../components/fix/ExpenseRow";
import { useFixItems, useRawFixItems } from "../utils/fixItems";
import { calculateFixedExpense, calculateMonthlySavings, getUpcomingExpense } from "../utils/fixCalculations";
import { useMySub } from "../queries/subs";
import { ALL_CATEGORY, CATEGORY_NAMES, DEFAULT_SORT, FIX_CATEGORIES, SORT_OPTIONS } from "../utils/fixConstants";
import { categoryKeyOf } from "../utils/category";
import { getNextPaymentDate } from "../utils/cycle";
import { formatWon } from "../utils/fixFormat";

const Fix = () => {
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY);
  const [sortOrder, setSortOrder] = useState(DEFAULT_SORT);

  // 사이드바에서 추가한 항목 + 상세에서 수정한 내용
  const allItems = useFixItems();

  const { data: subs } = useMySub();
  const rawItems = useRawFixItems();

  // 다음 결제일을 숫자로 (계산 안 되면 0 → 목록 맨 뒤로)
  const nextValue = (row) => getNextPaymentDate(row)?.getTime() ?? 0;
  // 등록 시각을 숫자로 (거의 동시에 등록한 건 id로 순서 고정)
  const createdValue = (row) => Date.parse(row.created_at) || 0;

  // 카테고리 필터 + 정렬
  const visibleRows = (subs ?? [])
    .filter((row) => {
      if (selectedCategory === ALL_CATEGORY) return true;
      const key = row.categories?.key ?? categoryKeyOf(row.categories?.name);
      return CATEGORY_NAMES[key] === selectedCategory;
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case "created": return createdValue(b) - createdValue(a) || b.id - a.id; // 최신 등록순
        case "high":   return Number(b.amount) - Number(a.amount); // 금액 높은순
        case "low":    return Number(a.amount) - Number(b.amount); // 금액 낮은순
        case "latest": return nextValue(b) - nextValue(a);         // 최신순
        case "oldest": return nextValue(a) - nextValue(b);         // 과거순
        default:       return 0;
      }
    });

  // 다가오는 큰 지출: { title, amount, month } 또는 null
  const upcomingExpense = getUpcomingExpense(rawItems);

  return (
    <div className="expenses-page">
      {/* 페이지 제목 + 설명 */}
      <header className="page-header">
        <h1 className="page-title">내 고정지출</h1>
        <p className="page-description">
          매달, 매년 빠져나가는 돈을 한곳에서 봐요
        </p>
      </header>

      {/* 요약 카드 — 모양은 공통 StatCard, 이 화면 크기는 Fix.css의 .summary-cards .stat-card */}
      <section className="summary-cards">
        <StatCard
          highlight
          label="한 달 고정지출 (월 환산)"
          value={formatWon(calculateFixedExpense(allItems))}
        />
        <StatCard
          label="자동으로 빠지는 저축 (별도)"
          value={formatWon(calculateMonthlySavings(allItems))}
        />
        <StatCard
          label="다가오는 큰 지출"
          value={
            upcomingExpense
              ? `${upcomingExpense.title} ${formatWon(upcomingExpense.amount)}`
              : "예정된 지출이 없습니다."
          }
          badge={upcomingExpense?.month}
        />
      </section>

      {/* 카테고리 및 정렬 */}
      <section className="filter-area">
        <div className="category-list">
          {FIX_CATEGORIES.map((category) => (
            <button
              key={category}
              className={
                selectedCategory === category
                  ? "category-button active"
                  : "category-button"
              }
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <select
          className="sort-select"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </section>

      {/* 고정지출 테이블 */}
      <section className="expense-table">
        <div className="table-header">
          <span>항목</span>
          <span>카테고리</span>
          <span>주기</span>
          <span>다음 결제일</span>
          <span>결제 금액</span>
          <span>월 환산</span>
        </div>

        {visibleRows.map((item) => (
          <ExpenseRow
            key={item.id}
            item={item}
            onClick={() => navigate(`/fix/${item.id}`)}
          />
        ))}

        {visibleRows.length === 0 && (
          <p className="empty-message">등록된 고정지출이 없습니다.</p>
        )}
      </section>

      <p className="copyright">
        Copyright © 2026. Fixpick All rights reserved.
      </p>
    </div>
  );
};

export default Fix;
