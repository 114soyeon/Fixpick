/*
  예산(설정 > 예산 카드, 대시보드 > 이번 달 예산) Supabase 요청 js
  - budgets 테이블: 한 사람·한 달에 하나만 (unique (user_id, month))
  - month는 그 달의 1일짜리로 통일 (예: 2026-11-01)
*/

import { supabase } from "@/lib/supabase";

// 이번 달의 1일 (예: 2026-11-01)
const thisMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
};

// 로그인한 사람 id (안 됨 → "로그인이 필요해요")
const myId = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) throw new Error("로그인이 필요해요");
  return data.user.id;
};

// 이번 달 예산 읽기(없으면 null)
export const getMyBudget = async () => {
  const uid = await myId();
  const { data, error } = await supabase
    .from("budgets")
    .select("amount")
    .eq("user_id", uid)
    .eq("month", thisMonth())
    .maybeSingle();
  if (error) {
    console.error("예산 조회 실패:", error);
    throw error;
  }
  return data?.amount ?? null;
};

// 이번 달 예산 저장 (없으면 새로, 있으면 고침 = upsert)
export const saveMyBudget = async (amount) => {
  const uid = await myId();
  const { error } = await supabase.from("budgets").upsert(
    {
      user_id: uid,
      month: thisMonth(),
      amount,
    },
    { onConflict: "user_id,month" }
  );
  if (error) {
    console.error("예산 저장 실패:", error);
    throw error;
  }
};