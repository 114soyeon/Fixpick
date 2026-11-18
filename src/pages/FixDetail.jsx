import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "@/styles/FixDetail.css";
import AddItemModal from "@/components/add-item/AddItemModal.jsx"; // 항목 추가 창을 "수정 모드"로 재사용
import AlertSettings from "@/components/fix-detail/AlertSettings.jsx";
import AmountChart from "@/components/fix-detail/AmountChart.jsx";
import PaymentInfoCard from "@/components/fix-detail/PaymentInfoCard.jsx";
import HeroCard from "@/components/fix-detail/HeroCard.jsx";
import MemoCard from "@/components/fix-detail/MemoCard.jsx";
import EndDateCard from "@/components/fix-detail/EndDateCard.jsx";
import { getAmountHistory, getPayMethods } from "@/utils/fix/fixCalculations";
import { useFixItems } from "@/hooks/useFixItems";
import { useMySub, useUpdateSub, useDeleteSub } from "@/queries/subs";
import SidebarToast from "@/components/sidebar/SidebarToast";

const FixDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // 주소 /fix/8 에서 8을 꺼내와요

  const [isModalOpen, setIsModalOpen] = useState(false);
  const updateSub = useUpdateSub(); // DB 수정
  const deleteSub = useDeleteSub(); // DB 삭제
  const [toast, setToast] = useState(null); // 항목수정 토스트

  // DB 목록에서 이 항목 찾기
  // DB 데이터는 조금 늦게 와서, 화면을 그릴 때마다 다시 찾아요
  // (저장·삭제하면 목록을 다시 불러와서 화면도 저절로 바뀌어요)
  const allItems = useFixItems();
  const { data: rows, isLoading } = useMySub(); // DB 원본 목록 + 아직 불러오는 중인지
  const found = allItems.find((e) => e.id === Number(id));
  const rawRow = rows?.find((r) => Number(r.id) === Number(id)); // 수정 창에 미리 채울 DB 원본 값

  // 안 건드렸으면 DB 메모를 보여주고, 건드렸으면 입력한 값을 보여줘요
  const [memoDraft, setMemoDraft] = useState(null); // null = 아직 안 건드림
  const memo = memoDraft ?? rawRow?.memo ?? "";

  // 디바운스 타이머
  const memoTimer = useRef(null);
  useEffect(() => () => clearTimeout(memoTimer.current), []);

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
  const item = { ...found, memo };

  // "삭제"를 눌렀을 때 → DB에서 삭제
  const handleDelete = () => {
    if (!window.confirm(`'${item.name}' 항목을 삭제할까요?`)) return;
    deleteSub.mutate(Number(id), {
      onSuccess: () => navigate("/fix"),
      onError: () => window.alert("삭제하지 못했어요. 다시 시도해 주세요"),
    });
  };

  // 메모
  const handleMemoChange = (e) => {
    const newMemo = e.target.value;
    setMemoDraft(newMemo);
    clearTimeout(memoTimer.current);
    // 0.6초 쉬었다가 한 번만 DB 저장 (글자를 누를 때마다 저장 안 함)
    memoTimer.current = setTimeout(() => {
      updateSub.mutate(
        { id: Number(id), data: { memo: newMemo } },
        {
          onError: () => setToast("메모를 저장하지 못했어요. 다시 시도해 주세요"),
        }
      );
    }, 600);
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

          <PaymentInfoCard
            item={item}
            onEdit={() =>
              rawRow
                ? setIsModalOpen(true)
                : window.alert("아직 데이터를 불러오지 못했어요")
            }
          />

          <MemoCard memo={item.memo} onChange={handleMemoChange} />
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
                {
                  onError: () =>
                    window.alert(
                      "알림 설정을 저장하지 못했어요. 다시 시도해 주세요",
                    ),
                },
              )
            }
          />

          <EndDateCard startDate={item.startDate} endDate={item.endDate} />
        </div>
      </div>

      {/* 결제 정보 수정 = 항목 추가 창을 수정 모드로 (저장된 값이 미리 채워져요) */}
      {isModalOpen && rawRow && (
        <AddItemModal
          item={rawRow}
          payMethods={getPayMethods(allItems)}
          onClose={() => setIsModalOpen(false)}
          setToast={setToast}
        />
      )}

      {toast && (
        <SidebarToast key={toast} text={toast} onDone={() => setToast(null)} />
      )}

      <footer className="page-copy">
        Copyright © 2026. Fixpick All rights reserved.
      </footer>
    </div>
  );
};

export default FixDetail;
