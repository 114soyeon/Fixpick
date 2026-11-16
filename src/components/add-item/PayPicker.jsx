import { useEffect, useRef, useState } from "react";
import CardIcon from "@/components/add-item/CardIcon";
import { useSetting } from "@/hooks/useSetting";

/**
 * 결제 수단 고르기 (화살표를 누르면 카드 목록)
 * - recent: 내 고정지출에 썼던 결제 수단 이름들
 * - onRegister: 목록이 비었을 때 "설정에서 등록하기" 버튼 (설정 페이지로 이동)
 */
export default function PayPicker({ value, onChange, recent = [], onRegister }) {
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false); // 아래 공간이 모자라면 위로 펼쳐요
  const boxRef = useRef(null);
  const inputRef = useRef(null);
  const { methods } = useSetting(); // 설정 페이지에서 등록한 결제 수단

  // 설정에서 등록한 결제 수단 + 고정지출에 썼던 결제 수단 (중복 제거)
  const list = [...new Set([...methods.map((m) => m.name), ...recent])];

  const show = () => {
    const r = boxRef.current?.getBoundingClientRect();
    setUp(r ? window.innerHeight - r.bottom < 310 && r.top > 310 : false);
    setOpen(true);
  };
  const choose = (m) => { onChange(m); setOpen(false); };

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (!boxRef.current?.contains(e.target)) setOpen(false); };
    // 목록이 열려 있으면 ESC는 목록만 닫아요 (항목 추가 창은 그대로)
    const onKey = (e) => { if (e.key === "Escape") { e.stopPropagation(); setOpen(false); } };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey, true);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey, true); };
  }, [open]);

  return (
    <div ref={boxRef} className="gk-pick">
      <input id="gk-add-pay" ref={inputRef} className={`gk-input gk-pay-input ${value ? "is-filled" : ""}`} readOnly placeholder={list.length ? "등록한 결제 수단에서 선택" : "등록한 결제 수단이 없어요"}
        role="combobox" aria-expanded={open} aria-controls="gk-pay-list" aria-haspopup="listbox"
        value={value} onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") { e.preventDefault(); show(); } }} />
      {value && (
        <button type="button" className="gk-pay-clear" aria-label="결제 수단 지우기" onClick={() => { onChange(""); inputRef.current?.focus(); }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
      )}
      <button type="button" className="gk-pay-arrow" aria-label={open ? "결제 수단 목록 닫기" : "결제 수단 목록 열기"} aria-expanded={open}
        onMouseDown={(e) => e.preventDefault()} onClick={() => (open ? setOpen(false) : (inputRef.current?.focus(), show()))}>
        <svg className="gk-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </button>

      {open && (
        <div id="gk-pay-list" className={`gk-pay-panel ${up ? "is-up" : ""}`} role="listbox">
          <div className="gk-pay-scroll">
            {list.length === 0 && (
              <div className="gk-pay-empty">
                <span className="gk-pay-empty__icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2.5" /><path d="M3 10h18M7 15h3" /></svg>
                </span>
                <span className="gk-pay-empty__title">아직 등록한 결제 수단이 없어요</span>
                <span className="gk-pay-empty__desc">카드·계좌는 '설정' 페이지에서 등록할 수 있어요</span>
                {onRegister && (
                  <button type="button" className="gk-pay-empty__go" onMouseDown={(e) => e.preventDefault()} onClick={onRegister}>
                    설정에서 등록하기
                  </button>
                )}
              </div>
            )}
            {list.map((m) => {
              const on = value === m;
              return (
                <button key={m} type="button" role="option" aria-selected={on} className="gk-pay-opt" onMouseDown={(e) => e.preventDefault()} onClick={() => choose(m)}>
                  <CardIcon name={m} />
                  <span className="gk-pay-opt__name">{m}</span>
                  {on && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5CB8F2" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
