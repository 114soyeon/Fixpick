import { useEffect, useRef, useState } from "react";
import { initialOf } from "../utils/auth";
import { addItem, useItems } from "../utils/items";
import { MENU_ITEMS, NOTIFICATIONS } from "../constants/sidebar";
import { LogoMark, Wordmark } from "./common/Logo";
import { Icons } from "./sidebar/icons";
import NotificationPanel from "./sidebar/NotificationPanel";
import SidebarToast from "./sidebar/SidebarToast";
import AddItemModal from "./add-item/AddItemModal";
import { UserRound, ChevronRight } from "lucide-react";
import "../styles/sidebar.css";

export default function Sidebar({
  active = "home",
  onNavigate,
  onAddClick,
  onAddItem,
  onNotificationClick,
  onLogout,
  user = null, // 로그인 안 했으면 null
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(NOTIFICATIONS);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState(null);
  const [menu, setMenu] = useState(false);
  const boxRef = useRef(null);
  const myItems = useItems(); // 내가 등록한 고정지출
  const usedPayMethods = [...new Set(myItems.map((it) => it.payMethod).filter(Boolean))];

  // 메인페이지의 "첫 고정지출 등록하기" 버튼에서도 이 창을 열 수 있게
  useEffect(() => {
    const openAdd = () => setAdding(true);
    window.addEventListener("gk-open-add", openAdd);
    return () => window.removeEventListener("gk-open-add", openAdd);
  }, []);
  const notificationCount = items.filter((n) => n.unread).length;

  // 바깥을 누르거나 Esc를 누르면 닫기
  useEffect(() => {
    if (!open && !menu) return;
    const onDown = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) { setOpen(false); setMenu(false); } };
    const onKey = (e) => { if (e.key === "Escape") { setOpen(false); setMenu(false); } };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open, menu]);

  const readOne = (id) => setItems((list) => list.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  const readAll = () => setItems((list) => list.map((n) => ({ ...n, unread: false })));

  return (
    <nav aria-label="주 메뉴" className="gk-sidebar">
      {/* 로고 (누르면 홈으로) */}
      <button type="button" className="gk-logo" aria-label="고정콕 홈으로 가기" onClick={() => onNavigate?.("home")}>
        <LogoMark size={36} />
        <span className="gk-sb-label"><Wordmark height={26} /></span>
      </button>

      {/* 메뉴 */}
      <div className="gk-sidebar__menu">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            className="gk-sidebar__item"
            aria-current={active === item.key ? "page" : undefined}
            title={item.label}
            onClick={() => onNavigate?.(item.key)}
          >
            {Icons[item.key]}
            <span className="gk-sb-label">{item.label}</span>
          </button>
        ))}
      </div>

      {/* 항목 추가 */}
      <button type="button" className="gk-sidebar__add" onClick={() => { setAdding(true); onAddClick?.(); }}>
        {Icons.plus}
        <span className="gk-sb-label">항목 추가</span>
      </button>

      {/* 프로필 + 알림 */}
      <div ref={boxRef} className="gk-sb-foot">
        {user ? (
          <button type="button" className="gk-profile" aria-haspopup="menu" aria-expanded={menu} onClick={() => { setMenu((v) => !v); setOpen(false); }}>
            <span aria-hidden="true" className="gk-avatar">{initialOf(user.name)}</span>
            <span className="gk-sb-label gk-profile__text">
              <b className="gk-profile__name">{user.name}님</b>
              <span className="gk-profile__sub">{myItems.length ? `고정지출 ${myItems.length}건` : "등록한 항목 없음"}</span>
            </span>
          </button>
        ) : (
          <button type="button" className="gk-profile" aria-label="로그인 페이지로 가기" onClick={() => onNavigate?.("login")}>
             <span aria-hidden="true" className="gk-avatar gk-avatar--guest">
             <UserRound size={20} strokeWidth={2} />
            </span>
             
            <span className="gk-sb-label gk-profile__text">
              <b className="gk-profile__name">로그인하기</b>
              <span className="gk-profile__sub">내 고정지출 관리하기</span>
            </span>
            <ChevronRight size={16} strokeWidth={2.2} />
          </button>
        )}
        {menu && user && (
          <div className="gk-noti gk-menu" role="menu" aria-label="내 계정">
            <div className="gk-menu__head">
              <span aria-hidden="true" className="gk-avatar gk-avatar--lg">{initialOf(user.name)}</span>
              <span className="gk-menu__who">
                <b className="gk-menu__name">{user.name}님</b>
                <span className="gk-menu__email">{user.email}</span>
              </span>
            </div>
            <div className="gk-menu__list">
              <button type="button" role="menuitem" className="gk-menu__item" onClick={() => { setMenu(false); onNavigate?.("settings"); }}>내 정보 · 설정</button>
              <button type="button" role="menuitem" className="gk-menu__item gk-menu__item--danger" onClick={() => { setMenu(false); onLogout?.(); }}>로그아웃</button>
            </div>
          </div>
        )}
        {user && (
          <button
            type="button"
            className="gk-bell"
            aria-label={notificationCount > 0 ? `알림 ${notificationCount}개` : "알림"}
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => { setOpen((v) => !v); setMenu(false); onNotificationClick?.(); }}
          >
            {Icons.bell}
            {notificationCount > 0 && (
              <span key={notificationCount} className="gk-bell__badge">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </button>
        )}

        {open && (
          <NotificationPanel items={items} onRead={readOne} onReadAll={readAll} onClose={() => setOpen(false)} onSettings={() => { setOpen(false); onNavigate?.("settings"); }} onGo={(key) => { setOpen(false); onNavigate?.(key); }} />
        )}
      </div>

      {adding && (
        <AddItemModal
          payMethods={usedPayMethods}
          onClose={() => setAdding(false)}
          onSubmit={(item) => {
            addItem(item); // 로그인했으면 내 계정, 아니면 이 브라우저에 저장 (가입하면 계정으로 옮겨져요)
            onAddItem?.(item);
            setToast(`'${item.name}' 항목을 추가했어요`);
          }}
        />
      )}
      {toast && <SidebarToast key={toast} text={toast} onDone={() => setToast(null)} />}
    </nav>
  );
}
