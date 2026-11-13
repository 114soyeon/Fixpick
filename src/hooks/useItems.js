import { useSyncExternalStore } from "react";
import { NO_ITEMS, readItems, subscribeItems } from "@/utils/common/items";
import { useUser } from "@/hooks/useUser";

/** 지금 로그인한 사람의 항목 목록 — 브라우저 저장소 (로그인 안 했으면 빈 목록) */
export function useItems() {
  const user = useUser();
  return useSyncExternalStore(
    subscribeItems,
    () => (user ? readItems(user.email) : NO_ITEMS), // 로그인 안 했으면 빈 목록
    () => NO_ITEMS
  );
}
