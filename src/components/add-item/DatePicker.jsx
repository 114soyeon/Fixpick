import { useEffect, useRef, useState } from "react";
import { QUICK_END_DATES, WEEKDAYS } from "@/constants/addItem";
import { addYears, leftText, prettyDate, toKey, todayKey } from "@/utils/common/date";

/** 만기일 고르기 (작은 달력) */
export default function DatePicker({ value, onChange }) {
  const now = new Date();
  const start = value ? value.split("-").map(Number) : [now.getFullYear(), now.getMonth() + 1];
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false);
  const [view, setView] = useState({ y: start[0], m: start[1] }); // 보고 있는 달
  const boxRef = useRef(null);
  const today = todayKey();

  const show = () => {
    const sel = value ? value.split("-").map(Number) : [now.getFullYear(), now.getMonth() + 1];
    setView({ y: sel[0], m: sel[1] });
    const r = boxRef.current?.getBoundingClientRect();
    setUp(r ? window.innerHeight - r.bottom < 400 && r.top > 400 : false);
    setOpen(true);
  };
  const move = (n) => setView(({ y, m }) => { const t = new Date(y, m - 1 + n, 1); return { y: t.getFullYear(), m: t.getMonth() + 1 }; });
  const pick = (key) => { onChange(key); setOpen(false); };

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (!boxRef.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") { e.stopPropagation(); setOpen(false); } };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey, true);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey, true); };
  }, [open]);

  const first = new Date(view.y, view.m - 1, 1).getDay();
  const days = new Date(view.y, view.m, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const isPastMonth = view.y < now.getFullYear() || (view.y === now.getFullYear() && view.m <= now.getMonth() + 1);

  return (
    <div ref={boxRef} className="gk-pick">
      <button id="gk-add-end" type="button" className={`gk-input gk-date-btn ${value ? "is-filled" : ""}`} aria-haspopup="dialog" aria-expanded={open}
        onClick={() => (open ? setOpen(false) : show())}>
        <svg className="gk-date-btn__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3.5" y="5" width="17" height="15.5" rx="3" /><path d="M3.5 10h17M8 3v4M16 3v4" />
        </svg>
        <span className="gk-date-btn__text">
          {value ? prettyDate(value) : "날짜 선택"}
        </span>
      </button>

      {open && (
        <div className={`gk-dp ${up ? "is-up" : ""}`} role="dialog" aria-label="만기일 선택">
          <div className="gk-dp__quick-row">
            {QUICK_END_DATES.map(([t, n]) => {
              const k = addYears(n);
              return <button key={t} type="button" className="gk-dp-quick" aria-pressed={value === k} onClick={() => pick(k)}>{t}</button>;
            })}
          </div>
          <div className="gk-dp__head">
            <button type="button" className="gk-dp-nav" aria-label="이전 달" disabled={isPastMonth} onClick={() => move(-1)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <b className="gk-dp__month">{view.y}년 {view.m}월</b>
            <button type="button" className="gk-dp-nav" aria-label="다음 달" onClick={() => move(1)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
            </button>
          </div>
          <div className="gk-dp__grid">
            {WEEKDAYS.map((w) => (
              <span key={w} className="gk-dp__week">{w}</span>
            ))}
            {cells.map((d, i) => {
              if (!d) return <span key={`e${i}`} />;
              const key = toKey(view.y, view.m, d);
              return (
                <button key={key} type="button" className={`gk-dp-day ${i % 7 === 0 ? "is-sun" : ""}`} disabled={key < today} aria-pressed={value === key} data-today={key === today || undefined}
                  onClick={() => pick(key)}>{d}</button>
              );
            })}
          </div>
          <div className="gk-dp__foot">
            <span className={`gk-dp__status ${value ? "is-set" : ""}`}>{value ? `${prettyDate(value)} · ${leftText(value)}` : "약정·계약이 끝나는 날을 골라 주세요"}</span>
            {value && <button type="button" className="gk-dp-clear" onClick={() => pick("")}>지우기</button>}
          </div>
        </div>
      )}
    </div>
  );
}
