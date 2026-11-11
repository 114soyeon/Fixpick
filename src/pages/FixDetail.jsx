import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFixItems } from "../utils/fixItems";
import { removeItem } from "../utils/items";
import "../styles/FixDetail.css";
import PaymentEditModal from "../components/PaymentEditModal/PaymentEditModal.jsx";
import AlertSettings from "../components/fix-detail/AlertSettings.jsx";
import AmountChart from "../components/fix-detail/AmountChart.jsx";
import PaymentInfoCard from "../components/fix-detail/PaymentInfoCard.jsx";
import { toInputDate, toKoreanDate, getMonthly } from "../utils/fixDetail";
import HeroCard from "../components/fix-detail/HeroCard.jsx";
import MemoCard from "../components/fix-detail/MemoCard.jsx";

const FixDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // 주소 /fix/8 에서 8을 꺼내와요

  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // 팝업에서 "저장"을 눌렀을 때 실행돼요
  const handleSave = (newInfo) => {
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
      JSON.stringify({ ...edits, [id]: updated }),
    );

    setItem(updated);
    setIsModalOpen(false);
  };

  // "삭제"를 눌렀을 때 실행돼요
  const handleDelete = () => {
    if (!window.confirm(`'${item.name}' 항목을 삭제할까요?`)) return;

    const itemId = Number(id);

    // 사이드바에서 추가한 항목이면 그 저장소에서도 지워요
    removeItem(itemId);

    // 기본 데이터 항목은 원본을 지울 수 없으니 "삭제 목록"에 넣어 목록에서 빼요
    const deleted = JSON.parse(localStorage.getItem("expense-deleted") || "[]");
    if (!deleted.includes(itemId)) {
      localStorage.setItem(
        "expense-deleted",
        JSON.stringify([...deleted, itemId]),
      );
    }

    // 이 항목의 수정본과 메모도 정리해요
    const edits = JSON.parse(localStorage.getItem("expense-edits") || "{}");
    delete edits[id];
    localStorage.setItem("expense-edits", JSON.stringify(edits));
    localStorage.removeItem(`memo-${id}`);

    navigate("/fix");
  };

  // 메모 칸에 글자를 칠 때마다 실행돼요
  const handleMemoChange = (e) => {
    const newMemo = e.target.value;
    setItem({ ...item, memo: newMemo });
    localStorage.setItem(`memo-${id}`, newMemo);
  };

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
        <button className="outline-button" onClick={handleDelete}>
          삭제
        </button>
      </div>

      <div className="detail-grid">
        {/* 왼쪽 */}
        <div className="detail-left">
          <HeroCard item={item} />

          <PaymentInfoCard item={item} onEdit={() => setIsModalOpen(true)} />

          <MemoCard memo={item.memo} onChange={handleMemoChange} />
        </div>

        {/* 오른쪽 */}
        <div className="detail-right">
          <AmountChart history={history} />

          <AlertSettings />
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
};

export default FixDetail;
