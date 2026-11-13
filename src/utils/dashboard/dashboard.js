import { BIG, CATEGORIES } from "../../constants/dashboard";
import { comma } from "../format";
import { amountIn, cycleText, payDaysIn, paysIn } from "../payment";
import { getToday } from "../date";

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
 */
export function useDashData(items) {
  const thisMonth = items.filter((it) => paysIn(it, TODAY.year, MONTH)); // 매년·몇 달마다 항목은 결제하는 달에만 들어가요
  const cats = CATEGORIES.map((c) => {
    const mine = thisMonth.filter((it) => it.category === c.key);
    return {
      ...c,
      amount: mine.reduce((sum, it) => sum + amountIn(it, TODAY.year, MONTH), 0), // 매일·매주는 이번 달 횟수만큼
      count: mine.length,
      desc: mine.length ? mine.map((it) => it.name).join("·") : c.desc,
      empty: mine.length === 0,
      list: [...mine].sort((a, b) => b.amount - a.amount), // 카드 안에 보여줄 항목 (금액 큰 순)
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

/** 내가 등록한 항목 → 다가오는 결제 카드 모양으로 */
export const toCard = (p) => ({
  key: p.id,
  month: p.month,
  payDay: p.payDay,
  dday: p.dday,
  title: `${p.name} ${p.amountType === "variable" ? "약 " : ""}${comma(p.amount)}원`,
  sub: `${p.amountType === "variable" ? "예상 금액 · " : ""}${p.payMethod || "결제 수단 미등록"} · ${cycleText(p)}`,
  warn: p.amount >= BIG,
  cat: CATEGORIES.find((c) => c.key === p.category) || CATEGORIES[CATEGORIES.length - 1], // 카드 색 = 카테고리 색
});

/** 달력 칸마다 결제 이름 모으기 { 날짜: { name, first, count, warn } } */
export function payByDay(items, year, month) {
  const PAY = {};
  items.forEach((it) => {
    payDaysIn(it, year, month).forEach((d) => { // 매주·매일 결제는 그 달에 여러 날
      const prev = PAY[d];
      PAY[d] = prev
        ? { name: `${prev.first} 외 ${prev.count}`, first: prev.first, count: prev.count + 1, warn: prev.warn || it.amount >= BIG }
        : { name: it.name, first: it.name, count: 1, warn: it.amount >= BIG };
    });
  });
  return PAY;
}
