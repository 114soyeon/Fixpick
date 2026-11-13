import { supabase } from "@/lib/supabase";

// 카테고리를 가져와야 함
export const getCategories = async () => {
    const {data} = await supabase.from("categories").select("*").order("id", { ascending: true });
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

// 내 고정지출 항목 리스트
export const getMySubs = async () => {
    const { data, error } = await supabase.from("subscriptions").select(`
        id, user_id, category_id, name, amount, cycle, amount_type,
        day, month, week, custom_number, custom_text,
        start_date, expiry_date, pay_method, memo, remind, created_at,
        categories ( id, name, icon, color, chart, key, bg )
    `).order("created_at", { ascending: false });
    if (error) {
        console.error("내 고정지출 조회 실패:", error);
        throw error;
    }
    return data;
}