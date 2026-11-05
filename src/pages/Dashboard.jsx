import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../utils/auth";
import { nextPayments, openAddItem, payDayIn, paysIn, useItems } from "../utils/items";

// 사이드바는 components/Layout.jsx에서 그려요.

/* ───────── 화면 등장 효과 ───────── */
const ANIM_CSS = `
@keyframes gkRise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
@keyframes gkReveal { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
@keyframes gkGrowX { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes gkGrowY { from { transform: scaleY(0); } to { transform: scaleY(1); } }
@keyframes gkFade { from { opacity: 0; } to { opacity: 1; } }
.gk-rise { animation: gkRise .7s cubic-bezier(.22,1,.36,1) both; animation-delay: var(--d, 0ms); }
.gk-reveal { animation: gkReveal 1s cubic-bezier(.65,0,.35,1) both; animation-delay: var(--d, 0ms); }
.gk-grow-x { transform-origin: left center; animation: gkGrowX 1s cubic-bezier(.22,1,.36,1) both; animation-delay: var(--d, 0ms); }
.gk-grow-y { transform-box: fill-box; transform-origin: bottom; animation: gkGrowY .8s cubic-bezier(.22,1,.36,1) both; animation-delay: var(--d, 0ms); }
.gk-fade { animation: gkFade .5s ease both; animation-delay: var(--d, 0ms); }
@keyframes gkSlideL { from { opacity: 0; transform: translateX(28px); } to { opacity: 1; transform: none; } }
@keyframes gkSlideR { from { opacity: 0; transform: translateX(-28px); } to { opacity: 1; transform: none; } }
.gk-slide-next { animation: gkSlideL .45s cubic-bezier(.22,1,.36,1) both; }
.gk-slide-prev { animation: gkSlideR .45s cubic-bezier(.22,1,.36,1) both; }
.gk-arrow { transition: background .15s, transform .15s; }
.gk-arrow:hover { background: #E6EEF5 !important; }
.gk-arrow:active { transform: scale(.92); }
.gk-cal-grid { cursor: pointer; }
.gk-cal-day { transition: transform .15s, filter .15s, background-color .15s; }
.gk-cal-day:hover { transform: translateY(-2px); filter: drop-shadow(0 6px 10px rgba(11,42,69,.12)); }
.gk-cal-day:not(.is-pay):hover { background-color: #FFFFFF; }
.gk-cal-up { transition: transform .15s, filter .15s; cursor: pointer; }
.gk-cal-up:hover { transform: translateY(-2px); filter: brightness(.98); }
.gk-dash-copy { position: relative; left: -124px; }
/* 작은 화면 */
@media (max-width: 1600px) {
  .gk-dash-num { font-size: 68px !important; letter-spacing: -2.8px !important; }
  .gk-dash-total-row { gap: 36px !important; }
}
@media (max-width: 1440px) {
  .gk-dash-main { justify-content: flex-start !important; }
  .gk-dash-cols { flex-direction: column !important; }
  .gk-dash-right { max-width: none !important; flex: none !important; }
  .gk-cal-card { flex-direction: row !important; gap: 32px !important; }
  .gk-cal-main { flex: 1.25 1 0 !important; }
  .gk-cal-side { flex: 1 1 0 !important; justify-content: center !important; }
}
@media (max-width: 1100px) {
  .gk-dash-main { padding: 24px !important; gap: 22px !important; }
  .gk-dash-head { flex-direction: column !important; align-items: flex-start !important; }
  .gk-dash-total-row { flex-direction: column !important; align-items: stretch !important; gap: 20px !important; }
  .gk-dash-num { font-size: 56px !important; }
  .gk-dash-expense-grid { grid-template-columns: 1fr !important; gap: 4px !important; }
  .gk-dash-bottom { flex-direction: column !important; }
  .gk-dash-copy { left: -42px; }
}
@media (max-width: 820px) {
  .gk-cal-card { flex-direction: column !important; }
}
@media (prefers-reduced-motion: reduce) {
  .gk-rise, .gk-reveal, .gk-grow-x, .gk-grow-y, .gk-fade, .gk-slide-next, .gk-slide-prev { animation: none; }
}
`;
const at = (ms) => ({ "--d": `${ms}ms` }); // 효과 시작 시간(ms)

/** 0부터 목표 숫자까지 부드럽게 올라가는 숫자 */
function useCountUp(target, duration = 1100, delay = 250) {
  const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const [value, setValue] = useState(reduce ? target : 0);
  useEffect(() => {
    if (reduce) return;
    let raf;
    let start;
    const timer = setTimeout(() => {
      const tick = (t) => {
        if (start === undefined) start = t;
        const p = Math.min((t - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setValue(Math.round(target * eased));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
  }, [target, duration, delay, reduce]);
  return value;
}

/* ───────── 색 · 글씨 ───────── */
const C = {
  bg: "#F7F9FA",
  card: "#FFFFFF",
  text: "#0B2A45",
  sub: "#3E4247",
  muted: "#5B5F66",
  line: "#EEF0F2",
  sky: "#5CB8F2",
  sky2: "#BCE1F8",
  skySoft: "#DCEFFD",
  skyTint: "#EAF6FE",
  yellow: "#FFE57A",
  yellowDeep: "#FFD43B",
  yellowSoft: "#FFF8D6",
  yellowLine: "#F5E7A3",
  yellowInk: "#5C5214",
};
const FONT = "'Pretendard', 'Noto Sans KR', system-ui, -apple-system, sans-serif";
const SHADOW = "0 1px 2px rgba(28,28,30,0.04), 0 10px 30px rgba(28,28,30,0.05)";
const won = (n) => n.toLocaleString("ko-KR");

/* ───────── 이번 달 (실제 날짜로 자동) ───────── */
const now = new Date();
const TODAY = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
const MONTH = TODAY.month;
const monthAgo = (n) => ((MONTH - n - 1 + 120) % 12) + 1; // n달 전이 몇 월인지
const PREV = monthAgo(1);

/* ───────── 예시 데이터 ───────── */

const CATEGORIES = [
  { key: "home", name: "주거", desc: "월세·관리비·공과금", amount: 486400, count: 4, color: "#4C8DF6", tint: "#DFEAFD", ink: "#3664AF", icon: "building" },
  { key: "phone", name: "통신", desc: "휴대폰·인터넷·IPTV", amount: 98700, count: 3, color: "#36C2CE", tint: "#DBF4F6", ink: "#20727A", icon: "phone" },
  { key: "sub", name: "구독 서비스", desc: "OTT·음악·멤버십", amount: 57790, count: 5, color: "#FF7EB3", tint: "#FFE8F1", ink: "#9D4D6E", icon: "play", highlight: true },
  { key: "rental", name: "가전", desc: "정수기·안마의자·건조기", amount: 64800, count: 2, color: "#5ED3A0", tint: "#E2F7EE", ink: "#35765A", icon: "washer" },
  { key: "insure", name: "보험", desc: "실손·자동차·운전자", amount: 142000, count: 3, color: "#9B8AFB", tint: "#EDEAFE", ink: "#685CA8", icon: "shield" },
  { key: "saving", name: "금융/저축", desc: "적금·청약·대출이자", amount: 300000, count: 2, color: "#FFC94D", tint: "#FFF2D2", ink: "#5E5300", icon: "piggy" },
  { key: "transit", name: "교통", desc: "교통카드·주차", amount: 68000, count: 2, color: "#FF9466", tint: "#FFECE3", ink: "#98583D", icon: "bus" },
];
const EX_TOTAL = CATEGORIES.reduce((s, c) => s + c.amount, 0);
const EX_COUNT = CATEGORIES.reduce((s, c) => s + c.count, 0);

/* 구독 서비스 최근 6개월 (예시) */
const EX_MONTHLY = [52300, 54800, 61200, 63500, 65600, 57790];
const monthlyRows = (values) => values.map((value, i) => ({
  label: i === values.length - 1 ? `${MONTH}월 예정` : `${monthAgo(values.length - 1 - i)}월`,
  value, // null이면 기록 없음
  current: i === values.length - 1,
}));

/**
 * 메인 화면에 보여줄 숫자
 * - 로그인 안 함: 예시 데이터
 * - 로그인했는데 등록한 게 없음: 0원 (등록 전 화면)
 * - 등록함: 내가 등록한 항목으로 계산
 */
function useDashData() {
  const user = useUser();
  const items = useItems();
  if (!user) {
    return { mode: "example", cats: CATEGORIES, total: EX_TOTAL, count: EX_COUNT, monthly: monthlyRows(EX_MONTHLY) };
  }
  const thisMonth = items.filter((it) => paysIn(it, MONTH)); // 매년 항목은 그 달에만 들어가요
  const cats = CATEGORIES.map((c) => {
    const mine = thisMonth.filter((it) => it.category === c.key);
    return {
      ...c,
      amount: mine.reduce((sum, it) => sum + it.amount, 0),
      count: mine.length,
      desc: mine.length ? mine.map((it) => it.name).join("·") : c.desc,
      empty: mine.length === 0,
    };
  });
  const total = cats.reduce((sum, c) => sum + c.amount, 0);
  const count = cats.reduce((sum, c) => sum + c.count, 0);
  const subNow = cats.find((c) => c.key === "sub").amount;
  return {
    mode: count ? "mine" : "empty",
    cats,
    total,
    count,
    monthly: monthlyRows([null, null, null, null, null, subNow]), // 지난달 기록은 다음 달부터 쌓여요
  };
}

/* 예산: 설정·지출 리포트 페이지에서 바꾼 값을 읽어와요 */
const loadBudget = () => {
  try { return JSON.parse(localStorage.getItem("gk-settings") || "{}").budget ?? 1300000; } catch { return 1300000; }
};

/* 로그인 안 했을 때 보여주는 예시 결제 (날짜: 이름) */
const PAYMENTS = {
  10: { name: "넷플릭스", warn: false },
  12: { name: "유튜브", warn: false },
  15: { name: "티빙", warn: true },
  20: { name: "쿠팡", warn: true },
  25: { name: "밀리", warn: false },
};

const UPCOMING = [
  { day: 10, title: "넷플릭스 14,500원", sub: "국민카드 · 매달 10일" },
  { day: 12, title: "유튜브 프리미엄 14,900원", sub: "신한 체크카드 · 매달 12일" },
  { day: 15, title: "티빙 13,500원", sub: "같은 주에 결제 3건 · 잔액 확인", warn: true },
].map((u) => ({ ...u, month: TODAY.month, payDay: u.day, dday: u.day - TODAY.day }));

const BIG = 100000; // 이 금액 이상이면 노란색(큰 지출)으로 표시
const ddayText = (d) => (d > 0 ? `D-${d}` : d === 0 ? "D-DAY" : "결제 완료");

/** 내가 등록한 항목 → 다가오는 결제 카드 모양으로 */
const toCard = (p) => ({
  key: p.id,
  month: p.month,
  payDay: p.payDay,
  dday: p.dday,
  title: `${p.name} ${won(p.amount)}원`,
  sub: `${p.payMethod || "결제 수단 미등록"} · ${p.cycle === "매년" ? `매년 ${p.month}월 ${p.day}일` : `매달 ${p.day}일`}`,
  warn: p.amount >= BIG,
});

/* ───────── 아이콘 ───────── */
const line = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
const ICON_PATHS = {
  building: (<><path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" /><path d="M6 11H4.5A1.5 1.5 0 0 0 3 12.5V21h3M18 9h1.5A1.5 1.5 0 0 1 21 10.5V21h-3M3 21h18M10 7h4M10 11h4M10 21v-3a2 2 0 0 1 4 0v3" /></>),
  phone: (<><rect x="6.5" y="2.5" width="11" height="19" rx="2.5" /><path d="M11 18h2" /></>),
  play: (<><circle cx="12" cy="12" r="9" /><path d="M10 8.5l5.5 3.5-5.5 3.5z" /></>),
  washer: (<><rect x="3.5" y="2.5" width="17" height="19" rx="2.5" /><path d="M7 6h2M16 6h.01" /><circle cx="12" cy="13.5" r="4.5" /><path d="M12 18a2.25 2.25 0 0 0 0-4.5 2.25 2.25 0 0 1 0-4.5" /></>),
  shield: (<><path d="M12 3l8 3v6c0 4.8-3.4 8-8 9-4.6-1-8-4.2-8-9V6z" /><path d="M9 12l2 2 4-4" /></>),
  piggy: (<><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z" /><path d="M2 9v1c0 1.1.9 2 2 2h1M16 11h.01" /></>),
  bus: (<><rect x="4" y="3" width="16" height="15" rx="3" /><path d="M4 11h16M7 18v3M17 18v3M9 7h6" /><circle cx="8" cy="14.5" r="1" /><circle cx="16" cy="14.5" r="1" /></>),
};
const Icon = ({ name, size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...line} stroke={color} aria-hidden="true">{ICON_PATHS[name]}</svg>
);

/* ───────── 공통 ───────── */
const card = { background: C.card, borderRadius: 24, boxShadow: SHADOW, boxSizing: "border-box" };
const h2 = { margin: 0, fontSize: 19, fontWeight: 600 };

/* ───────── 1. 이번 달에 나갈 구독료 ───────── */
const addBtn = { height: 38, padding: "0 16px", borderRadius: 999, border: 0, background: C.yellow, color: C.text, fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" };

function TotalCard({ data }) {
  const { mode, cats, total, count } = data;
  const shown = useCountUp(total);
  const filled = cats.filter((c) => c.amount > 0);
  return (
    <section className="gk-rise" style={{ ...at(80), background: C.skySoft, borderRadius: 28, padding: "30px 36px 34px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, minHeight: 38 }}>
        <h2 style={{ ...h2, color: C.text }}>{MONTH}월에 나갈 구독료</h2>
        {mode === "example" && (
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 600, background: "#FFFFFF", padding: "8px 14px 8px 10px", borderRadius: 999 }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: C.sky, color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" {...line} strokeWidth="3" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
            </span>
            {PREV}월보다 7,810원 줄었어요
          </span>
        )}
        {mode === "mine" && (
          <span style={{ fontSize: 15, fontWeight: 600, background: "#FFFFFF", padding: "8px 14px", borderRadius: 999 }}>이번 달 {count}건 등록됨</span>
        )}
      </div>

      <div className="gk-dash-total-row" style={{ display: "flex", alignItems: "flex-end", gap: 56 }}>
        <span className="gk-dash-num" style={{ fontSize: 84, fontWeight: 700, letterSpacing: "-3.6px", lineHeight: 1, whiteSpace: "nowrap", color: mode === "empty" ? "#8FB7D4" : C.text }}>
          {won(shown)}<span style={{ fontSize: 38, fontWeight: 600, letterSpacing: 0, marginLeft: 8 }}>원</span>
        </span>

        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <span style={{ fontSize: 16, fontWeight: 600 }}>카테고리별 구성</span>
            <span style={{ fontSize: 14, color: C.sub }}>총 {count}건</span>
          </div>

          {mode === "empty" ? (
            <>
              <div style={{ height: 24, borderRadius: 12, background: "#FFFFFF", border: `2px dashed ${C.sky2}`, boxSizing: "border-box" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <span style={{ fontSize: 14, color: C.sub }}>고정지출을 등록하면 카테고리별 금액과 비율이 보여요.</span>
                <button type="button" onClick={openAddItem} style={addBtn}>+ 항목 추가</button>
              </div>
            </>
          ) : (
            <>
              <div role="img" aria-label={filled.map((c) => `${c.name} ${won(c.amount)}원`).join(", ")} className="gk-reveal"
                style={{ ...at(350), display: "flex", height: 24, gap: 4, borderRadius: 12, overflow: "hidden" }}>
                {filled.map((c) => (
                  <span key={c.key} title={`${c.name} ${won(c.amount)}원 · ${Math.round((c.amount / total) * 100)}%`} style={{ flex: `${c.amount} 1 0`, background: c.color }} />
                ))}
              </div>
              <div className="gk-fade" style={{ ...at(900), display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 11px", fontSize: 13, fontWeight: 600, letterSpacing: "-0.4px" }}>
                {filled.map((c) => (
                  <span key={c.key} style={{ display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
                    <span style={{ width: 9, height: 9, borderRadius: "50%", background: c.color }} />
                    {c.name}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/* ───────── 2. 내 고정지출 ───────── */
function ExpenseRow({ c, delay }) {
  return (
    <div className="gk-rise" style={{ ...at(delay), display: "flex", alignItems: "center", gap: 12, padding: "0 12px", height: 54, borderRadius: 14,
      background: c.highlight ? C.skyTint : "transparent", borderBottom: c.highlight ? "0" : `1px solid ${C.line}` }}>
      <span style={{ width: 34, height: 34, borderRadius: 10, background: c.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, opacity: c.empty ? 0.55 : 1 }}>
        <Icon name={c.icon} color={c.ink} />
      </span>
      <div style={{ flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        <b style={{ fontSize: 15 }}>{c.name}</b>
        <span style={{ fontSize: 13, color: C.muted, marginLeft: 10 }}>{c.desc}</span>
      </div>
      {c.highlight && (
        <span style={{ fontSize: 11, fontWeight: 700, background: C.sky, color: "#FFFFFF", padding: "3px 7px", borderRadius: 999, flexShrink: 0 }}>구독 관리</span>
      )}
      <span style={{ fontSize: 13, color: C.muted, width: 32, textAlign: "right", flexShrink: 0 }}>{c.count}건</span>
      <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.5px", width: 110, textAlign: "right", flexShrink: 0, color: c.empty ? "#A9AFB6" : C.text }}>{won(c.amount)}원</span>
    </div>
  );
}

function ExpenseList({ data }) {
  const navigate = useNavigate();
  const { mode, cats, total, count } = data;
  const left = cats.slice(0, 4);
  const right = cats.slice(4);
  return (
    <section className="gk-rise" style={{ ...at(160), ...card, padding: "22px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <h2 style={h2}>내 고정지출</h2>
          <span style={{ fontSize: 14, color: C.muted }}>{mode === "empty" ? "아직 등록한 항목이 없어요" : "카테고리별 이번 달 내 구독비"}</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: 14, color: C.muted }}>총 {count}건</span>
          <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.6px" }}>{won(total)}원</span>
        </div>
      </div>
      <div className="gk-dash-expense-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {left.map((c, i) => <ExpenseRow key={c.key} c={c} delay={300 + i * 60} />)}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {right.map((c, i) => <ExpenseRow key={c.key} c={c} delay={330 + i * 60} />)}
          <button type="button" className="gk-fade" onClick={() => navigate("/fix", { state: { openAdd: true } })} style={{ ...at(560), height: 50, borderRadius: 14, border: `2px dashed ${C.sky2}`, background: "transparent", color: C.sub, fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            + 카테고리 추가
          </button>
        </div>
      </div>
    </section>
  );
}

/* ───────── 3. 월별 지출 ───────── */
function MonthlyChart({ data }) {
  const { mode, monthly } = data;
  const W = 600, base = 150, bw = 58, step = W / monthly.length;
  const max = Math.max(1, ...monthly.map((m) => m.value || 0));
  const scale = 110 / max;
  const recorded = monthly.filter((m) => m.value !== null);
  const avg = Math.round(recorded.reduce((s, m) => s + m.value, 0) / Math.max(recorded.length, 1));
  return (
    <section className="gk-rise" style={{ ...at(240), ...card, flex: "3 1 0", minWidth: 0, padding: "22px 24px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <h2 style={h2}>월별 지출</h2>
          <span style={{ fontSize: 14, color: C.muted }}>{mode === "example" ? `최근 6개월 · 평균 ${won(avg)}원` : "구독 서비스 · 이번 달부터 기록이 쌓여요"}</span>
        </div>
        {mode === "example" && <span style={{ fontSize: 14, fontWeight: 600, background: C.skySoft, padding: "7px 12px", borderRadius: 999 }}>{PREV}월보다 7,810원 ↓</span>}
      </div>
      <svg viewBox={`0 0 ${W} 180`} width="100%" role="img" aria-label={monthly.map((m) => `${m.label} ${m.value === null ? "기록 없음" : `${won(m.value)}원`}`).join(", ")} style={{ display: "block", flex: 1, minHeight: 0, maxHeight: 240 }}>
        <line x1="0" y1={base} x2={W} y2={base} stroke="#E4E7EB" />
        {monthly.map((m, i) => {
          const cx = step * i + step / 2;
          const h = (m.value || 0) * scale;
          const y = base - h;
          const fill = m.current ? C.sky : i === monthly.length - 2 ? C.sky2 : C.skySoft;
          return (
            <g key={m.label} fontFamily={FONT} textAnchor="middle">
              {m.value === null ? (
                <>
                  <rect x={cx - bw / 2} y={base - 40} width={bw} height="40" rx="12" fill="none" stroke="#DDE3E9" strokeDasharray="4 4" />
                  <text x={cx} y={base - 50} fontSize="13" fill="#A9AFB6">기록 없음</text>
                </>
              ) : (
                <rect className="gk-grow-y" style={at(450 + i * 70)} x={cx - bw / 2} y={y} width={bw} height={h} rx="12" fill={fill} />
              )}
              {m.current ? (
                <g className="gk-fade" style={at(450 + i * 70 + 500)}>
                  <rect x={cx - 48} y={y - 36} width="96" height="28" rx="14" fill={C.yellow} />
                  <text x={cx} y={y - 16.5} fontSize="15" fontWeight="700" fill={C.text}>{won(m.value)}원</text>
                </g>
              ) : m.value !== null && (
                <text className="gk-fade" style={at(450 + i * 70 + 400)} x={cx} y={y - 9} fontSize="15" fontWeight="600" fill={C.muted}>{(m.value / 10000).toFixed(1)}만</text>
              )}
              <text x={cx} y="174" fontSize="15" fontWeight={m.current ? 700 : 400} fill={m.current ? C.text : C.muted}>{m.label}</text>
            </g>
          );
        })}
      </svg>
    </section>
  );
}

/* ───────── 4. 이번 달 예산 ───────── */
function BudgetCard({ data }) {
  const navigate = useNavigate();
  const [limit] = useState(loadBudget);
  const BUDGET = { limit, used: data.total };
  const pct = Math.round((BUDGET.used / BUDGET.limit) * 100);
  const over = BUDGET.used > BUDGET.limit;
  return (
    <section className="gk-rise" style={{ ...at(300), flex: "2 1 0", minWidth: 0, background: C.yellowSoft, borderRadius: 24, padding: "24px 28px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 600, background: C.yellow, padding: "5px 13px", borderRadius: 999 }}>이번 달 예산</span>
        <span style={{ fontSize: 14, color: C.yellowInk }}>{MONTH}월</span>
      </div>
      <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: "-1px", lineHeight: 1.35 }}>
        예산 {BUDGET.limit / 10000}만 원 중<br />{pct}%를 썼어요
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ height: 14, borderRadius: 7, background: C.yellowLine }}>
          <div className="gk-grow-x" style={{ ...at(650), width: `${Math.min(pct, 100)}%`, height: "100%", borderRadius: 7, background: over ? "#FF9466" : C.yellowDeep }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 600 }}>
          <span>{won(BUDGET.used)}원 사용</span>
          <span style={{ color: C.yellowInk }}>{over ? `${won(BUDGET.used - BUDGET.limit)}원 초과` : `${won(BUDGET.limit - BUDGET.used)}원 남음`}</span>
        </div>
      </div>
      <button type="button" onClick={() => navigate("/report")} style={{ marginTop: "auto", flexShrink: 0, height: 48, borderRadius: 999, border: 0, background: C.yellow, color: C.text, fontFamily: "inherit", fontSize: 16, fontWeight: 600, cursor: "pointer" }}>
        예산 조정하기
      </button>
    </section>
  );
}

/* ───────── 5. 결제 캘린더 + 다가오는 결제 ───────── */
function CalendarCard() {
  const navigate = useNavigate();
  const user = useUser();
  const items = useItems();
  const [view, setView] = useState({ year: TODAY.year, month: TODAY.month });
  const [dir, setDir] = useState(null); // "next" | "prev" | null

  const move = (step) => {
    setDir(step > 0 ? "next" : "prev");
    setView(({ year, month }) => {
      const m = month + step;
      if (m < 1) return { year: year - 1, month: 12 };
      if (m > 12) return { year: year + 1, month: 1 };
      return { year, month: m };
    });
  };

  const firstWeekday = new Date(view.year, view.month - 1, 1).getDay();
  const days = new Date(view.year, view.month, 0).getDate();
  const cells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];
  const viewKey = view.year * 100 + view.month;
  const todayKey = TODAY.year * 100 + TODAY.month;
  const isPast = (day) => viewKey < todayKey || (viewKey === todayKey && day < TODAY.day);
  const isToday = (day) => viewKey === todayKey && day === TODAY.day;
  const title = view.year === TODAY.year ? `${view.month}월 결제일` : `${view.year}년 ${view.month}월 결제일`;

  // 날짜를 누르면 결제 캘린더 페이지로 (누른 날짜도 같이 넘겨줘요)
  const goCalendar = (day = null) => navigate("/calendar", { state: { year: view.year, month: view.month, day } });

  // 로그인했으면 내가 등록한 항목, 아니면 예시
  const payMap = {};
  if (user) {
    items.filter((it) => paysIn(it, view.month)).forEach((it) => {
      const d = payDayIn(it, view.year, view.month);
      const prev = payMap[d];
      payMap[d] = prev
        ? { name: `${prev.first} 외 ${prev.count}`, first: prev.first, count: prev.count + 1, warn: prev.warn || it.amount >= BIG }
        : { name: it.name, first: it.name, count: 1, warn: it.amount >= BIG };
    });
  }
  const PAY = user ? payMap : PAYMENTS;
  const upcoming = user ? nextPayments(items, TODAY).map(toCard) : UPCOMING;

  const arrowBtn = { width: 36, height: 36, borderRadius: "50%", border: 0, background: "#F3F5F7", color: "#4A4D52", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" };

  return (
    <section className="gk-rise gk-cal-card" style={{ ...at(120), ...card, flex: 1, borderRadius: 28, padding: 26, display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="gk-cal-main" style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={h2} aria-live="polite">{title}</h2>
        <div style={{ display: "flex", gap: 6 }}>
          <button type="button" aria-label="이전 달" className="gk-arrow" style={arrowBtn} onClick={() => move(-1)}>
            <svg width="14" height="14" viewBox="0 0 24 24" {...line} strokeWidth="2.4" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <button type="button" aria-label="다음 달" className="gk-arrow" style={arrowBtn} onClick={() => move(1)}>
            <svg width="14" height="14" viewBox="0 0 24 24" {...line} strokeWidth="2.4" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "8px 6px", fontSize: 14 }}>
        {["일", "월", "화", "수", "목", "금", "토"].map((w) => (
          <span key={w} style={{ fontSize: 13, color: "#6B7078", textAlign: "center", padding: "2px 0" }}>{w}</span>
        ))}
      </div>

      <div key={viewKey} className={`gk-cal-grid ${dir ? `gk-slide-${dir}` : ""}`}
        role="button" tabIndex={0} aria-label="결제 캘린더로 이동"
        onClick={(e) => { const d = e.target.closest("[data-day]")?.dataset.day; goCalendar(d ? Number(d) : null); }}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goCalendar(); } }}
        style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gridAutoRows: 66, gap: "8px 6px", fontSize: 14 }}>
        {cells.map((day, i) => {
          if (!day) return <span key={`e${i}`} />;
          const pay = PAY[day];
          const past = isPast(day);
          const base = { height: 66, borderRadius: 14, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between", opacity: past ? 0.5 : 1 };
          if (isToday(day)) {
            return (
              <span key={day} data-day={day} className="gk-cal-day" style={{ ...base, padding: "5px 7px 6px", background: "#FFFFFF", boxShadow: `inset 0 0 0 2px ${C.sky}` }}>
                <span style={{ alignSelf: "flex-start", minWidth: 24, height: 24, borderRadius: 999, background: C.sky, color: "#FFFFFF", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>{day}</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>오늘</span>
              </span>
            );
          }
          if (pay) {
            return (
              <span key={day} data-day={day} className={`gk-cal-day is-pay ${dir ? "" : "gk-fade"}`} style={{ ...(dir ? {} : at(500 + day * 12)), ...base, padding: "7px 6px", background: pay.warn ? C.yellowSoft : C.skySoft, boxShadow: pay.warn ? `inset 0 0 0 1.5px ${C.yellow}` : "none" }}>
                <b style={{ fontSize: 14 }}>{day}</b>
                <span style={{ fontSize: 12, fontWeight: 600, color: pay.warn ? C.yellowInk : C.text, whiteSpace: "nowrap", overflow: "hidden" }}>{pay.name}</span>
              </span>
            );
          }
          return <span key={day} data-day={day} className="gk-cal-day" style={{ ...base, padding: "7px 8px", color: C.sub }}>{day}</span>;
        })}
      </div>

      </div>

      <div className="gk-cal-side" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 14, minWidth: 0 }}>
        {user && upcoming.length === 0 && (
          <div className="gk-rise" style={{ ...at(520), flex: 1, maxHeight: 340, minHeight: 200, borderRadius: 20, border: `2px dashed ${C.sky2}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, textAlign: "center", padding: 20 }}>
            <b style={{ fontSize: 17 }}>아직 등록한 고정지출이 없어요</b>
            <span style={{ fontSize: 14, color: C.sub, lineHeight: 1.5 }}>월세·통신비·구독료를 등록하면<br />다가오는 결제가 여기에 보여요.</span>
            <button type="button" onClick={openAddItem} style={{ height: 42, padding: "0 18px", borderRadius: 999, border: 0, background: C.yellow, color: C.text, fontFamily: "inherit", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>+ 첫 고정지출 등록하기</button>
          </div>
        )}
        {upcoming.map((u, i) => (
          <a key={u.key ?? u.day} href="/calendar" onClick={(e) => { e.preventDefault(); navigate("/calendar", { state: { year: TODAY.year, month: u.month, day: u.payDay } }); }} className="gk-rise gk-cal-up" style={{ ...at(520 + i * 90), flex: 1, maxHeight: 104, display: "flex", alignItems: "center", gap: 14, borderRadius: 20, padding: "14px 16px 14px 14px", textDecoration: "none", color: C.text,
            background: u.warn ? C.yellowSoft : C.skySoft }}>
            <span style={{ flexShrink: 0, width: 60, height: 60, borderRadius: 16, background: u.warn ? C.yellow : C.sky, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.1 }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{u.month}월</span>
              <b style={{ fontSize: 22, fontWeight: 700 }}>{u.payDay}</b>
            </span>
            <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
              <b style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.title}</b>
              <span style={{ fontSize: 13, color: u.warn ? C.yellowInk : C.sub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.sub}</span>
            </span>
            <span style={{ flexShrink: 0, height: 40, padding: "0 14px", borderRadius: 999, background: C.text, color: "#FFFFFF", fontSize: 17, fontWeight: 700, display: "flex", alignItems: "center" }}>{ddayText(u.dday)}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

/* ───────── 페이지 ───────── */
export default function Dashboard() {
  const user = useUser(); // 로그인 안 했으면 null
  const navigate = useNavigate();
  const data = useDashData();
  return (
    <main
      className="gk-dash-main"
      style={{
        minHeight: "100vh",
        padding: "28px 40px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 30,
        background: C.bg,
        fontFamily: FONT,
        color: C.text,
        letterSpacing: "-0.2px",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <style>{ANIM_CSS}</style>
      <div className="gk-rise gk-dash-head" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, minHeight: 48 }}>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: "-1px", lineHeight: 1.3 }}>
          {user ? `${user.name}님, ${MONTH}월 구독 현황이에요` : `${MONTH}월 고정지출 현황이에요`}
        </h1>
        {!user && (
          <div style={{ display: "flex", alignItems: "center", gap: 14, background: C.yellowSoft, borderRadius: 999, padding: "6px 6px 6px 18px" }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: C.yellowInk }}>지금은 예시 화면이에요 · 로그인하면 내 고정지출로 바뀌어요</span>
            <button type="button" onClick={() => navigate("/login")} style={{ height: 36, padding: "0 16px", borderRadius: 999, border: 0, background: C.text, color: "#FFFFFF", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>로그인</button>
          </div>
        )}
      </div>

      <div className="gk-dash-cols" style={{ display: "flex", gap: 30, alignItems: "stretch" }}>
        {/* 왼쪽 */}
        <div style={{ flex: "999 1 640px", minWidth: 0, display: "flex", flexDirection: "column", gap: 30 }}>
          <TotalCard data={data} />
          <ExpenseList data={data} />
          <div className="gk-dash-bottom" style={{ display: "flex", gap: 30, flex: 1, minHeight: 0 }}>
            <MonthlyChart data={data} />
            <BudgetCard data={data} />
          </div>
        </div>

        {/* 오른쪽 */}
        <div className="gk-dash-right" style={{ flex: "1 1 520px", maxWidth: 540, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <CalendarCard />
        </div>
      </div>

      {/* 글자만 사이드바 폭의 절반만큼 왼쪽으로 옮겨서 화면 전체의 가운데에 놓아요 */}
      <footer style={{ marginTop: -10, textAlign: "center", fontSize: 13, color: "#8A9098" }}>
        <span className="gk-dash-copy">Copyright © 2026. Fixpick All rights reserved.</span>
      </footer>
    </main>
  );
}
