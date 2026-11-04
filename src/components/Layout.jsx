import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { logout, useUser } from "../utils/auth";

// 사이드바 메뉴 key ↔ 주소
const PATHS = {
  home: "/",
  expenses: "/fix",
  calendar: "/calendar",
  report: "/report",
  settings: "/setting",
  login: "/login",
};

export default function Layout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = useUser(); // 로그인 안 했으면 null

  const active =
    Object.keys(PATHS).find((key) =>
      PATHS[key] === "/" ? pathname === "/" : pathname.startsWith(PATHS[key])
    ) ?? "home";

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#F7F9FA",
        fontFamily: "'Pretendard', 'Noto Sans KR', system-ui, sans-serif",
        color: "#0B2A45",
      }}
    >
      <Sidebar
        active={active}
        onNavigate={(key) => navigate(PATHS[key])}
        onAddClick={() => console.log("항목 추가")}
        user={user}
        onLogout={() => { logout(); navigate("/"); }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Outlet />
      </div>
    </div>
  );
}