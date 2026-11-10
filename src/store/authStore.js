import { create } from "zustand";
import { supabase } from "../lib/supabase";

export const useAuthStore = create((set) => ({

  // 상태
  user: null,
  session: null,
  loading: true,

  // 초기 로그인 상태 확인
  initialize: async () => {

    const { data, error } =
      await supabase.auth.getSession();

    if (!error) {
      set({
        session: data.session,
        user: data.session?.user ?? null,
        loading: false
      });
    } else {
      set({ loading: false });
    }
  },

  // 로그인
  signIn: async (email, password) => {

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password
      });

    if (error) throw error;

    return data;
  },

  // 회원가입
  signUp: async (email, password) => {

    const { data, error } =
      await supabase.auth.signUp({
        email,
        password
      });

    if (error) throw error;

    return data;
  },

  // 로그아웃
  signOut: async () => {
    console.log("로그아웃!!!!!!")
    const { error } =
      await supabase.auth.signOut();

    console.log(error)
    if (error) throw error;
  },

  // 로그인 상태 변경
  setAuth: (session) => {
    set({
      session,
      user: session?.user ?? null
    });
  }

}));