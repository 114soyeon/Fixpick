import { BIG } from "@/constants/dashboard";
import { comma } from "@/utils/common/format";
import { amountIn, cycleText, isEnded, payDaysIn, paysIn, ruleOf } from "@/utils/common/payment";
import { getToday } from "@/utils/common/date";

/* 메인(대시보드) 계산 */

/* 이번 달 (실제 날짜로 자동) */
export const TODAY = getToday(); // 페이지 파일을 처음 불러올 때 한 번 정해져요
export const MONTH = TODAY.month;
const monthAgo = (n) => ((MONTH - n - 1 + 120) % 12) + 1; // n달 전이 몇 월인지

/** 카테고리 색 class (dashboard.css의 .gk-dash-cat--<key>) */
export const catClass = (key) => `gk-dash-cat--${key}`;

const monthlyRows = (values) => values.map((value, i) => ({
  label: i === values.length - 1 ? `${MONTH}월 예정` : `${monthAgo(values.length - 1 - i)}월`,
  value, // null이면 기록 없음
  current: i === values.length - 1,
}));

/**
 * 메인 화면에 보여줄 숫자 (로그인해야 등록할 수 있어요)
 * - 등록한 게 없음: 0원 (등록 전 화면)
 * - 등록함: 내가 등록한 항목으로 계산
 * items: DB에서 읽은 내 고정지출 (pages/Dashboard.jsx 가 useMySub 로 읽어서 넘겨줘요)
 * categories: DB 카테고리 목록 (pages/Dashboard.jsx 가 useCategories 로 읽어서 넘겨줘요)
 */
export function dashData(items, categories = []) {
  const thisMonth = items.filter((it) => paysIn(it, TODAY.year, MONTH)); // 매년·몇 달마다 항목은 결제하는 달에만 들어가요
  const cats = categories.map((c) => {
    const mine = thisMonth.filter((it) => it.category === c.key);
    return {
      key: c.key,
      name: c.name, // DB 카테고리 이름
      amount: mine.reduce((sum, it) => sum + amountIn(it, TODAY.year, MONTH), 0), // 매일·매주는 이번 달 횟수만큼
      count: mine.length,
      empty: mine.length === 0,
      list: [...mine].sort((a, b) => b.amount - a.amount), // 카드 안에 보여줄 항목 (금액 큰 순)
    };
  });
  const total = cats.reduce((sum, c) => sum + c.amount, 0);
  const count = cats.reduce((sum, c) => sum + c.count, 0);
  return {
    mode: count ? "mine" : "empty",
    cats,
    total,
    count,
    monthly: monthlyRows([null, null, null, null, null, count ? total : null]), // 이번 달 = 전체 예정 합계 / 지난달 기록은 다음 달부터 쌓여요
  };
}

/** 내가 등록한 항목 → 다가오는 결제 카드 모양으로 */
export const toCard = (p) => ({
  key: p.id,
  month: p.month,
  payDay: p.payDay,
  dday: p.dday,
  title: `${p.name} ${p.amountType === "variable" ? "약 " : ""}${comma(p.amount)}원`,
  sub: `${p.amountType === "variable" ? "예상 금액 · " : ""}${p.payMethod || "결제 수단 미등록"} · ${cycleText(p)}`,
  warn: p.amount >= BIG,
  catKey: p.category, // 카드 색 = 카테고리 색 (DB categories.key)
});

/** 매일 나가는 항목인지 ("매일", 사용자화 "1일마다") — 달력 밑줄 순서를 정할 때 써요 */
export const isDaily = (it) => { const { unit, every } = ruleOf(it); return unit === "day" && every === 1; };

/**
 * 달력 칸마다 그날 나가는 항목 전부 모으기 { 날짜: [{ id, name, category }...] }
 * 매달·매년·매주·매일 모두 (항목마다 밑줄 하나, 색은 그 항목 카테고리)
 * 순서: 그날만 나가는 결제 먼저, 매일 나가는 결제는 뒤에
 */
export function itemsByDay(items, year, month) {
  const DAYS = {};
  const ordered = [...items.filter((it) => !isDaily(it)), ...items.filter(isDaily)];
  ordered.forEach((it) => {
    payDaysIn(it, year, month).forEach((d) => {
      if (isEnded(it, new Date(year, month - 1, d))) return; // 만기 뒤엔 안 나가요
      (DAYS[d] ??= []).push({ id: it.id, name: it.name, category: it.category });
    });
  });
  return DAYS;
}
