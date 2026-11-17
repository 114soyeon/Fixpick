import { supabase } from "@/lib/supabase";

/*
  결제 수단 관련 Supabase 요청 js
  - payment_categories, payment_methods 같이 사용
  - payment_id 로 payment_categories를 가리킴
*/

/* DB type ("카드"/"계좌") → 프론트 type ("card"/"bank") */
const toFrontType = (dbType) => (dbType === "카드" ? "card" : "bank");

/*
    카드사·은행 사전 (설정 > 결제 수단 추가 창의 셀렉트박스)
    - [{ id, type: "card"|"bank", name: "국민카드" }]
*/
export const getPayCategories = async () => {
    const { data, error } = await supabase
        .from("payment_categories")
        .select("id, type, name")
        .order("id", { ascending: true });
    if (error) {
        console.error("결제 수단 사전 조회 실패:", error);
        throw error;
    }
    return (data ?? []).map((c) => ({ id: c.id, type: toFrontType(c.type), name: c.name }));
};

/*
    내가 등록한 결제 수단 (설정 > 우측 "결제 수단" 카드 + 항목 추가 모달 셀렉트 박스)
    - [{ id, type: "card"|"bank", name: "국민카드", last4: "1234" }]
*/
export const getMyMethods = async () => {
    const { data, error } = await supabase
        .from("payment_methods")
        .select("id, last4, payment_categories ( type, name )")
        .order("created_at", { ascending: true });
    if (error) {
        console.error("내 결제 수단 조회 실패:", error);
        throw error;
    }
    return (data ?? []).map((m) => ({
        id: m.id,
        type: toFrontType(m.payment_categories?.type),
        name: m.payment_categories?.name ?? "",
        last4: m.last4,
    }));
};

// 결제 수단 등록
export const addMyMethod = async ({ name, last4 }) => {
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth?.user) throw new Error("로그인이 필요해요");

    const { data: cat, error: catError } = await supabase
        .from("payment_categories")
        .select("id")
        .eq("name", name)
        .maybeSingle();
    if (catError) throw catError;
    if (!cat) throw new Error(`"${name}" 카드사/은행이 사전에 없어요`);

    const { error } = await supabase.from("payment_methods").insert({
        user_id: auth.user.id,
        payment_id: cat.id,
        last4,
    });
    if (error) {
        console.error("결제 수단 등록 실패:", error);
        throw error;
    }
};

// 결제 수단 수정
export const updateMyMethod = async (id, { name, last4 }) => {
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth?.user) throw new Error("로그인이 필요해요");

    // 이름 → payment_categories.id
    const { data: cat, error: catError } = await supabase
        .from("payment_categories")
        .select("id")
        .eq("name", name)
        .maybeSingle();
    if (catError) throw catError;
    if (!cat) throw new Error(`"${name}" 카드사/은행이 사전에 없어요`);

    const { error } = await supabase
        .from("payment_methods")
        .update({ payment_id: cat.id, last4 })
        .eq("id", id)
        .eq("user_id", auth.user.id);   // 내 것만 수정 (RLS와 이중 안전장치)
    if (error) {
        console.error("결제 수단 수정 실패:", error);
        throw error;
    }
};

// 결제 수단 삭제
export const deleteMyMethod = async (id) => {
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth?.user) throw new Error("로그인이 필요해요");

    const { error } = await supabase
        .from("payment_methods")
        .delete()
        .eq("id", id)
        .eq("user_id", auth.user.id);
    if (error) throw error;
};
