import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/FixDetail.css";
import PaymentEditModal from "../components/paymentEditModal/PaymentEditModal.jsx";
import AlertSettings from "../components/fix-detail/AlertSettings.jsx";
import AmountChart from "../components/fix-detail/AmountChart.jsx";
import PaymentInfoCard from "../components/fix-detail/PaymentInfoCard.jsx";
import HeroCard from "../components/fix-detail/HeroCard.jsx";
import MemoCard from "../components/fix-detail/MemoCard.jsx";
import { useFixItems } from "../utils/fixItems";
import { DEFAULT_AMOUNT_TYPE } from "../utils/fixConstants";
import { toInputDate } from "../utils/fixFormat";
import { getAmountHistory, getPayMethods } from "../utils/fixCalculations";
import {
  deleteFixItem,
  loadMemo,
  saveEdit,
  saveMemo,
  toEditedFields,
} from "../utils/fixStorage";

const FixDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // 주소 /fix/8 에서 8을 꺼내와요

  const [isModalOpen, setIsModalOpen] = useState(false);

  // 전체 목록(추가한 항목 + 수정본)에서 이 항목 찾기
  const allItems = useFixItems();
  const mergedItem = allItems.find((e) => e.id === Number(id));

  const [item, setItem] = useState(() =>
    mergedItem ? { ...mergedItem, memo: loadMemo(id) ?? "" } : null,
  );

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

  // 팝업에서 "저장"을 눌렀을 때
  const handleSave = (newInfo) => {
    const fields = toEditedFields(newInfo);
    saveEdit(id, fields);
    setItem({ ...item, ...fields });
    setIsModalOpen(false);
  };

  // "삭제"를 눌렀을 때
  const handleDelete = () => {
    if (!window.confirm(`'${item.name}' 항목을 삭제할까요?`)) return;
    deleteFixItem(Number(id));
    navigate("/fix");
  };

  // 메모 칸에 글자를 칠 때마다
  const handleMemoChange = (e) => {
    const newMemo = e.target.value;
    setItem({ ...item, memo: newMemo });
    saveMemo(id, newMemo);
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
          <AmountChart history={getAmountHistory(item)} />

          <AlertSettings />
        </div>
      </div>

      {isModalOpen && (
        <PaymentEditModal
          info={{
            cycle: item.period,
            amountType: item.amountType || DEFAULT_AMOUNT_TYPE,
            amount: item.amount,
            method: item.method || "",
            startDate: toInputDate(item.startDate),
            endDate: toInputDate(item.endDate),
            nextDate: toInputDate(item.date),
          }}
          payMethods={getPayMethods(allItems)}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}

      <p className="copyright">
        Copyright © 2026. Fixpick All rights reserved.
      </p>
    </div>
  );
};

export default FixDetail;
