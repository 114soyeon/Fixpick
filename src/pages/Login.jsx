import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogoMark, Wordmark } from "../components/Sidebar";
import { login } from "../utils/auth";

const C = {
  bg: "#F7F9FA",
  text: "#0B2A45",
  sub: "#3E4247",
  muted: "#5B5F66",
  line: "#E3E8ED",
  sky: "#5CB8F2",
  skySoft: "#DCEFFD",
  yellow: "#FFE57A",
  yellowSoft: "#FFF8D6",
  danger: "#D9534F",
};
const FONT = "'Pretendard', 'Noto Sans KR', system-ui, -apple-system, sans-serif";

const CSS = `
@keyframes gkLoginRise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
@keyframes gkFloat { 0%,100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-10px) rotate(1deg); } }
.gk-login-rise { animation: gkLoginRise .7s cubic-bezier(.22,1,.36,1) both; animation-delay: var(--d, 0ms); }
.gk-login-float { animation: gkFloat 6s ease-in-out infinite; }
.gk-login-input { width: 100%; height: 54px; box-sizing: border-box; border-radius: 16px; border: 1.5px solid ${C.line}; background: #FFFFFF; padding: 0 18px; font: inherit; font-size: 16px; color: ${C.text}; outline: none; transition: border-color .15s, box-shadow .15s; }
.gk-login-input:focus { border-color: ${C.sky}; box-shadow: 0 0 0 4px rgba(92,184,242,.18); }
.gk-login-input::placeholder { color: #A9AFB6; }
.gk-login-input.is-error { border-color: ${C.danger}; }
.gk-login-btn { width: 100%; height: 56px; border: 0; border-radius: 16px; background: ${C.yellow}; color: ${C.text}; font: inherit; font-size: 17px; font-weight: 700; cursor: pointer; transition: filter .15s, transform .1s; }
.gk-login-btn:hover { filter: brightness(.96); }
.gk-login-btn:active { transform: scale(.99); }
.gk-login-social { flex: 1; height: 50px; border-radius: 14px; border: 1.5px solid ${C.line}; background: #FFFFFF; font: inherit; font-size: 15px; font-weight: 600; color: ${C.text}; cursor: pointer; transition: background .15s; }
.gk-login-social:hover { background: #F3F5F7; }
.gk-login-link { border: 0; background: none; padding: 0; font: inherit; font-size: 14px; color: ${C.muted}; cursor: pointer; }
.gk-login-link:hover { color: ${C.text}; text-decoration: underline; }
.gk-login-check { width: 18px; height: 18px; accent-color: ${C.sky}; margin: 0; }
.gk-login-eye { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); width: 36px; height: 36px; border: 0; border-radius: 10px; background: none; color: ${C.muted}; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.gk-login-eye:hover { background: #F3F5F7; }
.gk-login-page button:focus-visible, .gk-login-page input:focus-visible { outline: 2px solid ${C.sky}; outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { .gk-login-rise, .gk-login-float { animation: none; } }
`;
const at = (ms) => ({ "--d": `${ms}ms` });

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [keep, setKeep] = useState(true);
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!email.includes("@")) return setError("이메일 주소를 다시 확인해 주세요.");
    if (pw.length < 4) return setError("비밀번호를 4자 이상 입력해 주세요.");
    setError("");
    login({ email });
    navigate("/");
  };

  return (
    <div className="gk-login-page" style={{ minHeight: "100vh", display: "flex", background: C.bg, fontFamily: FONT, color: C.text, letterSpacing: "-0.2px" }}>
      <style>{CSS}</style>

      {/* 왼쪽: 브랜드 */}
      <section style={{ flex: "1 1 50%", background: C.skySoft, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "48px 64px", boxSizing: "border-box", position: "relative", overflow: "hidden" }}>
        <button type="button" onClick={() => navigate("/")} aria-label="고정콕 홈으로 가기" style={{ display: "flex", alignItems: "center", gap: 10, border: 0, background: "none", padding: 0, cursor: "pointer", alignSelf: "flex-start" }}>
          <LogoMark size={44} />
          <Wordmark height={32} />
        </button>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
          <div className="gk-login-float" style={{ filter: "drop-shadow(0 24px 40px rgba(11,42,69,.12))" }}>
            <LogoMark size={300} />
          </div>
          <div className="gk-login-rise" style={{ ...at(150), textAlign: "center", display: "flex", flexDirection: "column", gap: 12 }}>
            <h1 style={{ margin: 0, fontSize: 40, fontWeight: 800, letterSpacing: "-1.4px", lineHeight: 1.3 }}>
              매달 나가는 돈,<br />고정콕이 콕 짚어 드려요
            </h1>
            <p style={{ margin: 0, fontSize: 17, color: C.sub, lineHeight: 1.6 }}>
              주거·통신·구독까지 고정지출을 한 화면에서 관리하고<br />결제일 전에 미리 알려드려요.
            </p>
          </div>
        </div>

        <div className="gk-login-rise" style={{ ...at(300), display: "flex", justifyContent: "center", gap: 10 }}>
          {["결제일 알림", "결제 캘린더", "예산 관리"].map((t) => (
            <span key={t} style={{ background: "#FFFFFF", borderRadius: 999, padding: "9px 16px", fontSize: 14, fontWeight: 600 }}>{t}</span>
          ))}
        </div>
      </section>

      {/* 오른쪽: 로그인 폼 */}
      <section style={{ flex: "1 1 50%", display: "flex", alignItems: "center", justifyContent: "center", padding: 48, boxSizing: "border-box" }}>
        <form onSubmit={submit} noValidate className="gk-login-rise" style={{ ...at(80), width: 440, maxWidth: "100%", display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <h2 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: "-1px" }}>로그인</h2>
            <p style={{ margin: 0, fontSize: 16, color: C.muted }}>다시 오신 걸 환영해요! 계정 정보를 입력해 주세요.</p>
          </div>

          <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>이메일</span>
            <input id="login-email" type="email" autoComplete="email" className={`gk-login-input ${error.includes("이메일") ? "is-error" : ""}`} placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>비밀번호</span>
            <span style={{ position: "relative" }}>
              <input id="login-pw" type={showPw ? "text" : "password"} autoComplete="current-password" className={`gk-login-input ${error.includes("비밀번호") ? "is-error" : ""}`} style={{ paddingRight: 54 }} placeholder="비밀번호 입력" value={pw} onChange={(e) => setPw(e.target.value)} />
              <button type="button" className="gk-login-eye" aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 보기"} onClick={() => setShowPw((v) => !v)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />
                  {showPw && <path d="M4 4l16 16" />}
                </svg>
              </button>
            </span>
          </label>

          {error && <p role="alert" style={{ margin: "-8px 0 0", fontSize: 14, color: C.danger }}>{error}</p>}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: C.sub, cursor: "pointer" }}>
              <input id="login-keep" type="checkbox" className="gk-login-check" checked={keep} onChange={(e) => setKeep(e.target.checked)} />
              로그인 상태 유지
            </label>
            <button type="button" className="gk-login-link">비밀번호를 잊으셨나요?</button>
          </div>

          <button type="submit" className="gk-login-btn">로그인</button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#9AA1A9", fontSize: 13 }}>
            <span style={{ flex: 1, height: 1, background: C.line }} />
            간편 로그인
            <span style={{ flex: 1, height: 1, background: C.line }} />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" className="gk-login-social">카카오</button>
            <button type="button" className="gk-login-social">네이버</button>
            <button type="button" className="gk-login-social">구글</button>
          </div>

          <p style={{ margin: 0, textAlign: "center", fontSize: 15, color: C.muted }}>
            아직 계정이 없나요?{" "}
            <button type="button" className="gk-login-link" onClick={() => navigate("/signup")} style={{ fontSize: 15, fontWeight: 700, color: C.text }}>회원가입</button>
          </p>
        </form>
      </section>
    </div>
  );
}