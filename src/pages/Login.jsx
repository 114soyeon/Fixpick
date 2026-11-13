import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { LogoMark, Wordmark } from "../components/common/Logo";
import LoginToast from "../components/login/LoginToast";
import ResetModal from "../components/login/ResetModal";
import FindIdModal from "../components/login/FindIdModal";
import { BRAND_TAGS, SOCIALS } from "../constants/login";
import { openAddItem, takeLoginReason } from "../utils/addItemFlow";
import { loginError, readLastLogin, saveLastLogin } from "../utils/auth/login";
import { isValidEmail } from "../utils/validate";
import { useAuthStore } from "../store/authStore";
import "../styles/login.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [keep, setKeep] = useState(true);
  const [error, setError] = useState({ field: "", message: "" });
  const [resetOpen, setResetOpen] = useState(false);
  const [findOpen, setFindOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [lastLogin] = useState(readLastLogin); // 페이지를 열 때 한 번만 읽어요
  const [reason] = useState(takeLoginReason); // "add": 항목 추가하려다 넘어왔어요

  const login = useAuthStore((state) => state.signIn);

  const fail = (field, message) => setError({ field, message });

  const submit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) return fail("email", "이메일 주소를 다시 확인해 주세요.");
    if (!pw) return fail("pw", "비밀번호를 입력해 주세요.");
    try {
      await login(email, pw);
    } catch (err) {
      const { field, message } = loginError(err); // 틀렸을 때 문구 (utils/auth/login.js)
      return fail(field, message);
    }
    setError({ field: "", message: "" });
    //saveLastLogin("email");
    navigate("/"); // 로그인 후 홈으로
    if (reason === "add") setTimeout(openAddItem, 400); // 하려던 항목 추가 창을 바로 열어 줘요
  };

  return (
    <div className="gk-login-page">

      {/* 왼쪽: 브랜드 */}
      <section className="gk-login-brand">
        <button type="button" className="gk-login-home" onClick={() => navigate("/")} aria-label="고정콕 홈으로 가기">
          <LogoMark size={44} />
          <Wordmark height={32} />
        </button>

        <div className="gk-login-brand__center">
          <div className="gk-login-float gk-login-hero">
            <LogoMark size={300} />
          </div>
          <div className="gk-login-rise gk-login-copy">
            <h1 className="gk-login-copy__title">
              매달 나가는 돈,<br />고정콕이 콕 짚어 드려요
            </h1>
            <p className="gk-login-copy__desc">
              주거·통신·구독까지 고정지출을 한 화면에서 관리하고<br />결제일 전에 미리 알려드려요.
            </p>
          </div>
        </div>

        <div className="gk-login-rise gk-login-tags">
          {BRAND_TAGS.map((t) => (
            <span key={t} className="gk-login-tag">{t}</span>
          ))}
        </div>
      </section>

      {/* 오른쪽: 로그인 폼 */}
      <section className="gk-login-form-wrap">
        <form onSubmit={submit} noValidate className="gk-login-rise gk-login-form">
          {/* 작은 화면에서만 보이는 로고 */}
          <button type="button" className="gk-login-mobile-logo" onClick={() => navigate("/")} aria-label="고정콕 홈으로 가기">
            <LogoMark size={36} />
            <Wordmark height={26} />
          </button>

          <div className="gk-login-head">
            {reason === "add" && (
              <p role="status" className="gk-login-notice">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
                고정지출을 등록하려면 로그인이 필요해요
              </p>
            )}
            <h2 className="gk-login-head__title">로그인</h2>
            <p className="gk-login-head__desc">다시 오신 걸 환영해요! 계정 정보를 입력해 주세요.</p>
          </div>

          <label className="gk-login-field">
            <span className="gk-login-label">이메일</span>
            <input id="login-email" type="email" autoComplete="email" className={`gk-login-input ${error.field === "email" || error.field === "both" ? "is-error" : ""}`} placeholder="example@email.com" value={email} onChange={(e) => { setEmail(e.target.value); setError({ field: "", message: "" }); }} />
          </label>

          <label className="gk-login-field">
            <span className="gk-login-label">비밀번호</span>
            <span className="gk-login-pw">
              <input id="login-pw" type={showPw ? "text" : "password"} autoComplete="current-password" className={`gk-login-input gk-login-input--pw ${error.field === "pw" || error.field === "both" ? "is-error" : ""}`} placeholder="비밀번호 입력" value={pw} onChange={(e) => { setPw(e.target.value); setError({ field: "", message: "" }); }} />
              <button type="button" className="gk-login-eye" aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 보기"} onClick={() => setShowPw((v) => !v)}>
                {showPw ? <EyeOff size={20} strokeWidth={2} /> : <Eye size={20} strokeWidth={2} />}
              </button>
            </span>
          </label>

          {error.message && (
            <p role="alert" className="gk-login-alert">
              {error.message}{" "}
              {error.field === "email" && error.message.includes("가입되지") && (
                <button type="button" className="gk-login-link gk-login-link--strong" onClick={() => navigate("/signup")}>회원가입하기</button>
              )}
            </p>
          )}

          <div className="gk-login-options">
            <label className="gk-login-keep" title="끄면 브라우저를 닫을 때 로그아웃돼요">
              <input id="login-keep" type="checkbox" className="gk-login-check" checked={keep} onChange={(e) => setKeep(e.target.checked)} />
              로그인 상태 유지
            </label>
            <span className="gk-login-finds">
              <button type="button" className="gk-login-link" onClick={() => setFindOpen(true)}>아이디 찾기</button>
              <span aria-hidden="true" className="gk-login-finds__bar" />
              <button type="button" className="gk-login-link" onClick={() => setResetOpen(true)}>비밀번호 찾기</button>
            </span>
          </div>

          <button type="submit" className="gk-login-btn">로그인</button>

          <div className="gk-login-or">
            <span className="gk-login-or__line" />
            간편 로그인
            <span className="gk-login-or__line" />
          </div>

          <div className="gk-login-socials">
            {SOCIALS.map((s) => (
              <button key={s.key} type="button" className={`gk-login-social gk-login-social--${s.key}`}
                aria-describedby={lastLogin === s.key ? "gk-last-login" : undefined}
                onClick={() => {
                  saveLastLogin(s.key); // 실제 간편 로그인을 붙이면 로그인 성공한 뒤에 저장하면 돼요
                  setToast({ text: `${s.name} 로그인은 준비 중이에요`, id: Date.now() });
                }}>
                {s.logo && <img src={s.logo} alt="" aria-hidden="true" className="gk-login-social__logo" />}
                {s.label}
                {lastLogin === s.key && <span id="gk-last-login" className="gk-login-last">최근 로그인</span>}
              </button>
            ))}
          </div>

          <p className="gk-login-foot">
            아직 계정이 없나요?{" "}
            <button type="button" className="gk-login-link gk-login-link--strong gk-login-link--signup" onClick={() => navigate("/signup")}>회원가입</button>
          </p>
        </form>
      </section>

      {resetOpen && <ResetModal initialEmail={email} onClose={() => setResetOpen(false)} />}
      {findOpen && (
        <FindIdModal onClose={() => setFindOpen(false)}
          onFound={(found) => { setEmail(found); setFindOpen(false); setTimeout(() => document.getElementById("login-pw")?.focus(), 50); }}
          onReset={(found) => { setEmail(found); setFindOpen(false); setResetOpen(true); }} />
      )}
      {toast && <LoginToast key={toast.id} text={toast.text} onDone={() => setToast(null)} />}
    </div>
  );
}
