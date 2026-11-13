import { useSyncExternalStore } from "react";
import { useAuthStore } from "@/store/authStore";
import { getUser } from "@/utils/auth/auth";

/** 컴포넌트에서 현재 로그인한 사람 정보를 쓰는 훅 (로그아웃 상태면 null) */
export function useUser() {
  return useSyncExternalStore(
    (cb) => useAuthStore.subscribe(cb), // Supabase 로그인·로그아웃하면 알려 줘요
    getUser,
    () => null
  );
}
