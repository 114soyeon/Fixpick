import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { initialOf } from "../utils/auth";
import { addItem, useItems } from "../utils/items";

const COLORS = {
  text: "#0B2A45",
  muted: "#5B5F66",
  border: "#EEF0F2",
  activeBg: "#DCEFFD",
  accent: "#5CB8F2",
  yellow: "#FFE57A",
  badge: "#FFD43B",
  iconButtonBg: "#F3F5F7",
  iconButtonFg: "#4A4D52",
};

const FONT = "'Pretendard', 'Noto Sans KR', system-ui, -apple-system, sans-serif";

const svgProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

const Icons = {
  home: (
    <svg {...svgProps}>
      <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
    </svg>
  ),
  expenses: (
    <svg {...svgProps}>
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </svg>
  ),
  calendar: (
    <svg {...svgProps}>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M16 3v4M8 3v4M3 10h18M9 15.5l2 2 4-4" />
    </svg>
  ),
  report: (
    <svg {...svgProps}>
      <path d="M21 12c.55 0 1-.45.95-1A10 10 0 0 0 13 2.05c-.55-.05-1 .4-1 .95v8a1 1 0 0 0 1 1z" />
      <path d="M21.2 15.9A10 10 0 1 1 8 2.8" />
    </svg>
  ),
  settings: (
    <svg {...svgProps}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  plus: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  bell: (
    <svg {...svgProps}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0" />
    </svg>
  ),
};

/* 알림 예시 데이터 (설정 페이지의 알림 종류와 맞춰져 있어요) */
const THIS_MONTH = new Date().getMonth() + 1;
const NEXT_MONTH = (THIS_MONTH % 12) + 1;
const NOTIFICATIONS = [
  { id: 1, type: "pay", title: "넷플릭스 결제 예정", body: `${THIS_MONTH}월 10일에 14,500원이 국민카드로 결제돼요.`, time: "방금", unread: true, action: "캘린더 보기", to: "calendar" },
  { id: 2, type: "big", title: "큰 지출이 다가와요", body: `${THIS_MONTH}월 25일에 월세 486,400원이 빠져나가요.`, time: "1시간 전", unread: true, action: "캘린더 보기", to: "calendar" },
  { id: 3, type: "contract", title: "휴대폰 약정이 곧 끝나요", body: `${NEXT_MONTH}월 18일에 24개월 약정이 끝나요. 요금제를 확인해 보세요.`, time: "어제", unread: false, action: "내 고정지출", to: "expenses" },
  { id: 4, type: "budget", title: "예산의 90%를 넘었어요", body: `${THIS_MONTH}월 예산이 얼마 남지 않았어요. 리포트에서 확인해 보세요.`, time: "2일 전", unread: false, action: "리포트 보기", to: "report" },
  { id: 5, type: "done", title: "결제 완료", body: `${THIS_MONTH}월 1일에 관리비 182,400원이 결제됐어요.`, time: "4일 전", unread: false },
];

const NOTI_STYLE = {
  pay: { bg: "#DCEFFD", ink: "#2F7FC0", path: <><rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M16 3v4M8 3v4M3 10h18" /></> },
  big: { bg: "#FFECE3", ink: "#98583D", path: <><path d="M12 3v12M7 10l5 5 5-5" /><path d="M4 20h16" /></> },
  contract: { bg: "#FFF2D2", ink: "#8A6A12", path: <><rect x="4" y="3" width="16" height="18" rx="2.5" /><path d="M8 8h8M8 12h8M8 16h4" /></> },
  done: { bg: "#E2F7EE", ink: "#35765A", path: <><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.8 2.8L16.5 9.5" /></> },
  budget: { bg: "#EDEAFE", ink: "#7364C6", path: <><rect x="3" y="6" width="18" height="14" rx="3" /><path d="M3 10h18M16 15h2" /></> },
};

/** 알림 패널 */
function NotificationPanel({ items, onRead, onReadAll, onClose, onSettings, onGo }) {
  const unread = items.filter((n) => n.unread).length;
  return (
    <div className="gk-noti" role="dialog" aria-label="알림">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <b style={{ fontSize: 17 }}>알림</b>
          {unread > 0 && <span style={{ fontSize: 12, fontWeight: 700, background: COLORS.badge, borderRadius: 999, padding: "2px 8px" }}>새 알림 {unread}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button type="button" className="gk-noti__link" onClick={onReadAll} disabled={unread === 0}>모두 읽음</button>
          <button type="button" className="gk-noti__close" aria-label="알림 닫기" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>
      </div>

      <ul style={{ listStyle: "none", margin: 0, padding: "0 8px 8px", display: "flex", flexDirection: "column", gap: 2, maxHeight: 440, overflowY: "auto" }}>
        {items.map((n, i) => {
          const st = NOTI_STYLE[n.type];
          return (
            <li key={n.id} className="gk-noti__item" style={{ "--i": i }}>
              <button type="button" className="gk-noti__row" onClick={() => { onRead(n.id); if (n.to) onGo(n.to); }} style={{ background: n.unread ? "#F3F9FE" : "transparent" }}>
                <span style={{ width: 38, height: 38, borderRadius: 12, background: st.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={st.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{st.path}</svg>
                </span>
                <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3, textAlign: "left" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <b style={{ fontSize: 14.5, fontWeight: n.unread ? 700 : 600 }}>{n.title}</b>
                    {n.unread && <span aria-label="안 읽음" style={{ width: 7, height: 7, borderRadius: "50%", background: COLORS.accent, flexShrink: 0 }} />}
                  </span>
                  <span style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.45 }}>{n.body}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                    <span style={{ fontSize: 12, color: "#8A9098" }}>{n.time}</span>
                    {n.action && <span style={{ fontSize: 12, fontWeight: 700, color: st.ink }}>{n.action} →</span>}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div style={{ borderTop: `1px solid ${COLORS.border}`, padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button type="button" className="gk-noti__link" onClick={onSettings}>알림 설정</button>
        <span style={{ fontSize: 12, color: "#8A9098", paddingRight: 8 }}>최근 7일 알림</span>
      </div>
    </div>
  );
}


/* ───────── 항목 추가 창 ───────── */
const ADD_CATEGORIES = [
  { key: "home", name: "주거", color: "#4C8DF6", tint: "#DFEAFD" },
  { key: "phone", name: "통신", color: "#36C2CE", tint: "#DBF4F6" },
  { key: "sub", name: "구독 서비스", color: "#FF7EB3", tint: "#FFE8F1" },
  { key: "rental", name: "가전", color: "#5ED3A0", tint: "#E2F7EE" },
  { key: "insure", name: "보험", color: "#9B8AFB", tint: "#EDEAFE" },
  { key: "saving", name: "금융/저축", color: "#FFC94D", tint: "#FFF2D2" },
  { key: "transit", name: "교통", color: "#FF9466", tint: "#FFECE3" },
  { key: "car", name: "자동차", color: "#C4A27F", tint: "#F4EDE4" },
  { key: "etc", name: "기타", color: "#A3ABB5", tint: "#EEF1F4" },
];
const CYCLES = ["매달", "매년"];

function AddItemModal({ onClose, onSubmit, payMethods = [] }) {
  const [closing, setClosing] = useState(false);
  const [form, setForm] = useState({ category: "sub", name: "", amount: "", amountType: "fixed", day: "", cycle: "매달", month: new Date().getMonth() + 1, payMethod: "", remind: true });
  const nameRef = useRef(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const close = () => { setClosing(true); setTimeout(onClose, 180); };
  const amountNum = Number(form.amount.replace(/[^0-9]/g, ""));
  const dayNum = Number(form.day);
  const valid = form.name.trim() && amountNum > 0 && dayNum >= 1 && dayNum <= 31;

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
    onSubmit({ ...form, name: form.name.trim(), payMethod: form.payMethod.trim(), amount: amountNum, day: dayNum, month: Number(form.month) });
    close();
  };

  const label = { fontSize: 14, fontWeight: 600, color: COLORS.text };
  const input = { height: 48, borderRadius: 14, border: `1.5px solid ${COLORS.border}`, background: "#F7F9FA", padding: "0 16px", fontSize: 16, fontFamily: "inherit", color: COLORS.text, outline: "none", width: "100%", boxSizing: "border-box" };

  return createPortal(
    <div className={`gk-modal ${closing ? "is-closing" : ""}`} onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <form className="gk-modal__box" role="dialog" aria-modal="true" aria-labelledby="gk-add-title" onSubmit={submit} style={{ fontFamily: FONT }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h2 id="gk-add-title" style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: "-0.6px" }}>고정지출 항목 추가</h2>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: COLORS.muted }}>매달 나가는 돈을 등록하면 결제일에 맞춰 알려드려요.</p>
          </div>
          <button type="button" className="gk-noti__close" aria-label="닫기" onClick={close}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>

        <fieldset style={{ border: 0, margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          <legend style={{ ...label, padding: 0, marginBottom: 10 }}>카테고리</legend>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {ADD_CATEGORIES.map((c) => {
              const on = form.category === c.key;
              return (
                <button key={c.key} type="button" className="gk-chip" aria-pressed={on} onClick={() => set("category", c.key)}
                  style={{ background: on ? c.tint : "#FFFFFF", boxShadow: on ? `inset 0 0 0 2px ${c.color}` : `inset 0 0 0 1.5px ${COLORS.border}`, fontWeight: on ? 700 : 500 }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: c.color }} />
                  {c.name}
                </button>
              );
            })}
          </div>
        </fieldset>

        <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={label}>항목 이름</span>
          <input id="gk-add-name" ref={nameRef} className="gk-input" style={input} placeholder="예) 넷플릭스, 월세, 휴대폰 요금" value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={30} />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 28 }}>
              <label htmlFor="gk-add-amount" style={label}>{form.amountType === "variable" ? "예상 금액" : "금액"}</label>
              <div className="gk-amt-seg" role="group" aria-label="금액 종류">
                {[["fixed", "고정"], ["variable", "변동"]].map(([v, t]) => (
                  <button key={v} type="button" aria-pressed={form.amountType === v} onClick={() => set("amountType", v)}>{t}</button>
                ))}
              </div>
            </div>
            <div style={{ position: "relative" }}>
              <input id="gk-add-amount" className="gk-input" inputMode="numeric" style={{ ...input, paddingRight: 44, textAlign: "right", fontWeight: 700 }} placeholder={form.amountType === "variable" ? "예상 금액" : "0"}
                value={amountNum ? amountNum.toLocaleString("ko-KR") : ""} onChange={(e) => set("amount", e.target.value)} />
              <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: COLORS.muted }}>원</span>
            </div>
          </div>
          <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ ...label, minHeight: 28, display: "flex", alignItems: "center" }}>결제일</span>
            <div style={{ display: "flex", gap: 8 }}>
              <select id="gk-add-cycle" className="gk-input" style={{ ...input, width: 78, padding: "0 8px", flexShrink: 0 }} value={form.cycle} onChange={(e) => set("cycle", e.target.value)}>
                {CYCLES.map((c) => <option key={c}>{c}</option>)}
              </select>
              {form.cycle === "매년" && (
                <select id="gk-add-month" className="gk-input" aria-label="결제 월" style={{ ...input, width: 70, padding: "0 6px", flexShrink: 0 }} value={form.month} onChange={(e) => set("month", e.target.value)}>
                  {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}월</option>)}
                </select>
              )}
              <div style={{ position: "relative", flex: 1 }}>
                <input id="gk-add-day" className="gk-input" inputMode="numeric" style={{ ...input, paddingRight: 34, textAlign: "right", fontWeight: 700 }} placeholder="10"
                  value={form.day} onChange={(e) => set("day", e.target.value.replace(/[^0-9]/g, "").slice(0, 2))} />
                <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: COLORS.muted }}>일</span>
              </div>
            </div>
          </label>
        </div>

        <p style={{ margin: "-8px 0 0", fontSize: 13, lineHeight: 1.5, color: form.amountType === "variable" ? "#2F7FC0" : COLORS.muted, display: "flex", gap: 6 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
          매달 금액이 달라지면 예상 금액으로 넣고, 결제 후에 실제 금액으로 고칠 수 있어요
        </p>

        <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={label}>결제 수단 <span style={{ fontWeight: 400, color: COLORS.muted }}>(선택)</span></span>
          <input id="gk-add-pay" className="gk-input" style={input} list="gk-pay-list" maxLength={20} placeholder="예) 국민카드, 카카오뱅크 계좌" value={form.payMethod} onChange={(e) => set("payMethod", e.target.value)} />
          <datalist id="gk-pay-list">{payMethods.map((m) => <option key={m} value={m} />)}</datalist>
          {payMethods.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {payMethods.slice(0, 4).map((m) => (
                <button key={m} type="button" className="gk-chip" onClick={() => set("payMethod", m)}
                  style={{ height: 30, fontSize: 13, background: form.payMethod === m ? "#DCEFFD" : "#F3F5F7" }}>{m}</button>
              ))}
            </div>
          )}
        </label>

        <label className="gk-toggle-row">
          <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={label}>결제 3일 전에 알림 받기</span>
            <span style={{ fontSize: 13, color: COLORS.muted }}>사이드바 알림으로 미리 알려드려요</span>
          </span>
          <input id="gk-add-remind" type="checkbox" checked={form.remind} onChange={(e) => set("remind", e.target.checked)} className="gk-switch" />
        </label>

        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <button type="button" className="gk-btn gk-btn--ghost" onClick={close}>취소</button>
          <button type="submit" className="gk-btn gk-btn--primary" disabled={!valid}>추가하기</button>
        </div>
      </form>
    </div>,
    document.body
  );
}

function Toast({ text, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return createPortal(
    <div className="gk-toast" role="status" style={{ fontFamily: FONT }}>
      <span style={{ width: 24, height: 24, borderRadius: "50%", background: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
      </span>
      {text}
    </div>,
    document.body
  );
}

const MENU_ITEMS = [
  { key: "home", label: "홈", icon: Icons.home },
  { key: "expenses", label: "내 고정지출", icon: Icons.expenses },
  { key: "calendar", label: "결제 캘린더", icon: Icons.calendar },
  { key: "report", label: "지출 리포트", icon: Icons.report },
  { key: "settings", label: "설정", icon: Icons.settings },
];

/** 캘린더 + 메모지 + 압정 로고 그림 */
export function LogoMark({ size = 36 }) {
  const uid = useId().replace(/:/g, "");
  const clipId = `gk-clip-${uid}`;
  const shadowId = `gk-shadow-${uid}`;
  return (
    <svg width={size} height={size} viewBox="270 110 450 450" aria-hidden="true">
      <defs><clipPath id={clipId}><rect x="350" y="200" width="330" height="320" rx="44" /></clipPath><filter id={shadowId} x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="14" stdDeviation="16" floodColor="#1C2A3A" floodOpacity="0.14" /></filter></defs><g transform="rotate(-9 470 340)" filter={`url(#${shadowId})`}><rect x="300" y="170" width="320" height="320" rx="40" fill="#FFE57A" /></g><g transform="rotate(6 515 360)" filter={`url(#${shadowId})`}><rect x="350" y="200" width="330" height="320" rx="44" fill="#FFFFFF" /><g clipPath={`url(#${clipId})`}><rect x="350" y="200" width="330" height="78" fill="#5CB8F2" /></g><rect x="412" y="180" width="18" height="44" rx="9" fill="#2A2F38" /><rect x="600" y="180" width="18" height="44" rx="9" fill="#2A2F38" /><g fill="#DCEFFD"><rect x="384" y="306" width="44" height="40" rx="11" /><rect x="440" y="306" width="44" height="40" rx="11" /><rect x="552" y="306" width="44" height="40" rx="11" /><rect x="608" y="306" width="44" height="40" rx="11" /><rect x="384" y="358" width="44" height="40" rx="11" /><rect x="440" y="358" width="44" height="40" rx="11" /><rect x="496" y="358" width="44" height="40" rx="11" /><rect x="552" y="358" width="44" height="40" rx="11" /><rect x="608" y="358" width="44" height="40" rx="11" /><rect x="384" y="410" width="44" height="40" rx="11" /><rect x="440" y="410" width="44" height="40" rx="11" /><rect x="496" y="410" width="44" height="40" rx="11" /><rect x="552" y="410" width="44" height="40" rx="11" /><rect x="384" y="462" width="44" height="34" rx="11" /><rect x="440" y="462" width="44" height="34" rx="11" /></g><rect x="496" y="306" width="44" height="40" rx="11" fill="#FFD43B" /></g><ellipse cx="530" cy="338" rx="16" ry="6" fill="#1C2A3A" opacity="0.18" /><g transform="rotate(38 600 220)"><rect x="596" y="232" width="8" height="120" rx="4" fill="#9AA6B2" /><path d="M572 170 L628 170 L622 222 L578 222 Z" fill="#2A2F38" /><rect x="556" y="216" width="88" height="24" rx="12" fill="#2A2F38" /><rect x="566" y="128" width="68" height="50" rx="25" fill="#2A2F38" /><rect x="580" y="138" width="22" height="10" rx="5" fill="#FFFFFF" opacity="0.35" /></g>
    </svg>
  );
}

/** "고정콕" 글씨 (주아체 모양을 도형으로 변환) */
export function Wordmark({ height = 26 }) {
  return (
    <svg height={height} viewBox="44 144 942 339" role="img" aria-label="고정콕" style={{ display: "block" }}>
      <path fillRule="evenodd" fill={COLORS.text} d="M640 341 L632 341 L626 339 L623 337 L617 332 L613 324 L611 312 L611 269 L611 268 L589 268 L571 267 L565 266 L561 264 L557 261 L554 258 L552 253 L552 248 L552 240 L553 235 L554 233 L557 230 L562 226 L565 225 L571 224 L611 223 L611 222 L611 176 L611 172 L613 163 L616 157 L621 152 L628 149 L635 148 L639 149 L646 150 L651 153 L655 156 L657 159 L659 165 L660 179 L660 316 L658 325 L655 331 L653 334 L648 338 L644 340 L640 341Z M398 327 L391 327 L386 326 L380 323 L378 321 L375 318 L374 315 L374 309 L375 304 L377 300 L379 297 L393 282 L443 233 L443 233 L443 202 L443 200 L405 201 L395 200 L389 199 L383 197 L379 194 L376 191 L373 184 L372 180 L372 170 L373 166 L376 162 L381 159 L392 157 L524 156 L541 157 L551 158 L560 161 L566 166 L569 169 L570 172 L571 175 L571 180 L570 188 L568 192 L565 195 L564 196 L552 200 L545 201 L500 200 L499 202 L499 216 L499 233 L500 234 L533 263 L553 285 L558 291 L563 298 L567 307 L568 311 L567 317 L565 321 L562 323 L558 325 L554 326 L548 327 L540 326 L536 325 L525 320 L519 316 L511 310 L496 296 L478 277 L471 271 L452 290 L437 305 L432 310 L426 315 L418 320 L410 324 L404 326 L398 327Z M300 362 L292 362 L281 358 L277 355 L275 352 L271 343 L270 337 L266 301 L266 273 L264 253 L264 231 L262 225 L260 222 L258 220 L256 219 L250 219 L186 219 L125 220 L119 219 L92 219 L81 217 L76 215 L74 213 L72 211 L68 205 L67 201 L66 194 L67 188 L69 182 L72 178 L76 174 L80 171 L94 166 L105 165 L134 163 L191 163 L276 164 L289 165 L302 167 L310 171 L313 176 L316 182 L317 186 L319 196 L320 247 L319 279 L319 335 L317 345 L313 353 L308 358 L300 362Z M91 445 L80 445 L70 444 L62 442 L55 438 L51 434 L49 431 L47 424 L48 417 L49 412 L51 408 L55 404 L60 400 L66 398 L77 397 L156 396 L156 395 L156 312 L156 307 L158 300 L164 292 L168 288 L172 286 L180 285 L190 285 L194 286 L198 288 L205 294 L208 299 L209 301 L209 307 L210 335 L210 395 L211 396 L214 396 L269 396 L303 396 L315 396 L329 396 L337 398 L343 400 L349 404 L351 407 L354 411 L355 415 L356 420 L355 428 L353 434 L351 436 L347 440 L342 442 L334 444 L96 444 L91 445Z M544 473 L518 473 L496 472 L481 471 L466 469 L447 465 L437 462 L428 458 L421 454 L414 449 L407 443 L404 439 L400 431 L398 424 L397 412 L398 401 L399 396 L404 386 L407 382 L414 375 L421 370 L429 365 L439 361 L456 356 L466 354 L488 351 L506 350 L531 350 L561 350 L590 352 L604 354 L623 359 L635 364 L646 371 L654 379 L658 385 L662 394 L664 404 L664 419 L662 429 L658 438 L654 443 L648 449 L640 455 L632 459 L622 463 L607 467 L596 469 L581 471 L566 472 L544 473Z M580 430 L586 429 L595 427 L601 425 L605 422 L609 418 L610 415 L610 409 L608 405 L605 401 L596 397 L585 394 L572 392 L542 391 L504 392 L492 392 L479 394 L467 397 L461 400 L458 402 L454 407 L453 411 L454 415 L455 417 L459 420 L462 422 L473 426 L483 428 L503 430 L531 431 L559 431 L580 430Z" />
      <path fillRule="evenodd" fill={COLORS.accent} d="M925 298 L917 298 L910 296 L904 293 L899 289 L896 284 L895 277 L894 274 L894 259 L894 258 L893 258 L735 257 L728 256 L721 253 L716 249 L713 245 L711 241 L709 238 L709 233 L710 228 L713 224 L717 220 L723 217 L734 215 L778 213 L893 214 L894 214 L894 213 L893 197 L893 196 L880 195 L776 193 L750 194 L735 193 L723 192 L719 191 L715 189 L712 186 L708 182 L706 177 L705 172 L706 165 L707 162 L710 158 L714 155 L720 152 L725 150 L734 148 L747 147 L876 147 L913 148 L925 148 L931 150 L935 152 L940 156 L944 162 L946 166 L948 173 L949 180 L950 234 L949 257 L946 277 L942 288 L939 292 L936 294 L930 297 L925 298Z M728 349 L711 348 L706 347 L700 344 L694 339 L690 335 L689 332 L688 327 L689 321 L693 314 L697 310 L701 308 L712 305 L751 304 L779 305 L779 304 L779 283 L780 279 L782 275 L786 271 L790 268 L798 265 L803 264 L812 264 L822 266 L826 268 L831 273 L833 276 L834 279 L836 294 L836 304 L837 305 L927 304 L949 305 L957 305 L966 307 L973 310 L978 315 L980 318 L981 321 L981 326 L981 331 L979 337 L977 340 L972 344 L967 346 L955 348 L728 349Z M944 478 L935 478 L930 477 L924 474 L920 471 L918 468 L916 462 L915 457 L914 425 L913 420 L913 419 L904 418 L887 418 L721 418 L717 417 L712 414 L707 411 L705 408 L704 404 L704 396 L704 391 L706 385 L709 380 L714 375 L718 373 L726 372 L926 372 L938 372 L946 374 L951 376 L955 379 L958 383 L960 388 L961 455 L960 463 L957 470 L952 475 L948 477 L944 478Z" />
    </svg>
  );
}

const css = `
.gk-sidebar__item{display:flex;align-items:center;gap:12px;width:100%;height:48px;padding:0 14px;border:0;border-radius:14px;background:transparent;color:${COLORS.muted};font:inherit;font-size:16px;font-weight:500;text-align:left;cursor:pointer;transition:background .15s,color .15s}
.gk-sidebar__item:hover{background:#F3F8FC;color:${COLORS.text}}
.gk-sidebar__item[aria-current="page"]{background:${COLORS.activeBg};color:${COLORS.text};font-weight:600}
.gk-sidebar__add{transition:filter .15s}
.gk-sidebar__add:hover{filter:brightness(0.97)}
.gk-sidebar button:focus-visible{outline:2px solid ${COLORS.accent};outline-offset:2px}
.gk-bell{transition:background .15s,transform .15s}
.gk-bell:hover{background:#E6EEF5 !important}
.gk-bell[aria-expanded="true"]{background:${COLORS.activeBg} !important;color:${COLORS.text} !important}
.gk-noti{position:absolute;left:calc(100% + 32px);bottom:0;width:380px;background:#FFFFFF;border-radius:22px;box-shadow:0 2px 6px rgba(11,42,69,.06),0 24px 60px rgba(11,42,69,.18);transform-origin:bottom left;animation:gkNotiIn .32s cubic-bezier(.22,1,.36,1) both;z-index:50;text-align:left;color:${COLORS.text}}
.gk-noti__item{animation:gkNotiItem .4s cubic-bezier(.22,1,.36,1) both;animation-delay:calc(60ms + var(--i) * 45ms)}
.gk-noti__row{display:flex;gap:12px;width:100%;padding:12px;border:0;border-radius:14px;font:inherit;color:inherit;cursor:pointer;transition:background .15s}
.gk-noti__row:hover{background:#F3F5F7 !important}
.gk-noti__link{border:0;background:none;font:inherit;font-size:13px;font-weight:600;color:${COLORS.muted};padding:6px 8px;border-radius:8px;cursor:pointer}
.gk-noti__link:hover:not(:disabled){background:#F3F5F7}
.gk-noti__link:disabled{opacity:.4;cursor:default}
.gk-noti__close{width:30px;height:30px;border:0;border-radius:50%;background:none;color:${COLORS.muted};display:flex;align-items:center;justify-content:center;cursor:pointer}
.gk-noti__close:hover{background:#F3F5F7}
@keyframes gkNotiIn{from{opacity:0;transform:translateX(-8px) scale(.96)}to{opacity:1;transform:none}}
@keyframes gkNotiItem{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes gkBadgePop{0%{transform:scale(.6)}60%{transform:scale(1.15)}100%{transform:scale(1)}}
.gk-profile{display:flex;align-items:center;gap:10px;flex:1;min-width:0;padding:6px;margin:-6px;border:0;border-radius:14px;background:transparent;font:inherit;color:inherit;text-align:left;cursor:pointer;transition:background .15s}
.gk-profile:hover{background:#F3F8FC}
.gk-menu{width:280px}
.gk-menu__item{height:44px;padding:0 12px;border:0;border-radius:12px;background:none;font:inherit;font-size:15px;font-weight:600;color:${COLORS.text};text-align:left;cursor:pointer}
.gk-menu__item:hover{background:#F3F5F7}
.gk-logo{transition:transform .15s}
.gk-logo:hover{transform:scale(1.03)}
.gk-logo:active{transform:scale(.97)}
.gk-modal{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(11,42,69,.32);backdrop-filter:blur(3px);animation:gkFadeIn .22s ease both}
.gk-modal.is-closing{animation:gkFadeOut .18s ease both}
.gk-modal__box{width:520px;max-width:100%;background:#FFFFFF;border-radius:28px;padding:28px;box-sizing:border-box;display:flex;flex-direction:column;gap:20px;box-shadow:0 30px 80px rgba(11,42,69,.28);color:${COLORS.text};animation:gkModalIn .34s cubic-bezier(.22,1,.36,1) both}
.gk-modal.is-closing .gk-modal__box{animation:gkModalOut .18s ease both}
.gk-chip{display:flex;align-items:center;gap:7px;height:38px;padding:0 14px;border:0;border-radius:999px;font:inherit;font-size:14px;color:${COLORS.text};cursor:pointer;transition:background .15s,box-shadow .15s,transform .1s}
.gk-chip:active{transform:scale(.96)}
.gk-amt-seg{display:flex;padding:3px;gap:2px;background:#F1F4F7;border-radius:10px}
.gk-amt-seg button{height:24px;padding:0 10px;border:0;border-radius:7px;background:transparent;font:inherit;font-size:12.5px;font-weight:600;color:${COLORS.muted};cursor:pointer;transition:background .15s,color .15s}
.gk-amt-seg button[aria-pressed="true"]{background:#FFFFFF;color:${COLORS.text};box-shadow:0 1px 3px rgba(11,42,69,.12)}
.gk-input{transition:border-color .15s,background .15s,box-shadow .15s}
.gk-input:focus{border-color:${COLORS.accent} !important;background:#FFFFFF !important;box-shadow:0 0 0 4px rgba(92,184,242,.18)}
.gk-input::placeholder{color:#A9AFB6;font-weight:400}
.gk-toggle-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-radius:16px;background:#F7F9FA;cursor:pointer}
.gk-switch{appearance:none;-webkit-appearance:none;width:46px;height:28px;border-radius:999px;background:#D5DCE3;position:relative;cursor:pointer;transition:background .2s;flex-shrink:0;margin:0}
.gk-switch::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2);transition:transform .2s cubic-bezier(.22,1,.36,1)}
.gk-switch:checked{background:${COLORS.accent}}
.gk-switch:checked::after{transform:translateX(18px)}
.gk-btn{flex:1;height:52px;border:0;border-radius:16px;font:inherit;font-size:16px;font-weight:700;cursor:pointer;transition:filter .15s,background .15s,opacity .15s}
.gk-btn--ghost{flex:0 0 120px;background:#F3F5F7;color:${COLORS.text}}
.gk-btn--ghost:hover{background:#E6EBF0}
.gk-btn--primary{background:${COLORS.yellow};color:${COLORS.text}}
.gk-btn--primary:hover:not(:disabled){filter:brightness(.96)}
.gk-btn--primary:disabled{opacity:.45;cursor:not-allowed}
.gk-modal button:focus-visible,.gk-modal input:focus-visible{outline:2px solid ${COLORS.accent};outline-offset:2px}
.gk-toast{position:fixed;left:50%;bottom:36px;z-index:110;display:flex;align-items:center;gap:10px;padding:14px 20px 14px 14px;border-radius:999px;background:${COLORS.text};color:#fff;font-size:15px;font-weight:600;box-shadow:0 12px 30px rgba(11,42,69,.3);animation:gkToast 2.6s cubic-bezier(.22,1,.36,1) both}
@keyframes gkFadeIn{from{opacity:0}to{opacity:1}}
@keyframes gkFadeOut{from{opacity:1}to{opacity:0}}
@keyframes gkModalIn{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:none}}
@keyframes gkModalOut{from{opacity:1;transform:none}to{opacity:0;transform:translateY(8px) scale(.98)}}
@keyframes gkToast{0%{opacity:0;transform:translate(-50%,16px)}10%{opacity:1;transform:translate(-50%,0)}85%{opacity:1;transform:translate(-50%,0)}100%{opacity:0;transform:translate(-50%,8px)}}
/* 작은 화면: 1100px 이하에서는 아이콘만 보이는 좁은 사이드바 */
@media (max-width:1100px){
.gk-sidebar{flex:0 0 84px !important;width:84px !important;padding:24px 12px !important;align-items:center}
.gk-sidebar .gk-sb-label{display:none !important}
.gk-sidebar .gk-logo{padding:4px !important;align-self:center !important}
.gk-sidebar__item{justify-content:center;padding:0 !important;width:56px !important}
.gk-sidebar__add{width:56px !important;padding:0 !important}
.gk-sb-foot{flex-direction:column !important;padding:12px 0 0 !important;width:100%}
.gk-profile{flex:none !important;margin:0 !important;justify-content:center}
.gk-noti{left:calc(100% + 20px) !important}
}
@media (prefers-reduced-motion: reduce){.gk-noti,.gk-noti__item,.gk-modal,.gk-modal__box,.gk-toast{animation:none}}
`;

export default function Sidebar({
  active = "home",
  onNavigate,
  onAddClick,
  onAddItem,
  onNotificationClick,
  onLogout,
  user = null, // 로그인 안 했으면 null
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(NOTIFICATIONS);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState(null);
  const [menu, setMenu] = useState(false);
  const boxRef = useRef(null);
  const myItems = useItems(); // 내가 등록한 고정지출
  const usedPayMethods = [...new Set(myItems.map((it) => it.payMethod).filter(Boolean))];

  // 메인페이지의 "첫 고정지출 등록하기" 버튼에서도 이 창을 열 수 있게
  useEffect(() => {
    const openAdd = () => setAdding(true);
    window.addEventListener("gk-open-add", openAdd);
    return () => window.removeEventListener("gk-open-add", openAdd);
  }, []);
  const notificationCount = items.filter((n) => n.unread).length;

  // 바깥을 누르거나 Esc를 누르면 닫기
  useEffect(() => {
    if (!open && !menu) return;
    const onDown = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) { setOpen(false); setMenu(false); } };
    const onKey = (e) => { if (e.key === "Escape") { setOpen(false); setMenu(false); } };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open, menu]);

  const readOne = (id) => setItems((list) => list.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  const readAll = () => setItems((list) => list.map((n) => ({ ...n, unread: false })));

  return (
    <nav
      aria-label="주 메뉴"
      className="gk-sidebar"
      style={{
        flex: "0 0 248px",
        width: 248,
        minHeight: "100vh",
        background: "#FFFFFF",
        borderRight: `1px solid ${COLORS.border}`,
        boxSizing: "border-box",
        padding: "32px 20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 32,
        fontFamily: FONT,
        color: COLORS.text,
        letterSpacing: "-0.2px",
      }}
    >
      <style>{css}</style>

      {/* 로고 (누르면 홈으로) */}
      <button
        type="button"
        className="gk-logo"
        aria-label="고정콕 홈으로 가기"
        onClick={() => onNavigate?.("home")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "4px 10px",
          margin: "-4px 0",
          border: 0,
          borderRadius: 12,
          background: "transparent",
          cursor: "pointer",
          alignSelf: "flex-start",
        }}
      >
        <LogoMark size={36} />
        <span className="gk-sb-label"><Wordmark height={26} /></span>
      </button>

      {/* 메뉴 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {MENU_ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            className="gk-sidebar__item"
            aria-current={active === item.key ? "page" : undefined}
            title={item.label}
            onClick={() => onNavigate?.(item.key)}
          >
            {item.icon}
            <span className="gk-sb-label">{item.label}</span>
          </button>
        ))}
      </div>

      {/* 항목 추가 */}
      <button
        type="button"
        className="gk-sidebar__add"
        onClick={() => { setAdding(true); onAddClick?.(); }}
        style={{
          marginTop: "auto",
          height: 48,
          borderRadius: 14,
          border: 0,
          background: COLORS.yellow,
          color: COLORS.text,
          font: "inherit",
          fontSize: 15,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          cursor: "pointer",
        }}
      >
        {Icons.plus}
        <span className="gk-sb-label">항목 추가</span>
      </button>

      {/* 프로필 + 알림 */}
      <div
        ref={boxRef}
        className="gk-sb-foot"
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 10px 0",
          borderTop: `1px solid ${COLORS.border}`,
        }}
      >
        {user ? (
          <button type="button" className="gk-profile" aria-haspopup="menu" aria-expanded={menu} onClick={() => { setMenu((v) => !v); setOpen(false); }}>
            <span aria-hidden="true" style={{ width: 40, height: 40, borderRadius: "50%", background: COLORS.accent, color: "#FFFFFF", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {initialOf(user.name)}
            </span>
            <span className="gk-sb-label" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
              <b style={{ fontSize: 15, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}님</b>
              <span style={{ fontSize: 13, color: COLORS.muted, whiteSpace: "nowrap" }}>{myItems.length ? `고정지출 ${myItems.length}건` : "등록한 항목 없음"}</span>
            </span>
          </button>
        ) : (
          <button type="button" className="gk-profile" aria-label="로그인 페이지로 가기" onClick={() => onNavigate?.("login")}>
            <span aria-hidden="true" style={{ width: 40, height: 40, borderRadius: "50%", background: "#E9EDF1", color: "#8A9098", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
            </span>
            <span className="gk-sb-label" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
              <b style={{ fontSize: 15, fontWeight: 700 }}>로그인하기</b>
              <span style={{ fontSize: 13, color: COLORS.muted, whiteSpace: "nowrap" }}>내 고정지출 관리하기</span>
            </span>
            <svg className="gk-sb-label" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.muted} strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        )}
        {menu && user && (
          <div className="gk-noti gk-menu" role="menu" aria-label="내 계정">
            <div style={{ padding: "18px 20px 14px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${COLORS.border}` }}>
              <span aria-hidden="true" style={{ width: 44, height: 44, borderRadius: "50%", background: COLORS.accent, color: "#fff", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{initialOf(user.name)}</span>
              <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                <b style={{ fontSize: 16 }}>{user.name}님</b>
                <span style={{ fontSize: 13, color: COLORS.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</span>
              </span>
            </div>
            <div style={{ padding: 8, display: "flex", flexDirection: "column" }}>
              <button type="button" role="menuitem" className="gk-menu__item" onClick={() => { setMenu(false); onNavigate?.("settings"); }}>내 정보 · 설정</button>
              <button type="button" role="menuitem" className="gk-menu__item" style={{ color: "#D9534F" }} onClick={() => { setMenu(false); onLogout?.(); }}>로그아웃</button>
            </div>
          </div>
        )}
        {user && (
        <button
          type="button"
          className="gk-bell"
          aria-label={notificationCount > 0 ? `알림 ${notificationCount}개` : "알림"}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => { setOpen((v) => !v); setMenu(false); onNotificationClick?.(); }}
          style={{
            position: "relative",
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: 0,
            background: COLORS.iconButtonBg,
            color: COLORS.iconButtonFg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          {Icons.bell}
          {notificationCount > 0 && (
            <span
              key={notificationCount}
              style={{
                animation: "gkBadgePop .35s ease",
                position: "absolute",
                top: 6,
                right: 5,
                minWidth: 18,
                height: 18,
                padding: "0 5px",
                boxSizing: "border-box",
                borderRadius: 999,
                background: COLORS.badge,
                boxShadow: `0 0 0 2px ${COLORS.iconButtonBg}`,
                fontSize: 11,
                fontWeight: 700,
                color: COLORS.text,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </button>
        )}

        {open && (
          <NotificationPanel items={items} onRead={readOne} onReadAll={readAll} onClose={() => setOpen(false)} onSettings={() => { setOpen(false); onNavigate?.("settings"); }} onGo={(key) => { setOpen(false); onNavigate?.(key); }} />
        )}
      </div>

      {adding && (
        <AddItemModal
          payMethods={usedPayMethods}
          onClose={() => setAdding(false)}
          onSubmit={(item) => {
            addItem(item); // 로그인했으면 내 계정, 아니면 이 브라우저에 저장 (가입하면 계정으로 옮겨져요)
            onAddItem?.(item);
            setToast(`'${item.name}' 항목을 추가했어요`);
          }}
        />
      )}
      {toast && <Toast key={toast} text={toast} onDone={() => setToast(null)} />}
    </nav>
  );
}
