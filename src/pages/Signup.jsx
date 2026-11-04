import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogoMark, Wordmark } from "../components/Sidebar";
import { signup } from "../utils/auth";

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
@keyframes gkSignRise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
.gk-sign-rise { animation: gkSignRise .7s cubic-bezier(.22,1,.36,1) both; animation-delay: var(--d, 0ms); }
.gk-sign-input { width: 100%; height: 52px; box-sizing: border-box; border-radius: 16px; border: 1.5px solid ${C.line}; background: #FFFFFF; padding: 0 18px; font: inherit; font-size: 16px; color: ${C.text}; outline: none; transition: border-color .15s, box-shadow .15s; }
.gk-sign-input:focus { border-color: ${C.sky}; box-shadow: 0 0 0 4px rgba(92,184,242,.18); }
.gk-sign-input::placeholder { color: #A9AFB6; }
.gk-sign-input.is-error { border-color: ${C.danger}; }
.gk-sign-btn { width: 100%; height: 56px; border: 0; border-radius: 16px; background: ${C.yellow}; color: ${C.text}; font: inherit; font-size: 17px; font-weight: 700; cursor: pointer; transition: filter .15s, transform .1s, opacity .15s; }
.gk-sign-btn:hover:not(:disabled) { filter: brightness(.96); }
.gk-sign-btn:active:not(:disabled) { transform: scale(.99); }
.gk-sign-btn:disabled { opacity: .45; cursor: not-allowed; }
.gk-sign-link { border: 0; background: none; padding: 0; font: inherit; font-size: 15px; font-weight: 700; color: ${C.text}; cursor: pointer; }
.gk-sign-link:hover { text-decoration: underline; }
.gk-sign-check { width: 20px; height: 20px; accent-color: ${C.sky}; margin: 0; flex-shrink: 0; cursor: pointer; }
.gk-sign-eye { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); width: 36px; height: 36px; border: 0; border-radius: 10px; background: none; color: ${C.muted}; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.gk-sign-eye:hover { background: #F3F5F7; }
.gk-sign-page button:focus-visible, .gk-sign-page input:focus-visible { outline: 2px solid ${C.sky}; outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { .gk-sign-rise { animation: none; } }
`;
const at = (ms) => ({ "--d": `${ms}ms` });

const STEPS = [
  { n: 1, title: "이름과 이메일로 가입", desc: "1분이면 끝나요" },
  { n: 2, title: "고정지출 등록", desc: "월세·통신비·구독료를 한 번에" },
  { n: 3, title: "결제일 알림 받기", desc: "돈 나가기 3일 전에 알려드려요" },
];

const TERMS = [
  { key: "service", label: "[필수] 서비스 이용약관 동의", required: true },
  { key: "privacy", label: "[필수] 개인정보 수집·이용 동의", required: true },
  { key: "marketing", label: "[선택] 혜택·이벤트 알림 받기", required: false },
];

/** 비밀번호 강도: 0~3 */
function strengthOf(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[0-9]/.test(pw) && /[a-zA-Z]/.test(pw)) s++;
  if (/[^a-zA-Z0-9]/.test(pw)) s++;
  return pw ? Math.max(s, 1) : 0;
}
const STRENGTH = ["", "약해요", "보통이에요", "안전해요"];
const STRENGTH_COLOR = ["#E3E8ED", C.danger, "#F0A830", C.ok];

function EyeButton({ show, onClick }) {
  return (
    <button type="button" className="gk-sign-eye" aria-label={show ? "비밀번호 숨기기" : "비밀번호 보기"} onClick={onClick}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />
        {show && <path d="M4 4l16 16" />}
      </svg>
    </button>
  );
}

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", pw: "", pw2: "" });
  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState({ service: false, privacy: false, marketing: false });
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })); };
  const allAgreed = TERMS.every((t) => agree[t.key]);
  const requiredAgreed = TERMS.filter((t) => t.required).every((t) => agree[t.key]);
  const toggleAll = () => {
    const next = !allAgreed;
    setAgree({ service: next, privacy: next, marketing: next });
  };

  const strength = strengthOf(form.pw);
  const pwMatch = form.pw2 && form.pw === form.pw2;

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = "이름을 입력해 주세요.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "이메일 주소를 다시 확인해 주세요.";
    if (form.pw.length < 8) next.pw = "비밀번호는 8자 이상으로 만들어 주세요.";
    if (form.pw !== form.pw2) next.pw2 = "비밀번호가 서로 달라요.";
    setErrors(next);
    if (Object.keys(next).length || !requiredAgreed) return;
    signup({ name: form.name, email: form.email });
    navigate("/"); // 가입 후 바로 홈으로
  };

  const label = { fontSize: 14, fontWeight: 600 };
  const errText = { margin: 0, fontSize: 13, color: C.danger };

  return (
    <div className="gk-sign-page" style={{ minHeight: "100vh", display: "flex", background: C.bg, fontFamily: FONT, color: C.text, letterSpacing: "-0.2px" }}>
      <style>{CSS}</style>

      {/* 왼쪽: 브랜드 + 가입 후 흐름 */}
      <section style={{ flex: "1 1 50%", background: C.skySoft, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "48px 64px", boxSizing: "border-box" }}>
        <button type="button" onClick={() => navigate("/")} aria-label="고정콕 홈으로 가기" style={{ display: "flex", alignItems: "center", gap: 10, border: 0, background: "none", padding: 0, cursor: "pointer", alignSelf: "flex-start" }}>
          <LogoMark size={44} />
          <Wordmark height={32} />
        </button>

        <div style={{ display: "flex", flexDirection: "column", gap: 40, maxWidth: 520, alignSelf: "center", width: "100%" }}>
          <div className="gk-sign-rise" style={{ ...at(100), display: "flex", flexDirection: "column", gap: 12 }}>
            <h1 style={{ margin: 0, fontSize: 40, fontWeight: 800, letterSpacing: "-1.4px", lineHeight: 1.3 }}>
              가입하고 3단계면<br />고정지출 관리 끝!
            </h1>
            <p style={{ margin: 0, fontSize: 17, color: C.sub, lineHeight: 1.6 }}>
              매달 빠져나가는 돈을 한눈에 보고,<br />안 쓰는 구독은 바로 정리해 보세요.
            </p>
          </div>

          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
            {STEPS.map((s, i) => (
              <li key={s.n} className="gk-sign-rise" style={{ ...at(250 + i * 120), display: "flex", alignItems: "center", gap: 16, background: "#FFFFFF", borderRadius: 20, padding: "18px 20px" }}>
                <span style={{ width: 44, height: 44, borderRadius: 14, background: i === 0 ? C.yellow : C.skySoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, flexShrink: 0 }}>{s.n}</span>
                <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <b style={{ fontSize: 17 }}>{s.title}</b>
                  <span style={{ fontSize: 14, color: C.muted }}>{s.desc}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <p style={{ margin: 0, fontSize: 14, color: C.muted, textAlign: "center" }}>가입은 무료예요 · 언제든 탈퇴할 수 있어요</p>
      </section>

      {/* 오른쪽: 회원가입 폼 */}
      <section style={{ flex: "1 1 50%", display: "flex", alignItems: "center", justifyContent: "center", padding: 48, boxSizing: "border-box" }}>
        <form onSubmit={submit} noValidate className="gk-sign-rise" style={{ ...at(80), width: 440, maxWidth: "100%", display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 4 }}>
            <h2 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: "-1px" }}>회원가입</h2>
            <p style={{ margin: 0, fontSize: 16, color: C.muted }}>이름은 대시보드와 프로필에 표시돼요.</p>
          </div>

          <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={label}>이름</span>
            <input id="signup-name" autoComplete="name" maxLength={12} className={`gk-sign-input ${errors.name ? "is-error" : ""}`} placeholder="예) 김민지" value={form.name} onChange={(e) => set("name", e.target.value)} />
            {errors.name && <p role="alert" style={errText}>{errors.name}</p>}
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={label}>이메일</span>
            <input id="signup-email" type="email" autoComplete="email" className={`gk-sign-input ${errors.email ? "is-error" : ""}`} placeholder="example@email.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
            {errors.email && <p role="alert" style={errText}>{errors.email}</p>}
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={label}>비밀번호</span>
            <span style={{ position: "relative" }}>
              <input id="signup-pw" type={showPw ? "text" : "password"} autoComplete="new-password" className={`gk-sign-input ${errors.pw ? "is-error" : ""}`} style={{ paddingRight: 54 }} placeholder="8자 이상, 영문·숫자 섞어서" value={form.pw} onChange={(e) => set("pw", e.target.value)} />
              <EyeButton show={showPw} onClick={() => setShowPw((v) => !v)} />
            </span>
            {form.pw && (
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ flex: 1, display: "flex", gap: 4 }}>
                  {[1, 2, 3].map((n) => (
                    <span key={n} style={{ flex: 1, height: 5, borderRadius: 3, background: strength >= n ? STRENGTH_COLOR[strength] : "#E3E8ED", transition: "background .2s" }} />
                  ))}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: STRENGTH_COLOR[strength], width: 70, textAlign: "right" }}>{STRENGTH[strength]}</span>
              </span>
            )}
            {errors.pw && <p role="alert" style={errText}>{errors.pw}</p>}
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={label}>비밀번호 확인</span>
            <input id="signup-pw2" type={showPw ? "text" : "password"} autoComplete="new-password" className={`gk-sign-input ${errors.pw2 ? "is-error" : ""}`} placeholder="비밀번호를 한 번 더 입력" value={form.pw2} onChange={(e) => set("pw2", e.target.value)} />
            {errors.pw2 ? (
              <p role="alert" style={errText}>{errors.pw2}</p>
            ) : form.pw2 && (
              <p style={{ margin: 0, fontSize: 13, color: pwMatch ? C.ok : C.muted }}>{pwMatch ? "비밀번호가 일치해요" : "비밀번호를 똑같이 입력해 주세요"}</p>
            )}
          </label>

          {/* 약관 동의 */}
          <div style={{ background: "#FFFFFF", border: `1.5px solid ${C.line}`, borderRadius: 16, padding: "6px 16px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 0", borderBottom: `1px solid ${C.line}`, cursor: "pointer" }}>
              <input id="signup-agree-all" type="checkbox" className="gk-sign-check" checked={allAgreed} onChange={toggleAll} />
              <b style={{ fontSize: 15 }}>전체 동의하기</b>
            </label>
            {TERMS.map((t) => (
              <label key={t.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", cursor: "pointer", fontSize: 14, color: C.sub }}>
                <input id={`signup-agree-${t.key}`} type="checkbox" className="gk-sign-check" checked={agree[t.key]} onChange={(e) => setAgree((a) => ({ ...a, [t.key]: e.target.checked }))} />
                {t.label}
              </label>
            ))}
          </div>

          <button type="submit" className="gk-sign-btn" disabled={!requiredAgreed}>가입하고 시작하기</button>

          <p style={{ margin: 0, textAlign: "center", fontSize: 15, color: C.muted }}>
            이미 계정이 있나요?{" "}
            <button type="button" className="gk-sign-link" onClick={() => navigate("/login")}>로그인</button>
          </p>
        </form>
      </section>
    </div>
  );
}