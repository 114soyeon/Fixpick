import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

// 사이드바 메뉴 key ↔ 주소
const PATHS = {
  home: "/",
  expenses: "/fix",
  calendar: "/calendar",
  report: "/report",
  settings: "/setting",
};

export default function Layout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

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
        onAddClick={() => console.log("구독 추가")}
        onNotificationClick={() => console.log("알림")}
        user={{ name: "00", initial: "00", subscriptionCount: 5 }}
        notificationCount={2}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Outlet />
      </div>
    </div>
  );
}