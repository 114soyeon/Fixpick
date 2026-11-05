import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogoMark, Wordmark } from "../components/Sidebar";
import { emailExists, login } from "../utils/auth";

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
  ok: "#2E9D6B",
};
const FONT = "'Pretendard', 'Noto Sans KR', system-ui, -apple-system, sans-serif";

const CSS = `
@keyframes gkLoginRise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
@keyframes gkFloat { 0%,100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-10px) rotate(1deg); } }
@keyframes gkFadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes gkPopIn { from { opacity: 0; transform: translateY(16px) scale(.97); } to { opacity: 1; transform: none; } }
@keyframes gkToast { 0% { opacity: 0; transform: translate(-50%, 16px); } 12% { opacity: 1; transform: translate(-50%, 0); } 85% { opacity: 1; transform: translate(-50%, 0); } 100% { opacity: 0; transform: translate(-50%, 8px); } }
.gk-login-rise { animation: gkLoginRise .7s cubic-bezier(.22,1,.36,1) both; animation-delay: var(--d, 0ms); }
.gk-login-float { animation: gkFloat 6s ease-in-out infinite; }
.gk-login-input { width: 100%; height: 54px; box-sizing: border-box; border-radius: 16px; border: 1.5px solid ${C.line}; background: #FFFFFF; padding: 0 18px; font: inherit; font-size: 16px; color: ${C.text}; outline: none; transition: border-color .15s, box-shadow .15s; }
.gk-login-input:focus { border-color: ${C.sky}; box-shadow: 0 0 0 4px rgba(92,184,242,.18); }
.gk-login-input::placeholder { color: #A9AFB6; }
.gk-login-input.is-error { border-color: ${C.danger}; }
.gk-login-btn { width: 100%; height: 56px; border: 0; border-radius: 16px; background: ${C.yellow}; color: ${C.text}; font: inherit; font-size: 17px; font-weight: 700; cursor: pointer; transition: filter .15s, transform .1s; }
.gk-login-btn:hover { filter: brightness(.96); }
.gk-login-btn:active { transform: scale(.99); }
.gk-login-social { flex: 1; height: 50px; border-radius: 14px; border: 1.5px solid transparent; font: inherit; font-size: 15px; font-weight: 700; cursor: pointer; transition: filter .15s, transform .1s; display: flex; align-items: center; justify-content: center; gap: 8px; }
.gk-login-social:hover { filter: brightness(.96); }
.gk-login-social:active { transform: scale(.98); }
.gk-login-link { border: 0; background: none; padding: 0; font: inherit; font-size: 14px; color: ${C.muted}; cursor: pointer; }
.gk-login-link:hover { color: ${C.text}; text-decoration: underline; }
.gk-login-check { width: 18px; height: 18px; accent-color: ${C.sky}; margin: 0; }
.gk-login-eye { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); width: 36px; height: 36px; border: 0; border-radius: 10px; background: none; color: ${C.muted}; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.gk-login-eye:hover { background: #F3F5F7; }
.gk-login-page button:focus-visible, .gk-login-page input:focus-visible { outline: 2px solid ${C.sky}; outline-offset: 2px; }
.gk-modal { position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; padding: 24px; background: rgba(11,42,69,.32); backdrop-filter: blur(3px); animation: gkFadeIn .2s ease both; }
.gk-modal__box { width: 480px; max-width: 100%; background: #FFFFFF; border-radius: 28px; padding: 28px; box-sizing: border-box; box-shadow: 0 30px 80px rgba(11,42,69,.28); display: flex; flex-direction: column; gap: 18px; animation: gkPopIn .32s cubic-bezier(.22,1,.36,1) both; }
.gk-toast { position: fixed; left: 50%; bottom: 36px; z-index: 110; display: flex; align-items: center; gap: 10px; padding: 14px 20px 14px 14px; border-radius: 999px; background: ${C.text}; color: #fff; font-size: 15px; font-weight: 600; box-shadow: 0 12px 30px rgba(11,42,69,.3); animation: gkToast 2.4s cubic-bezier(.22,1,.36,1) both; }
.gk-login-mobile-logo { display: none; }
/* 작은 화면 */
@media (max-width: 1440px) {
  .gk-login-brand { padding: 40px 48px !important; }
  .gk-login-hero svg { width: 230px; height: 230px; }
  .gk-login-brand h1 { font-size: 34px !important; }
}
@media (max-width: 1000px) {
  .gk-login-brand { display: none !important; }
  .gk-login-mobile-logo { display: flex; }
  .gk-login-form-wrap { padding: 32px 24px !important; }
}
@media (prefers-reduced-motion: reduce) { .gk-login-rise, .gk-login-float, .gk-modal, .gk-modal__box, .gk-toast { animation: none; } }
`;
const at = (ms) => ({ "--d": `${ms}ms` });

/* 간편 로그인 버튼 (공식 로고 이미지는 각 회사 개발자 사이트의 디자인 가이드에서 받아 넣어 주세요) */
const SOCIALS = [
  { key: "kakao", label: "카카오", bg: "#FEE500", color: "#191919", border: "#FEE500" },
  { key: "naver", label: "네이버", bg: "#03C75A", color: "#FFFFFF", border: "#03C75A" },
  { key: "google", label: "구글", bg: "#FFFFFF", color: C.text, border: C.line },
];

function Toast({ text, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="gk-toast" role="status">
      <span style={{ width: 24, height: 24, borderRadius: "50%", background: C.sky, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><path d="M12 7v6M12 17h.01" /></svg>
      </span>
      {text}
    </div>
  );
}

/** 비밀번호 찾기 창 */
function ResetModal({ initialEmail, onClose }) {
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const send = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("이메일 주소를 다시 확인해 주세요.");
    if (!emailExists(email)) return setError("가입되지 않은 이메일이에요.");
    setError("");
    setSent(true);
  };

  return (
    <div className="gk-modal" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form className="gk-modal__box" role="dialog" aria-modal="true" aria-labelledby="gk-reset-title" onSubmit={send} noValidate>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <h3 id="gk-reset-title" style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-0.6px" }}>{sent ? "메일을 보냈어요" : "비밀번호 찾기"}</h3>
            <p style={{ margin: 0, fontSize: 15, color: C.muted, lineHeight: 1.55 }}>
              {sent ? <><b style={{ color: C.text }}>{email}</b>로 비밀번호를 다시 만드는 링크를 보냈어요. 메일함을 확인해 주세요.</> : "가입할 때 쓴 이메일을 넣으면 비밀번호를 다시 만드는 링크를 보내드려요."}
            </p>
          </div>
          <button type="button" className="gk-login-eye" style={{ position: "static", transform: "none" }} aria-label="닫기" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>

        {sent ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 16, background: C.skySoft, fontSize: 14, color: C.sub }}>
            <span style={{ width: 36, height: 36, borderRadius: "50%", background: C.sky, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m3.5 6.5 8.5 6 8.5-6" /></svg>
            </span>
            메일이 안 보이면 스팸함도 확인해 주세요. 링크는 30분 동안 쓸 수 있어요.
          </div>
        ) : (
          <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>이메일</span>
            <input id="reset-email" type="email" autoFocus className={`gk-login-input ${error ? "is-error" : ""}`} placeholder="example@email.com" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} />
            {error && <span role="alert" style={{ fontSize: 13, color: C.danger }}>{error}</span>}
          </label>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          {sent ? (
            <button type="button" className="gk-login-btn" onClick={onClose}>로그인하러 가기</button>
          ) : (
            <>
              <button type="button" className="gk-login-btn" style={{ flex: "0 0 110px", background: "#F3F5F7" }} onClick={onClose}>취소</button>
              <button type="submit" className="gk-login-btn" style={{ flex: 1 }}>재설정 링크 보내기</button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [keep, setKeep] = useState(true);
  const [error, setError] = useState({ field: "", message: "" });
  const [resetOpen, setResetOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const fail = (field, message) => setError({ field, message });

  const submit = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("email", "이메일 주소를 다시 확인해 주세요.");
    if (!pw) return fail("pw", "비밀번호를 입력해 주세요.");
    const res = login({ email, password: pw, keep });
    if (!res.ok) return fail(res.field, res.message);
    setError({ field: "", message: "" });
    navigate("/"); // 로그인 후 홈으로
  };

  return (
    <div className="gk-login-page" style={{ minHeight: "100vh", display: "flex", background: C.bg, fontFamily: FONT, color: C.text, letterSpacing: "-0.2px" }}>
      <style>{CSS}</style>

      {/* 왼쪽: 브랜드 */}
      <section className="gk-login-brand" style={{ flex: "1 1 50%", background: C.skySoft, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "48px 64px", boxSizing: "border-box", position: "relative", overflow: "hidden" }}>
        <button type="button" onClick={() => navigate("/")} aria-label="고정콕 홈으로 가기" style={{ display: "flex", alignItems: "center", gap: 10, border: 0, background: "none", padding: 0, cursor: "pointer", alignSelf: "flex-start" }}>
          <LogoMark size={44} />
          <Wordmark height={32} />
        </button>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
          <div className="gk-login-float gk-login-hero" style={{ filter: "drop-shadow(0 24px 40px rgba(11,42,69,.12))" }}>
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
      <section className="gk-login-form-wrap" style={{ flex: "1 1 50%", display: "flex", alignItems: "center", justifyContent: "center", padding: 48, boxSizing: "border-box" }}>
        <form onSubmit={submit} noValidate className="gk-login-rise" style={{ ...at(80), width: 440, maxWidth: "100%", display: "flex", flexDirection: "column", gap: 22 }}>
          {/* 작은 화면에서만 보이는 로고 */}
          <button type="button" className="gk-login-mobile-logo" onClick={() => navigate("/")} aria-label="고정콕 홈으로 가기" style={{ alignItems: "center", gap: 8, border: 0, background: "none", padding: 0, cursor: "pointer", alignSelf: "flex-start" }}>
            <LogoMark size={36} />
            <Wordmark height={26} />
          </button>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <h2 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: "-1px" }}>로그인</h2>
            <p style={{ margin: 0, fontSize: 16, color: C.muted }}>다시 오신 걸 환영해요! 계정 정보를 입력해 주세요.</p>
          </div>

          <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>이메일</span>
            <input id="login-email" type="email" autoComplete="email" className={`gk-login-input ${error.field === "email" ? "is-error" : ""}`} placeholder="example@email.com" value={email} onChange={(e) => { setEmail(e.target.value); setError({ field: "", message: "" }); }} />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>비밀번호</span>
            <span style={{ position: "relative" }}>
              <input id="login-pw" type={showPw ? "text" : "password"} autoComplete="current-password" className={`gk-login-input ${error.field === "pw" ? "is-error" : ""}`} style={{ paddingRight: 54 }} placeholder="비밀번호 입력" value={pw} onChange={(e) => { setPw(e.target.value); setError({ field: "", message: "" }); }} />
              <button type="button" className="gk-login-eye" aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 보기"} onClick={() => setShowPw((v) => !v)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />
                  {showPw && <path d="M4 4l16 16" />}
                </svg>
              </button>
            </span>
          </label>

          {error.message && (
            <p role="alert" style={{ margin: "-8px 0 0", fontSize: 14, color: C.danger }}>
              {error.message}{" "}
              {error.field === "email" && error.message.includes("가입되지") && (
                <button type="button" className="gk-login-link" onClick={() => navigate("/signup")} style={{ color: C.text, fontWeight: 700 }}>회원가입하기</button>
              )}
            </p>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: C.sub, cursor: "pointer" }} title="끄면 브라우저를 닫을 때 로그아웃돼요">
              <input id="login-keep" type="checkbox" className="gk-login-check" checked={keep} onChange={(e) => setKeep(e.target.checked)} />
              로그인 상태 유지
            </label>
            <button type="button" className="gk-login-link" onClick={() => setResetOpen(true)}>비밀번호를 잊으셨나요?</button>
          </div>

          <button type="submit" className="gk-login-btn">로그인</button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#9AA1A9", fontSize: 13 }}>
            <span style={{ flex: 1, height: 1, background: C.line }} />
            간편 로그인
            <span style={{ flex: 1, height: 1, background: C.line }} />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            {SOCIALS.map((s) => (
              <button key={s.key} type="button" className="gk-login-social" style={{ background: s.bg, color: s.color, borderColor: s.border }}
                onClick={() => setToast({ text: `${s.label} 로그인은 준비 중이에요`, id: Date.now() })}>
                {s.label}
              </button>
            ))}
          </div>

          <p style={{ margin: 0, textAlign: "center", fontSize: 15, color: C.muted }}>
            아직 계정이 없나요?{" "}
            <button type="button" className="gk-login-link" onClick={() => navigate("/signup")} style={{ fontSize: 15, fontWeight: 700, color: C.text }}>회원가입</button>
          </p>
        </form>
      </section>

      {resetOpen && <ResetModal initialEmail={email} onClose={() => setResetOpen(false)} />}
      {toast && <Toast key={toast.id} text={toast.text} onDone={() => setToast(null)} />}
    </div>
  );
}
