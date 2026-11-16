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
import { useMySub } from "@/queries/subs";
import { fromDbRow } from "@/utils/common/dbItem";
import { usePayMethods, useAddPayMethod } from "@/queries/payment";
import { useSetting } from "@/hooks/useSetting";
import { useBudget } from "@/queries/budgets";
import ProfileCard from "@/components/setting/ProfileCard";
import AlertCard from "@/components/setting/AlertCard";
import BudgetCard from "@/components/setting/BudgetCard";
import PayMethodCard from "@/components/setting/PayMethodCard";
import AccountCard from "@/components/setting/AccountCard";
import PayModal from "@/components/setting/PayModal";

const Setting = () => {
  const user = useUser(); // 로그인 안 했으면 null
  // 내가 등록한 고정지출 — DB(리액트 쿼리 useMySub) → 계산용 모양으로 (rows가 바뀔 때만)
  const { data: rows } = useMySub();
  const items = useMemo(() => (rows ?? []).map(fromDbRow), [rows]);
  const setting = useSetting(); // 알림·예산 (결제 수단은 DB usePayMethods)

  // 등록한 결제 수단 — DB(리액트 쿼리)
  const { data: methods = [] } = usePayMethods();
  const addPay = useAddPayMethod();
  
  // 예산
  const { data: dbBudget } = useBudget();

  // 결제 수단 추가 창
  const [modal, setModal] = useState(false);
  const [payError, setPayError] = useState(""); // 등록 실패 안내문

  const closeModal = () => {
    setModal(false);
    setPayError("");
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
        <AlertCard setting={setting} />

        {/* ───── 오른쪽: 예산 + 결제 수단 ───── */}
        <div className="set-side">
          <BudgetCard key={user?.email ?? "guest"} initial={dbBudget ?? setting.budget} />
          <PayMethodCard methods={methods} items={items} onAddClick={() => setModal(true)} />
        </div>
      </div>

      {/* ───── 계정 ───── */}
      <AccountCard user={user} />

      {modal && (
        <PayModal
          onClose={closeModal}
          saving={addPay.isPending}
          error={payError}
          onAdd={({ name, last4 }) => {
            setPayError("");
            addPay.mutate(
              { name, last4 },
              {
                onSuccess: closeModal,
                onError: (err) => {
                  console.error("결제 수단 등록 실패:", err);
                  // supabase 에러(code 있음)는 문구를 숨기고, 우리 에러 메시지는 그대로 보여요
                  setPayError(
                    err?.code
                      ? "결제 수단을 등록하지 못했어요. 다시 시도해 주세요"
                      : err?.message || "결제 수단을 등록하지 못했어요. 다시 시도해 주세요"
                  );
                },
              }
            );
          }}
        />
      )}

      <footer className="page-copy">Copyright © 2026. Fixpick All rights reserved.</footer>
    </div>
  );
};

export default Setting;
