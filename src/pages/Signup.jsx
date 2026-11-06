import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogoMark, Wordmark } from "../components/Sidebar";
import { emailExists, signup } from "../utils/auth";

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
.gk-sign-input { width: 100%; height: 48px; box-sizing: border-box; border-radius: 16px; border: 1.5px solid ${C.line}; background: #FFFFFF; padding: 0 18px; font: inherit; font-size: 16px; color: ${C.text}; outline: none; transition: border-color .15s, box-shadow .15s; }
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
.gk-sign-view { flex-shrink: 0; border: 0; background: none; padding: 4px 6px; margin-left: auto; border-radius: 8px; font: inherit; font-size: 13px; font-weight: 600; color: ${C.muted}; cursor: pointer; display: flex; align-items: center; gap: 2px; }
.gk-sign-view:hover { background: #F3F5F7; color: ${C.text}; }
@keyframes gkTermFade { from { opacity: 0; } to { opacity: 1; } }
@keyframes gkTermIn { from { opacity: 0; transform: translateY(16px) scale(.97); } to { opacity: 1; transform: none; } }
.gk-term { position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; padding: 24px; background: rgba(11,42,69,.32); backdrop-filter: blur(3px); animation: gkTermFade .2s ease both; }
.gk-term__box { width: 560px; max-width: 100%; max-height: 86vh; background: #FFFFFF; border-radius: 28px; box-shadow: 0 30px 80px rgba(11,42,69,.28); display: flex; flex-direction: column; overflow: hidden; animation: gkTermIn .32s cubic-bezier(.22,1,.36,1) both; }
.gk-term__body { overflow-y: auto; padding: 4px 28px 8px; display: flex; flex-direction: column; gap: 18px; }
.gk-term__body h4 { margin: 0 0 6px; font-size: 15px; font-weight: 700; }
.gk-term__body p { margin: 0; font-size: 14px; line-height: 1.7; color: ${C.sub}; white-space: pre-line; }
.gk-sign-mini { flex-shrink: 0; height: 48px; padding: 0 16px; border: 0; border-radius: 14px; background: ${C.text}; color: #FFFFFF; font: inherit; font-size: 14px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: opacity .15s, filter .15s; }
.gk-sign-mini:hover:not(:disabled) { filter: brightness(1.15); }
.gk-sign-mini:disabled { opacity: .35; cursor: default; }
.gk-sign-mini--light { background: #F1F4F7; color: ${C.text}; }
@keyframes gkSignPop { 0% { transform: scale(.6); opacity: 0; } 60% { transform: scale(1.08); opacity: 1; } 100% { transform: scale(1); } }
.gk-sign-pop { animation: gkSignPop .5s cubic-bezier(.22,1,.36,1) both; }
.gk-sign-page button:focus-visible, .gk-sign-page input:focus-visible { outline: 2px solid ${C.sky}; outline-offset: 2px; }
.gk-sign-mobile-logo { display: none; }
/* 작은 화면 */
@media (max-width: 1440px) {
  .gk-sign-brand { padding: 40px 48px !important; }
  .gk-sign-brand h1 { font-size: 34px !important; }
}
@media (max-width: 1000px) {
  .gk-sign-brand { display: none !important; }
  .gk-sign-mobile-logo { display: flex; }
  .gk-sign-form-wrap { padding: 32px 24px !important; }
}
@media (prefers-reduced-motion: reduce) { .gk-sign-rise, .gk-sign-pop, .gk-term, .gk-term__box { animation: none; } }
`;
const at = (ms) => ({ "--d": `${ms}ms` });

const STEPS = [
  { n: 1, title: "간단한 정보로 가입", desc: "이름·휴대폰·이메일만 있으면 1분이면 끝나요" },
  { n: 2, title: "고정지출 등록", desc: "월세·통신비·구독료를 한 번에" },
  { n: 3, title: "결제일 알림 받기", desc: "돈 나가기 전에 미리 알려드려요" },
];

const TERMS = [
  {
    key: "service", label: "[필수] 서비스 이용약관 동의", title: "고정콕 서비스 이용약관", required: true,
    body: [
      ["제1조 (목적)", "이 약관은 고정콕(이하 \"서비스\")이 제공하는 고정지출 관리 서비스를 이용하는 데 필요한 회원과 서비스 사이의 권리, 의무 및 책임 사항을 정하는 것을 목적으로 합니다."],
      ["제2조 (용어의 뜻)", "① \"회원\"이란 이 약관에 동의하고 가입하여 서비스를 이용하는 사람을 말합니다.\n② \"고정지출\"이란 회원이 직접 등록한 월세·통신비·구독료·보험료 등 정기적으로 나가는 돈을 말합니다."],
      ["제3조 (서비스 내용)", "서비스는 다음 기능을 제공합니다.\n1. 고정지출 등록과 카테고리별 정리\n2. 결제일 캘린더와 결제일 알림\n3. 월별 지출 리포트와 예산 관리"],
      ["제4조 (회원의 의무)", "회원은 가입할 때 정확한 정보를 입력해야 하며, 자신의 계정을 다른 사람이 쓰지 않도록 관리해야 합니다."],
      ["제5조 (서비스 이용 제한)", "서비스는 회원이 이 약관을 위반하거나 서비스 운영을 방해하는 경우 이용을 제한할 수 있습니다."],
      ["제6조 (책임의 한계)", "서비스가 보여주는 금액과 결제일은 회원이 입력한 정보를 바탕으로 하며, 실제 결제 내역과 다를 수 있습니다. 정확한 결제 정보는 각 카드사·금융사에서 확인해 주세요."],
      ["제7조 (회원 탈퇴)", "회원은 언제든지 설정 페이지에서 탈퇴할 수 있으며, 탈퇴하면 등록한 고정지출과 설정 정보는 바로 삭제됩니다."],
    ],
  },
  {
    key: "privacy", label: "[필수] 개인정보 수집·이용 동의", title: "개인정보 수집·이용 동의", required: true,
    body: [
      ["1. 수집하는 항목", "이름, 휴대폰 번호, 이메일 주소, 비밀번호"],
      ["2. 수집·이용 목적", "회원 가입과 본인 확인, 결제일 알림 발송, 고객 문의 응대"],
      ["3. 보관 기간", "회원 탈퇴 시까지 보관하며, 탈퇴하면 바로 삭제합니다. 단, 관련 법령에 따라 보관해야 하는 정보는 정해진 기간 동안 보관합니다."],
      ["4. 동의를 거부할 권리", "개인정보 수집·이용에 동의하지 않을 수 있습니다. 다만 필수 항목이라 동의하지 않으면 회원가입을 할 수 없어요."],
    ],
  },
  {
    key: "marketing", label: "[선택] 혜택·이벤트 알림 받기", title: "혜택·이벤트 알림 수신 동의", required: false,
    body: [
      ["1. 받는 내용", "새 기능 소개, 이벤트, 고정지출을 아끼는 팁 같은 소식을 보내드려요."],
      ["2. 받는 방법", "이메일, 문자(SMS)"],
      ["3. 보관 기간", "동의를 철회하거나 회원 탈퇴할 때까지"],
      ["4. 동의하지 않아도 돼요", "선택 항목이라 동의하지 않아도 가입과 서비스 이용에는 아무 문제가 없어요. 설정 페이지에서 언제든 바꿀 수 있어요."],
    ],
  },
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

/** 숫자만 받아서 010-1234-5678 모양으로 */
function formatPhone(v) {
  const d = v.replace(/[^0-9]/g, "").slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}
const STRENGTH_COLOR = ["#E3E8ED", C.danger, "#F0A830", C.ok];
const DEMO_CODE = "123456"; // 포트폴리오용 테스트 인증번호 (실제로는 문자로 보내야 해요)

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
  const [form, setForm] = useState({ name: "", phone: "", email: "", pw: "", pw2: "" });
  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState({ service: false, privacy: false, marketing: false });
  const [errors, setErrors] = useState({});
  const [viewing, setViewing] = useState(null); // 보고 있는 약관
  const [verify, setVerify] = useState({ sent: false, code: "", ok: false, left: 0 }); // 휴대폰 인증
  const [done, setDone] = useState(null); // 가입 완료한 사람 이름

  // 인증번호 남은 시간 (3분)
  useEffect(() => {
    if (!verify.sent || verify.ok || verify.left <= 0) return;
    const t = setTimeout(() => setVerify((v) => ({ ...v, left: v.left - 1 })), 1000);
    return () => clearTimeout(t);
  }, [verify]);

  const phoneValid = /^01[016789]-\d{3,4}-\d{4}$/.test(form.phone);
  const sendCode = () => {
    if (!phoneValid) return setErrors((e) => ({ ...e, phone: "휴대폰 번호를 다시 확인해 주세요." }));
    setErrors((e) => ({ ...e, phone: "", code: "" }));
    setVerify({ sent: true, code: "", ok: false, left: 180 });
  };
  const checkCode = () => {
    if (verify.left <= 0) return setErrors((e) => ({ ...e, code: "시간이 지났어요. 인증번호를 다시 받아 주세요." }));
    if (verify.code !== DEMO_CODE) return setErrors((e) => ({ ...e, code: "인증번호가 맞지 않아요." }));
    setErrors((e) => ({ ...e, code: "", phone: "" }));
    setVerify((v) => ({ ...v, ok: true }));
  };
  const mmss = `${Math.floor(verify.left / 60)}:${String(verify.left % 60).padStart(2, "0")}`;
  const checkEmail = () => {
    if (form.email && emailExists(form.email)) setErrors((e) => ({ ...e, email: "이미 가입된 이메일이에요." }));
  };

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
    if (!phoneValid) next.phone = "휴대폰 번호를 다시 확인해 주세요.";
    else if (!verify.ok) next.phone = "휴대폰 인증을 해 주세요.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "이메일 주소를 다시 확인해 주세요.";
    else if (emailExists(form.email)) next.email = "이미 가입된 이메일이에요.";
    if (form.pw.length < 8) next.pw = "비밀번호는 8자 이상으로 만들어 주세요.";
    if (form.pw !== form.pw2) next.pw2 = "비밀번호가 서로 달라요.";
    setErrors(next);
    if (Object.keys(next).length || !requiredAgreed) return;
    const res = signup({ name: form.name, phone: form.phone, email: form.email, password: form.pw });
    if (!res.ok) return setErrors({ [res.field]: res.message });
    setDone(form.name.trim()); // 가입 완료 화면으로
  };

  const label = { fontSize: 14, fontWeight: 600 };
  const errText = { margin: 0, fontSize: 13, color: C.danger };

  return (
    <div className="gk-sign-page" style={{ minHeight: "100vh", display: "flex", background: C.bg, fontFamily: FONT, color: C.text, letterSpacing: "-0.2px" }}>
      <style>{CSS}</style>

      {/* 왼쪽: 브랜드 + 가입 후 흐름 */}
      <section className="gk-sign-brand" style={{ flex: "1 1 50%", background: C.skySoft, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "48px 64px", boxSizing: "border-box" }}>
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
              매달 빠져나가는 돈을 한눈에 보고,<br />결제일 전에 미리 알림을 받아 보세요.
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
      <section className="gk-sign-form-wrap" style={{ flex: "1 1 50%", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 48px", boxSizing: "border-box" }}>
        {done ? (
          <Complete name={done} onHome={() => navigate("/")} onAdd={() => navigate("/fix", { state: { openAdd: true } })} />
        ) : (
        <form onSubmit={submit} noValidate className="gk-sign-rise" style={{ ...at(80), width: 440, maxWidth: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* 작은 화면에서만 보이는 로고 */}
          <button type="button" className="gk-sign-mobile-logo" onClick={() => navigate("/")} aria-label="고정콕 홈으로 가기" style={{ alignItems: "center", gap: 8, border: 0, background: "none", padding: 0, cursor: "pointer", alignSelf: "flex-start" }}>
            <LogoMark size={36} />
            <Wordmark height={26} />
          </button>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 4 }}>
            <h2 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: "-1px" }}>회원가입</h2>
            <p style={{ margin: 0, fontSize: 16, color: C.muted }}>이름은 대시보드와 프로필에 표시돼요.</p>
          </div>

          <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={label}>이름</span>
            <input id="signup-name" autoComplete="name" maxLength={12} className={`gk-sign-input ${errors.name ? "is-error" : ""}`} placeholder="이름" value={form.name} onChange={(e) => set("name", e.target.value)} />
            {errors.name && <p role="alert" style={errText}>{errors.name}</p>}
          </label>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label htmlFor="signup-phone" style={label}>휴대폰 번호</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input id="signup-phone" type="tel" inputMode="numeric" autoComplete="tel" disabled={verify.ok} className={`gk-sign-input ${errors.phone ? "is-error" : ""}`} placeholder="010-1234-5678" value={form.phone}
                onChange={(e) => { set("phone", formatPhone(e.target.value)); setVerify({ sent: false, code: "", ok: false, left: 0 }); }}
                style={{ flex: 1, background: verify.ok ? "#F3F5F7" : "#FFFFFF" }} />
              {verify.ok ? (
                <span style={{ flexShrink: 0, height: 48, padding: "0 14px", borderRadius: 14, background: "#E3F5EC", color: C.ok, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                  인증 완료
                </span>
              ) : (
                <button type="button" className={`gk-sign-mini ${verify.sent ? "gk-sign-mini--light" : ""}`} disabled={!phoneValid} onClick={sendCode}>{verify.sent ? "다시 받기" : "인증번호 받기"}</button>
              )}
            </div>
            {verify.sent && !verify.ok && (
              <div className="gk-sign-rise" style={{ display: "flex", gap: 8 }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <input id="signup-code" inputMode="numeric" autoComplete="one-time-code" className={`gk-sign-input ${errors.code ? "is-error" : ""}`} placeholder="인증번호 6자리" value={verify.code}
                    onChange={(e) => { setVerify((v) => ({ ...v, code: e.target.value.replace(/[^0-9]/g, "").slice(0, 6) })); setErrors((er) => ({ ...er, code: "" })); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); checkCode(); } }}
                    style={{ paddingRight: 64, letterSpacing: 2 }} />
                  <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", fontSize: 14, fontWeight: 700, color: verify.left > 30 ? C.sky : C.danger }}>{mmss}</span>
                </div>
                <button type="button" className="gk-sign-mini" disabled={verify.code.length !== 6} onClick={checkCode}>확인</button>
              </div>
            )}
            {verify.sent && !verify.ok && !errors.code && <p style={{ margin: 0, fontSize: 13, color: C.muted }}>문자로 받은 6자리를 입력해 주세요. (테스트용 인증번호: {DEMO_CODE})</p>}
            {errors.code && <p role="alert" style={errText}>{errors.code}</p>}
            {errors.phone && <p role="alert" style={errText}>{errors.phone}</p>}
          </div>

          <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={label}>이메일</span>
            <input id="signup-email" type="email" autoComplete="email" className={`gk-sign-input ${errors.email ? "is-error" : ""}`} placeholder="example@email.com" value={form.email} onChange={(e) => set("email", e.target.value)} onBlur={checkEmail} />
            {errors.email && (
              <p role="alert" style={errText}>
                {errors.email}{" "}
                {errors.email.includes("이미") && <button type="button" className="gk-sign-link" style={{ fontSize: 13 }} onClick={() => navigate("/login")}>로그인하기</button>}
              </p>
            )}
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
              <div key={t.key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14, color: C.sub }}>
                  <input id={`signup-agree-${t.key}`} type="checkbox" className="gk-sign-check" checked={agree[t.key]} onChange={(e) => setAgree((a) => ({ ...a, [t.key]: e.target.checked }))} />
                  {t.label}
                </label>
                <button type="button" className="gk-sign-view" onClick={() => setViewing(t)} aria-label={`${t.title} 보기`}>
                  보기
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
                </button>
              </div>
            ))}
          </div>

          <button type="submit" className="gk-sign-btn" disabled={!requiredAgreed}>가입하고 시작하기</button>

          <p style={{ margin: 0, textAlign: "center", fontSize: 15, color: C.muted }}>
            이미 계정이 있나요?{" "}
            <button type="button" className="gk-sign-link" onClick={() => navigate("/login")}>로그인</button>
          </p>
        </form>
        )}
      </section>

      {viewing && (
        <TermsModal term={viewing} onClose={() => setViewing(null)}
          onAgree={() => { setAgree((a) => ({ ...a, [viewing.key]: true })); setViewing(null); }} />
      )}
    </div>
  );
}

/** 가입 완료 화면 */
function Complete({ name, onHome, onAdd }) {
  return (
    <div className="gk-sign-rise" style={{ width: 440, maxWidth: "100%", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 22 }}>
      <span className="gk-sign-pop" style={{ width: 96, height: 96, borderRadius: "50%", background: C.yellow, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 16px 40px rgba(255,212,59,.45)" }}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={C.text} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: "-1px" }}>가입을 마쳤어요!</h2>
        <p style={{ margin: 0, fontSize: 17, color: C.sub, lineHeight: 1.6 }}>
          <b style={{ color: C.text }}>{name}님</b>, 고정콕에 오신 걸 환영해요.<br />매달 나가는 돈을 하나씩 등록해 볼까요?
        </p>
      </div>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10, background: "#FFFFFF", border: `1.5px solid ${C.line}`, borderRadius: 20, padding: "18px 20px", textAlign: "left", boxSizing: "border-box" }}>
        {[
          ["1", "월세·통신비·구독료를 등록해요"],
          ["2", "결제일 캘린더에서 날짜를 확인해요"],
          ["3", "결제일 전에 알림을 받아요"],
        ].map(([n, t]) => (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 15 }}>
            <span style={{ width: 26, height: 26, borderRadius: 8, background: C.skySoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 }}>{n}</span>
            {t}
          </div>
        ))}
      </div>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
        <button type="button" className="gk-sign-btn" onClick={onAdd}>첫 고정지출 등록하기</button>
        <button type="button" className="gk-sign-btn" style={{ background: "#F1F4F7" }} onClick={onHome}>홈으로 가기</button>
      </div>
    </div>
  );
}

/** 약관 보기 창 */
function TermsModal({ term, onClose, onAgree }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="gk-term" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="gk-term__box" role="dialog" aria-modal="true" aria-labelledby="gk-term-title">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, padding: "26px 28px 18px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ alignSelf: "flex-start", fontSize: 12, fontWeight: 700, padding: "3px 9px", borderRadius: 999, background: term.required ? C.skySoft : "#F1F4F7", color: C.text }}>{term.required ? "필수" : "선택"}</span>
            <h3 id="gk-term-title" style={{ margin: 0, fontSize: 21, fontWeight: 800, letterSpacing: "-0.6px" }}>{term.title}</h3>
          </div>
          <button type="button" className="gk-sign-eye" style={{ position: "static", transform: "none" }} aria-label="닫기" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>
        <div className="gk-term__body">
          {term.body.map(([h, p]) => (
            <section key={h}>
              <h4>{h}</h4>
              <p>{p}</p>
            </section>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, padding: "18px 28px 24px", borderTop: `1px solid ${C.line}` }}>
          <button type="button" className="gk-sign-btn" style={{ flex: "0 0 120px", height: 52, background: "#F3F5F7" }} onClick={onClose}>닫기</button>
          <button type="button" className="gk-sign-btn" style={{ flex: 1, height: 52 }} onClick={onAgree}>동의하기</button>
        </div>
      </div>
    </div>
  );
}