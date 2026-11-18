/*
  고정 지출 항목 관련 Supabase 요청 js
*/

import { supabase } from "@/lib/supabase";
import { getUser } from "@/utils/auth/auth";

// 카테고리를 가져와야 함
export const getCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*").order("id", { ascending: true });
    if (error) {
        console.error("카테고리 조회 실패:", error);
        throw error;
    }
    return data;
}

// 고정 지출 항목 추가 - 실패 시 error throw
export const addSubs = async (input) => {
    const { error } = await supabase.from("subscriptions").insert(input);
    if (error) {
        console.error("고정지출 추가 실패:", error);
        throw error;
    }
};

// 고정 지출 항목 수정
export const updateSubs = async (id, patch) => {
  const { error } = await supabase.from("subscriptions").update(patch).eq("id", id);
  if (error) throw error;
};

// 고정 지출 항목 삭제
export const deleteSubs = async (id) => {
  const { error } = await supabase.from("subscriptions").delete().eq("id", id);
  if (error) throw error;
};

// 내 고정지출 항목 리스트
export const getMySubs = async () => {
    const { data, error } = await supabase.from("subscriptions").select(`
        id, user_id, category_id, name, amount, cycle, amount_type,
        day, month, week, custom_number, custom_text,
        start_date, expiry_date, pay_method, memo, remind, payment_alert_days, expiry_alert_days, created_at,
        categories ( id, name, icon, color, chart, key, bg )
    `).order("created_at", { ascending: false });
    if (error) {
        console.error("내 고정지출 조회 실패:", error);
        throw error;
    }
    return data;
}

// 내 고정지출 "결제일 알림" 일괄 켜기/끄기 (설정·항목 추가 창의 전역 토글)
export const updateAllReminds = async (remind) => {
  const userId = getUser()?.id;
  if (!userId) return;
  const { error } = await supabase.from("subscriptions")
    .update({ remind }).eq("user_id", userId);
  if (error) throw error;
};