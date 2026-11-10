import { Outlet, useLocation, useNavigate, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { logout, useUser } from "../utils/auth";
import "../styles/common.css";
import { supabase } from "../lib/supabase";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";


const PATHS = {
  home: "/",
  expenses: "/fix",
  calendar: "/calendar",
  report: "/report",
  settings: "/setting",
  login: "/login",
  signup: "/signup"
};

export default function Layout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // 유저가 로그인 상태 여부
  const { user, loading, setAuth } = useAuthStore();
   const [initialized, setInitialized] = useState(false);

   useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuth(session);
        setInitialized(true);
      }
    );

    return () => subscription.unsubscribe();

  }, [setAuth]);

  useEffect(() => {
    console.log(pathname)
    console.log(pathname !== "/")
    console.log(user)
    
    if(pathname !== "/" && !user) {
      navigate("/login")
    }
  }, [pathname])

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

      <div style={{ flex: 1, minWidth: 0, height: "100vh", overflowY: "auto" }}>
        <Outlet />
      </div>
    </div>
  );
}