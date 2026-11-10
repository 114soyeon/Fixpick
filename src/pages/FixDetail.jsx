import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFixItems } from "../utils/fixItems";
import { removeItem } from "../utils/items";
import "../styles/FixDetail.css";
import PaymentEditModal from "../components/PaymentEditModal/PaymentEditModal.jsx";

// "11월 5일" 또는 "2027년 3월 4일" → 날짜(Date)로 바꾸기
function toDate(text) {
  const match = text.match(/(?:(\d{4})년 )?(\d{1,2})월 (\d{1,2})일/);
  if (!match) return null;
  const year = Number(match[1] || new Date().getFullYear());
  return new Date(year, Number(match[2]) - 1, Number(match[3]));
}

// 오늘부터 결제일까지 남은 날짜
function getDday(text) {
  const target = toDate(text);
  if (!target) return "";
  const diff = Math.ceil((target - new Date()) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? `D-${diff}` : "지남";
}

// "2027년 3월 4일" → "2027-03-04" (팝업의 날짜 칸용)
function toInputDate(text) {
  if (!text) return "";
  const date = toDate(text);
  if (!date) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function formatMoney(number) {
  return number.toLocaleString("ko-KR");
}

// "2027-03-04" → "2027년 3월 4일" (모달의 날짜를 화면용 글자로 바꾸기)
function toKoreanDate(text) {
  if (!text) return "";
  const [year, month, day] = text.split("-");
  return `${year}년 ${Number(month)}월 ${Number(day)}일`;
}

// 주기에 따라 "월로 나눈 금액" 다시 계산하기
function getMonthly(amount, cycle) {
  if (cycle === "매년") return Math.round(amount / 12);
  if (cycle === "매주") return Math.round((amount * 52) / 12);
  return amount; // 매월
}

const ALERT_OPTIONS = ["30일 전", "7일 전", "3일 전", "1일 전"];

function FixDetail() {
  const navigate = useNavigate();
  const { id } = useParams(); // 주소 /fix/8 에서 8을 꺼내와요

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payAlert, setPayAlert] = useState("1일 전");
  const [endAlert, setEndAlert] = useState("7일 전");

  // 전체 목록(기본 + 추가한 항목, 수정본 반영)에서 항목 찾기
  const allItems = useFixItems();
  const mergedItem = allItems.find((e) => e.id === Number(id));

  const [item, setItem] = useState(() => {
    if (!mergedItem) return mergedItem;
    const savedMemo = localStorage.getItem(`memo-${id}`);
    return { ...mergedItem, memo: savedMemo ?? mergedItem.memo };
  });

  // 없는 번호로 들어왔을 때
  if (!item) {
    return (
      <div className="detail-page">
        <p>항목을 찾을 수 없어요.</p>
        <button className="outline-button" onClick={() => navigate("/fix")}>
          목록으로
        </button>
      </div>
    );
  }

  // 금액 변화 그래프용 예시 값 (실제 데이터가 생기면 바꿔주세요)
  const history = [
    { year: 2024, amount: Math.round(item.amount * 0.94) },
    { year: 2025, amount: Math.round(item.amount * 0.97) },
    { year: 2026, amount: item.amount },
  ];
  const maxAmount = Math.max(...history.map((h) => h.amount));

  // 팝업에서 "저장"을 눌렀을 때 실행돼요
  function handleSave(newInfo) {
    const amount = Number(newInfo.amount);

    const updated = {
      ...item, // 나머지(이름, 카테고리, 메모 등)는 그대로 두고
      period: newInfo.cycle,
      amountType: newInfo.amountType,
      amount: amount,
      monthly: getMonthly(amount, newInfo.cycle),
      method: newInfo.method,
      startDate: toKoreanDate(newInfo.startDate),
      endDate: toKoreanDate(newInfo.endDate),
      date: toKoreanDate(newInfo.nextDate),
    };

    // 수정한 내용을 localStorage에 저장 (목록 페이지에서 읽어가요)
    const edits = JSON.parse(localStorage.getItem("expense-edits") || "{}");
    localStorage.setItem(
      "expense-edits",
      JSON.stringify({ ...edits, [id]: updated })
    );

    setItem(updated);
    setIsModalOpen(false);
  }

  // "삭제"를 눌렀을 때 실행돼요
  function handleDelete() {
    if (!window.confirm(`'${item.name}' 항목을 삭제할까요?`)) return;

    const itemId = Number(id);

    // 사이드바에서 추가한 항목이면 그 저장소에서도 지워요
    removeItem(itemId);

    // 기본 데이터 항목은 원본을 지울 수 없으니 "삭제 목록"에 넣어 목록에서 빼요
    const deleted = JSON.parse(localStorage.getItem("expense-deleted") || "[]");
    if (!deleted.includes(itemId)) {
      localStorage.setItem(
        "expense-deleted",
        JSON.stringify([...deleted, itemId])
      );
    }

    // 이 항목의 수정본과 메모도 정리해요
    const edits = JSON.parse(localStorage.getItem("expense-edits") || "{}");
    delete edits[id];
    localStorage.setItem("expense-edits", JSON.stringify(edits));
    localStorage.removeItem(`memo-${id}`);

    navigate("/fix");
  }

  // 메모 칸에 글자를 칠 때마다 실행돼요
  function handleMemoChange(e) {
    const newMemo = e.target.value;
    setItem({ ...item, memo: newMemo });
    localStorage.setItem(`memo-${id}`, newMemo);
  }

  return (
    <div className="detail-page">
      {/* 상단: 경로 + 제목 + 버튼 */}
      <p className="breadcrumb">
        <span onClick={() => navigate("/fix")}>내 고정지출</span> › {item.name}
      </p>

      <div className="detail-top">
        <div className="detail-title">
          <h1>{item.name}</h1>
          <span className="tag light">{item.category}</span>
          {item.big && <span className="tag dark">큰 지출</span>}
        </div>
        <button
          className="outline-button"
          onClick={handleDelete}
        >
          삭제
        </button>
      </div>

      <div className="detail-grid">
        {/* 왼쪽 */}
        <div className="detail-left">
          <section className="card hero-card">
            <span className="dday-badge">{getDday(item.date)}</span>
            <p>다음 결제 · {item.date}</p>
            <h2>
              {formatMoney(item.amount)} <small>원</small>
            </h2>
            <p>
              {item.period} 결제 · 월 {formatMoney(item.monthly)}원
            </p>
          </section>
          <section className="card">
            <div className="card-head">
              <h3>결제 정보</h3>
              <button
                className="outline-button"
                onClick={() => setIsModalOpen(true)}
              >
                수정
              </button>
            </div>

            <div className="info-grid">
              <div>
                <span>주기</span>
                <strong>{item.period}</strong>
              </div>
              <div>
                <span>금액 유형</span>
                <strong>{item.amountType || "고정"}</strong>
              </div>
              <div>
                <span>결제 수단</span>
                <strong>{item.method || "-"}</strong>
              </div>
              <div>
                <span>시작일</span>
                <strong>{item.startDate || "-"}</strong>
              </div>
              <div>
                <span>다음 결제일</span>
                <strong>{item.date}</strong>
              </div>
              <div>
                <span>만기일</span>
                <strong>{item.endDate || "-"}</strong>
              </div>
            </div>
          </section>

          <section className="card">
            <h3>메모</h3>
            <textarea
              className="memo-box memo-input"
              rows={3}
              placeholder="메모를 입력하세요"
              value={item.memo || ""}
              onChange={handleMemoChange}
            />
          </section>
        </div>

        {/* 오른쪽 */}
        <div className="detail-right">
          <section className="card">
            <h3>금액 변화</h3>
            <div className="chart">
              {history.map((h) => (
                <div className="chart-col" key={h.year}>
                  <span className="chart-value">
                    {Math.round(h.amount / 10000)}만
                  </span>
                  <div
                    className={
                      h.year === 2026 ? "chart-bar current" : "chart-bar"
                    }
                    style={{ height: `${(h.amount / maxAmount) * 160}px` }}
                  />
                  <span className="chart-year">{h.year}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <h3>알림</h3>

            <div className="alert-row">
              <span>결제 알림</span>
              <div className="segment">
                {ALERT_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    className={payAlert === opt ? "active" : ""}
                    onClick={() => setPayAlert(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="alert-row">
              <span>만기 전 알림</span>
              <div className="segment">
                {ALERT_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    className={endAlert === opt ? "active" : ""}
                    onClick={() => setEndAlert(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      {isModalOpen && (
        <PaymentEditModal
          info={{
            cycle: item.period,
            amountType: item.amountType || "고정",
            amount: item.amount,
            method: item.method || "",
            startDate: toInputDate(item.startDate),
            endDate: toInputDate(item.endDate),
            nextDate: toInputDate(item.date),
          }}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
export default FixDetail;
