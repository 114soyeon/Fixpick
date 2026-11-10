/*
 * 설정 페이지
 * - 이 파일은 "데이터 준비 + 화면 배치"만 해요. 각 카드는 components/setting/ 에 있어요
 *   ProfileCard(프로필) / AlertCard(알림) / BudgetCard(예산) / PayMethodCard(결제 수단) / AccountCard(계정)
 * - class는 다른 페이지와 겹치지 않게 모두 "set-" 로 시작 (styles/setting.css)
 */
import { useState } from "react";
import "../styles/setting.css";

import { useUser } from "../utils/auth";
import { useItems } from "../utils/items";
import { addMethod, useSetting } from "../utils/setting";
import ProfileCard from "../components/setting/ProfileCard";
import AlertCard from "../components/setting/AlertCard";
import BudgetCard from "../components/setting/BudgetCard";
import PayMethodCard from "../components/setting/PayMethodCard";
import AccountCard from "../components/setting/AccountCard";
import PayModal from "../components/setting/PayModal";

const Setting = () => {
  const user = useUser(); // 로그인 안 했으면 null
  const items = useItems(); // 내가 등록한 고정지출
  const setting = useSetting(); // 알림·예산·결제 수단

  // 결제 수단 추가 창
  const [modal, setModal] = useState(false);

  return (
    <div className="set-page">
      {/* ───── 페이지 제목 ───── */}
      <header className="set-header">
        <h1 className="set-header-title">설정</h1>
        <p className="set-header-desc">알림, 예산, 결제 수단을 내 방식대로 바꿔 보세요. 바꾸면 바로 저장돼요.</p>
      </header>

      {/* ───── 프로필 ───── */}
      <ProfileCard user={user} items={items} />

      <div className="set-body">
        {/* ───── 왼쪽: 알림 ───── */}
        <AlertCard setting={setting} />

        {/* ───── 오른쪽: 예산 + 결제 수단 ───── */}
        <div className="set-side">
          {/* key: 사람이 바뀌면 예산 카드를 새로 만들어요 (BudgetCard.jsx 설명 참고) */}
          <BudgetCard key={user?.email ?? "guest"} initial={setting.budget} />
          <PayMethodCard methods={setting.methods} items={items} onAddClick={() => setModal(true)} />
        </div>
      </div>

      {/* ───── 계정 ───── */}
      <AccountCard user={user} />

      {modal && (
        <PayModal
          onClose={() => setModal(false)}
          onAdd={(m) => {
            addMethod(m);
            setModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Setting;
