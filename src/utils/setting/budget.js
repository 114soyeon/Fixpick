/* 이번 달 예산 (설정·지출 리포트 페이지에서 바꾼 값) */
export const DEFAULT_BUDGET = 1300000;

/** 저장된 예산을 읽어요 (없거나 못 읽으면 130만 원) */
export const loadBudget = () => {
  try { return JSON.parse(localStorage.getItem("gk-settings") || "{}").budget ?? DEFAULT_BUDGET; } catch { return DEFAULT_BUDGET; }
};
