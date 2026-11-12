import { useEffect } from "react";
import { X } from "lucide-react";

/** 약관 보기 창 */
export default function TermsModal({ term, onClose, onAgree }) {
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
