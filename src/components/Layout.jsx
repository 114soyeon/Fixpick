import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { PATHS } from "@/constants/routes";
import { logout } from "@/utils/auth/auth";
import "@/styles/common.css";
import { onAuthChange } from "@/api/auth";
import { useEffect, useRef } from "react"; // useRef : 값을 저장해 두었다가 나중에 다시 사용할 수 있도록 해주는 기능
import { useAuthStore } from "@/store/authStore";
import { useQueryClient } from "@tanstack/react-query";

export default function Layout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const scrollRef = useRef(null);

  // 유저가 로그인 상태 여부
  const { user, loading, setAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const prevUserId = useRef(undefined); // 직전에 알던 로그인 사람 (아직 세션 확인 전에는 undefined)

  useEffect(() => {
    const stop = onAuthChange((session) => setAuth(session));
    return stop;
  }, [setAuth]);

  useEffect(() => {
    const id = user?.id;
    if (prevUserId.current === id) return;
    const wasLoggedIn = !!prevUserId.current;
    prevUserId.current = id;
    if (wasLoggedIn) queryClient.clear();
  }, [user?.id, queryClient]);

  // 주소가 바뀔 때 마다 맨 위로 -> scrollTo(0, 0);
  useEffect(() => {
    // window.scrollTo(0, 0); -> css에 overflow: hidden이 있어서 먹히지않음
    scrollRef.current?.scrollTo(0, 0);
  }, [pathname]);

  // 세션 확인이 끝나기 전에는 기다렸다가, 로그인 안 했으면 홈(대시보드)을 빼고 로그인 페이지로 보내요
  useEffect(() => {
    if (loading) return; // 세션 아직 확인 중 — 기다려요
    if (pathname !== "/" && !user) navigate("/login", { replace: true });
  }, [pathname, user, loading, navigate])

  const active =
    Object.keys(PATHS).find((key) =>
      PATHS[key] === "/" ? pathname === "/" : pathname.startsWith(PATHS[key])
    ) ?? "home";

    /* 나중에 로그인 해야 들어가는 화면 컴포넌트에 추가!
  if (!user) {
    return <Navigate to="/login" replace />;
  }*/

  return (
    <div className ="body_content">
      <Sidebar
        active={active}
        onNavigate={(key) => navigate(PATHS[key])}
        onAddClick={() => console.log("항목 추가")}
        user={user}
        onLogout={() => { logout(); navigate("/"); }}
      />

      <div ref={scrollRef} className="body_content__page">
        <Outlet />
      </div>
    </div>
  );
}