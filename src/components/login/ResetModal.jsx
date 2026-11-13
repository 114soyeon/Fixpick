import { useEffect, useState } from "react";
import { emailExists } from "../../utils/auth/auth";
import { isValidEmail } from "../../utils/validate";

/** 비밀번호 찾기 창 */
export default function ResetModal({ initialEmail, onClose }) {
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
    if (!isValidEmail(email)) return setError("이메일 주소를 다시 확인해 주세요.");
    if (!emailExists(email)) return setError("가입되지 않은 이메일이에요.");
    setError("");
    setSent(true);
  };

  return (
    <div className="gk-modal" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form className="gk-modal__box" role="dialog" aria-modal="true" aria-labelledby="gk-reset-title" onSubmit={send} noValidate>
        <div className="gk-login-modal-head">
          <div className="gk-login-modal-head__text">
            <h3 id="gk-reset-title" className="gk-login-modal-title">{sent ? "메일을 보냈어요" : "비밀번호 찾기"}</h3>
            <p className="gk-login-modal-desc">
              {sent ? <><b className="gk-login-modal-desc__strong">{email}</b>로 비밀번호를 다시 만드는 링크를 보냈어요. 메일함을 확인해 주세요.</> : "가입할 때 쓴 이메일을 넣으면 비밀번호를 다시 만드는 링크를 보내드려요."}
            </p>
          </div>
          <button type="button" className="gk-login-eye gk-login-eye--close" aria-label="닫기" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>

        {sent ? (
          <div className="gk-login-mailnote">
            <span className="gk-login-mailnote__icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m3.5 6.5 8.5 6 8.5-6" /></svg>
            </span>
            메일이 안 보이면 스팸함도 확인해 주세요. 링크는 30분 동안 쓸 수 있어요.
          </div>
        ) : (
          <label className="gk-login-field">
            <span className="gk-login-label">이메일</span>
            <input id="reset-email" type="email" autoFocus className={`gk-login-input ${error ? "is-error" : ""}`} placeholder="example@email.com" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} />
            {error && <span role="alert" className="gk-login-error">{error}</span>}
          </label>
        )}

        <div className="gk-login-actions">
          {sent ? (
            <button type="button" className="gk-login-btn" onClick={onClose}>로그인하러 가기</button>
          ) : (
            <>
              <button type="button" className="gk-login-btn gk-login-btn--ghost" onClick={onClose}>취소</button>
              <button type="submit" className="gk-login-btn gk-login-btn--grow">재설정 링크 보내기</button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
