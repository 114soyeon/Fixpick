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
.gk-login-social { position: relative; width: 100%; flex: none; height: 52px; border-radius: 14px; border: 1.5px solid transparent; font: inherit; font-size: 15px; font-weight: 700; cursor: pointer; transition: filter .15s, transform .1s; display: flex; align-items: center; justify-content: center; gap: 8px; }
.gk-login-social:hover { filter: brightness(.96); }
.gk-login-social__logo { width: 20px; height: 20px; object-fit: contain; flex-shrink: 0; }
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
/* 간편 로그인 로고 (폴더·이미지 파일 없이 코드 안에 바로 넣었어요) */
const KAKAO_LOGO = "data:image/png;base64,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";
const GOOGLE_LOGO = "data:image/png;base64,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";

/* 간편 로그인 (카카오 한 줄, 그 아래 구글 한 줄)
 */
const SOCIALS = [
  { key: "kakao", label: "카카오로 시작하기", name: "카카오", bg: "#FEE500", color: "rgba(0,0,0,.85)", border: "#FEE500", logo: KAKAO_LOGO },
  { key: "google", label: "Google로 시작하기", name: "Google", bg: "#FFFFFF", color: "#1F1F1F", border: "#DADCE0", logo: GOOGLE_LOGO },
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

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {SOCIALS.map((s) => (
              <button key={s.key} type="button" className="gk-login-social" style={{ background: s.bg, color: s.color, borderColor: s.border }}
                onClick={() => setToast({ text: `${s.name} 로그인은 준비 중이에요`, id: Date.now() })}>
                {s.logo && <img src={s.logo} alt="" aria-hidden="true" className="gk-login-social__logo" />}
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
