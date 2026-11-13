import { useEffect, useState } from "react";
import { findEmail } from "@/utils/auth/auth";
import { formatPhone } from "@/utils/common/validate";
import { joinedText } from "@/utils/auth/login";

/** 아이디(이메일) 찾기 창 */
export default function FindIdModal({ onClose, onFound, onReset }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState({ field: "", message: "" });
  const [result, setResult] = useState(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const find = (e) => {
    e.preventDefault();
    if (!name.trim()) return setError({ field: "name", message: "이름을 입력해 주세요." });
    if (phone.replace(/[^0-9]/g, "").length < 10) return setError({ field: "phone", message: "휴대폰 번호를 다시 확인해 주세요." });
    const r = findEmail({ name, phone });
    if (!r.ok) return setError({ field: "all", message: r.message });
    setError({ field: "", message: "" });
    setResult(r.accounts);
  };

  return (
    <div className="gk-modal" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form className="gk-modal__box" role="dialog" aria-modal="true" aria-labelledby="gk-findid-title" onSubmit={find} noValidate>
        <div className="gk-login-modal-head">
          <div className="gk-login-modal-head__text">
            <h3 id="gk-findid-title" className="gk-login-modal-title">아이디 찾기</h3>
            <p className="gk-login-modal-desc">
              {result ? "입력한 정보로 가입된 이메일이에요." : "가입할 때 쓴 이름과 휴대폰 번호를 넣으면 가입한 이메일을 알려드려요."}
            </p>
          </div>
          <button type="button" className="gk-login-eye gk-login-eye--close" aria-label="닫기" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>

        {result ? (
          <div className="gk-login-found-list">
            {result.map((a) => (
              <div key={a.email} className="gk-login-found">
                <span className="gk-login-found__label">가입한 이메일</span>
                <b className="gk-login-found__email">{a.masked}</b>
                {a.joined && <span className="gk-login-found__joined">{joinedText(a.joined)}</span>}
              </div>
            ))}
          </div>
        ) : (
          <>
            <label className="gk-login-field">
              <span className="gk-login-label">이름</span>
              <input id="find-name" autoFocus className={`gk-login-input ${error.field === "name" || error.field === "all" ? "is-error" : ""}`} placeholder="홍길동" value={name}
                onChange={(e) => { setName(e.target.value); setError({ field: "", message: "" }); }} />
            </label>
            <label className="gk-login-field">
              <span className="gk-login-label">휴대폰 번호</span>
              <input id="find-phone" inputMode="numeric" className={`gk-login-input ${error.field === "phone" || error.field === "all" ? "is-error" : ""}`} placeholder="010-0000-0000" value={phone}
                onChange={(e) => { setPhone(formatPhone(e.target.value)); setError({ field: "", message: "" }); }} />
            </label>
            {error.message && <span role="alert" className="gk-login-error gk-login-error--tight">{error.message}</span>}
          </>
        )}

        <div className="gk-login-actions">
          {result ? (
            <>
              <button type="button" className="gk-login-btn gk-login-btn--ghost gk-login-btn--wide" onClick={() => onReset(result[0].email)}>비밀번호 찾기</button>
              <button type="button" className="gk-login-btn gk-login-btn--grow" onClick={() => onFound(result[0].email)}>로그인하기</button>
            </>
          ) : (
            <>
              <button type="button" className="gk-login-btn gk-login-btn--ghost" onClick={onClose}>취소</button>
              <button type="submit" className="gk-login-btn gk-login-btn--grow">아이디 찾기</button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
