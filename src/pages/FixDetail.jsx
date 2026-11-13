import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "@/styles/FixDetail.css";
import PaymentEditModal from "@/components/paymentEditModal/PaymentEditModal.jsx";
import AlertSettings from "@/components/fix-detail/AlertSettings.jsx";
import AmountChart from "@/components/fix-detail/AmountChart.jsx";
import PaymentInfoCard from "@/components/fix-detail/PaymentInfoCard.jsx";
import HeroCard from "@/components/fix-detail/HeroCard.jsx";
import MemoCard from "@/components/fix-detail/MemoCard.jsx";
import EndDateCard from "@/components/fix-detail/EndDateCard.jsx";
import { DEFAULT_AMOUNT_TYPE } from "@/constants/fix";
import { toInputDate } from "@/utils/common/date";
import { getAmountHistory, getPayMethods } from "@/utils/fix/fixCalculations";
import { useFixItems } from "@/hooks/useFixItems";
import { useMySub, useUpdateSub, useDeleteSub } from "@/queries/subs";

const FixDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // 주소 /fix/8 에서 8을 꺼내와요

  const [isModalOpen, setIsModalOpen] = useState(false);
  const updateSub = useUpdateSub(); // DB 수정
  const deleteSub = useDeleteSub(); // DB 삭제

  // DB 목록에서 이 항목 찾기
  // DB 데이터는 조금 늦게 와서, 화면을 그릴 때마다 다시 찾아요
  // (저장·삭제하면 목록을 다시 불러와서 화면도 저절로 바뀌어요)
  const allItems = useFixItems();
  const { isLoading } = useMySub(); // 아직 불러오는 중인지
  const found = allItems.find((e) => e.id === Number(id));

  // 메모: 기본값은 DB(found.memo), 입력 중에는 draft 사용
  const [memoDraft, setMemoDraft] = useState(null);
  const [prevId, setPrevId] = useState(id);
  if (prevId !== id) { // 다른 항목으로 이동하면 원래 값으로
    setPrevId(id);
    setMemoDraft(null);
  }

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

  // 화면에 보여줄 항목 = DB 항목 + 메모
  const item = { ...found, memo: memoDraft ?? found.memo ?? "" };

  // 팝업에서 "저장"을 눌렀을 때 → DB에 저장
  const handleSave = (newInfo) => {
    const patch = {
      amount: Number(newInfo.amount) || 0,
      amount_type: newInfo.amountType === "변동" ? "변동" : "고정",
      cycle: newInfo.cycle === "매월" ? "매달" : newInfo.cycle, // DB 표기는 "매달"
      pay_method: newInfo.method || null,
      start_date: newInfo.startDate || null, // "YYYY-MM-DD"
      expiry_date: newInfo.endDate || null, // "YYYY-MM-DD"
    };

    updateSub.mutate(
      { id: Number(id), data: patch }, // mutationFn이 ({id, data}) 형태
      {
        onSuccess: () => setIsModalOpen(false),
        onError: () => window.alert("저장하지 못했어요. 다시 시도해 주세요"),
      },
    );
  };

  // "삭제"를 눌렀을 때 → DB에서 삭제
  const handleDelete = () => {
    if (!window.confirm(`'${item.name}' 항목을 삭제할까요?`)) return;
    deleteSub.mutate(Number(id), {
      onSuccess: () => navigate("/fix"),
      onError: () => window.alert("삭제하지 못했어요. 다시 시도해 주세요"),
    });
  };

  // 메모 칸에 글자를 칠 때마다
  const handleMemoChange = (e) => setMemoDraft(e.target.value);

  const handleMemoBlur = () => {
    if (memoDraft == null || memoDraft === (found.memo ?? "")) return; // 안 바뀌었으면 스킵
    updateSub.mutate(
      { id: Number(id), data: { memo: memoDraft } },
      { onError: () => window.alert("메모를 저장하지 못했어요. 다시 시도해 주세요") },
    );
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

          <MemoCard memo={item.memo} onChange={handleMemoChange} onBlur={handleMemoBlur} />
        </div>

        {/* 오른쪽 */}
        <div className="detail-right">
          <AmountChart history={getAmountHistory(item)} />

          <AlertSettings
            payDays={item.payAlertDays}
            endDays={item.endAlertDays}
            onChange={(patch) =>
              updateSub.mutate(
                { id: Number(id), data: patch },
                { onError: () => window.alert("알림 설정을 저장하지 못했어요. 다시 시도해 주세요") },
              )
            }
          />

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
