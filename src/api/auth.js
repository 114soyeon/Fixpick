import { supabase } from "../lib/supabase";

/* 회원가입 : 계정 저장. 회원가입 후 로그인 페이지로 이동 */
export const signup = async ({ name, phone = "", email, password }) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if(error) {
        return { ok: false, field: "email", message: "이미 가입된 이메일이에요." };
    }
    const {data : user, error: userError} = await supabase.from("users").insert({id: data.user.id, name, phone});
    console.log(userError)
    return { ok: true };
}

/* 로그인 :  */