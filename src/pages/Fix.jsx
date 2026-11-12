import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import "../styles/Fix.css";
import SummaryCards from "../components/fix/SummaryCards";
import ExpenseRow from "../components/fix/ExpenseRow";
import { useItems } from "../utils/items";
import { useFixItems } from "../utils/fixItems";
import {
  ALL_CATEGORY,
  DEFAULT_SORT,
  FIX_CATEGORIES,
  PAGE_SIZE,
  SORT_OPTIONS,
} from "../utils/fixConstants";
import {
  calculateFixedExpense,
  calculateMonthlySavings,
  filterByCategory,
  getUpcomingExpense,
  sortExpenses,
} from "../utils/fixCalculations";

const Fix = () => {
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY);
  const [showAll, setShowAll] = useState(false);
  const [sortOrder, setSortOrder] = useState(DEFAULT_SORT);

  // 사이드바에서 추가한 항목 + 상세에서 수정한 내용
  const allItems = useFixItems();
  const rawItems = useItems();

  const filteredExpenses = sortExpenses(
    filterByCategory(allItems, selectedCategory),
    sortOrder,
  );
  const visibleExpenses = showAll
    ? filteredExpenses
    : filteredExpenses.slice(0, PAGE_SIZE);

  return (
    <div className="expenses-page">
      {/* 페이지 제목 + 설명 */}
      <header className="page-header">
        <h1 className="page-title">내 고정지출</h1>
        <p className="page-description">
          매달, 매년 빠져나가는 돈을 한곳에서 봐요
        </p>
      </header>

      {/* 요약 카드 */}
      <SummaryCards
        fixedExpense={calculateFixedExpense(allItems)}
        monthlySavings={calculateMonthlySavings(allItems)}
        upcomingExpense={getUpcomingExpense(rawItems)}
      />

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

        {/* 정렬 선택 (화살표는 lucide 아이콘, 위치는 Fix.css 의 .sort-select-icon) */}
        <div className="sort-select-wrap">
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
          <ChevronDown className="sort-select-icon" size={16} />
        </div>
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

        {visibleExpenses.map((item) => (
          <ExpenseRow
            key={item.id}
            item={item}
            onClick={() => navigate(`/fix/${item.id}`)}
          />
        ))}

        {/* 전체 항목 보기 */}
        {filteredExpenses.length > PAGE_SIZE && (
          <button
            className="show-all-button"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "접기" : `전체 ${filteredExpenses.length}개 보기`}
          </button>
        )}

        {filteredExpenses.length === 0 && (
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
