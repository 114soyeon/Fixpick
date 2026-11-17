/*
 * 설정 페이지
 * - 이 파일은 "데이터 준비 + 화면 배치"만 해요. 각 카드는 components/setting/ 에 있어요
 *   ProfileCard(프로필) / AlertCard(알림) / BudgetCard(예산) / PayMethodCard(결제 수단) / AccountCard(계정)
 * - class는 다른 페이지와 겹치지 않게 모두 "set-" 로 시작 (styles/setting.css)
 * - 데이터: 고정지출(useMySub)·결제 수단(usePayMethods)은 DB, 알림·예산은 아직 브라우저 저장소(useSetting)
 */
import { useMemo, useState } from "react";
import "@/styles/setting.css";

import { useUser } from "@/hooks/useUser";
import { useMySub, useUpdateAllReminds  } from "@/queries/subs";
import { fromDbRow } from "@/utils/common/dbItem";
import { usePayMethods, useAddPayMethod, useUpdatePayMethod, useDeletePayMethod } from "@/queries/payment";
import { useSetting } from "@/hooks/useSetting";
import { useBudget } from "@/queries/budgets";
import ProfileCard from "@/components/setting/ProfileCard";
import AlertCard from "@/components/setting/AlertCard";
import BudgetCard from "@/components/setting/BudgetCard";
import PayMethodCard from "@/components/setting/PayMethodCard";
import AccountCard from "@/components/setting/AccountCard";
import PayModal from "@/components/setting/PayModal";
import SidebarToast from "@/components/sidebar/SidebarToast"; 
import { isPayAlertOn, saveSetting } from "@/utils/setting/setting";

const Setting = () => {
  const user = useUser(); // 로그인 안 했으면 null
  // 내가 등록한 고정지출 — DB(리액트 쿼리 useMySub) → 계산용 모양으로 (rows가 바뀔 때만)
  const { data: rows } = useMySub();
  const payAll = useUpdateAllReminds();
  const payOn = isPayAlertOn(rows);
  const items = useMemo(() => (rows ?? []).map(fromDbRow), [rows]);
  const setting = useSetting(); // 알림·예산 (결제 수단은 DB usePayMethods)

  // 등록한 결제 수단 — DB(리액트 쿼리)
  const { data: methods = [] } = usePayMethods();
  const addPay = useAddPayMethod();       // 추가
  const updatePay = useUpdatePayMethod(); // 수정
  const deletePay = useDeletePayMethod(); // 삭제
  
  // 예산
  const { data: dbBudget } = useBudget();

  // 결제 수단 추가 / 수정 창
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null); // null = 추가, 값 있으면 수정
  const openAdd = () => { setEditing(null); setModal(true); };
  const openEdit = (m) => { setEditing(m); setModal(true); };

  const [payError, setPayError] = useState(""); // 등록 실패 안내문
  const [toast, setToast] = useState(null); 

  const closeModal = () => {
    setModal(false);
    setEditing(null);
    setPayError("");
  };

  // 결제 수단 삭제 (window.confirm — FixDetail.jsx·AccountCard.jsx와 같은 방식)
  const confirmDelete = (m) => {
    const used = items.filter((it) => it.payMethod === m.name).length;
    const warn = used > 0 ? `\n이 카드를 쓰는 고정지출 ${used}건의 결제 수단이 비워져요.` : "";
    if (!window.confirm(`'${m.name}' 결제 수단을 삭제할까요?${warn}`)) return;

    deletePay.mutate(m.id, {
      onSuccess: () => setToast(`'${m.name}' 결제 수단을 삭제했어요`),
      onError: (err) => {
        console.error("결제 수단 삭제 실패:", err);
        setToast(err?.message || "결제 수단을 삭제하지 못했어요. 다시 시도해 주세요");
      },
    });
  };

  return (
    <div className="set-page">
      {/* ───── 페이지 제목 ───── */}
      <header className="set-header">
        <h1 className="set-header-title">설정</h1>
        {/* 좁은 화면에서는 문장마다 줄바꿈 (setting.css 767px 이하) */}
        <p className="set-header-desc">
          <span>알림, 예산, 결제 수단을 내 방식대로 바꿔 보세요.</span>{" "}
          <span>바꾸면 바로 저장돼요.</span>
        </p>
      </header>

      {/* ───── 프로필 ───── */}
      <ProfileCard user={user} items={items} />

      <div className="set-body">
        {/* ───── 왼쪽: 알림 ───── */}
        <AlertCard 
          setting={setting}
          payOn={payOn}
          onPayAlertChange={(on) => {
            saveSetting({ alerts: { ...setting.alerts, pay: on } });
            payAll.mutate(on);
          }}
        />

        {/* ───── 오른쪽: 예산 + 결제 수단 ───── */}
        <div className="set-side">
          <BudgetCard key={user?.email ?? "guest"} initial={dbBudget ?? setting.budget} />
          <PayMethodCard
            methods={methods}
            items={items}
            onAddClick={openAdd}
            onEditClick={openEdit}
            onDeleteClick={confirmDelete}
          />
        </div>
      </div>

      {/* ───── 계정 ───── */}
      <AccountCard user={user} />

      {modal && (
        <PayModal
          onClose={closeModal}
          saving={addPay.isPending || updatePay.isPending}
          error={payError}
          initial={editing}
          onAdd={({ name, last4 }) => {
            setPayError("");
            const fail = (msg) => (err) => {
              console.error(msg, err);
              setPayError(err?.code ? msg : err?.message || msg);
            };

            if (editing) {
              // ── 수정 ──
              updatePay.mutate(
                { id: editing.id, name, last4 },
                {
                  onSuccess: () => {
                    closeModal();
                    setToast(`'${name}' 결제 수단을 수정했어요`);
                  },
                  onError: fail("결제 수단을 수정하지 못했어요. 다시 시도해 주세요"),
                }
              );
            } else {
              // ── 추가 ──
              addPay.mutate(
                { name, last4 },
                {
                  onSuccess: () => {
                    closeModal();
                    setToast(`'${name}' 결제 수단을 추가했어요`);
                  },
                  onError: fail("결제 수단을 등록하지 못했어요. 다시 시도해 주세요"),
                }
              );
            }
          }}
        />
      )}
      
      {toast && (<SidebarToast key={toast} text={toast} onDone={() => setToast(null)} />)}

      <footer className="page-copy">Copyright © 2026. Fixpick All rights reserved.</footer>
    </div>
  );
};

export default Setting;
