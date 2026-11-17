import { DEFAULT_BUDGET } from "@/utils/setting/budget";
import { monthDay, won } from "@/utils/common/format";
import { amountIn, isEnded, payDaysIn } from "@/utils/common/payment";

/* 사이드바 알림: 내가 등록한 고정지출로 만들어요 (등록한 게 없으면 알림도 없어요) */

export const BIG_AMOUNT = 100000; // 이 금액 이상이면 "큰 지출"

const keyOfDate = (d) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const dayDiff = (a, b) => Math.round((a - b) / 86400000);

/** from ~ to 사이에 이 항목이 결제되는 날짜들 */
function payDatesBetween(item, from, to) {
  const out = [];
  let y = from.getFullYear();
  let m = from.getMonth() + 1;
  for (let i = 0; i < 3; i++) { // 앞뒤로 길어야 한 달이라 3개월만 보면 돼요
    payDaysIn(item, y, m).forEach((d) => {
      const date = new Date(y, m - 1, d);
      if (date >= from && date <= to && !isEnded(item, date)) out.push(date);
    });
    m += 1; if (m > 12) { m = 1; y += 1; }
  }
  return out;
}

const ALL_ON = { pay: true, budget: true, big: true, end: true };

/*
  등록한 항목(DB, fromDbRow 모양) → 알림 목록 (최근 7일 + 앞으로 다가오는 것)
  - alerts: 설정 페이지에서 켠 알림 종류 { budget, big, end }
  - 항목의 "결제 알림 받기"(remind)를 끄면 그 항목 결제·만기 알림은 안 떠요
  - 항목 상세에서 정한 며칠 전(payAlertDays, endAlertDays)이 있으면 그걸 써요
*/
export function buildNotifications(items, readIds, alerts = ALL_ON, dbBudget = null) {
  if (!items.length) return [];
  const on = { ...ALL_ON, ...alerts };
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const list = [];
  // 결제 완료는 지난 일이라 처음부터 읽은 상태로 (새 알림 숫자에 안 세요)
  const add = (n) => list.push({ ...n, unread: n.type !== "done" && !readIds.has(n.id) });

  items.forEach((it) => {
    const remind = it.remind !== false; // 값이 없으면 받는 걸로
    const big = it.amount >= BIG_AMOUNT;

    // 다가오는 결제: 큰 지출은 7일 전부터, 나머지는 3일 전부터 (항목에서 며칠 전으로 정했으면 그 날부터)
    const wantPay = remind && (!big || on.big); // 결제일 알림은 항목의 remind 하나로만
    const ahead = new Date(today); ahead.setDate(ahead.getDate() + (Number(it.payAlertDays) || (big ? 7 : 3)));
    if (wantPay) payDatesBetween(it, today, ahead).forEach((date) => {
      const left = dayDiff(date, today);
      const when = left === 0 ? "오늘" : left === 1 ? "내일" : `${left}일 뒤`;
      const pay = it.payMethod ? `${it.payMethod}로 ` : "";
      const amt = `${it.amountType === "variable" ? "약 " : ""}${won(it.amount)}`;
      add(big
        ? { id: `big-${it.id}-${keyOfDate(date)}`, type: "big", title: "큰 지출이 다가와요", body: `${monthDay(date)}에 ${it.name} ${amt}이 ${pay}빠져나가요.`, time: when, sort: left, action: "캘린더 보기", to: "calendar" }
        : { id: `pay-${it.id}-${keyOfDate(date)}`, type: "pay", title: `${it.name} 결제 예정`, body: `${monthDay(date)}에 ${amt}이 ${pay}결제돼요.`, time: when, sort: left, action: "캘린더 보기", to: "calendar" });
    });

    // 지난 7일 안에 결제된 것
    const back = new Date(today); back.setDate(back.getDate() - 7);
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    payDatesBetween(it, back, yesterday).forEach((date) => {
      const ago = dayDiff(today, date);
      add({ id: `done-${it.id}-${keyOfDate(date)}`, type: "done", title: "결제 완료", body: `${monthDay(date)}에 ${it.name} ${won(it.amount)}이 결제됐어요.`, time: ago === 1 ? "어제" : `${ago}일 전`, sort: 100 + ago });
    });

    // 만기일이 30일 안으로 다가온 것 (항목에서 며칠 전으로 정했으면 그 날부터)
    if (it.endDate && remind && on.end) {
      const [y, m, d] = it.endDate.split("-").map(Number);
      const end = new Date(y, m - 1, d);
      const left = dayDiff(end, today);
      if (left >= 0 && left <= (Number(it.endAlertDays) || 30)) {
        add({ id: `contract-${it.id}-${it.endDate}`, type: "contract", title: `${it.name} 만기가 다가와요`, body: `${monthDay(end)}에 계약이 끝나요. 연장하거나 바꿀지 확인해 보세요.`, time: left === 0 ? "오늘" : `D-${left}`, sort: 50 + left, action: "내 고정지출", to: "expenses" });
      }
    }
  });

  // 이번 달 예산의 90%를 넘었을 때
  const budget = dbBudget ?? DEFAULT_BUDGET; // DB 예산 (없으면 기본 130만)
  const used = items.reduce((sum, it) => sum + amountIn(it, today.getFullYear(), today.getMonth() + 1), 0);
  if (on.budget && budget > 0 && used >= budget * 0.9) {
    const over = used > budget;
    add({ id: `budget-${today.getFullYear()}-${today.getMonth() + 1}-${over ? "over" : "90"}`, type: "budget", title: over ? "이번 달 예산을 넘었어요" : "예산의 90%를 넘었어요",
      body: over ? `${today.getMonth() + 1}월 고정지출이 예산보다 ${won(used - budget)} 많아요.` : `${today.getMonth() + 1}월 예산이 ${won(budget - used)} 남았어요.`, time: "이번 달", sort: 40, action: "리포트 보기", to: "report" });
  }

  return list.sort((a, b) => Number(b.unread) - Number(a.unread) || a.sort - b.sort);
}

/* 읽은 알림은 사람마다 기억해 둬요 */
const readKey = (email) => `gk-noti-read:${(email || "guest").toLowerCase()}`;
export const loadRead = (email) => { try { return new Set(JSON.parse(localStorage.getItem(readKey(email)) || "[]")); } catch { return new Set(); } };
export const saveRead = (email, set) => { try { localStorage.setItem(readKey(email), JSON.stringify([...set].slice(-300))); } catch { /* 무시 */ } };
