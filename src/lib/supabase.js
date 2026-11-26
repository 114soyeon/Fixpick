
import { createClient } from '@supabase/supabase-js';

// "로그인 상태 유지" 체크 (끄면 브라우저 닫을 때 로그아웃 → 세션을 sessionStorage에 저장)
const KEEP_KEY = "gk-keep";
const authStorage = {
  getItem: (k) => {
    try {
      return localStorage.getItem(KEEP_KEY) === "off" ? sessionStorage.getItem(k) : localStorage.getItem(k);
    } catch { return null; }
  },
  setItem: (k, v) => {
    try {
      if (localStorage.getItem(KEEP_KEY) === "off") sessionStorage.setItem(k, v);
      else localStorage.setItem(k, v);
    } catch { /* 무시 */ }
  },
  removeItem: (k) => {
    try { sessionStorage.removeItem(k); localStorage.removeItem(k); } catch { /* 무시 */ }
  },
};

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  { auth: { storage: authStorage, persistSession: true, autoRefreshToken: true } }
);