import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogoMark, Wordmark } from "../components/Sidebar";
import { emailExists, signup } from "../utils/auth";
import { formatPhone, isValidEmail, isValidPhone, strengthOf } from "../utils/validate";
import { DEMO_CODE, STEPS, STRENGTH, TERMS } from "../constants/signup";
import EyeButton from "../components/signup/EyeButton";
import SignupComplete from "../components/signup/SignupComplete";
import TermsModal from "../components/signup/TermsModal";
import "../styles/signup.css";

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

  const phoneValid = isValidPhone(form.phone);
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
    if (!isValidEmail(form.email)) next.email = "이메일 주소를 다시 확인해 주세요.";
    else if (emailExists(form.email)) next.email = "이미 가입된 이메일이에요.";
    if (form.pw.length < 8) next.pw = "비밀번호는 8자 이상으로 만들어 주세요.";
    if (form.pw !== form.pw2) next.pw2 = "비밀번호가 서로 달라요.";
    setErrors(next);
    if (Object.keys(next).length || !requiredAgreed) return;
    const res = signup({ name: form.name, phone: form.phone, email: form.email, password: form.pw });
    if (!res.ok) return setErrors({ [res.field]: res.message });
    setDone(form.name.trim()); // 가입 완료 화면으로
  };

  return (
    <div className="gk-sign-page">
      {/* 왼쪽: 브랜드 + 가입 후 흐름 */}
      <section className="gk-sign-brand">
        <button type="button" className="gk-sign-home" onClick={() => navigate("/")} aria-label="고정콕 홈으로 가기">
          <LogoMark size={44} />
          <Wordmark height={32} />
        </button>

        <div className="gk-sign-brand__body">
          <div className="gk-sign-rise gk-sign-brand__intro">
            <h1 className="gk-sign-brand__title">
              가입하고 3단계면<br />고정지출 관리 끝!
            </h1>
            <p className="gk-sign-brand__desc">
              매달 빠져나가는 돈을 한눈에 보고,<br />결제일 전에 미리 알림을 받아 보세요.
            </p>
          </div>

          <ol className="gk-sign-steps">
            {STEPS.map((s) => (
              <li key={s.n} className="gk-sign-rise gk-sign-step">
                <span className="gk-sign-step__num">{s.n}</span>
                <span className="gk-sign-step__text">
                  <b className="gk-sign-step__title">{s.title}</b>
                  <span className="gk-sign-step__desc">{s.desc}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <p className="gk-sign-brand__foot">가입은 무료예요 · 언제든 탈퇴할 수 있어요</p>
      </section>

      {/* 오른쪽: 회원가입 폼 */}
      <section className="gk-sign-form-wrap">
        {done ? (
          <SignupComplete name={done} onHome={() => navigate("/")} onAdd={() => navigate("/fix", { state: { openAdd: true } })} />
        ) : (
        <form onSubmit={submit} noValidate className="gk-sign-rise gk-sign-form">
          {/* 작은 화면에서만 보이는 로고 */}
          <button type="button" className="gk-sign-mobile-logo" onClick={() => navigate("/")} aria-label="고정콕 홈으로 가기">
            <LogoMark size={36} />
            <Wordmark height={26} />
          </button>
          <div className="gk-sign-head">
            <h2 className="gk-sign-title">회원가입</h2>
            <p className="gk-sign-subtitle">이름은 대시보드와 프로필에 표시돼요.</p>
          </div>

          <label className="gk-sign-field">
            <span className="gk-sign-label">이름</span>
            <input id="signup-name" autoComplete="name" maxLength={12} className={`gk-sign-input ${errors.name ? "is-error" : ""}`} placeholder="이름" value={form.name} onChange={(e) => set("name", e.target.value)} />
            {errors.name && <p role="alert" className="gk-sign-error">{errors.name}</p>}
          </label>

          <div className="gk-sign-field">
            <label htmlFor="signup-phone" className="gk-sign-label">휴대폰 번호</label>
            <div className="gk-sign-row">
              <input id="signup-phone" type="tel" inputMode="numeric" autoComplete="tel" disabled={verify.ok} className={`gk-sign-input gk-sign-input--grow ${errors.phone ? "is-error" : ""}`} placeholder="010-1234-5678" value={form.phone}
                onChange={(e) => { set("phone", formatPhone(e.target.value)); setVerify({ sent: false, code: "", ok: false, left: 0 }); }} />
              {verify.ok ? (
                <span className="gk-sign-verified">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                  인증 완료
                </span>
              ) : (
                <button type="button" className={`gk-sign-mini ${verify.sent ? "gk-sign-mini--light" : ""}`} disabled={!phoneValid} onClick={sendCode}>{verify.sent ? "다시 받기" : "인증번호 받기"}</button>
              )}
            </div>
            {verify.sent && !verify.ok && (
              <div className="gk-sign-rise gk-sign-row">
                <div className="gk-sign-code">
                  <input id="signup-code" inputMode="numeric" autoComplete="one-time-code" className={`gk-sign-input gk-sign-input--code ${errors.code ? "is-error" : ""}`} placeholder="인증번호 6자리" value={verify.code}
                    onChange={(e) => { setVerify((v) => ({ ...v, code: e.target.value.replace(/[^0-9]/g, "").slice(0, 6) })); setErrors((er) => ({ ...er, code: "" })); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); checkCode(); } }} />
                  <span className={`gk-sign-timer ${verify.left > 30 ? "" : "is-urgent"}`}>{mmss}</span>
                </div>
                <button type="button" className="gk-sign-mini" disabled={verify.code.length !== 6} onClick={checkCode}>확인</button>
              </div>
            )}
            {verify.sent && !verify.ok && !errors.code && <p className="gk-sign-hint">문자로 받은 6자리를 입력해 주세요. (테스트용 인증번호: {DEMO_CODE})</p>}
            {errors.code && <p role="alert" className="gk-sign-error">{errors.code}</p>}
            {errors.phone && <p role="alert" className="gk-sign-error">{errors.phone}</p>}
          </div>

          <label className="gk-sign-field">
            <span className="gk-sign-label">이메일</span>
            <input id="signup-email" type="email" autoComplete="email" className={`gk-sign-input ${errors.email ? "is-error" : ""}`} placeholder="example@email.com" value={form.email} onChange={(e) => set("email", e.target.value)} onBlur={checkEmail} />
            {errors.email && (
              <p role="alert" className="gk-sign-error">
                {errors.email}{" "}
                {errors.email.includes("이미") && <button type="button" className="gk-sign-link gk-sign-link--sm" onClick={() => navigate("/login")}>로그인하기</button>}
              </p>
            )}
          </label>

          <label className="gk-sign-field">
            <span className="gk-sign-label">비밀번호</span>
            <span className="gk-sign-pw">
              <input id="signup-pw" type={showPw ? "text" : "password"} autoComplete="new-password" className={`gk-sign-input gk-sign-input--pw ${errors.pw ? "is-error" : ""}`} placeholder="8자 이상, 영문·숫자 섞어서" value={form.pw} onChange={(e) => set("pw", e.target.value)} />
              <EyeButton show={showPw} onClick={() => setShowPw((v) => !v)} />
            </span>
            {form.pw && (
              <span className={`gk-sign-strength is-level-${strength}`}>
                <span className="gk-sign-strength__bars">
                  {[1, 2, 3].map((n) => (
                    <span key={n} className={`gk-sign-strength__bar ${strength >= n ? "is-on" : ""}`} />
                  ))}
                </span>
                <span className="gk-sign-strength__label">{STRENGTH[strength]}</span>
              </span>
            )}
            {errors.pw && <p role="alert" className="gk-sign-error">{errors.pw}</p>}
          </label>

          <label className="gk-sign-field">
            <span className="gk-sign-label">비밀번호 확인</span>
            <input id="signup-pw2" type={showPw ? "text" : "password"} autoComplete="new-password" className={`gk-sign-input ${errors.pw2 ? "is-error" : ""}`} placeholder="비밀번호를 한 번 더 입력" value={form.pw2} onChange={(e) => set("pw2", e.target.value)} />
            {errors.pw2 ? (
              <p role="alert" className="gk-sign-error">{errors.pw2}</p>
            ) : form.pw2 && (
              <p className={`gk-sign-hint ${pwMatch ? "is-ok" : ""}`}>{pwMatch ? "비밀번호가 일치해요" : "비밀번호를 똑같이 입력해 주세요"}</p>
            )}
          </label>

          {/* 약관 동의 */}
          <div className="gk-sign-terms">
            <label className="gk-sign-terms__all">
              <input id="signup-agree-all" type="checkbox" className="gk-sign-check" checked={allAgreed} onChange={toggleAll} />
              <b className="gk-sign-terms__all-text">전체 동의하기</b>
            </label>
            {TERMS.map((t) => (
              <div key={t.key} className="gk-sign-terms__item">
                <label className="gk-sign-terms__label">
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

          <p className="gk-sign-foot">
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
