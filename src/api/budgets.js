import { supabase } from "@/lib/supabase";

/*
  예산(설정 > 예산 카드, 대시보드 > 이번 달 예산) Supabase 요청 js
  - budgets 테이블: 한 사람·한 달에 하나만 (unique (user_id, month))
  - month는 그 달의 1일짜리로 통일 (예: 2026-11-01)
*/

/* 이번 달의 1일 (예: 2026-11-01) */
const thisMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
};

/* 로그인한 사람 id (안 됨 → "로그인이 필요해요") */
const myId = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) throw new Error("로그인이 필요해요");
  return data.user.id;
};

/*
    이번 달 예산 읽기 (없으면 null)
    - 설정 페이지 초기값, 대시보드 "이번 달 예산" 카드에서 씀
*/
export const getMyBudget = async () => {
  const uid = await myId();
  const { data, error } = await supabase
    .from("budgets")
    .select("amount")
    .eq("user_id", uid)
    .eq("month", thisMonth())
    .maybeSingle(); // 없으면 null (에러 아님)
  if (error) {
    console.error("예산 조회 실패:", error);
    throw error;
  }
  return data?.amount ?? null;
};

/*
    이번 달 예산 저장 (없으면 새로, 있으면 고침 = upsert)
    - amount: 원 단위 숫자 (예: 1300000)
*/
export const saveMyBudget = async (amount) => {
  const uid = await myId();
  const { error } = await supabase.from("budgets").upsert(
    {
      user_id: uid,
      month: thisMonth(),
      amount,
      // category_id 는 비워둠 (STEP 1에서 nullable 처리한 컬럼)
    },
    { onConflict: "user_id,month" } // 같은 달 이미 있으면 update
  );
  if (error) {
    console.error("예산 저장 실패:", error);
    throw error;
  }
};