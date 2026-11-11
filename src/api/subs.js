import { supabase } from "../lib/supabase";

// 카테고리를 가져와야 함
export const getCategories = async () => {
    const {data} = await supabase.from("categories").select("id, name, color, tint");
    return data;
}

getCategories();

// 고정 지출 항목 추가
export const addSubs = async (input) => {
    await supabase.from("subscriptions").insert(input);
}