import { Icons } from "./icons";

/* 알림 종류별 아이콘 모양 (색은 sidebar.css의 .gk-noti__row.is-<종류>) */
const NOTI_ICONS = {
  pay: <><rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  big: <><path d="M12 3v12M7 10l5 5 5-5" /><path d="M4 20h16" /></>,
  contract: <><rect x="4" y="3" width="16" height="18" rx="2.5" /><path d="M8 8h8M8 12h8M8 16h4" /></>,
  done: <><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.8 2.8L16.5 9.5" /></>,
  budget: <><rect x="3" y="6" width="18" height="14" rx="3" /><path d="M3 10h18M16 15h2" /></>,
};

/** 알림 패널 */
export default function NotificationPanel({ items, hasItems, onRead, onReadAll, onClose, onSettings, onGo }) {
  const unread = items.filter((n) => n.unread).length;
  return (
    <div className="gk-noti" role="dialog" aria-label="알림">
      <div className="gk-noti__head">
        <div className="gk-noti__heading">
          <b className="gk-noti__heading-title">알림</b>
          {unread > 0 && <span className="gk-noti__count">새 알림 {unread}</span>}
        </div>
        <div className="gk-noti__actions">
          <button type="button" className="gk-noti__link" onClick={onReadAll} disabled={unread === 0}>모두 읽음</button>
          <button type="button" className="gk-noti__close" aria-label="알림 닫기" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="gk-noti__empty">
          <span className="gk-noti__empty-icon">{Icons.bell}</span>
          <b className="gk-noti__empty-title">{hasItems ? "새 알림이 없어요" : "아직 알림이 없어요"}</b>
          <span className="gk-noti__empty-desc">
            {hasItems ? "결제일이 다가오면 여기에서 알려드릴게요." : <>고정지출을 등록하면<br />결제일 전에 미리 알려드려요.</>}
          </span>
        </div>
      ) : (
      <ul className="gk-noti__list">
        {items.map((n) => (
          <li key={n.id} className="gk-noti__item">
            <button type="button" className={`gk-noti__row is-${n.type} ${n.unread ? "is-unread" : ""}`} onClick={() => { onRead(n.id); if (n.to) onGo(n.to); }}>
              <span className="gk-noti__icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{NOTI_ICONS[n.type]}</svg>
              </span>
              <span className="gk-noti__content">
                <span className="gk-noti__title-row">
                  <b className="gk-noti__title">{n.title}</b>
                  {n.unread && <span aria-label="안 읽음" className="gk-noti__dot" />}
                </span>
                <span className="gk-noti__body">{n.body}</span>
                <span className="gk-noti__meta">
                  <span className="gk-noti__time">{n.time}</span>
                  {n.action && <span className="gk-noti__action">{n.action} →</span>}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      )}

      <div className="gk-noti__foot">
        <button type="button" className="gk-noti__link" onClick={onSettings}>알림 설정</button>
        <span className="gk-noti__foot-note">최근 7일 알림</span>
      </div>
    </div>
  );
}
