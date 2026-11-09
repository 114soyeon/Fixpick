import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ADD_CATEGORIES, AMOUNT_TYPES, CYCLE_OPTIONS, MONTH_OPTIONS, NAME_HINTS, UNIT_OPTIONS, WEEKDAY_OPTIONS } from "../../constants/addItem";
import { todayKey } from "../../utils/date";
import { ruleOf } from "../../utils/items";
import DatePicker from "./DatePicker";
import MiniSelect from "./MiniSelect";
import PayPicker from "./PayPicker";

/** 고정지출 항목 추가 창 */
export default function AddItemModal({ onClose, onSubmit, payMethods = [] }) {
  const [closing, setClosing] = useState(false);
  const [form, setForm] = useState({ category: "sub", name: "", amount: "", amountType: "fixed", day: "", cycle: "매달", month: new Date().getMonth() + 1, weekday: new Date().getDay(), every: "2", unit: "month", payMethod: "", endDate: "", remind: true });
  const nameRef = useRef(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const close = () => { setClosing(true); setTimeout(onClose, 180); };
  const amountNum = Number(form.amount.replace(/[^0-9]/g, ""));
  const dayNum = Number(form.day);
  const everyNum = Number(form.every);
  const { unit } = ruleOf(form); // 매일=day, 매주=week, 매달=month, 매년=year, 사용자화=고른 단위
  const custom = form.cycle === "사용자화";
  const needDay = unit === "month" || unit === "year";
  const valid = form.name.trim() && amountNum > 0 && (!needDay || (dayNum >= 1 && dayNum <= 31)) && (!custom || (everyNum >= 1 && everyNum <= 99));
  const variable = form.amountType === "variable";

  useEffect(() => {
    nameRef.current?.focus();
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;
    onSubmit({
      ...form,
      name: form.name.trim(), payMethod: form.payMethod.trim(), amount: amountNum,
      day: needDay ? dayNum : undefined, month: Number(form.month), weekday: Number(form.weekday),
      every: custom ? everyNum : undefined, unit: custom ? unit : undefined, // 사용자화일 때만 저장
      start: todayKey(),
    });
    close();
  };

  return createPortal(
    <div className={`gk-add-modal ${closing ? "is-closing" : ""}`} onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <form className="gk-add-modal__box" role="dialog" aria-modal="true" aria-labelledby="gk-add-title" onSubmit={submit}>
        <div className="gk-add-modal__head">
          <div>
            <h2 id="gk-add-title" className="gk-add-modal__title">항목 추가</h2>
            <p className="gk-add-modal__desc">매달 나가는 돈을 등록하면 결제일에 맞춰 알려드려요.</p>
          </div>
          <button type="button" className="gk-noti__close" aria-label="닫기" onClick={close}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>

        <fieldset className="gk-add-cats">
          <legend className="gk-field-label gk-add-cats__legend">카테고리</legend>
          <div className="gk-add-cats__list">
            {ADD_CATEGORIES.map((c) => (
              <button key={c.key} type="button" className={`gk-chip is-${c.key}`} aria-pressed={form.category === c.key} onClick={() => set("category", c.key)}>
                <span className="gk-chip__dot" />
                {c.name}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="gk-field">
          <span className="gk-field-label">항목 이름</span>
          <input id="gk-add-name" ref={nameRef} className="gk-input" placeholder={`예) ${NAME_HINTS[form.category] || "넷플릭스, 월세, 휴대폰 요금"}`} value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={30} />
        </label>

        {/* 금액 (한 줄 전체) */}
        <div className="gk-field">
          <div className="gk-field__head">
            <label htmlFor="gk-add-amount" className="gk-field-label">{variable ? "예상 금액" : "금액"}</label>
            <div className="gk-amt-seg" role="group" aria-label="금액 종류">
              {AMOUNT_TYPES.map(([v, t]) => (
                <button key={v} type="button" aria-pressed={form.amountType === v} onClick={() => set("amountType", v)}>{t}</button>
              ))}
            </div>
          </div>
          <div className="gk-unit-wrap">
            <input id="gk-add-amount" className="gk-input gk-input--amount" inputMode="numeric" placeholder={variable ? "예상 금액" : "0"}
              value={amountNum ? amountNum.toLocaleString("ko-KR") : ""} onChange={(e) => set("amount", e.target.value)} />
            <span className="gk-unit">원</span>
          </div>
          <p className={`gk-amt-hint ${variable ? "is-variable" : ""}`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
            매달 금액이 달라지면 예상 금액으로 넣고, 결제 후에 실제 금액으로 고칠 수 있어요
          </p>
        </div>

        {/* 결제일 + 만기일 (한 줄) */}
        <div className="gk-add-dates">
          {/* 매년·사용자화는 칸이 많아서 결제일이 한 줄을 다 써요 (만기일은 아래 줄로) */}
          <div className={`gk-field gk-field--shrink ${unit === "year" || custom ? "gk-field--wide" : ""}`}>
            <label htmlFor="gk-add-cycle" className="gk-field-label">결제일</label>
            <div className="gk-add-day-row">
              <MiniSelect id="gk-add-cycle" label="결제 주기" value={form.cycle} options={CYCLE_OPTIONS} onChange={(v) => set("cycle", v)} className="gk-mini--cycle" />
              {/* 사용자화: [2] [주] 마다 [수요일] 처럼 */}
              {custom && (
                <>
                  <input id="gk-add-every" className="gk-input gk-input--every" inputMode="numeric" aria-label="반복 간격" placeholder="2"
                    value={form.every} onChange={(e) => set("every", e.target.value.replace(/[^0-9]/g, "").slice(0, 2))} />
                  <MiniSelect id="gk-add-unit" label="반복 단위" value={form.unit} options={UNIT_OPTIONS} onChange={(v) => set("unit", v)} className="gk-mini--unit" />
                  <span className="gk-add-day-note">마다</span>
                </>
              )}
              {form.cycle === "매일" && <span className="gk-add-day-note">매일 나가요</span>}
              {unit === "week" && (
                <MiniSelect id="gk-add-weekday" label="결제 요일" value={Number(form.weekday)} options={WEEKDAY_OPTIONS} onChange={(v) => set("weekday", v)} className="gk-mini--weekday" />
              )}
              {unit === "year" && (
                <MiniSelect id="gk-add-month" label="결제 월" value={Number(form.month)} options={MONTH_OPTIONS} onChange={(v) => set("month", v)} className="gk-mini--month" grid />
              )}
              {needDay && (
                <div className="gk-unit-wrap gk-unit-wrap--day">
                  <input id="gk-add-day" className="gk-input gk-input--day" inputMode="numeric" placeholder="10" aria-label="결제일"
                    value={form.day} onChange={(e) => set("day", e.target.value.replace(/[^0-9]/g, "").slice(0, 2))} />
                  <span className="gk-unit gk-unit--day">일</span>
                </div>
              )}
            </div>
          </div>
          <div className="gk-field gk-field--shrink">
            <label htmlFor="gk-add-end" className="gk-field-label">만기일 <span className="gk-field-label__opt">(선택)</span></label>
            <DatePicker value={form.endDate} onChange={(v) => set("endDate", v)} />
          </div>
        </div>

        <div className="gk-field">
          <label htmlFor="gk-add-pay" className="gk-field-label">결제 수단 <span className="gk-field-label__opt">(선택)</span></label>
          <PayPicker value={form.payMethod} onChange={(v) => set("payMethod", v)} recent={payMethods} />
        </div>

        <label className="gk-toggle-row">
          <span className="gk-toggle-row__text">
            <span className="gk-field-label">결제 알림 받기</span>
            <span className="gk-toggle-row__desc">사이드바 알림으로 미리 알려드려요</span>
          </span>
          <input id="gk-add-remind" type="checkbox" checked={form.remind} onChange={(e) => set("remind", e.target.checked)} className="gk-switch" />
        </label>

        <div className="gk-add-modal__actions">
          <button type="button" className="gk-btn gk-btn--ghost" onClick={close}>취소</button>
          <button type="submit" className="gk-btn gk-btn--primary" disabled={!valid}>추가하기</button>
        </div>
      </form>
    </div>,
    document.body
  );
}
