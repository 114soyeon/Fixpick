import { removeItem } from "../items";
import { monthAmount } from "../items";
import { getToday, keyToDate, prettyDate } from "../date";

/*
 * 상세 페이지에서 바꾼 내용을 브라우저(localStorage)에 저장해요.
 *   "expense-edits" : { [항목 id]: 수정한 값들 }  → 목록·상세에서 원본 위에 덮어써요
 *   "memo-<id>"     : 메모 글자
 */
const EDITS_KEY = "expense-edits";
const memoKey = (id) => `memo-${id}`;

const readJson = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

/** 저장된 수정본 전체 */
export const loadEdits = () => readJson(EDITS_KEY, {});

/** 수정 모달에서 받은 값 → 저장할 필드만 골라서 화면용 모양으로 */
export const toEditedFields = (newInfo) => {
  const amount = Number(newInfo.amount);
  // 한 달 금액 계산용: 다음 결제일("2026-11-25")에서 날짜·요일·월을 꺼내요
  const next = keyToDate(newInfo.nextDate);
  const rule = { amount, cycle: newInfo.cycle, day: next?.getDate(), weekday: next?.getDay(), month: next ? next.getMonth() + 1 : undefined };
  const today = getToday();
  return {
    period: newInfo.cycle,
    amountType: newInfo.amountType,
    amount,
    monthly: monthAmount(rule, today.year, today.month), // 이번 달 금액 (매년은 ÷12)
    method: newInfo.method,
    startDate: prettyDate(newInfo.startDate),
    endDate: prettyDate(newInfo.endDate),
    date: prettyDate(newInfo.nextDate),
  };
};

/** 수정본 저장 */
export const saveEdit = (id, fields) => {
  const edits = loadEdits();
  localStorage.setItem(
    EDITS_KEY,
    JSON.stringify({ ...edits, [id]: { ...edits[id], ...fields } }),
  );
};

/** 메모 저장 */
export const saveMemo = (id, memo) => localStorage.setItem(memoKey(id), memo);

/** 항목 삭제 + 그 항목의 수정본·메모 정리 */
export const deleteFixItem = (id) => {
  removeItem(id);

  const edits = loadEdits();
  delete edits[id];
  localStorage.setItem(EDITS_KEY, JSON.stringify(edits));
  localStorage.removeItem(memoKey(id));
};
