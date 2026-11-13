import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/FixDetail.css";
import PaymentEditModal from "../components/paymentEditModal/PaymentEditModal.jsx";
import AlertSettings from "../components/fix-detail/AlertSettings.jsx";
import AmountChart from "../components/fix-detail/AmountChart.jsx";
import PaymentInfoCard from "../components/fix-detail/PaymentInfoCard.jsx";
import HeroCard from "../components/fix-detail/HeroCard.jsx";
import MemoCard from "../components/fix-detail/MemoCard.jsx";
import EndDateCard from "../components/fix-detail/EndDateCard.jsx";
import { DEFAULT_AMOUNT_TYPE } from "../constants/fix";
import { toInputDate } from "../utils/date";
import { getAmountHistory, getPayMethods } from "../utils/fix/fixCalculations";
import { useFixItems } from "../utils/fix/fixItems";
import { useMySub } from "../queries/subs";
import {
  deleteFixItem,
  saveEdit,
  saveMemo,
  toEditedFields,
} from "../utils/fix/fixStorage";

const FixDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // 주소 /fix/8 에서 8을 꺼내와요

  const [isModalOpen, setIsModalOpen] = useState(false);

  // 전체 목록(DB 항목 + 수정본)에서 이 항목 찾기
  // DB 데이터는 조금 늦게 와서, 화면을 그릴 때마다 다시 찾아요
  const allItems = useFixItems();
  const { isLoading } = useMySub(); // 아직 불러오는 중인지
  const found = allItems.find((e) => e.id === Number(id));

  const [changes, setChanges] = useState({}); // 이 화면에서 고친 값 (수정 팝업에서 저장한 것)
  // 메모는 브라우저에 "memo-<id>" 로 저장돼 있어요 (저장은 fixStorage.js saveMemo)
  const [memo, setMemo] = useState(() => {
    try { return localStorage.getItem(`memo-${id}`) ?? ""; } catch { return ""; }
  });

  // 불러오는 중
  if (isLoading) {
    return (
      <div className="detail-page">
        <p>불러오는 중이에요.</p>
      </div>
    );
  }

  // 없는 번호로 들어왔을 때 (또는 로그인 안 했을 때)
  if (!found) {
    return (
      <div className="detail-page">
        <p>항목을 찾을 수 없어요.</p>
        <button className="outline-button" onClick={() => navigate("/fix")}>
          목록으로
        </button>
      </div>
    );
  }

  // 화면에 보여줄 항목 = DB 항목 + 메모 + 이 화면에서 고친 값
  const item = { ...found, memo, ...changes };

  // 팝업에서 "저장"을 눌렀을 때
  const handleSave = (newInfo) => {
    const fields = toEditedFields(newInfo);
    saveEdit(id, fields);
    setChanges((prev) => ({ ...prev, ...fields }));
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
    setMemo(newMemo);
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

          <EndDateCard startDate={item.startDate} endDate={item.endDate} />
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
