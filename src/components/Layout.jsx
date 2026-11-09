import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { logout, useUser } from "../utils/auth";
import "../styles/common.css";

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
  const user = useUser(); // 로그인 안 했으면 null

  const active =
    Object.keys(PATHS).find((key) =>
      PATHS[key] === "/" ? pathname === "/" : pathname.startsWith(PATHS[key])
    ) ?? "home";

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