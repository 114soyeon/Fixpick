import { useEffect, useRef, useState } from "react";

/**
 * 작은 선택 버튼 (결제 주기, 요일, 결제 월, 반복 단위)
 * 너비·목록 모양은 className으로 정해요 (sidebar.css의 .gk-mini--cycle, --weekday, --month, --unit)
 * grid: 목록을 바둑판으로 보여줄 때 true
 */
export default function MiniSelect({ id, value, options, onChange, label, className = "", grid = false }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (!boxRef.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") { e.stopPropagation(); setOpen(false); } };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey, true);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey, true); };
  }, [open]);
  const cur = options.find((o) => o.value === value) || options[0];
  return (
    <div ref={boxRef} className={`gk-mini ${className}`}>
      <button id={id} type="button" className="gk-input gk-mini-btn" aria-haspopup="listbox" aria-expanded={open} aria-label={label}
        onClick={() => setOpen((v) => !v)}>
        <span className="gk-mini-btn__label">{cur.label}</span>
        <svg className="gk-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      {open && (
        <div className={`gk-mini-list ${grid ? "is-grid" : ""}`} role="listbox" aria-label={label}>
          {options.map((o) => {
            const on = o.value === value;
            return (
              <button key={o.value} type="button" role="option" aria-selected={on} className={`gk-mini-opt ${grid ? "is-grid" : ""}`} onClick={() => { onChange(o.value); setOpen(false); }}>
                <span className="gk-mini-opt__text">
                  <b className="gk-mini-opt__label">{o.label}</b>
                  {o.sub && <span className="gk-mini-opt__sub">{o.sub}</span>}
                </span>
                {on && !grid && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5CB8F2" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
