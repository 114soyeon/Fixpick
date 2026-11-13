import { create } from "zustand";
import * as authApi from "@/api/auth"; // Supabase 요청은 api/auth.js 에서 해요

/*
 * 로그인 상태 저장소 — "누가 로그인했는지"만 들고 있어요
 * Supabase 를 직접 부르지 않고 api/auth.js 함수를 불러요
 */

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
    try {
      const session = await authApi.getSession();
      set({ session, user: userInfo(session?.user), loading: false });
    } catch {
      set({ loading: false });
    }
  },

  // 로그인 (틀리면 error 를 throw → 로그인 페이지가 문구를 보여줘요)
  signIn: (email, password) => authApi.signIn(email, password),

  // 로그인한 사람의 이름·전화는 users 테이블
  loadProfile: async (id) => {
    let data;
    try {
      data = await authApi.getProfile(id);
    } catch {
      return; // 못 가져오면 임시 이름(이메일 앞글자) 유지
    }
    if (!data) return;

    const cur = get().user;
    if (!cur || cur.id !== id) return; // 그 사이 사용자가 로그아웃을 하면 return

    set({ user: { ...cur, name: data.name || cur.name, phone: data.phone || "" } });
  },

  // 이름 바꾸기 (설정 페이지 프로필에서 사용)
  updateName: async (name) => {
    const cur = get().user;
    if (!cur) return false;

    let data;
    try {
      data = await authApi.updateUserName(cur.id, name);
    } catch {
      return false;
    }
    // 수정 권한이 없으면 오류 없이 빈 배열([])만 와요 → 돌아온 줄이 없으면 실패로 봐요
    if (!data?.length) return false;

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
  signOut: () => authApi.signOut(),
}));
