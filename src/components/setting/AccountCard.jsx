/*
  설정 맨 아래: 계정 카드
  - 로그인했으면 [로그아웃] [회원 탈퇴], 안 했으면 [로그인]
  - 탈퇴는 DB에서 users.is_active = false
*/
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteAccount } from "@/api/auth";
import { clearLocalAccount } from "@/utils/auth/auth";
import { useAuthStore } from "@/store/authStore";

const AccountCard = ({ user }) => {
  const navigate = useNavigate();
  const signOut = useAuthStore((state) => state.signOut);
  const [quitting, setQuitting] = useState(false);

  const logout = () => {
    signOut();
    navigate("/");
  };

  const quit = async () => {
    if (!window.confirm("정말 탈퇴할까요? 계정이 비활성화되어 로그인할 수 없게 돼요.")) return;
    setQuitting(true);
    try {
      await deleteAccount();                  // DB: is_active = false
      clearLocalAccount(user?.email);         // 브라우저 저장 정보 지우기
      await signOut();                        // 세션 끊기
      navigate("/");
    } catch (err) {
      console.error("회원 탈퇴 실패:", err);
      alert("탈퇴하지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setQuitting(false);
    }
  };

  return (
    <section className="set-card set-account">
      <div>
        <h2 className="set-row-title">계정</h2>
        <p className="set-account-desc">
          {user ? `${user.email} 계정으로 로그인했어요` : "로그인하면 설정이 내 계정에 저장돼요"}
        </p>
      </div>
      {user ? (
        <div className="set-account-btns">
          <button type="button" className="set-btn-gray" onClick={logout}>
            로그아웃
          </button>
          <button type="button" className="set-btn-red" onClick={quit} disabled={quitting}>
            {quitting ? "탈퇴 중이에요" : "회원 탈퇴"}
          </button>
        </div>
      ) : (
        <button type="button" className="set-btn-gray" onClick={() => navigate("/login")}>
          로그인
        </button>
      )}
    </section>
  );
};

export default AccountCard;