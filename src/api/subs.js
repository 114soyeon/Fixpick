import { supabase } from "../lib/supabase";

// 카테고리를 가져와야 함
export const getCategories = async () => {
    const {data} = await supabase.from("categories").select("id, name, color, tint");
    return data;
}

// 고정 지출 항목 추가
// 실패하면 error를 돌려줘요 (예전엔 실패해도 아무것도 안 돌려줘서 "추가했어요"가 떴어요)
export const addSubs = async (input) => {
    const { error } = await supabase.from("subscriptions").insert(input);
    console.error(error)
    if (error) console.error("고정지출 추가 실패:", error);
    return { error };
}