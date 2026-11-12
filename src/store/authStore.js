import { create } from "zustand";
import { supabase } from "../lib/supabase";

const userInfo = (user) =>
  user
    ? {
        id: user.id,
        name: (user.email || "").split("@")[0] || "사용자",
        phone: "",
        email: user.email,
      }
    : null;

export const useAuthStore = create((set, get) => ({
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
        user: userInfo(data.session?.user),
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

  // 로그인한 사람의 이름·전화는 users 테이블
  loadProfile: async (id) => {
    const { data, error } = await supabase
      .from("users")
      .select("name, phone")
      .eq("id", id)
      .single();
    if (error || !data) return; // 못 가져오면 임시 이름(이메일 앞글자) 유지
    
    const cur = get().user;
    if (!cur || cur.id !== id) return; // 그 사이 사용자가 로그아웃을 하면 return
    
    set({ user: { ...cur, name: data.name || cur.name, phone: data.phone || "" } });
  },

  // 이름 바꾸기 (설정 페이지 프로필에서 사용)
  // 1) users 테이블의 내 이름을 바꿔요
  // 2) 성공하면 화면의 user.name도 바꿔요 → 사이드바·대시보드 이름도 같이 바뀌어요
  // 성공하면 true, 실패하면 false를 돌려줘요
  updateName: async (name) => {
    const cur = get().user;
    if (!cur) return false;
    const { data, error } = await supabase
      .from("users")
      .update({ name })
      .eq("id", cur.id)
      .select("name"); // 바뀐 줄을 돌려받아요 (아래에서 진짜 바뀌었는지 확인하려고)

    // 수정 권한이 없으면 오류 없이 아무것도 안 바뀌고 빈 배열([])만 와요
    // 그래서 "오류가 있거나 돌아온 줄이 없으면" 실패로 봐요
    if (error || !data?.length) return false;

    const now = get().user;
    if (!now || now.id !== cur.id) return false; // 그 사이 사용자가 로그아웃을 하면 return

    set({ user: { ...now, name } });
    return true;
  },

  // 로그인 상태 변경
  setAuth: (session) => {
    const userSession = session?.user;
    set({
      session,
      user: userInfo(userSession),
      loading: false
    });
    if (userSession) get().loadProfile(userSession.id); // 세션이 오면 이름·전화를 users 테이블에서 덮어씀
  },

  // 로그아웃
  signOut: async () => {
    const { error } =
      await supabase.auth.signOut();
    if (error) throw error;
  }
}));