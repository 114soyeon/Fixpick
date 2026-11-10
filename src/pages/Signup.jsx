import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogoMark, Wordmark } from "../components/Sidebar";
import { emailExists, signup } from "../utils/auth";
import { formatPhone, isValidEmail, isValidPhone, strengthOf } from "../utils/validate";
import { DEMO_CODE, STEPS, STRENGTH, TERMS } from "../constants/signup";
import { Eye, EyeOff, ChevronRight, Check } from "lucide-react";
import SignupComplete from "../components/signup/SignupComplete";
import TermsModal from "../components/signup/TermsModal";
import "../styles/signup.css";

// 비밀번호 표시여부
function EyeButton({ show, onClick }) {
  return (
    <button type="button" className="gk-sign-eye" aria-label={show ? "비밀번호 숨기기" : "비밀번호 보기"} onClick={onClick}>
      {show ? <EyeOff size={16} strokeWidth={1.25} /> : <Eye size={16} strokeWidth={1.25} />}
    </button>
  );
}

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", phone: "", email: "", pw: "", pw2: "" }); // 회원가입 입력 데이터
  const [showPw, setShowPw] = useState(false); // 비밀번호 표시여부(기본 비밀번호 숨김 : false)
  const [agree, setAgree] = useState({ service: false, privacy: false, marketing: false }); // 약관 동의 상태(기본 모두 동의하지 않음 : false)
  const [errors, setErrors] = useState({}); // 에러 메시지
  const [viewing, setViewing] = useState(null); // 보고 있는 약관(약관 모달이 닫혀있음 : null)
  const [verify, setVerify] = useState({ sent: false, code: "", ok: false, left: 0 }); // 휴대폰 인증
  const [done, setDone] = useState(null); // 회원가입 완료 상태(아직 가입이 완료되지 않은경우 : null)
  const [busy, setBusy] = useState(false); // 가입 요청 중(가입 요청 하지 않는 상태 : false(가입 버튼을 여러번 누르는 것 방치))

  // 인증번호 타이머(3분)
  useEffect(() => {
    // 인증번호를 아직 발송하지 않음 || 이미 인증 성공 || 남은 시간이 없음 -> 하나라도 참인경우 실행 종료
    if (!verify.sent || verify.ok || verify.left <= 0) return; 

    const t = setTimeout(() => setVerify((v) => ({ ...v, left: v.left - 1 })), 1000);
    return () => clearTimeout(t);
  }, [verify]);

  const phoneValid = isValidPhone(form.phone); // 휴대폰 번호 유효성 검사
  
  // 인증번호 발송
  const sendCode = () => {
    if (!phoneValid) return setErrors((e) => ({ ...e, phone: "휴대폰 번호를 다시 확인해 주세요." }));
    setErrors((e) => ({ ...e, phone: "", code: "" }));
    setVerify({ sent: true, code: "", ok: false, left: 180 });
  };

  // 인증번호 확인
  const checkCode = () => {
    if (verify.left <= 0) return setErrors((e) => ({ ...e, code: "시간이 지났어요. 인증번호를 다시 받아 주세요." }));
    if (verify.code !== DEMO_CODE) return setErrors((e) => ({ ...e, code: "인증번호가 맞지 않아요." }));
    setErrors((e) => ({ ...e, code: "", phone: "" }));
    setVerify((v) => ({ ...v, ok: true }));
  };

  // 남은 시간 표시
  // 초 단위의 시간을 분:초 형식으로 변환
  const mmss = `${Math.floor(verify.left / 60)}:${String(verify.left % 60).padStart(2, "0")}`;

  // 이메일 중복 검사
  const checkEmail = async () => {
    if (!form.email) return;
    if (await emailExists(form.email)) setErrors((e) => ({ ...e, email: "이미 가입된 이메일이에요." }));
  };

  // 공통 입력값 변경
  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })); };

  // 약관 동의 상태
  const allAgreed = TERMS.every((t) => agree[t.key]);
  const requiredAgreed = TERMS.filter((t) => t.required).every((t) => agree[t.key]); // 필수 동의
  // 전체 동의 버튼
  const toggleAll = () => {
    const next = !allAgreed;
    setAgree({ service: next, privacy: next, marketing: next });
  };

  const strength = strengthOf(form.pw); // 비밀번호 강도
  const pwMatch = form.pw2 && form.pw === form.pw2; // 비밀번호가 일치하는지

  // 회원가입
  const submit = async (e) => {
    e.preventDefault();

    const next = {};
    if (!form.name.trim()) next.name = "이름을 입력해 주세요.";
    if (!phoneValid) next.phone = "휴대폰 번호를 다시 확인해 주세요.";
    else if (!verify.ok) next.phone = "휴대폰 인증을 해 주세요.";
    if (!isValidEmail(form.email)) next.email = "이메일 주소를 다시 확인해 주세요.";
    else if (await emailExists(form.email)) next.email = "이미 가입된 이메일이에요.";
    if (form.pw.length < 8) next.pw = "비밀번호는 8자 이상으로 만들어 주세요.";
    if (form.pw !== form.pw2) next.pw2 = "비밀번호가 서로 달라요.";
    setErrors(next);

    if (Object.keys(next).length || !requiredAgreed) return; // 오류가 하나라도 있거나, 필수동의를 하지 않은경우

    setBusy(true); // 회원가입이 진행중

    try {
      const res = await signup({ name: form.name, phone: form.phone, email: form.email, password: form.pw });
      if (!res.ok) return setErrors({ [res.field]: res.message });

      setDone(form.name.trim()); // 가입 완료 화면으로
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="gk-sign-page">
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

      <section className="gk-sign-form-wrap">
        {done ? (
          <SignupComplete name={done} onHome={() => navigate("/")} onAdd={() => navigate("/fix", { state: { openAdd: true } })} />
        ) : (
        <form onSubmit={submit} noValidate className="gk-sign-rise gk-sign-form">

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
            <input id="signup-name" autoComplete="name" maxLength={12} className={`gk-sign-input ${errors.name ? "is-error" : ""}`} placeholder="이름을 입력하세요" value={form.name} onChange={(e) => set("name", e.target.value)} />
            {errors.name && <p role="alert" className="gk-sign-error">{errors.name}</p>}
          </label>

          <div className="gk-sign-field">
            <label htmlFor="signup-phone" className="gk-sign-label">휴대폰 번호</label>
            <div className="gk-sign-row">
              <input id="signup-phone" type="tel" inputMode="numeric" autoComplete="tel" disabled={verify.ok} className={`gk-sign-input gk-sign-input--grow ${errors.phone ? "is-error" : ""}`} placeholder="휴대폰 번호를 입력하세요" value={form.phone}
                onChange={(e) => { set("phone", formatPhone(e.target.value)); setVerify({ sent: false, code: "", ok: false, left: 0 }); }} />
              {verify.ok ? (
                <span className="gk-sign-verified">
                  <Check size={16} color="#2E9D6B" strokeWidth={3} />
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
            <input id="signup-email" type="email" autoComplete="email" className={`gk-sign-input ${errors.email ? "is-error" : ""}`} placeholder="이메일을 입력하세요" value={form.email} onChange={(e) => set("email", e.target.value)} onBlur={checkEmail} />
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
              <input id="signup-pw" type={showPw ? "text" : "password"} autoComplete="new-password" className={`gk-sign-input gk-sign-input--pw ${errors.pw ? "is-error" : ""}`} placeholder="8자 이상, 영문·숫자 섞어서 입력하세요" value={form.pw} onChange={(e) => set("pw", e.target.value)} />
              <button type="button" className="gk-sign-eye" aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 보기"} onClick={() => setShowPw((v) => !v)}>
              {showPw ? <EyeOff size={20} strokeWidth={2} /> : <Eye size={20} strokeWidth={2} />}
              </button>
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
            <input id="signup-pw2" type={showPw ? "text" : "password"} autoComplete="new-password" className={`gk-sign-input ${errors.pw2 ? "is-error" : ""}`} placeholder="비밀번호를 한 번 더 입력하세요" value={form.pw2} onChange={(e) => set("pw2", e.target.value)} />
            {errors.pw2 ? (
              <p role="alert" className="gk-sign-error">{errors.pw2}</p>
            ) : form.pw2 && (
              <p className={`gk-sign-hint ${pwMatch ? "is-ok" : ""}`}>{pwMatch ? "비밀번호가 일치해요" : "비밀번호를 똑같이 입력해 주세요"}</p>
            )}
          </label>

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
                 <ChevronRight size={14} strokeWidth={2.4} />                
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
