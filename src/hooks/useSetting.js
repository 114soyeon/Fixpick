import { useSyncExternalStore } from "react";
import { readSetting, subscribeSetting } from "@/utils/setting/setting";

/** 컴포넌트에서 설정(알림·예산·결제 수단)을 쓰는 훅 */
export function useSetting() {
  return useSyncExternalStore(subscribeSetting, readSetting);
}
