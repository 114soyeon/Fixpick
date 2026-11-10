import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Fix.css";
import { useFixItems } from "../utils/fixItems";

function MyExpenses() {
  const navigate = useNavigate();

  // 기본 데이터 + 사이드바에서 추가한 항목 + 상세에서 수정한 내용
  const allItems = useFixItems();
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [showAll, setShowAll] = useState(false);
  const [sortOrder, setSortOrder] = useState("high");

  // 카테고리 목록
  const categories = [
    "전체",
    "주거·공과",
    "통신",
    "구독",
    "가전",
    "보험",
    "금융·저축",
    "교통",
    "생활·기타",
    "자동차",
  ];

  // 카테고리 필터링
  let filteredExpenses =
    selectedCategory === "전체"
      ? allItems
      : allItems.filter((item) => item.category === selectedCategory);
  // 정렬 기능
  const getDateValue = (date) => {
    const currentYear = new Date().getFullYear();
    const match = date.match(/(?:(\d{4})년 )?(\d{1,2})월 (\d{1,2})일/);

    if (!match) return 0;

    const year = Number(match[1] || currentYear);
    const month = Number(match[2]);
    const day = Number(match[3]);

    return new Date(year, month - 1, day).getTime();
  };

  filteredExpenses = [...filteredExpenses].sort((a, b) => {
    switch (sortOrder) {
      case "high":
        return b.amount - a.amount;

      case "low":
        return a.amount - b.amount;

      case "latest":
        return getDateValue(b.date) - getDateValue(a.date);

      case "oldest":
        return getDateValue(a.date) - getDateValue(b.date);

      default:
        return 0;
    }
  });

  // 처음에는 8개만 표시
  const visibleExpenses = showAll
    ? filteredExpenses
    : filteredExpenses.slice(0, 8);

  // 금액 표시
  const formatMoney = (number) => {
    return number.toLocaleString("ko-KR") + "원";
  };

  return (
    <div className="expenses-page">
      {/* 상단 설명 */}
      <p className="page-description">
        매달, 매년 빠져나가는 돈을 한곳에서 봐요
      </p>

      {/* 요약 카드 */}
      <section className="summary-cards">
        <div className="summary-card primary">
          <p>한 달 고정지출 (월 환산)</p>
          <h2>1,125,857원</h2>
        </div>

        <div className="summary-card">
          <p>자동 이체 되는 저축</p>
          <h2>300,000원</h2>
        </div>

        <div className="summary-card upcoming-card">
          <div>
            <p>다가오는 큰 지출</p>
            <h2>자동차세 130,000원</h2>
          </div>
          <span className="month-badge">12월</span>
        </div>
      </section>

      {/* 카테고리 및 정렬 */}
      <section className="filter-area">
        <div className="category-list">
          {categories.map((category) => (
            <button
              key={category}
              className={
                selectedCategory === category
                  ? "category-button active"
                  : "category-button"
              }
              onClick={() => {
                setSelectedCategory(category);
                setShowAll(false);
              }}
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
          <option value="latest">최신순</option>
          <option value="oldest">과거순</option>
          <option value="high">금액 높은순</option>
          <option value="low">금액 낮은순</option>
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

        {visibleExpenses.map((item) => (
          <div
            className="table-row"
            key={item.id}
            onClick={() => navigate(`/fix/${item.id}`)}
          >
            {/* 항목 */}
            <div className="expense-name">
              <div className={`expense-icon ${item.color}`}>
                <img src={item.icon} alt={item.name} />
              </div>

              <strong>{item.name}</strong>

              {item.expected && <span className="expected-badge">예상</span>}

              {item.big && <span className="big-badge">큰 지출</span>}
            </div>

            <span>{item.category}</span>

            <span>{item.period}</span>

            <span>{item.date}</span>

            <strong className="amount">{formatMoney(item.amount)}</strong>

            <span className="monthly-amount">{formatMoney(item.monthly)}</span>
          </div>
        ))}

        {/* 전체 항목 보기 */}
        {filteredExpenses.length > 8 && (
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
    </div>
  );
}

export default MyExpenses;
