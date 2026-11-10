/*
 * 설정 맨 아래: 계정 카드
 * - 로그인했으면 [로그아웃] [회원 탈퇴], 안 했으면 [로그인]
 */
import { useNavigate } from "react-router-dom";
import { deleteAccount } from "../../utils/auth";
import { useAuthStore } from "../../store/authStore"; 

const AccountCard = ({ user }) => {
  const navigate = useNavigate();
  const signOut = useAuthStore((state) => state.signOut);

  const logout = () => {
    signOut();
    navigate("/");
  };

  const quit = () => {
    if (!window.confirm("정말 탈퇴할까요? 저장된 계정 정보가 지워져요.")) return;
    deleteAccount();
    navigate("/");
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
          <button type="button" className="set-btn-red" onClick={quit}>
            회원 탈퇴
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
