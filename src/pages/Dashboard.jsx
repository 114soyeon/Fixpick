import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cycleText, nextPayments, openAddItem, useItems } from "../utils/items";
import { useCategoryColors, dashCatVars } from "../hooks/useCategoryColors";
import { ddayText } from "../utils/date";
import { MONTH, TODAY, catClass, payByDay, toCard, useDashData } from "../utils/dashboard";
import { useCountUp } from "../hooks/useCountUp";
import { loadBudget } from "../utils/budget";
import { comma as won } from "../utils/format";
import { LINE_ICON as line, MAX_CARDS, MAX_LINES } from "../constants/dashboard";
import { WEEKDAYS } from "../constants/addItem";
import { Icon } from "../components/dashboard/DashIcon";
import { useAuthStore } from "../store/authStore";
import "../styles/dashboard.css";

// 사이드바는 components/Layout.jsx에서 그려요.

/* ───────── 1. 이번 달에 나갈 구독료 ───────── */
function TotalCard({ data }) {
  const { mode, cats, total, count } = data;
  const shown = useCountUp(total);
  const colorOf = useCategoryColors(); // DB 색
  const filled = cats.filter((c) => c.amount > 0);
  return (
    <section className="gk-rise gk-dash-total">
      <div className="gk-dash-total__head">
        <h2 className="gk-dash-h2">{MONTH}월에 나갈 구독료</h2>
        {mode === "mine" && (
          <span className="gk-dash-total__count">이번 달 {count}건 등록됨</span>
        )}
      </div>

      <div className="gk-dash-total-row">
        <span className={`gk-dash-num ${mode === "empty" ? "is-empty" : ""}`}>
          {won(shown)}<span className="gk-dash-num__unit">원</span>
        </span>

        <div className="gk-dash-total__body">
          <div className="gk-dash-total__label-row">
            <span className="gk-dash-total__label">카테고리별 구성</span>
            <span className="gk-dash-total__sum">총 {count}건</span>
          </div>

          {mode === "empty" ? (
            <>
              <div className="gk-dash-total__placeholder" />
              <div className="gk-dash-total__empty">
                <span className="gk-dash-total__hint">고정지출을 등록하면 카테고리별 금액과 비율이 보여요.</span>
                <button type="button" className="gk-dash-add-btn" onClick={openAddItem}>+ 항목 추가</button>
              </div>
            </>
          ) : (
            <>
              <div role="img" aria-label={filled.map((c) => `${c.name} ${won(c.amount)}원`).join(", ")} className="gk-reveal gk-dash-stack">
                {filled.map((c) => (
                  // 막대 길이는 금액 비율이라 CSS 변수(--grow)로만 넘겨요
                  <span key={c.key} title={`${c.name} ${won(c.amount)}원 · ${Math.round((c.amount / total) * 100)}%`} className={`gk-dash-stack__part ${catClass(c.key)}`} style={{ "--grow": c.amount, ...dashCatVars(colorOf(c.key)) }} />
                ))}
              </div>
              <div className="gk-fade gk-dash-legend">
                {filled.map((c) => (
                  <span key={c.key} className={`gk-dash-legend__item ${catClass(c.key)}`} style={dashCatVars(colorOf(c.key))}>
                    <span className="gk-dash-legend__dot" />
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
function CategoryCard({ c, total, onOpen }) {
  const pct = total ? Math.round((c.amount / total) * 100) : 0;
  const shown = c.list.slice(0, MAX_LINES);
  const rest = c.list.length - shown.length;
  const colorOf = useCategoryColors(); // DB 색
  return (
    <div className={`gk-rise gk-cat-card ${catClass(c.key)}`} style={dashCatVars(colorOf(c.key))} role="button" tabIndex={0} onClick={onOpen} onKeyDown={(e) => e.key === "Enter" && onOpen()}>
      <div className="gk-cat-card__head">
        <span className="gk-cat-card__icon">
          <Icon name={c.icon} />
        </span>
        <b className="gk-cat-card__name">{c.name}</b>
        <span className="gk-cat-card__count">{c.count}건</span>
      </div>

      <div className="gk-cat-card__amount">
        {won(c.amount)}<span className="gk-cat-card__unit">원</span>
      </div>

      <div className="gk-cat-card__ratio">
        <div className="gk-cat-card__track">
          {/* 막대 길이는 비율이라 CSS 변수(--pct)로만 넘겨요 */}
          <div className="gk-grow-x gk-cat-card__bar" style={{ "--pct": `${Math.max(pct, 3)}%` }} />
        </div>
        <span className="gk-cat-card__pct">{pct}%</span>
      </div>

      <div className="gk-cat-card__list">
        {shown.map((it, i) => (
          <div key={it.id} className={`gk-cat-card__row ${i < shown.length - 1 || rest > 0 ? "has-line" : ""}`}>
            <span className="gk-cat-card__item-name">{it.name}</span>
            <span className="gk-cat-card__item-day">{cycleText(it)}</span>
            <span className="gk-cat-card__item-amount">
              {it.amountType === "variable" ? "약 " : ""}{won(it.amount)}원
            </span>
          </div>
        ))}
        {rest > 0 && (
          <div className="gk-cat-card__more">외 {rest}건 더 있어요</div>
        )}
      </div>
    </div>
  );
}

function AddCard() {
  return (
    <button type="button" className="gk-rise gk-cat-add" onClick={openAddItem}>
      <span className="gk-cat-plus">
        <svg width="22" height="22" viewBox="0 0 24 24" {...line} strokeWidth="2.4" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
      </span>
      <span>
        <b className="gk-cat-add__title">카테고리 추가하기</b>
        <span className="gk-cat-add__desc">매달 나가는 돈을 더 등록해 보세요</span>
      </span>
    </button>
  );
}

function ExpenseList({ data }) {
  const navigate = useNavigate();
  const { mode, cats, total, count } = data;
  // 등록한 카테고리만, 금액 큰 순으로 최대 3개 → 남는 칸은 '카테고리 추가하기'
  const used = cats.filter((c) => !c.empty).sort((a, b) => b.amount - a.amount);
  const shown = used.slice(0, MAX_CARDS);
  const hidden = used.length - shown.length;
  const slots = MAX_CARDS - shown.length;
  const goAll = () => navigate("/fix");
  return (
    <section className="gk-rise gk-dash-card gk-dash-expense">
      {/* 창이 좁아지면: 제목은 한 줄 그대로, 설명은 … 으로 줄이고, 건수·전체보기는 다음 줄로 */}
      <div className="gk-dash-expense__head">
        <div className="gk-dash-expense__title">
          <h2 className="gk-dash-h2">내 고정지출</h2>
          <span className="gk-dash-expense__desc">
            {mode === "empty" ? "아직 등록한 항목이 없어요" : hidden > 0 ? `금액이 큰 카테고리 ${MAX_CARDS}개 · 외 ${hidden}개` : "카테고리별 이번 달 내 구독비"}
          </span>
        </div>
        <div className="gk-dash-expense__actions">
          <span className="gk-dash-expense__count">총 {count}건</span>
          <button type="button" className="gk-all-btn" onClick={goAll}>
            전체보기
            <svg width="14" height="14" viewBox="0 0 24 24" {...line} strokeWidth="2.4" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>
      </div>
      <div className="gk-dash-expense-grid">
        {shown.map((c) => <CategoryCard key={c.key} c={c} total={total} onOpen={goAll} />)}
        {Array.from({ length: slots }, (_, i) => <AddCard key={`add-${i}`} />)}
      </div>
    </section>
  );
}

/* ───────── 3. 월별 지출 ───────── */
function MonthlyChart({ data }) {
  const { monthly } = data;
  const W = 600, base = 150, bw = 58, step = W / monthly.length;
  const max = Math.max(1, ...monthly.map((m) => m.value || 0));
  const scale = 110 / max;
  const recorded = monthly.filter((m) => m.value !== null);
  const avg = Math.round(recorded.reduce((s, m) => s + m.value, 0) / Math.max(recorded.length, 1));
  return (
    <section className="gk-rise gk-dash-card gk-dash-monthly">
      <div className="gk-dash-monthly__head">
        <div className="gk-dash-monthly__title">
          <h2 className="gk-dash-h2">월별 지출</h2>
          <span className="gk-dash-monthly__desc">{recorded.length > 1 ? `구독 서비스 · 평균 ${won(avg)}원` : "구독 서비스 · 이번 달부터 기록이 쌓여요"}</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} 180`} width="100%" role="img" aria-label={monthly.map((m) => `${m.label} ${m.value === null ? "기록 없음" : `${won(m.value)}원`}`).join(", ")} className="gk-chart">
        <line className="gk-chart__base" x1="0" y1={base} x2={W} y2={base} />
        {monthly.map((m, i) => {
          const cx = step * i + step / 2;
          const h = (m.value || 0) * scale;
          const y = base - h;
          const tone = m.current ? "is-current" : i === monthly.length - 2 ? "is-prev" : "";
          return (
            <g key={m.label} className="gk-chart__col">
              {m.value === null ? (
                <>
                  <rect className="gk-chart__empty" x={cx - bw / 2} y={base - 40} width={bw} height="40" rx="12" />
                  <text className="gk-chart__empty-text" x={cx} y={base - 50}>기록 없음</text>
                </>
              ) : (
                <rect className={`gk-grow-y gk-chart__bar ${tone}`} x={cx - bw / 2} y={y} width={bw} height={h} rx="12" />
              )}
              {m.current ? (
                <g className="gk-fade gk-chart__tag">
                  <rect className="gk-chart__tag-bg" x={cx - 48} y={y - 36} width="96" height="28" rx="14" />
                  <text className="gk-chart__tag-text" x={cx} y={y - 16.5}>{won(m.value)}원</text>
                </g>
              ) : m.value !== null && (
                <text className="gk-fade gk-chart__value" x={cx} y={y - 9}>{(m.value / 10000).toFixed(1)}만</text>
              )}
              <text className={`gk-chart__label ${m.current ? "is-current" : ""}`} x={cx} y="174">{m.label}</text>
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
    <section className="gk-rise gk-dash-budget">
      <div className="gk-dash-budget__head">
        <span className="gk-dash-budget__badge">이번 달 예산</span>
        <span className="gk-dash-budget__month">{MONTH}월</span>
      </div>
      <h2 className="gk-dash-budget__title">
        예산 {BUDGET.limit / 10000}만 원 중<br />{pct}%를 썼어요
      </h2>
      <div className="gk-dash-budget__meter">
        <div className="gk-dash-budget__track">
          {/* 막대 길이는 비율이라 CSS 변수(--pct)로만 넘겨요 */}
          <div className={`gk-grow-x gk-dash-budget__bar ${over ? "is-over" : ""}`} style={{ "--pct": `${Math.min(pct, 100)}%` }} />
        </div>
        <div className="gk-dash-budget__nums">
          <span>{won(BUDGET.used)}원 사용</span>
          <span className="gk-dash-budget__left">{over ? `${won(BUDGET.used - BUDGET.limit)}원 초과` : `${won(BUDGET.limit - BUDGET.used)}원 남음`}</span>
        </div>
      </div>
      <button type="button" className="gk-dash-budget__btn" onClick={() => navigate("/setting")}>
        예산 조정하기
      </button>
    </section>
  );
}

/* ───────── 5. 결제 캘린더 + 다가오는 결제 ───────── */
function CalendarCard() {
  const navigate = useNavigate();
  const items = useItems();
  const colorOf = useCategoryColors(); // DB 색
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

  // 내가 등록한 항목으로 달력·다가오는 결제를 채워요
  const PAY = payByDay(items, view.year, view.month);
  const upcoming = nextPayments(items, TODAY).map(toCard);

  return (
    <section className="gk-rise gk-dash-card gk-cal-card">
      <div className="gk-cal-main">
      <div className="gk-cal-head">
        <h2 className="gk-dash-h2" aria-live="polite">{title}</h2>
        <div className="gk-cal-head__arrows">
          <button type="button" aria-label="이전 달" className="gk-arrow" onClick={() => move(-1)}>
            <svg width="14" height="14" viewBox="0 0 24 24" {...line} strokeWidth="2.4" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <button type="button" aria-label="다음 달" className="gk-arrow" onClick={() => move(1)}>
            <svg width="14" height="14" viewBox="0 0 24 24" {...line} strokeWidth="2.4" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>
      </div>

      <div className="gk-cal-weekdays">
        {WEEKDAYS.map((w) => (
          <span key={w} className="gk-cal-weekday">{w}</span>
        ))}
      </div>

      <div key={viewKey} className={`gk-cal-grid ${dir ? `gk-slide-${dir}` : ""}`}
        role="button" tabIndex={0} aria-label="결제 캘린더로 이동"
        onClick={(e) => { const d = e.target.closest("[data-day]")?.dataset.day; goCalendar(d ? Number(d) : null); }}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goCalendar(); } }}>
        {cells.map((day, i) => {
          if (!day) return <span key={`e${i}`} />;
          const pay = PAY[day];
          const past = isPast(day) ? "is-past" : "";
          if (isToday(day)) {
            return (
              <span key={day} data-day={day} className={`gk-cal-day is-today ${past}`}>
                <span className="gk-cal-day__today-num">{day}</span>
                <span className="gk-cal-day__today-text">오늘</span>
              </span>
            );
          }
          if (pay) {
            return (
              <span key={day} data-day={day} className={`gk-cal-day is-pay ${past} ${dir ? "" : "gk-fade"}`}>
                <b className="gk-cal-day__num">{day}</b>
                {/* 긴 이름은 글자를 조금 줄여 최대 두 줄까지 (넘치면 …) */}
                <span title={pay.name} className="gk-cal-day__name">{pay.name}</span>
              </span>
            );
          }
          return <span key={day} data-day={day} className={`gk-cal-day is-plain ${past}`}>{day}</span>;
        })}
      </div>

      </div>

      <div className="gk-cal-side">
        {upcoming.length === 0 && (
          <div className="gk-rise gk-cal-empty">
            <b className="gk-cal-empty__title">아직 등록한 고정지출이 없어요</b>
            <span className="gk-cal-empty__desc">월세·통신비·구독료를 등록하면<br />다가오는 결제가 여기에 보여요.</span>
            <button type="button" className="gk-cal-empty__btn" onClick={openAddItem}>+ 첫 고정지출 등록하기</button>
          </div>
        )}
        {upcoming.map((u) => (
          <a key={u.key ?? u.day} href="/calendar" onClick={(e) => { e.preventDefault(); navigate("/calendar", { state: { year: TODAY.year, month: u.month, day: u.payDay } }); }} className={`gk-rise gk-cal-up ${catClass(u.cat.key)}`} style={dashCatVars(colorOf(u.cat.key))}>
            <span className="gk-cal-up__date">
              <span className="gk-cal-up__month">{u.month}월</span>
              <b className="gk-cal-up__day">{u.payDay}</b>
            </span>
            <span className="gk-cal-up__text">
              <b className="gk-cal-up__title">{u.title}</b>
              <span className="gk-cal-up__sub">{u.sub}</span>
            </span>
            <span className="gk-cal-up__dday">{ddayText(u.dday)}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

/* ───────── 페이지 ───────── */
export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const data = useDashData();
  return (
    <main className="gk-dash-main">
      <div className="gk-rise gk-dash-head">
        <h1 className="gk-dash-title">
          {user ? `${user.name}님, ${MONTH}월 구독 현황이에요` : `${MONTH}월 고정지출 현황이에요`}
        </h1>
        {!user && (
          <div className="gk-dash-login">
            <span className="gk-dash-login__text">로그인하면 고정지출을 등록할 수 있어요</span>
            <button type="button" className="gk-dash-login__btn" onClick={() => navigate("/login")}>로그인</button>
          </div>
        )}
      </div>

      <div className="gk-dash-cols">
        {/* 왼쪽 */}
        <div className="gk-dash-left">
          <TotalCard data={data} />
          <ExpenseList data={data} />
          <div className="gk-dash-bottom">
            <MonthlyChart data={data} />
            <BudgetCard data={data} />
          </div>
        </div>

        {/* 오른쪽 */}
        <div className="gk-dash-right">
          <CalendarCard />
        </div>
      </div>

      {/* 글자만 사이드바 폭의 절반만큼 왼쪽으로 옮겨서 화면 전체의 가운데에 놓아요 */}
      <footer className="gk-dash-footer">
        <span className="gk-dash-copy">Copyright © 2026. Fixpick All rights reserved.</span>
      </footer>
    </main>
  );
}
