/*
    로그인·회원 관련 Supabase 요청 js
    - 누가 로그인했는지는 store/authStore.js)
*/

import { supabase } from "@/lib/supabase";

// 로그인 상태가 바뀔 때마다 callback(session)을 부름 → 그만 듣는 함수를 돌려줌
export const onAuthChange = (callback) => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
    return () => data.subscription.unsubscribe();
};

// 이메일·비밀번호로 로그인
export const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    // 탈퇴한 계정(users.is_active = false)은 들어올 수 없음
    const { data: profile } = await supabase
        .from("users")
        .select("is_active")
        .eq("id", data.user.id)
        .maybeSingle();
    if (profile?.is_active === false) {
        try { await supabase.auth.signOut(); } catch { /* 세션 정리 실패는 무시 */ }
        const err = new Error("탈퇴한 계정이에요. 다시 가입해 주세요.");
        err.code = "account_disabled";
        throw err;
    }
    return data;
};

/* 간편 로그인 : 카카오. 브라우저가 Supabase → 카카오로 넘어갔다가 복귀하면 세션으로 자동 로그인됨 */
export const signInWithProvider = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) throw error;
};

/* 소셜 로그인은 users 행이 따로 없어서 이름·전화가 비어 → 없을 때만 하나 만들어 둔다 */
export const ensureProfile = async (user) => {
    const { data } = await supabase.from("users").select("id, is_active").eq("id", user.id).maybeSingle();
    if (data) {
        // 탈퇴한 계정은 다시 들어올 수 없음 (local 로그인과 같은 규칙)
        if (data.is_active === false) {
            try { await supabase.auth.signOut(); } catch { /* 무시 */ }
        }
        return;
    }
    const meta = user.user_metadata || {};
    const name = meta.name || meta.full_name || meta.preferred_username || "카카오 사용자";
    const { error } = await supabase.from("users").insert({ id: user.id, name, phone: "" });
    if (error) console.error("users 저장 실패:", error);
};

// 회원가입 : 계정 저장 + users 테이블에 이름·전화 저장. 회원가입 후 로그인 페이지로 이동
export const signup = async ({ name, phone = "", email, password }) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
        return { ok: false, field: "email", message: "이미 가입된 이메일이에요." };
    }
    const { error: userError } = await supabase.from("users").insert({ id: data.user.id, name, phone });
    if (userError) console.error("users 저장 실패:", userError);
    return { ok: true };
};

// 로그아웃
export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

// users 테이블에서 이름·전화 가져오기
export const getProfile = async (id) => {
    const { data, error } = await supabase.from("users").select("name, phone").eq("id", id).single();
    if (error) throw error;
    return data;
};

// users 테이블의 이름 바꾸기 → 바뀐 줄 목록(수정 권한이 없으면 오류 없이 빈 배열 [])
export const updateUserName = async (id, name) => {
    const { data, error } = await supabase.from("users").update({ name }).eq("id", id).select("name");
    if (error) throw error;
    return data;
};

// 회원 탈퇴 : users.is_active = false 로 바꿈(행은 남음. 로그인은 불가)
export const deleteAccount = async () => {
    const { error } = await supabase.rpc("delete_my_account");
    if (error) throw error;
};

/* 비밀번호 재설정 링크 보내기 */
export const sendResetLink = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
};

/* 링크를 연 뒤 새 비밀번호로 바꾸기 */
export const updateUserPassword = async (password) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
};