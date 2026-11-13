import { supabase } from "../lib/supabase";

/*
 * 로그인·회원 관련 Supabase 요청은 모두 여기서 해요 (api/subs.js 와 같은 방식)
 * - 화면 상태(누가 로그인했는지)는 store/authStore.js 가 들고 있어요
 * - 실패하면 error 를 throw 해요 (signup 만 화면에 보여줄 결과 { ok, field, message } 를 돌려줘요)
 */

/** 지금 로그인 세션 가져오기 (없으면 null) */
export const getSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
};

/** 로그인 상태가 바뀔 때마다 callback(session) 을 불러요 → 그만 듣는 함수를 돌려줘요 */
export const onAuthChange = (callback) => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
    return () => data.subscription.unsubscribe();
};

/** 이메일·비밀번호로 로그인 */
export const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
};

/* 회원가입 : 계정 저장 + users 테이블에 이름·전화 저장. 회원가입 후 로그인 페이지로 이동 */
export const signup = async ({ name, phone = "", email, password }) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
        return { ok: false, field: "email", message: "이미 가입된 이메일이에요." };
    }
    const { error: userError } = await supabase.from("users").insert({ id: data.user.id, name, phone });
    if (userError) console.error("users 저장 실패:", userError);
    return { ok: true };
};

/** 로그아웃 */
export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

/** users 테이블에서 이름·전화 가져오기 */
export const getProfile = async (id) => {
    const { data, error } = await supabase.from("users").select("name, phone").eq("id", id).single();
    if (error) throw error;
    return data;
};

/** users 테이블의 이름 바꾸기 → 바뀐 줄 목록 (수정 권한이 없으면 오류 없이 빈 배열 [] 이 와요) */
export const updateUserName = async (id, name) => {
    const { data, error } = await supabase.from("users").update({ name }).eq("id", id).select("name");
    if (error) throw error;
    return data;
};
