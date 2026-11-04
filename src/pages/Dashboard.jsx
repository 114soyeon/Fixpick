import { useEffect, useState } from "react";

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

/* ───────── 예시 데이터 ───────── */
const USER = { name: "00", initial: "00", subscriptionCount: 5 };
const MONTH = 11;

const CATEGORIES = [
  { key: "home", name: "주거", desc: "월세·관리비·공과금", amount: 486400, count: 4, color: "#4C8DF6", tint: "#DFEAFD", ink: "#3A6CC0", icon: "building" },
  { key: "phone", name: "통신", desc: "휴대폰·인터넷·IPTV", amount: 98700, count: 3, color: "#36C2CE", tint: "#DBF4F6", ink: "#2696A0", icon: "phone" },
  { key: "sub", name: "구독 서비스", desc: "OTT·음악·멤버십", amount: 57790, count: 5, color: "#FF7EB3", tint: "#FFE8F1", ink: "#C85F8B", icon: "play", highlight: true },
  { key: "rental", name: "가전", desc: "정수기·안마의자·건조기", amount: 64800, count: 2, color: "#5ED3A0", tint: "#E2F7EE", ink: "#3F9F76", icon: "washer" },
  { key: "insure", name: "보험", desc: "실손·자동차·운전자", amount: 142000, count: 3, color: "#9B8AFB", tint: "#EDEAFE", ink: "#7364C6", icon: "shield" },
  { key: "saving", name: "금융/저축", desc: "적금·청약·대출이자", amount: 300000, count: 2, color: "#FFC94D", tint: "#FFF2D2", ink: "#C6982F", icon: "piggy" },
  { key: "transit", name: "교통", desc: "교통카드·주차", amount: 68000, count: 2, color: "#FF9466", tint: "#FFECE3", ink: "#C96F48", icon: "bus" },
];
const TOTAL = CATEGORIES.reduce((s, c) => s + c.amount, 0);
const TOTAL_COUNT = CATEGORIES.reduce((s, c) => s + c.count, 0);

const MONTHLY = [
  { label: "6월", value: 52300 },
  { label: "7월", value: 54800 },
  { label: "8월", value: 61200 },
  { label: "9월", value: 63500 },
  { label: "10월", value: 65600 },
  { label: "11월 예정", value: 57790, current: true },
];

const BUDGET = { limit: 1300000, used: TOTAL };

/* 오늘 날짜 (실제 날짜) */
const now = new Date();
const TODAY = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };

/* 매달 같은 날 나가는 결제 (날짜: 이름) */
const PAYMENTS = {
  10: { name: "넷플릭스", warn: false },
  12: { name: "유튜브", warn: false },
  15: { name: "티빙", warn: true },
  20: { name: "쿠팡", warn: true },
  25: { name: "밀리", warn: false },
};

const UPCOMING = [
  { day: 10, title: "넷플릭스 14,500원", sub: "가족 3명 분담 예정" },
  { day: 12, title: "유튜브 프리미엄 14,900원", sub: "개인 결제 · 국민카드" },
  { day: 15, title: "티빙 13,500원", sub: "3주째 안 봤어요", warn: true },
];

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

/* ───────── 1. 11월에 나갈 구독료 ───────── */
function TotalCard() {
  const shown = useCountUp(TOTAL);
  return (
    <section className="gk-rise" style={{ ...at(80), background: C.skySoft, borderRadius: 28, padding: "30px 36px 34px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h2 style={{ ...h2, color: C.text }}>{MONTH}월에 나갈 구독료</h2>
        <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 600, background: "#FFFFFF", padding: "8px 14px 8px 10px", borderRadius: 999 }}>
          <span style={{ width: 22, height: 22, borderRadius: "50%", background: C.sky, color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" {...line} strokeWidth="3" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
          </span>
          10월보다 7,810원 줄었어요
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 56 }}>
        <span style={{ fontSize: 84, fontWeight: 700, letterSpacing: "-3.6px", lineHeight: 1, whiteSpace: "nowrap" }}>
          {won(shown)}<span style={{ fontSize: 38, fontWeight: 600, letterSpacing: 0, marginLeft: 8 }}>원</span>
        </span>

        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <span style={{ fontSize: 16, fontWeight: 600 }}>카테고리별 구성</span>
            <span style={{ fontSize: 14, color: C.sub }}>총 {TOTAL_COUNT}건</span>
          </div>
          <div role="img" aria-label={CATEGORIES.map((c) => `${c.name} ${won(c.amount)}원`).join(", ")} className="gk-reveal"
            style={{ ...at(350), display: "flex", height: 24, gap: 4, borderRadius: 12, overflow: "hidden" }}>
            {CATEGORIES.map((c) => (
              <span key={c.key} title={`${c.name} ${won(c.amount)}원`} style={{ flex: `${c.amount} 1 0`, background: c.color }} />
            ))}
          </div>
          <div className="gk-fade" style={{ ...at(900), display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 11px", fontSize: 13, fontWeight: 600, letterSpacing: "-0.4px" }}>
            {CATEGORIES.map((c) => (
              <span key={c.key} style={{ display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: c.color }} />
                {c.name}
              </span>
            ))}
          </div>
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
      <span style={{ width: 34, height: 34, borderRadius: 10, background: c.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
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
      <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.5px", width: 110, textAlign: "right", flexShrink: 0 }}>{won(c.amount)}원</span>
    </div>
  );
}

function ExpenseList() {
  const left = CATEGORIES.slice(0, 4);
  const right = CATEGORIES.slice(4);
  return (
    <section className="gk-rise" style={{ ...at(160), ...card, padding: "22px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <h2 style={h2}>내 고정지출</h2>
          <span style={{ fontSize: 14, color: C.muted }}>카테고리별 이번 달 내 구독비</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: 14, color: C.muted }}>총 {TOTAL_COUNT}건</span>
          <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.6px" }}>{won(TOTAL)}원</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {left.map((c, i) => <ExpenseRow key={c.key} c={c} delay={300 + i * 60} />)}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {right.map((c, i) => <ExpenseRow key={c.key} c={c} delay={330 + i * 60} />)}
          <button type="button" className="gk-fade" style={{ ...at(560), height: 50, borderRadius: 14, border: `2px dashed ${C.sky2}`, background: "transparent", color: C.sub, fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            + 카테고리 추가
          </button>
        </div>
      </div>
    </section>
  );
}

/* ───────── 3. 월별 지출 ───────── */
function MonthlyChart() {
  const W = 600, base = 150, bw = 58, step = W / MONTHLY.length, scale = 0.001686;
  return (
    <section className="gk-rise" style={{ ...at(240), ...card, flex: "3 1 0", minWidth: 0, padding: "22px 24px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <h2 style={h2}>월별 지출</h2>
          <span style={{ fontSize: 14, color: C.muted }}>최근 6개월 · 평균 59,198원</span>
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, background: C.skySoft, padding: "7px 12px", borderRadius: 999 }}>10월보다 7,810원 ↓</span>
      </div>
      <svg viewBox={`0 0 ${W} 180`} width="100%" role="img" aria-label={MONTHLY.map((m) => `${m.label} ${won(m.value)}원`).join(", ")} style={{ display: "block", flex: 1, minHeight: 0 }}>
        <line x1="0" y1={base} x2={W} y2={base} stroke="#E4E7EB" />
        {MONTHLY.map((m, i) => {
          const cx = step * i + step / 2;
          const h = m.value * scale;
          const y = base - h;
          const fill = m.current ? C.sky : i === MONTHLY.length - 2 ? C.sky2 : C.skySoft;
          return (
            <g key={m.label} fontFamily={FONT} textAnchor="middle">
              <rect className="gk-grow-y" style={at(450 + i * 70)} x={cx - bw / 2} y={y} width={bw} height={h} rx="12" fill={fill} />
              {m.current ? (
                <g className="gk-fade" style={at(450 + i * 70 + 500)}>
                  <rect x={cx - 48} y={y - 36} width="96" height="28" rx="14" fill={C.yellow} />
                  <text x={cx} y={y - 16.5} fontSize="15" fontWeight="700" fill={C.text}>{won(m.value)}원</text>
                </g>
              ) : (
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
function BudgetCard() {
  const pct = Math.round((BUDGET.used / BUDGET.limit) * 100);
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
          <div className="gk-grow-x" style={{ ...at(650), width: `${Math.min(pct, 100)}%`, height: "100%", borderRadius: 7, background: C.yellowDeep }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 600 }}>
          <span>{won(BUDGET.used)}원 사용</span>
          <span style={{ color: C.yellowInk }}>{won(BUDGET.limit - BUDGET.used)}원 남음</span>
        </div>
      </div>
      <button type="button" style={{ marginTop: "auto", flexShrink: 0, height: 48, borderRadius: 999, border: 0, background: C.yellow, color: C.text, fontFamily: "inherit", fontSize: 16, fontWeight: 600, cursor: "pointer" }}>
        예산 조정하기
      </button>
    </section>
  );
}

/* ───────── 5. 결제 캘린더 + 다가오는 결제 ───────── */
function CalendarCard() {
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

  const arrowBtn = { width: 36, height: 36, borderRadius: "50%", border: 0, background: "#F3F5F7", color: "#4A4D52", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" };

  return (
    <section className="gk-rise" style={{ ...at(120), ...card, flex: 1, borderRadius: 28, padding: 26, display: "flex", flexDirection: "column", gap: 14 }}>
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

      <div key={viewKey} className={dir ? `gk-slide-${dir}` : undefined}
        style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gridAutoRows: 66, gap: "8px 6px", fontSize: 14 }}>
        {cells.map((day, i) => {
          if (!day) return <span key={`e${i}`} />;
          const pay = PAYMENTS[day];
          const past = isPast(day);
          const base = { height: 66, borderRadius: 14, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between", opacity: past ? 0.5 : 1 };
          if (isToday(day)) {
            return (
              <span key={day} style={{ ...base, padding: "5px 7px 6px", background: "#FFFFFF", boxShadow: `inset 0 0 0 2px ${C.sky}` }}>
                <span style={{ alignSelf: "flex-start", minWidth: 24, height: 24, borderRadius: 999, background: C.sky, color: "#FFFFFF", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>{day}</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>오늘</span>
              </span>
            );
          }
          if (pay) {
            return (
              <span key={day} className={dir ? undefined : "gk-fade"} style={{ ...(dir ? {} : at(500 + day * 12)), ...base, padding: "7px 6px", background: pay.warn ? C.yellowSoft : C.skySoft, boxShadow: pay.warn ? `inset 0 0 0 1.5px ${C.yellow}` : "none" }}>
                <b style={{ fontSize: 14 }}>{day}</b>
                <span style={{ fontSize: 12, fontWeight: 600, color: pay.warn ? C.yellowInk : C.text, whiteSpace: "nowrap", overflow: "hidden" }}>{pay.name}</span>
              </span>
            );
          }
          return <span key={day} style={{ ...base, padding: "7px 8px", color: C.sub }}>{day}</span>;
        })}
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 14 }}>
        {UPCOMING.map((u, i) => (
          <a key={u.day} href="#" className="gk-rise" style={{ ...at(520 + i * 90), flex: 1, maxHeight: 104, display: "flex", alignItems: "center", gap: 14, borderRadius: 20, padding: "14px 16px 14px 14px", textDecoration: "none", color: C.text,
            background: u.warn ? C.yellowSoft : C.skySoft }}>
            <span style={{ flexShrink: 0, width: 60, height: 60, borderRadius: 16, background: u.warn ? C.yellow : C.sky, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.1 }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{TODAY.month}월</span>
              <b style={{ fontSize: 22, fontWeight: 700 }}>{u.day}</b>
            </span>
            <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
              <b style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.title}</b>
              <span style={{ fontSize: 13, color: u.warn ? C.yellowInk : C.sub }}>{u.sub}</span>
            </span>
            <span style={{ flexShrink: 0, height: 40, padding: "0 14px", borderRadius: 999, background: C.text, color: "#FFFFFF", fontSize: 17, fontWeight: 700, display: "flex", alignItems: "center" }}>{u.day - TODAY.day > 0 ? `D-${u.day - TODAY.day}` : u.day === TODAY.day ? "D-DAY" : "결제 완료"}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

/* ───────── 페이지 ───────── */
export default function Dashboard() {
  return (
    <main
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
      <h1 className="gk-rise" style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: "-1px", lineHeight: 1.3 }}>
        {USER.name}님, {MONTH}월 구독 현황이에요
      </h1>

      <div style={{ display: "flex", gap: 30, alignItems: "stretch" }}>
        {/* 왼쪽 */}
        <div style={{ flex: "999 1 640px", minWidth: 0, display: "flex", flexDirection: "column", gap: 30 }}>
          <TotalCard />
          <ExpenseList />
          <div style={{ display: "flex", gap: 30, flex: 1, minHeight: 0 }}>
            <MonthlyChart />
            <BudgetCard />
          </div>
        </div>

        {/* 오른쪽 */}
        <div style={{ flex: "1 1 520px", maxWidth: 540, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <CalendarCard />
        </div>
      </div>
    </main>
  );
}