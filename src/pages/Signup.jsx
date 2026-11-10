import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronRight, Eye, EyeOff, X } from "lucide-react";
import { LogoMark, Wordmark } from "../components/Sidebar";
import { emailExists, signup } from "../utils/auth";
import "../styles/signup.css"; // 이 페이지 스타일은 전부 여기 (class는 gk-sign- 로 시작)

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
const DEMO_CODE = "123456"; // 포트폴리오용 테스트 인증번호 (실제로는 이메일로 보내야 해요)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", email: "", pw: "", pw2: "" });
  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState({ service: false, privacy: false, marketing: false });
  const [errors, setErrors] = useState({});
  const [viewing, setViewing] = useState(null); // 보고 있는 약관
  const [verify, setVerify] = useState({ sent: false, code: "", ok: false, left: 0 }); // 이메일 인증
  const [done, setDone] = useState(null); // 가입 완료한 사람 이름

  // 인증번호 남은 시간 (3분)
  useEffect(() => {
    if (!verify.sent || verify.ok || verify.left <= 0) return;
    const t = setTimeout(() => setVerify((v) => ({ ...v, left: v.left - 1 })), 1000);
    return () => clearTimeout(t);
  }, [verify]);

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })); };

  // ── 이메일 인증 ──
  const emailValid = EMAIL_RE.test(form.email);
  const sendCode = () => {
    if (!emailValid) return setErrors((e) => ({ ...e, email: "이메일 주소를 다시 확인해 주세요." }));
    if (emailExists(form.email)) return setErrors((e) => ({ ...e, email: "이미 가입된 이메일이에요." }));
    setErrors((e) => ({ ...e, email: "", code: "" }));
    setVerify({ sent: true, code: "", ok: false, left: 180 });
  };
  const checkCode = () => {
    if (verify.left <= 0) return setErrors((e) => ({ ...e, code: "시간이 지났어요. 인증번호를 다시 받아 주세요." }));
    if (verify.code !== DEMO_CODE) return setErrors((e) => ({ ...e, code: "인증번호가 맞지 않아요." }));
    setErrors((e) => ({ ...e, code: "", email: "" }));
    setVerify((v) => ({ ...v, ok: true }));
  };
  const mmss = `${Math.floor(verify.left / 60)}:${String(verify.left % 60).padStart(2, "0")}`;

  // ── 약관 ──
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
    if (!/^01[016789]-\d{3,4}-\d{4}$/.test(form.phone)) next.phone = "휴대폰 번호를 다시 확인해 주세요.";
    if (!emailValid) next.email = "이메일 주소를 다시 확인해 주세요.";
    else if (emailExists(form.email)) next.email = "이미 가입된 이메일이에요.";
    else if (!verify.ok) next.email = "이메일 인증을 해 주세요.";
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
        <button type="button" className="gk-sign-logo" onClick={() => navigate("/")} aria-label="고정콕 홈으로 가기">
          <LogoMark size={44} />
          <Wordmark height={32} />
        </button>

        <div className="gk-sign-brand__body">
          <div className="gk-sign-rise gk-sign-intro">
            <h1 className="gk-sign-intro__title">가입하고 3단계면<br />고정지출 관리 끝!</h1>
            <p className="gk-sign-intro__desc">매달 빠져나가는 돈을 한눈에 보고,<br />결제일 전에 미리 알림을 받아 보세요.</p>
          </div>

          <ol className="gk-sign-steps">
            {STEPS.map((s) => (
              <li key={s.n} className="gk-sign-rise gk-sign-step">
                <span className="gk-sign-step__num">{s.n}</span>
                <span className="gk-sign-step__text">
                  <b>{s.title}</b>
                  <span>{s.desc}</span>
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
          <Complete name={done} onHome={() => navigate("/")} onAdd={() => navigate("/fix", { state: { openAdd: true } })} />
        ) : (
        <form onSubmit={submit} noValidate className="gk-sign-rise gk-sign-form">
          {/* 작은 화면에서만 보이는 로고 */}
          <button type="button" className="gk-sign-logo gk-sign-mobile-logo" onClick={() => navigate("/")} aria-label="고정콕 홈으로 가기">
            <LogoMark size={36} />
            <Wordmark height={26} />
          </button>
          <div className="gk-sign-head">
            <h2 className="gk-sign-head__title">회원가입</h2>
            <p className="gk-sign-head__desc">이름은 대시보드와 프로필에 표시돼요.</p>
          </div>

          {/* 이름 */}
          <label className="gk-sign-field">
            <span className="gk-sign-label">이름</span>
            <input id="signup-name" autoComplete="name" maxLength={12} className={`gk-sign-input ${errors.name ? "is-error" : ""}`} placeholder="예) 김민지" value={form.name} onChange={(e) => set("name", e.target.value)} />
            {errors.name && <p role="alert" className="gk-sign-error">{errors.name}</p>}
          </label>

          {/* 휴대폰 번호 (인증 없이 입력만 — 아이디 찾기에 써요) */}
          <label className="gk-sign-field">
            <span className="gk-sign-label">휴대폰 번호</span>
            <input id="signup-phone" type="tel" inputMode="numeric" autoComplete="tel" className={`gk-sign-input ${errors.phone ? "is-error" : ""}`} placeholder="010-1234-5678" value={form.phone}
              onChange={(e) => set("phone", formatPhone(e.target.value))} />
            {errors.phone && <p role="alert" className="gk-sign-error">{errors.phone}</p>}
          </label>

          {/* 이메일 + 인증번호 */}
          <div className="gk-sign-field">
            <label htmlFor="signup-email" className="gk-sign-label">이메일</label>
            <div className="gk-sign-row">
              <input id="signup-email" type="email" autoComplete="email" disabled={verify.ok} className={`gk-sign-input ${errors.email ? "is-error" : ""}`} placeholder="example@email.com" value={form.email}
                onChange={(e) => { set("email", e.target.value); setVerify({ sent: false, code: "", ok: false, left: 0 }); }} />
              {verify.ok ? (
                <span className="gk-sign-verified"><Check size={16} strokeWidth={3} />인증 완료</span>
              ) : (
                <button type="button" className={`gk-sign-mini ${verify.sent ? "gk-sign-mini--light" : ""}`} disabled={!emailValid} onClick={sendCode}>
                  {verify.sent ? "다시 받기" : "인증번호 받기"}
                </button>
              )}
            </div>
            {verify.sent && !verify.ok && (
              <div className="gk-sign-rise gk-sign-row">
                <div className="gk-sign-code">
                  <input id="signup-code" inputMode="numeric" autoComplete="one-time-code" className={`gk-sign-input gk-sign-code__input ${errors.code ? "is-error" : ""}`} placeholder="인증번호 6자리" value={verify.code}
                    onChange={(e) => { setVerify((v) => ({ ...v, code: e.target.value.replace(/[^0-9]/g, "").slice(0, 6) })); setErrors((er) => ({ ...er, code: "" })); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); checkCode(); } }} />
                  <span className={`gk-sign-code__timer ${verify.left > 30 ? "" : "is-low"}`}>{mmss}</span>
                </div>
                <button type="button" className="gk-sign-mini" disabled={verify.code.length !== 6} onClick={checkCode}>확인</button>
              </div>
            )}
            {verify.sent && !verify.ok && !errors.code && (
              <p className="gk-sign-hint">메일로 받은 6자리를 입력해 주세요. (테스트용 인증번호: {DEMO_CODE})</p>
            )}
            {errors.code && <p role="alert" className="gk-sign-error">{errors.code}</p>}
            {errors.email && (
              <p role="alert" className="gk-sign-error">
                {errors.email}{" "}
                {errors.email.includes("이미") && <button type="button" className="gk-sign-link gk-sign-link--small" onClick={() => navigate("/login")}>로그인하기</button>}
              </p>
            )}
          </div>

          {/* 비밀번호 */}
          <label className="gk-sign-field">
            <span className="gk-sign-label">비밀번호</span>
            <span className="gk-sign-pw">
              <input id="signup-pw" type={showPw ? "text" : "password"} autoComplete="new-password" className={`gk-sign-input gk-sign-input--pw ${errors.pw ? "is-error" : ""}`} placeholder="8자 이상, 영문·숫자 섞어서" value={form.pw} onChange={(e) => set("pw", e.target.value)} />
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

          {/* 비밀번호 확인 */}
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
              <b>전체 동의하기</b>
            </label>
            {TERMS.map((t) => (
              <div key={t.key} className="gk-sign-terms__row">
                <label className="gk-sign-terms__item">
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

/** 가입 완료 화면 */
function Complete({ name, onHome, onAdd }) {
  return (
    <div className="gk-sign-rise gk-sign-done">
      <span className="gk-sign-pop gk-sign-done__badge"><Check size={44} strokeWidth={2.6} /></span>
      <div className="gk-sign-done__text">
        <h2 className="gk-sign-head__title">가입을 마쳤어요!</h2>
        <p className="gk-sign-done__desc">
          <b>{name}님</b>, 고정콕에 오신 걸 환영해요.<br />매달 나가는 돈을 하나씩 등록해 볼까요?
        </p>
      </div>
      <div className="gk-sign-done__list">
        {[
          ["1", "월세·통신비·구독료를 등록해요"],
          ["2", "결제일 캘린더에서 날짜를 확인해요"],
          ["3", "결제일 전에 알림을 받아요"],
        ].map(([n, t]) => (
          <div key={n} className="gk-sign-done__item">
            <span className="gk-sign-done__num">{n}</span>
            {t}
          </div>
        ))}
      </div>
      <div className="gk-sign-done__btns">
        <button type="button" className="gk-sign-btn" onClick={onAdd}>첫 고정지출 등록하기</button>
        <button type="button" className="gk-sign-btn gk-sign-btn--light" onClick={onHome}>홈으로 가기</button>
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
        <div className="gk-term__head">
          <div className="gk-term__titles">
            <span className={`gk-term__tag ${term.required ? "is-required" : ""}`}>{term.required ? "필수" : "선택"}</span>
            <h3 id="gk-term-title" className="gk-term__title">{term.title}</h3>
          </div>
          <button type="button" className="gk-sign-eye gk-term__close" aria-label="닫기" onClick={onClose}>
            <X size={18} strokeWidth={2.2} />
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
        <div className="gk-term__foot">
          <button type="button" className="gk-sign-btn gk-sign-btn--light gk-term__btn-close" onClick={onClose}>닫기</button>
          <button type="button" className="gk-sign-btn gk-term__btn-agree" onClick={onAgree}>동의하기</button>
        </div>
      </div>
    </div>
  );
}
