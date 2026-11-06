import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { initialOf } from "../utils/auth";
import { addItem, useItems } from "../utils/items";

const COLORS = {
  text: "#0B2A45",
  muted: "#5B5F66",
  border: "#EEF0F2",
  activeBg: "#DCEFFD",
  accent: "#5CB8F2",
  yellow: "#FFE57A",
  badge: "#FFD43B",
  iconButtonBg: "#F3F5F7",
  iconButtonFg: "#4A4D52",
};

const FONT = "'Pretendard', 'Noto Sans KR', system-ui, -apple-system, sans-serif";

const svgProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

const Icons = {
  home: (
    <svg {...svgProps}>
      <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
    </svg>
  ),
  expenses: (
    <svg {...svgProps}>
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </svg>
  ),
  calendar: (
    <svg {...svgProps}>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M16 3v4M8 3v4M3 10h18M9 15.5l2 2 4-4" />
    </svg>
  ),
  report: (
    <svg {...svgProps}>
      <path d="M21 12c.55 0 1-.45.95-1A10 10 0 0 0 13 2.05c-.55-.05-1 .4-1 .95v8a1 1 0 0 0 1 1z" />
      <path d="M21.2 15.9A10 10 0 1 1 8 2.8" />
    </svg>
  ),
  settings: (
    <svg {...svgProps}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  plus: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  bell: (
    <svg {...svgProps}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0" />
    </svg>
  ),
};

/* 알림 예시 데이터 (설정 페이지의 알림 종류와 맞춰져 있어요) */
const THIS_MONTH = new Date().getMonth() + 1;
const NEXT_MONTH = (THIS_MONTH % 12) + 1;
const NOTIFICATIONS = [
  { id: 1, type: "pay", title: "넷플릭스 결제 예정", body: `${THIS_MONTH}월 10일에 14,500원이 국민카드로 결제돼요.`, time: "방금", unread: true, action: "캘린더 보기", to: "calendar" },
  { id: 2, type: "big", title: "큰 지출이 다가와요", body: `${THIS_MONTH}월 25일에 월세 486,400원이 빠져나가요.`, time: "1시간 전", unread: true, action: "캘린더 보기", to: "calendar" },
  { id: 3, type: "contract", title: "휴대폰 약정이 곧 끝나요", body: `${NEXT_MONTH}월 18일에 24개월 약정이 끝나요. 요금제를 확인해 보세요.`, time: "어제", unread: false, action: "내 고정지출", to: "expenses" },
  { id: 4, type: "budget", title: "예산의 90%를 넘었어요", body: `${THIS_MONTH}월 예산이 얼마 남지 않았어요. 리포트에서 확인해 보세요.`, time: "2일 전", unread: false, action: "리포트 보기", to: "report" },
  { id: 5, type: "done", title: "결제 완료", body: `${THIS_MONTH}월 1일에 관리비 182,400원이 결제됐어요.`, time: "4일 전", unread: false },
];

const NOTI_STYLE = {
  pay: { bg: "#DCEFFD", ink: "#2F7FC0", path: <><rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M16 3v4M8 3v4M3 10h18" /></> },
  big: { bg: "#FFECE3", ink: "#98583D", path: <><path d="M12 3v12M7 10l5 5 5-5" /><path d="M4 20h16" /></> },
  contract: { bg: "#FFF2D2", ink: "#8A6A12", path: <><rect x="4" y="3" width="16" height="18" rx="2.5" /><path d="M8 8h8M8 12h8M8 16h4" /></> },
  done: { bg: "#E2F7EE", ink: "#35765A", path: <><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.8 2.8L16.5 9.5" /></> },
  budget: { bg: "#EDEAFE", ink: "#7364C6", path: <><rect x="3" y="6" width="18" height="14" rx="3" /><path d="M3 10h18M16 15h2" /></> },
};

/** 알림 패널 */
function NotificationPanel({ items, onRead, onReadAll, onClose, onSettings, onGo }) {
  const unread = items.filter((n) => n.unread).length;
  return (
    <div className="gk-noti" role="dialog" aria-label="알림">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <b style={{ fontSize: 17 }}>알림</b>
          {unread > 0 && <span style={{ fontSize: 12, fontWeight: 700, background: COLORS.badge, borderRadius: 999, padding: "2px 8px" }}>새 알림 {unread}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button type="button" className="gk-noti__link" onClick={onReadAll} disabled={unread === 0}>모두 읽음</button>
          <button type="button" className="gk-noti__close" aria-label="알림 닫기" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>
      </div>

      <ul style={{ listStyle: "none", margin: 0, padding: "0 8px 8px", display: "flex", flexDirection: "column", gap: 2, maxHeight: 440, overflowY: "auto" }}>
        {items.map((n, i) => {
          const st = NOTI_STYLE[n.type];
          return (
            <li key={n.id} className="gk-noti__item" style={{ "--i": i }}>
              <button type="button" className="gk-noti__row" onClick={() => { onRead(n.id); if (n.to) onGo(n.to); }} style={{ background: n.unread ? "#F3F9FE" : "transparent" }}>
                <span style={{ width: 38, height: 38, borderRadius: 12, background: st.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={st.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{st.path}</svg>
                </span>
                <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3, textAlign: "left" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <b style={{ fontSize: 14.5, fontWeight: n.unread ? 700 : 600 }}>{n.title}</b>
                    {n.unread && <span aria-label="안 읽음" style={{ width: 7, height: 7, borderRadius: "50%", background: COLORS.accent, flexShrink: 0 }} />}
                  </span>
                  <span style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.45 }}>{n.body}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                    <span style={{ fontSize: 12, color: "#8A9098" }}>{n.time}</span>
                    {n.action && <span style={{ fontSize: 12, fontWeight: 700, color: st.ink }}>{n.action} →</span>}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div style={{ borderTop: `1px solid ${COLORS.border}`, padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button type="button" className="gk-noti__link" onClick={onSettings}>알림 설정</button>
        <span style={{ fontSize: 12, color: "#8A9098", paddingRight: 8 }}>최근 7일 알림</span>
      </div>
    </div>
  );
}


/* ───────── 항목 추가 창 ───────── */
const ADD_CATEGORIES = [
  { key: "home", name: "주거", color: "#4C8DF6", tint: "#DFEAFD" },
  { key: "phone", name: "통신", color: "#36C2CE", tint: "#DBF4F6" },
  { key: "sub", name: "구독 서비스", color: "#FF7EB3", tint: "#FFE8F1" },
  { key: "rental", name: "가전", color: "#5ED3A0", tint: "#E2F7EE" },
  { key: "insure", name: "보험", color: "#9B8AFB", tint: "#EDEAFE" },
  { key: "saving", name: "금융/저축", color: "#FFC94D", tint: "#FFF2D2" },
  { key: "transit", name: "교통", color: "#FF9466", tint: "#FFECE3" },
  { key: "car", name: "자동차", color: "#8796AA", tint: "#EEF1F5" },
  { key: "etc", name: "기타", color: "#9A8D82", tint: "#F0ECE8" },
];
const CYCLES = ["매달", "매년"];

/* 카테고리를 고르면 항목 이름 칸 안에 그 카테고리 예시가 보여요 */
const NAME_HINTS = {
  home: "월세, 관리비, 전기요금",
  phone: "휴대폰 요금, 인터넷, IPTV",
  sub: "넷플릭스, 유튜브 프리미엄, 쿠팡 와우",
  rental: "정수기, 공기청정기, 안마의자",
  insure: "실손보험, 자동차보험, 운전자보험",
  saving: "적금, 주택청약, 대출 이자",
  transit: "교통카드, 기후동행카드, 정기권",
  car: "자동차 할부, 주유비, 주차비",
  etc: "모임 회비, 학원비, 경조사비",
};

/* ───────── 결제 수단 고르기 (화살표를 누르면 카드·계좌·간편결제 목록) ───────── */
// 카드 목록 (카카오뱅크·토스뱅크·케이뱅크는 '○○ 카드' 대신 이름만)
const PAY_CARDS = ["국민카드", "신한카드", "삼성카드", "현대카드", "롯데카드", "우리카드", "하나카드", "BC카드", "NH농협카드", "카카오뱅크", "토스뱅크", "케이뱅크"];
// 카드마다 이름 첫 글자 배지 (실제 회사 로고 대신, 고정콕 색으로)
const BADGE = {
  국민카드: ["국", 0], 신한카드: ["신", 1], 삼성카드: ["삼", 2], 현대카드: ["현", 3], 롯데카드: ["롯", 4], 우리카드: ["우", 5],
  하나카드: ["하", 6], BC카드: ["BC", 7], NH농협카드: ["NH", 8], 카카오뱅크: ["카", 9], 토스뱅크: ["토", 0], 케이뱅크: ["K", 4],
};
const BADGE_COLORS = [
  ["#DFEAFD", "#3664AF"], ["#DBF4F6", "#20727A"], ["#EDEAFE", "#685CA8"], ["#EEF1F5", "#536579"], ["#FFECE3", "#98583D"],
  ["#DCEFFD", "#1D6FA8"], ["#E2F7EE", "#35765A"], ["#FFE8F1", "#9D4D6E"], ["#FFF2D2", "#5E5300"], ["#FFF8D6", "#5C5214"],
];
/* 카드사 로고 (폴더·이미지 파일 없이 코드 안에 바로 넣어요)
 * 로고가 있는 카드만 적어 두면 돼요. 없는 카드는 첫 글자 배지가 나와요. */
const CARD_LOGOS = {
  국민카드: "data:image/png;base64,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",
  신한카드: "data:image/png;base64,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",
  삼성카드: "data:image/png;base64,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",
  현대카드: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAFFUlEQVR42u2ZSUgjWxSGa7wBJVHjlERagwNREcQBsxAVkSy0QcRFb1w0biTisFYEceHChYKCgsNGEFdGFM1CQUUhqARDwKlNdxvBCTSIpZZJKjXcXlxeni/67Nc8eK28exbh5IR76nx3+E9VhYQQEu/ZKOKdGwbAABgAA2AADIABMAAGwAAYAANgAAyAATDA7zHmxSiEUFGUtzXTFEWS5PM4+fzFlqIoFPUWV+bFwiIBIIQkSXIct729LYriW9knDGM2m7VaLSrvb7cQQlxeXrZarSkpKQzD/JsXj2js0+spikKS5Is74ZUMFEXJsnx+fj48PPzx48fIdYB/mKIoiqI8PDxkZGTYbDb4xmxhYcFoNHIch+oMx/8EkGUZQuhyuQoLC9FXFAn/BCEMhUKSJEmSFAqFRFEMhUKyLKOgIAihUEgQBEmSRFEUBGF/f//8/FySpGAwGAwGRVF0OBynp6fhbMhQNkEQRFFEA1FyQRCOj4+/fv0qy7IkSRDC4uLira2tp/VACCPPhCzLNE0jRIqiRkdHR0ZGIISTk5MDAwMsy9I0TdM0y7IMw7AsS1EUCgIAWJYFANA0zTAMAKCvr292dpamaZVKpVKpGIY5Ojry+XwURR0dHbW3t9fX1w8MDKBsAACGYdBAlBwAYLPZ+vv7KYpCs46cn8soKl2SJIIgDg4OUH1er/fm5sZut8fGxmZmZi4uLubn53/79q2hoWFwcLC6unphYUGtVns8np6eHr/fPzY25nQ6a2pqHh4eBgcHr6+vP3/+nJSUBAAgCKKhoaG3tzcnJ0elUgmCMDk5ube3Z7FYtFqtw+EIBoONjY3z8/M2m62qqioso89P8M8bWVJS0tLSUlNT09zcXHp6ut1ud7lcV1dX09PTu7u7MzMzsiyPj497vd6JiYmcnJyVlRW73d7S0lJaWpqWlub3+1tbW/Pz88/OztbX16enp91uN0EQ9/f3WVlZRqNRr9e3tbU9Pj7Gx8fPzc1tbGxsbW3V1NRYrVaDwVBUVBQMBp8f618ACAQChYWFzc3NJSUlfr8/Ojpap9PFx8fHxsayLKvX62maTkxMpGk6LS2toqIiLy/v9vaW4ziLxWIymTiOOzs7q62tLS8vZxhGq9VGRUWhzGq1Gjn7+/t1dXW1tbVRUVEAgKKiIrPZfHl5+enTp5KSEkEQfrkTP10mnueTk5MLCgoMBsPd3Z1Go5mamvry5QtBEBqNZnV1dWho6OrqSpKk29tbRVF8Pp9KpeI4rq+vb3NzMzc3V5bl7u5uh8NRV1fH83wgEEDVd3V16XQ6i8Wi1+t7enrQ4QkEAjc3N2i7d3R0HB4epqamvljYC40MDXM6nc3NzS6XC204j8ejKIrJZPr+/TuEMCYmxuFw8Dw/MTGxtrZmt9v1ej1FUenp6ScnJ2azeWdnx2g0ejwenufVanVGRsbFxcXl5WVCQoLBYLi/v4+Li0tJSfF6vU6nkyTJyspKnufdbveHDx80Gg0AQBCE7Oxst9t9cXGh0+k0Go3JZEK1FRcXDw0NlZaW/qUVRMjozs5OWVnZ65Lscrk6Ozv/yyaAVLGsrGx7eztCRiNvJURR5DguMTExvCxIAZBDkqSiKKIoAgCQUqGZIEkSaRfqtegzHEeLiXzkoILC2hIhLyhPOBiebJ/PFxMTg3TstZu5d/888E+Qfgv2ixcl8f/EGAADYAAMgAEwAAbAABgAA2AADIABMAAGwAD/S4Af50w9xQ2/CSsAAAAASUVORK5CYII=",
  롯데카드: "data:image/png;base64,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",
  우리카드: "data:image/png;base64,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",
  하나카드: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAKIUlEQVR42u1aW2xdV9H+Ztba+9yPfWzn7qSNIektaUkaKAXSFigVAgSVuAkkBDzAA+X+SwjEL6Ef8YDUB65CwBMg9bEgUEGoIBS1KaIFAm2hUdO0kFudxrGP7eTc9t5rvv9hHzt3WurjJpGyHyzreHud+dbMfPPNrCUkcTk/isv8uQLgCoArAC7zxy/LqkaSIgIAIADocu2UDL4OGKFyuXqAZlQ9uf9Q94FH7OnntZOISvSuN9TvfpMAsgzA/GCtN9XZ+3fP/M/3asfmIqiqC+3u9J/3lt62PapVZBmcowOMHBGZf+KZ7qe+MzbfjUeGZLjCejFaVSvOt8NzxwBgGWTL4ACQFOn95MFodlbKBU1SBGMIBOMXZmd+8msAdunSKAkRAnJgKvaxmZkAoACkForF8NDfk/mOOB24EwaYAwSEhShYloe55B8BBHwxpncgIPIy1jWjkVBEosvjARGQCuDOm7oWnCpUhCIQxFGv3cHOLYVyTON/G5WZmZBOJXJ6rvUXBGBEIAMtkMaX5nZVGoc+8Ba+e2fv6AySVGAuBE7Ondy2sXHP+0m+lN03ICMzC8FMRLwqRf40efhrf9z1i3/v4zlEcJ5CllqI1J0R36SJkIRAICBEzzaGpJmZSJhvT997n/1qt823o0IBt95U+7+PVq9eDTM5Xz0mwfw7CAGcKKRPyv+ca+46dPD+fz312PGj7fnOhnr56Y98uhjHBAVyAQAkRA60Tu6fPZ4SZR+NV2prKrXSmfxNBlIIydcSAUkSQppXD+lOzSVTM75RK6wZEwBZEK9CIQjkFkMIAQQUVSwY1Ex7e6en/3D4wK7DB/5y/IW5pAsfQ1HM0m/ecsdnX/NaAHLa7p0BIBcw9+1/6ku7fvd82gUhzo1FpfWV+kSjdk11eFN9+FXDI+uGh1eXSiUXnT8IghEU5/L8Y0gBqApEADk3aJOQTbbb+5rTT0y/sOf40b82jz/bbGZpCol8sQxY1uteWx269/Y733XVxGkS6xwAOWPM9Hrb7vvRwU6IynGgkUIDLMAMlgBQQaNQGq/WJoYam6rD4/WhNbXKqmJpqFAZiqKyd8U4jqACKHKjjWQGJmnSzmw+S2Z73alu+2B77vDciWeac/vmZw7PzTXTDgg4wEXeR7EUEutl3VYtKt9z3bbP73jdqlIpzULk3QVpNAd35OTcsRBc0QVLQBVARMSrQCERyUCbNkw3m49PH4flQUARLUZR0fmq81UfFxQgit4557tZGsx60F6StLOkxawd0hAymMEE6qEeTrVQ8eqcWjBJsiTLZuuF6IPXb/30TbfcOLISQEaea/156sBQsVxx8UxIoYteQd9LeZgDIhTvReMFxqKBHbIT0mYW0On0PWrWZ30CqhDJQ14QiY+9U5E8jRRAIkjSBL0UKjc0Rt736s3v23z9lsYogBBMVP0FKOwUABUhOV6p3rF2/P5nny6UygkD0E+7/EefHwiCsNCvAHkRhgAQBdRJ/rLLze03CAAkl6NORMQRFkLPiJCCCVQm6o3bNo+/96pNd4xfVY0jgJkFEVX3nwTgGUlspAr2Nptv+flPj4YQ+VJm4VwAZ/wuch6VxoW/C1RUIDlLWu4WZMhSBMJHa8r1LSMrbl218o2r1u1YuXqkVFogAiPhVOTFasfZNGqkivz+yKGP/f6XR06242I5IBiZs8diCC0WwfwLBAKKgKogQFpGwgACIUNIIA4iUexWFSvrK7VN9fqNoytvXLnm+kZjXbl6GoEFQpyqLOTky+nIspB65/7RnP3i7gd/d+AQvPoogpwBgABBW7SShmAIAaIAISi6qB7HY6Xq2kppU616VWN0ojq8sV4fr9ZXFIrOudM6IOSWivz3Oun8LSWZMos0ysif7X38O0/ueWLqOISggoQYzEEDVCLny87XC+VGVFhRKa6qlseL9Q3V6nilvKEyNFauDBXL1cjr2ctbzkACiEBfpuUv1hMHUgERaffS3x587pHJA0fT3nBUHCkXR6PKyjheUa4Ml4rDhXgkLlfiuOjcf1I4ZhnpVARQ0VeqqScyM6f6ohtEWhos9r4V0l2HDu4+cmjv7Eyr1y0VC68aqt+25uq3bbi66qNcn+kiN71iU4lA0myRYFTyEpvXCAAIsEjdb57b//U9ux89dhQBcNJXPTDQbR0d+/LNt3xo8xYJWVB1g3PCUscqBM3MqfvaX3Z/49GHTWMfF4SEwJDnM+Ak62YInU9s2f7dnXfFaoQMCsNSAWQWvLpv/e2xLz7yB1euCZnlBW6BYfP1naqIZifmPnnD9h+99e1ZCPpSQnO5e2Ijvbo9U0e/+thDvlQTMNAuoFAtWBZX6z9+6m8/2PuE925QAzVdSh+fF+kf7nm0k5lIloVssVB4hVN1qioU6RN9oEmx8I0/PzzZbqlov8ZfNACgEz3cav36+UMS+3BavysiWdLL2q2s07ZTgggGc95Pzs/9dO+TIjC7yAAA4KmZqeeTE6KO0L6sELE0vHPd1ffuvPNTW7fVLTMG7YtCBUVi/8CBZzNyIDnglzgLerY5g8Q00kACoiLW69yzdfv3b7szf+uu9es//OADXd8XUAZA42dOzB7rtNaWq8RSS8JSPdAKKVRhQlIIgzUK8Re27QDZDaEb0vdsvPb919xova5Tlzf+UD2RpNPt9qlO42JO5vIwkAXeZLZ+aHRNqRYQIqe50e8Yn0AWrF8UQLNgFi46C+WWj1XKUCdYkL4ZVJ2KCFUIJURkolaJirEZ+6+Jc3mXerE9IABeMzxa9HHIex4h1DVbJ1pJT0UWSbJciKLI5f8gEFioxb5eKJ41IHmlAShAcsvoyptHRi3tRXlWq5tOWlOdExDpD4yAXIdLzkICWLYiroyWKzC7uCEkJLzqV7bdgtBLECLxlCBEKSrwtKMMM6MFhaDfFummkZGKuoABqNIlJbGqBLN3Tmz+9s63j1CS7gntnPzMDTvGq0OBJgtMdbKXJFngwiwQIexYvbK/B0sOoaWO1506M37uppvv2jDxj6ljY7Xy7avHFQZV9qeNMtlthWAuIsEAjdTeMLYWGExTMIDzgdwP1zUa1zUaABgCdSF8CABHTs5CmAedZWFjfXjHirUcUCUejCh3qgQDaaQ4t6gpcgv3Tc+CIqKOgjR984aJWiE2s0vrhEYg7pwNVaGRTzZnIAoyE/FePrzxGgAUudSvGhgp0Olu57nWLLwHaWn3jStWv37tOpJ+QGf3ywiAIET2z85Mtloq3kSRpR/fui12zmiXw2UPAsDjx6bSLCuqWNLbvmrN3Rs3hWAievE7spekNICHjh1WFXMiWfa/N986FMUGk0v9tsrCnLiZ9B6ePGIad1uzH9+y7e6Ja4NZ5DwufQAEILpvtqlOx2uVTaWxb956B2gicslftzlj6GKBBFnw/tR5yWUE4CxSksHbv/xXznjqPEQunytn53ARrlz6uwLgCoArAM7//D+kWmM9ZvDOTQAAAABJRU5ErkJggg==",
  BC카드: "data:image/png;base64,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",
  NH농협카드: "data:image/png;base64,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",
  카카오뱅크: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAADkklEQVR42u2aPWwcRRiG329m9nx3vvPGf4QgRSnswgpNUhAkkICkQFikcJSkonJBFQmlQYqpoMGAhJAoKIEGClJRoEgUxKJAiqgowAWmiIIECBvf2nt/uzvzUgRBk1x8Y857K+3032mene/9fk/4q6DIR6HgpwQoAUqAEqAEKAFKgBLgEMccxpgEObSVCETGAYAQQ/H4gUxcChJKQ3IDIGDYauntHX3wz0lAK8zN2Oa8hQH2xDkodeQAJKDY7atLrx7f/DmoBHQHdiStMXPMLS0kK8udKxfbukYbi9b+AOLR0JCQgDvb5tnLT+zHCMxwSsgy6fWRpHLubP/9N/86c7ZvI38G//cThSCgh2EQMJzi8Tn3w4+Vl195/PY3NR3S2TzCKOlpZS3SDOEUCaxen9/arKg6nStaHsgy1KqMYnVjfZpSzESWZZiechvfVb+/U1UNn0cYIYASaA2todUj8lqayq2NOgI4Hm0mHnytbk+SBBCIYLLOh6ULEsZgcytAAiXjAaA1dyO1eiVeWelkbbQ76vW3Z+K2GP0A3RNQmjs7gtSnxDAj+vxJIqcXk+eWu4iQRrL23jQfrlMSk5Oe7qxG6EJ9sRFsJNG+GhBwlSDL5NTJDBPwELEZtYjxKBHff4Hnz/UKGUaVQrcnC6fSF8932BaPwi5nAK0YxbJ2LWrMOecl4jwBlODeb+a11f2rV2Pves7kdXsR9Pry7tru9WstG4tWxSwl/otOLBoAieoEb7wzvfbWrG7QsoAv4IiTJ+yHHzdvftHQIa0toAtZi7DJ9Y+OxdtKBT4NRs4AjqhV+ctd8/XtukyOWTntCGthLewBrrVxp5rDYGuwRmsT1CEAhnADMpQjgoB37xn0fUYsZkS3r1T401bl21u1++V0lskABhF0OoAbmxewVsImP/+y8enNxr8NjVYP1qgAzsrsLBGAydDVxChdqMp6/Z8kNUAGIsgynF5MUYGLhxalGamIYQ+EagK+9EIHqU9LmXMYNQa7e+rCM72nnu65uGjltDHo9iRsuvU3diWXUsJvzC8CrREYRHsiwCcf/Lm4lLiOqCPuiemQpj6GaSrRnvpjW515Mvnqs9/PX+jaSJQ+2v0ALWoNd2LetlqBluHG64/N2aWF5NJy5/LFtp7gYUbTnuP1sVpwiP8fnggYoqgrJgACZsLUR8RKjceW8v/dN5aL7hKgBCgBSoASoAQoAUqAYc/fSkKLiq3D+i0AAAAASUVORK5CYII=",
  토스뱅크: "data:image/png;base64,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",
  케이뱅크: "data:image/png;base64,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",
};
const brokenLogos = new Set(); // 한 번 못 불러온 로고는 다시 시도하지 않아요
const CardIcon = ({ name = "" }) => {
  const logo = CARD_LOGOS[name];
  const [failed, setFailed] = useState(!logo || brokenLogos.has(logo));
  const [txt, ci] = BADGE[name] || [name.trim().slice(0, 1) || "?", [...name].reduce((n, ch) => n + ch.charCodeAt(0), 0) % BADGE_COLORS.length];
  const [bg, ink] = BADGE_COLORS[ci];
  if (!failed) {
    return (
      <span aria-hidden="true" style={{ width: 30, height: 30, borderRadius: 9, background: "#FFFFFF", boxShadow: "inset 0 0 0 1px #EEF0F2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
        <img src={logo} alt="" width={30} height={30} style={{ width: "100%", height: "100%", objectFit: "contain" }}
          onError={() => { brokenLogos.add(logo); setFailed(true); }} />
      </span>
    );
  }
  return (
    <span aria-hidden="true" style={{ width: 30, height: 30, borderRadius: 9, background: bg, color: ink, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      fontSize: txt.length > 1 ? 11 : 13.5, fontWeight: 800, letterSpacing: "-0.3px" }}>{txt}</span>
  );
};

function PayPicker({ value, onChange, recent = [], inputStyle }) {
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false); // 아래 공간이 모자라면 위로 펼쳐요
  const [typed, setTyped] = useState(false); // 직접 쓰는 중이면 그 글자로 찾아요
  const boxRef = useRef(null);
  const inputRef = useRef(null);

  const q = typed ? value.trim() : "";
  const norm = (t) => t.replace(/\s/g, "").toLowerCase();
  // 최근에 쓴 결제 수단을 맨 위로, 나머지는 카드 목록 (겹치는 건 한 번만)
  const recentTop = recent.slice(0, 4);
  const list = [...recentTop, ...PAY_CARDS.filter((m) => !recentTop.includes(m))].filter((m) => !q || norm(m).includes(norm(q)));

  const show = () => {
    const r = boxRef.current?.getBoundingClientRect();
    setUp(r ? window.innerHeight - r.bottom < 310 && r.top > 310 : false);
    setOpen(true);
  };
  const choose = (m) => { onChange(m); setTyped(false); setOpen(false); };

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (!boxRef.current?.contains(e.target)) setOpen(false); };
    // 목록이 열려 있으면 ESC는 목록만 닫아요 (항목 추가 창은 그대로)
    const onKey = (e) => { if (e.key === "Escape") { e.stopPropagation(); setOpen(false); } };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey, true);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey, true); };
  }, [open]);

  return (
    <div ref={boxRef} style={{ position: "relative" }}>
      <input id="gk-add-pay" ref={inputRef} className="gk-input" autoComplete="off" maxLength={20} placeholder="예) 국민카드, 카카오뱅크"
        role="combobox" aria-expanded={open} aria-controls="gk-pay-list" aria-autocomplete="list"
        style={{ ...inputStyle, paddingRight: value ? 84 : 52, cursor: "text" }}
        value={value} onFocus={show} onClick={show}
        onChange={(e) => { onChange(e.target.value); setTyped(true); if (!open) show(); }} />
      {value && (
        <button type="button" className="gk-pay-clear" aria-label="결제 수단 지우기" onClick={() => { onChange(""); setTyped(false); inputRef.current?.focus(); }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
      )}
      <button type="button" className="gk-pay-arrow" aria-label={open ? "결제 수단 목록 닫기" : "결제 수단 목록 열기"} aria-expanded={open}
        onMouseDown={(e) => e.preventDefault()} onClick={() => (open ? setOpen(false) : (inputRef.current?.focus(), show()))}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
          style={{ transition: "transform .2s", transform: open ? "rotate(180deg)" : "none" }}><path d="m6 9 6 6 6-6" /></svg>
      </button>

      {open && (
        <div id="gk-pay-list" className="gk-pay-panel" role="listbox" style={up ? { bottom: "calc(100% + 8px)" } : { top: "calc(100% + 8px)" }}>
          <div className="gk-pay-scroll">
            {list.length === 0 && (
              <div style={{ padding: "22px 12px", textAlign: "center", fontSize: 13.5, color: COLORS.muted, lineHeight: 1.6 }}>
                목록에 없어요.<br /><b style={{ color: COLORS.text }}>'{value.trim()}'</b> 그대로 저장할게요.
              </div>
            )}
            {list.map((m) => {
              const on = value === m;
              return (
                <button key={m} type="button" role="option" aria-selected={on} className="gk-pay-opt" onMouseDown={(e) => e.preventDefault()} onClick={() => choose(m)}>
                  <CardIcon name={m} />
                  <span style={{ flex: 1, textAlign: "left", fontWeight: on ? 700 : 500 }}>{m}</span>
                  {recentTop.includes(m) && <span style={{ fontSize: 11.5, color: COLORS.muted }}>최근</span>}
                  {on && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5CB8F2" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function AddItemModal({ onClose, onSubmit, payMethods = [] }) {
  const [closing, setClosing] = useState(false);
  const [form, setForm] = useState({ category: "sub", name: "", amount: "", amountType: "fixed", day: "", cycle: "매달", month: new Date().getMonth() + 1, payMethod: "", remind: true });
  const nameRef = useRef(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const close = () => { setClosing(true); setTimeout(onClose, 180); };
  const amountNum = Number(form.amount.replace(/[^0-9]/g, ""));
  const dayNum = Number(form.day);
  const valid = form.name.trim() && amountNum > 0 && dayNum >= 1 && dayNum <= 31;

  useEffect(() => {
    nameRef.current?.focus();
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;
    onSubmit({ ...form, name: form.name.trim(), payMethod: form.payMethod.trim(), amount: amountNum, day: dayNum, month: Number(form.month) });
    close();
  };

  const label = { fontSize: 14, fontWeight: 600, color: COLORS.text };
  const input = { height: 48, borderRadius: 14, border: `1.5px solid ${COLORS.border}`, background: "#F7F9FA", padding: "0 16px", fontSize: 16, fontFamily: "inherit", color: COLORS.text, outline: "none", width: "100%", boxSizing: "border-box" };

  return createPortal(
    <div className={`gk-modal ${closing ? "is-closing" : ""}`} onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <form className="gk-modal__box" role="dialog" aria-modal="true" aria-labelledby="gk-add-title" onSubmit={submit} style={{ fontFamily: FONT }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h2 id="gk-add-title" style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: "-0.6px" }}>고정지출 항목 추가</h2>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: COLORS.muted }}>매달 나가는 돈을 등록하면 결제일에 맞춰 알려드려요.</p>
          </div>
          <button type="button" className="gk-noti__close" aria-label="닫기" onClick={close}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>

        <fieldset style={{ border: 0, margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          <legend style={{ ...label, padding: 0, marginBottom: 10 }}>카테고리</legend>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {ADD_CATEGORIES.map((c) => {
              const on = form.category === c.key;
              return (
                <button key={c.key} type="button" className="gk-chip" aria-pressed={on} onClick={() => set("category", c.key)}
                  style={{ background: on ? c.tint : "#FFFFFF", boxShadow: on ? `inset 0 0 0 2px ${c.color}` : `inset 0 0 0 1.5px ${COLORS.border}`, fontWeight: on ? 700 : 500 }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: c.color }} />
                  {c.name}
                </button>
              );
            })}
          </div>
        </fieldset>

        <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={label}>항목 이름</span>
          <input id="gk-add-name" ref={nameRef} className="gk-input" style={input} placeholder={`예) ${NAME_HINTS[form.category] || "넷플릭스, 월세, 휴대폰 요금"}`} value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={30} />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 28 }}>
              <label htmlFor="gk-add-amount" style={label}>{form.amountType === "variable" ? "예상 금액" : "금액"}</label>
              <div className="gk-amt-seg" role="group" aria-label="금액 종류">
                {[["fixed", "고정"], ["variable", "변동"]].map(([v, t]) => (
                  <button key={v} type="button" aria-pressed={form.amountType === v} onClick={() => set("amountType", v)}>{t}</button>
                ))}
              </div>
            </div>
            <div style={{ position: "relative" }}>
              <input id="gk-add-amount" className="gk-input" inputMode="numeric" style={{ ...input, paddingRight: 44, textAlign: "right", fontWeight: 700 }} placeholder={form.amountType === "variable" ? "예상 금액" : "0"}
                value={amountNum ? amountNum.toLocaleString("ko-KR") : ""} onChange={(e) => set("amount", e.target.value)} />
              <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: COLORS.muted }}>원</span>
            </div>
          </div>
          <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ ...label, minHeight: 28, display: "flex", alignItems: "center" }}>결제일</span>
            <div style={{ display: "flex", gap: 8 }}>
              <select id="gk-add-cycle" className="gk-input" style={{ ...input, width: 78, padding: "0 8px", flexShrink: 0 }} value={form.cycle} onChange={(e) => set("cycle", e.target.value)}>
                {CYCLES.map((c) => <option key={c}>{c}</option>)}
              </select>
              {form.cycle === "매년" && (
                <select id="gk-add-month" className="gk-input" aria-label="결제 월" style={{ ...input, width: 70, padding: "0 6px", flexShrink: 0 }} value={form.month} onChange={(e) => set("month", e.target.value)}>
                  {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}월</option>)}
                </select>
              )}
              <div style={{ position: "relative", flex: 1 }}>
                <input id="gk-add-day" className="gk-input" inputMode="numeric" style={{ ...input, paddingRight: 34, textAlign: "right", fontWeight: 700 }} placeholder="10"
                  value={form.day} onChange={(e) => set("day", e.target.value.replace(/[^0-9]/g, "").slice(0, 2))} />
                <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: COLORS.muted }}>일</span>
              </div>
            </div>
          </label>
        </div>

        <p style={{ margin: "-8px 0 0", fontSize: 13, lineHeight: 1.5, color: form.amountType === "variable" ? "#2F7FC0" : COLORS.muted, display: "flex", gap: 6 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
          매달 금액이 달라지면 예상 금액으로 넣고, 결제 후에 실제 금액으로 고칠 수 있어요
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label htmlFor="gk-add-pay" style={label}>결제 수단 <span style={{ fontWeight: 400, color: COLORS.muted }}>(선택)</span></label>
          <PayPicker value={form.payMethod} onChange={(v) => set("payMethod", v)} recent={payMethods} inputStyle={input} />
        </div>

        <label className="gk-toggle-row">
          <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={label}>결제 3일 전에 알림 받기</span>
            <span style={{ fontSize: 13, color: COLORS.muted }}>사이드바 알림으로 미리 알려드려요</span>
          </span>
          <input id="gk-add-remind" type="checkbox" checked={form.remind} onChange={(e) => set("remind", e.target.checked)} className="gk-switch" />
        </label>

        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <button type="button" className="gk-btn gk-btn--ghost" onClick={close}>취소</button>
          <button type="submit" className="gk-btn gk-btn--primary" disabled={!valid}>추가하기</button>
        </div>
      </form>
    </div>,
    document.body
  );
}

function Toast({ text, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return createPortal(
    <div className="gk-toast" role="status" style={{ fontFamily: FONT }}>
      <span style={{ width: 24, height: 24, borderRadius: "50%", background: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
      </span>
      {text}
    </div>,
    document.body
  );
}

const MENU_ITEMS = [
  { key: "home", label: "홈", icon: Icons.home },
  { key: "expenses", label: "내 고정지출", icon: Icons.expenses },
  { key: "calendar", label: "결제 캘린더", icon: Icons.calendar },
  { key: "report", label: "지출 리포트", icon: Icons.report },
  { key: "settings", label: "설정", icon: Icons.settings },
];

/** 캘린더 + 메모지 + 압정 로고 그림 */
export function LogoMark({ size = 36 }) {
  const uid = useId().replace(/:/g, "");
  const clipId = `gk-clip-${uid}`;
  const shadowId = `gk-shadow-${uid}`;
  return (
    <svg width={size} height={size} viewBox="270 110 450 450" aria-hidden="true">
      <defs><clipPath id={clipId}><rect x="350" y="200" width="330" height="320" rx="44" /></clipPath><filter id={shadowId} x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="14" stdDeviation="16" floodColor="#1C2A3A" floodOpacity="0.14" /></filter></defs><g transform="rotate(-9 470 340)" filter={`url(#${shadowId})`}><rect x="300" y="170" width="320" height="320" rx="40" fill="#FFE57A" /></g><g transform="rotate(6 515 360)" filter={`url(#${shadowId})`}><rect x="350" y="200" width="330" height="320" rx="44" fill="#FFFFFF" /><g clipPath={`url(#${clipId})`}><rect x="350" y="200" width="330" height="78" fill="#5CB8F2" /></g><rect x="412" y="180" width="18" height="44" rx="9" fill="#2A2F38" /><rect x="600" y="180" width="18" height="44" rx="9" fill="#2A2F38" /><g fill="#DCEFFD"><rect x="384" y="306" width="44" height="40" rx="11" /><rect x="440" y="306" width="44" height="40" rx="11" /><rect x="552" y="306" width="44" height="40" rx="11" /><rect x="608" y="306" width="44" height="40" rx="11" /><rect x="384" y="358" width="44" height="40" rx="11" /><rect x="440" y="358" width="44" height="40" rx="11" /><rect x="496" y="358" width="44" height="40" rx="11" /><rect x="552" y="358" width="44" height="40" rx="11" /><rect x="608" y="358" width="44" height="40" rx="11" /><rect x="384" y="410" width="44" height="40" rx="11" /><rect x="440" y="410" width="44" height="40" rx="11" /><rect x="496" y="410" width="44" height="40" rx="11" /><rect x="552" y="410" width="44" height="40" rx="11" /><rect x="384" y="462" width="44" height="34" rx="11" /><rect x="440" y="462" width="44" height="34" rx="11" /></g><rect x="496" y="306" width="44" height="40" rx="11" fill="#FFD43B" /></g><ellipse cx="530" cy="338" rx="16" ry="6" fill="#1C2A3A" opacity="0.18" /><g transform="rotate(38 600 220)"><rect x="596" y="232" width="8" height="120" rx="4" fill="#9AA6B2" /><path d="M572 170 L628 170 L622 222 L578 222 Z" fill="#2A2F38" /><rect x="556" y="216" width="88" height="24" rx="12" fill="#2A2F38" /><rect x="566" y="128" width="68" height="50" rx="25" fill="#2A2F38" /><rect x="580" y="138" width="22" height="10" rx="5" fill="#FFFFFF" opacity="0.35" /></g>
    </svg>
  );
}

/** "고정콕" 글씨 (주아체 모양을 도형으로 변환) */
export function Wordmark({ height = 26 }) {
  return (
    <svg height={height} viewBox="44 144 942 339" role="img" aria-label="고정콕" style={{ display: "block" }}>
      <path fillRule="evenodd" fill={COLORS.text} d="M640 341 L632 341 L626 339 L623 337 L617 332 L613 324 L611 312 L611 269 L611 268 L589 268 L571 267 L565 266 L561 264 L557 261 L554 258 L552 253 L552 248 L552 240 L553 235 L554 233 L557 230 L562 226 L565 225 L571 224 L611 223 L611 222 L611 176 L611 172 L613 163 L616 157 L621 152 L628 149 L635 148 L639 149 L646 150 L651 153 L655 156 L657 159 L659 165 L660 179 L660 316 L658 325 L655 331 L653 334 L648 338 L644 340 L640 341Z M398 327 L391 327 L386 326 L380 323 L378 321 L375 318 L374 315 L374 309 L375 304 L377 300 L379 297 L393 282 L443 233 L443 233 L443 202 L443 200 L405 201 L395 200 L389 199 L383 197 L379 194 L376 191 L373 184 L372 180 L372 170 L373 166 L376 162 L381 159 L392 157 L524 156 L541 157 L551 158 L560 161 L566 166 L569 169 L570 172 L571 175 L571 180 L570 188 L568 192 L565 195 L564 196 L552 200 L545 201 L500 200 L499 202 L499 216 L499 233 L500 234 L533 263 L553 285 L558 291 L563 298 L567 307 L568 311 L567 317 L565 321 L562 323 L558 325 L554 326 L548 327 L540 326 L536 325 L525 320 L519 316 L511 310 L496 296 L478 277 L471 271 L452 290 L437 305 L432 310 L426 315 L418 320 L410 324 L404 326 L398 327Z M300 362 L292 362 L281 358 L277 355 L275 352 L271 343 L270 337 L266 301 L266 273 L264 253 L264 231 L262 225 L260 222 L258 220 L256 219 L250 219 L186 219 L125 220 L119 219 L92 219 L81 217 L76 215 L74 213 L72 211 L68 205 L67 201 L66 194 L67 188 L69 182 L72 178 L76 174 L80 171 L94 166 L105 165 L134 163 L191 163 L276 164 L289 165 L302 167 L310 171 L313 176 L316 182 L317 186 L319 196 L320 247 L319 279 L319 335 L317 345 L313 353 L308 358 L300 362Z M91 445 L80 445 L70 444 L62 442 L55 438 L51 434 L49 431 L47 424 L48 417 L49 412 L51 408 L55 404 L60 400 L66 398 L77 397 L156 396 L156 395 L156 312 L156 307 L158 300 L164 292 L168 288 L172 286 L180 285 L190 285 L194 286 L198 288 L205 294 L208 299 L209 301 L209 307 L210 335 L210 395 L211 396 L214 396 L269 396 L303 396 L315 396 L329 396 L337 398 L343 400 L349 404 L351 407 L354 411 L355 415 L356 420 L355 428 L353 434 L351 436 L347 440 L342 442 L334 444 L96 444 L91 445Z M544 473 L518 473 L496 472 L481 471 L466 469 L447 465 L437 462 L428 458 L421 454 L414 449 L407 443 L404 439 L400 431 L398 424 L397 412 L398 401 L399 396 L404 386 L407 382 L414 375 L421 370 L429 365 L439 361 L456 356 L466 354 L488 351 L506 350 L531 350 L561 350 L590 352 L604 354 L623 359 L635 364 L646 371 L654 379 L658 385 L662 394 L664 404 L664 419 L662 429 L658 438 L654 443 L648 449 L640 455 L632 459 L622 463 L607 467 L596 469 L581 471 L566 472 L544 473Z M580 430 L586 429 L595 427 L601 425 L605 422 L609 418 L610 415 L610 409 L608 405 L605 401 L596 397 L585 394 L572 392 L542 391 L504 392 L492 392 L479 394 L467 397 L461 400 L458 402 L454 407 L453 411 L454 415 L455 417 L459 420 L462 422 L473 426 L483 428 L503 430 L531 431 L559 431 L580 430Z" />
      <path fillRule="evenodd" fill={COLORS.accent} d="M925 298 L917 298 L910 296 L904 293 L899 289 L896 284 L895 277 L894 274 L894 259 L894 258 L893 258 L735 257 L728 256 L721 253 L716 249 L713 245 L711 241 L709 238 L709 233 L710 228 L713 224 L717 220 L723 217 L734 215 L778 213 L893 214 L894 214 L894 213 L893 197 L893 196 L880 195 L776 193 L750 194 L735 193 L723 192 L719 191 L715 189 L712 186 L708 182 L706 177 L705 172 L706 165 L707 162 L710 158 L714 155 L720 152 L725 150 L734 148 L747 147 L876 147 L913 148 L925 148 L931 150 L935 152 L940 156 L944 162 L946 166 L948 173 L949 180 L950 234 L949 257 L946 277 L942 288 L939 292 L936 294 L930 297 L925 298Z M728 349 L711 348 L706 347 L700 344 L694 339 L690 335 L689 332 L688 327 L689 321 L693 314 L697 310 L701 308 L712 305 L751 304 L779 305 L779 304 L779 283 L780 279 L782 275 L786 271 L790 268 L798 265 L803 264 L812 264 L822 266 L826 268 L831 273 L833 276 L834 279 L836 294 L836 304 L837 305 L927 304 L949 305 L957 305 L966 307 L973 310 L978 315 L980 318 L981 321 L981 326 L981 331 L979 337 L977 340 L972 344 L967 346 L955 348 L728 349Z M944 478 L935 478 L930 477 L924 474 L920 471 L918 468 L916 462 L915 457 L914 425 L913 420 L913 419 L904 418 L887 418 L721 418 L717 417 L712 414 L707 411 L705 408 L704 404 L704 396 L704 391 L706 385 L709 380 L714 375 L718 373 L726 372 L926 372 L938 372 L946 374 L951 376 L955 379 L958 383 L960 388 L961 455 L960 463 L957 470 L952 475 L948 477 L944 478Z" />
    </svg>
  );
}

const css = `
.gk-sidebar__item{display:flex;align-items:center;gap:12px;width:100%;height:48px;padding:0 14px;border:0;border-radius:14px;background:transparent;color:${COLORS.muted};font:inherit;font-size:16px;font-weight:500;text-align:left;cursor:pointer;transition:background .15s,color .15s}
.gk-sidebar__item:hover{background:#F3F8FC;color:${COLORS.text}}
.gk-sidebar__item[aria-current="page"]{background:${COLORS.activeBg};color:${COLORS.text};font-weight:600}
.gk-sidebar__add{transition:filter .15s}
.gk-sidebar__add:hover{filter:brightness(0.97)}
.gk-sidebar button:focus-visible{outline:2px solid ${COLORS.accent};outline-offset:2px}
.gk-bell{transition:background .15s,transform .15s}
.gk-bell:hover{background:#E6EEF5 !important}
.gk-bell[aria-expanded="true"]{background:${COLORS.activeBg} !important;color:${COLORS.text} !important}
.gk-noti{position:absolute;left:calc(100% + 32px);bottom:0;width:380px;background:#FFFFFF;border-radius:22px;box-shadow:0 2px 6px rgba(11,42,69,.06),0 24px 60px rgba(11,42,69,.18);transform-origin:bottom left;animation:gkNotiIn .32s cubic-bezier(.22,1,.36,1) both;z-index:50;text-align:left;color:${COLORS.text}}
.gk-noti__item{animation:gkNotiItem .4s cubic-bezier(.22,1,.36,1) both;animation-delay:calc(60ms + var(--i) * 45ms)}
.gk-noti__row{display:flex;gap:12px;width:100%;padding:12px;border:0;border-radius:14px;font:inherit;color:inherit;cursor:pointer;transition:background .15s}
.gk-noti__row:hover{background:#F3F5F7 !important}
.gk-noti__link{border:0;background:none;font:inherit;font-size:13px;font-weight:600;color:${COLORS.muted};padding:6px 8px;border-radius:8px;cursor:pointer}
.gk-noti__link:hover:not(:disabled){background:#F3F5F7}
.gk-noti__link:disabled{opacity:.4;cursor:default}
.gk-noti__close{width:30px;height:30px;border:0;border-radius:50%;background:none;color:${COLORS.muted};display:flex;align-items:center;justify-content:center;cursor:pointer}
.gk-noti__close:hover{background:#F3F5F7}
@keyframes gkNotiIn{from{opacity:0;transform:translateX(-8px) scale(.96)}to{opacity:1;transform:none}}
@keyframes gkNotiItem{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes gkBadgePop{0%{transform:scale(.6)}60%{transform:scale(1.15)}100%{transform:scale(1)}}
.gk-profile{display:flex;align-items:center;gap:10px;flex:1;min-width:0;padding:6px;margin:-6px;border:0;border-radius:14px;background:transparent;font:inherit;color:inherit;text-align:left;cursor:pointer;transition:background .15s}
.gk-profile:hover{background:#F3F8FC}
.gk-menu{width:280px}
.gk-menu__item{height:44px;padding:0 12px;border:0;border-radius:12px;background:none;font:inherit;font-size:15px;font-weight:600;color:${COLORS.text};text-align:left;cursor:pointer}
.gk-menu__item:hover{background:#F3F5F7}
.gk-logo{transition:transform .15s}
.gk-logo:hover{transform:scale(1.03)}
.gk-logo:active{transform:scale(.97)}
.gk-modal{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(11,42,69,.32);backdrop-filter:blur(3px);animation:gkFadeIn .22s ease both}
.gk-modal.is-closing{animation:gkFadeOut .18s ease both}
.gk-modal__box{width:520px;max-width:100%;background:#FFFFFF;border-radius:28px;padding:28px;box-sizing:border-box;display:flex;flex-direction:column;gap:20px;box-shadow:0 30px 80px rgba(11,42,69,.28);color:${COLORS.text};animation:gkModalIn .34s cubic-bezier(.22,1,.36,1) both}
.gk-modal.is-closing .gk-modal__box{animation:gkModalOut .18s ease both}
.gk-chip{display:flex;align-items:center;gap:7px;height:38px;padding:0 14px;border:0;border-radius:999px;font:inherit;font-size:14px;color:${COLORS.text};cursor:pointer;transition:background .15s,box-shadow .15s,transform .1s}
.gk-chip:active{transform:scale(.96)}
.gk-pay-arrow{position:absolute;right:6px;top:6px;width:36px;height:36px;border:0;border-radius:10px;background:transparent;color:${COLORS.muted};display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s,color .15s}
.gk-pay-arrow:hover,.gk-pay-arrow[aria-expanded="true"]{background:#E6EEF5;color:${COLORS.text}}
.gk-pay-clear{position:absolute;right:46px;top:13px;width:22px;height:22px;border:0;border-radius:50%;background:#D5DCE3;color:#FFFFFF;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0}
.gk-pay-clear:hover{background:#A9B3BD}
.gk-pay-panel{position:absolute;left:0;right:0;z-index:5;background:#FFFFFF;border-radius:18px;box-shadow:0 18px 44px rgba(11,42,69,.18),0 0 0 1px rgba(11,42,69,.06);overflow:hidden;animation:gkPayIn .18s cubic-bezier(.22,1,.36,1) both}
@keyframes gkPayIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
.gk-pay-scroll{max-height:280px;overflow-y:auto;padding:6px}
.gk-pay-opt{display:flex;align-items:center;gap:12px;width:100%;height:46px;padding:0 10px;border:0;border-radius:12px;background:transparent;font:inherit;font-size:14.5px;color:${COLORS.text};cursor:pointer;transition:background .12s}
.gk-pay-opt:hover{background:#F3F8FC}
.gk-pay-opt[aria-selected="true"]{background:#EAF6FE}
.gk-amt-seg{display:flex;padding:3px;gap:2px;background:#F1F4F7;border-radius:10px}
.gk-amt-seg button{height:24px;padding:0 10px;border:0;border-radius:7px;background:transparent;font:inherit;font-size:12.5px;font-weight:600;color:${COLORS.muted};cursor:pointer;transition:background .15s,color .15s}
.gk-amt-seg button[aria-pressed="true"]{background:#FFFFFF;color:${COLORS.text};box-shadow:0 1px 3px rgba(11,42,69,.12)}
.gk-input{transition:border-color .15s,background .15s,box-shadow .15s}
.gk-input:focus{border-color:${COLORS.accent} !important;background:#FFFFFF !important;box-shadow:0 0 0 4px rgba(92,184,242,.18)}
.gk-input::placeholder{color:#A9AFB6;font-weight:400}
.gk-toggle-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-radius:16px;background:#F7F9FA;cursor:pointer}
.gk-switch{appearance:none;-webkit-appearance:none;width:46px;height:28px;border-radius:999px;background:#D5DCE3;position:relative;cursor:pointer;transition:background .2s;flex-shrink:0;margin:0}
.gk-switch::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2);transition:transform .2s cubic-bezier(.22,1,.36,1)}
.gk-switch:checked{background:${COLORS.accent}}
.gk-switch:checked::after{transform:translateX(18px)}
.gk-btn{flex:1;height:52px;border:0;border-radius:16px;font:inherit;font-size:16px;font-weight:700;cursor:pointer;transition:filter .15s,background .15s,opacity .15s}
.gk-btn--ghost{flex:0 0 120px;background:#F3F5F7;color:${COLORS.text}}
.gk-btn--ghost:hover{background:#E6EBF0}
.gk-btn--primary{background:${COLORS.yellow};color:${COLORS.text}}
.gk-btn--primary:hover:not(:disabled){filter:brightness(.96)}
.gk-btn--primary:disabled{opacity:.45;cursor:not-allowed}
.gk-modal button:focus-visible,.gk-modal input:focus-visible{outline:2px solid ${COLORS.accent};outline-offset:2px}
.gk-toast{position:fixed;left:50%;bottom:36px;z-index:110;display:flex;align-items:center;gap:10px;padding:14px 20px 14px 14px;border-radius:999px;background:${COLORS.text};color:#fff;font-size:15px;font-weight:600;box-shadow:0 12px 30px rgba(11,42,69,.3);animation:gkToast 2.6s cubic-bezier(.22,1,.36,1) both}
@keyframes gkFadeIn{from{opacity:0}to{opacity:1}}
@keyframes gkFadeOut{from{opacity:1}to{opacity:0}}
@keyframes gkModalIn{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:none}}
@keyframes gkModalOut{from{opacity:1;transform:none}to{opacity:0;transform:translateY(8px) scale(.98)}}
@keyframes gkToast{0%{opacity:0;transform:translate(-50%,16px)}10%{opacity:1;transform:translate(-50%,0)}85%{opacity:1;transform:translate(-50%,0)}100%{opacity:0;transform:translate(-50%,8px)}}
/* 작은 화면: 1100px 이하에서는 아이콘만 보이는 좁은 사이드바 */
@media (max-width:1100px){
.gk-sidebar{flex:0 0 84px !important;width:84px !important;padding:24px 12px !important;align-items:center}
.gk-sidebar .gk-sb-label{display:none !important}
.gk-sidebar .gk-logo{padding:4px !important;align-self:center !important}
.gk-sidebar__item{justify-content:center;padding:0 !important;width:56px !important}
.gk-sidebar__add{width:56px !important;padding:0 !important}
.gk-sb-foot{flex-direction:column !important;padding:12px 0 0 !important;width:100%}
.gk-profile{flex:none !important;margin:0 !important;justify-content:center}
.gk-noti{left:calc(100% + 20px) !important}
}
@media (prefers-reduced-motion: reduce){.gk-noti,.gk-noti__item,.gk-modal,.gk-modal__box,.gk-toast{animation:none}}
`;

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
    <nav
      aria-label="주 메뉴"
      className="gk-sidebar"
      style={{
        flex: "0 0 248px",
        width: 248,
        minHeight: "100vh",
        background: "#FFFFFF",
        borderRight: `1px solid ${COLORS.border}`,
        boxSizing: "border-box",
        padding: "32px 20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 32,
        fontFamily: FONT,
        color: COLORS.text,
        letterSpacing: "-0.2px",
      }}
    >
      <style>{css}</style>

      {/* 로고 (누르면 홈으로) */}
      <button
        type="button"
        className="gk-logo"
        aria-label="고정콕 홈으로 가기"
        onClick={() => onNavigate?.("home")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "4px 10px",
          margin: "-4px 0",
          border: 0,
          borderRadius: 12,
          background: "transparent",
          cursor: "pointer",
          alignSelf: "flex-start",
        }}
      >
        <LogoMark size={36} />
        <span className="gk-sb-label"><Wordmark height={26} /></span>
      </button>

      {/* 메뉴 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {MENU_ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            className="gk-sidebar__item"
            aria-current={active === item.key ? "page" : undefined}
            title={item.label}
            onClick={() => onNavigate?.(item.key)}
          >
            {item.icon}
            <span className="gk-sb-label">{item.label}</span>
          </button>
        ))}
      </div>

      {/* 항목 추가 */}
      <button
        type="button"
        className="gk-sidebar__add"
        onClick={() => { setAdding(true); onAddClick?.(); }}
        style={{
          marginTop: "auto",
          height: 48,
          borderRadius: 14,
          border: 0,
          background: COLORS.yellow,
          color: COLORS.text,
          font: "inherit",
          fontSize: 15,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          cursor: "pointer",
        }}
      >
        {Icons.plus}
        <span className="gk-sb-label">항목 추가</span>
      </button>

      {/* 프로필 + 알림 */}
      <div
        ref={boxRef}
        className="gk-sb-foot"
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 10px 0",
          borderTop: `1px solid ${COLORS.border}`,
        }}
      >
        {user ? (
          <button type="button" className="gk-profile" aria-haspopup="menu" aria-expanded={menu} onClick={() => { setMenu((v) => !v); setOpen(false); }}>
            <span aria-hidden="true" style={{ width: 40, height: 40, borderRadius: "50%", background: COLORS.accent, color: "#FFFFFF", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {initialOf(user.name)}
            </span>
            <span className="gk-sb-label" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
              <b style={{ fontSize: 15, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}님</b>
              <span style={{ fontSize: 13, color: COLORS.muted, whiteSpace: "nowrap" }}>{myItems.length ? `고정지출 ${myItems.length}건` : "등록한 항목 없음"}</span>
            </span>
          </button>
        ) : (
          <button type="button" className="gk-profile" aria-label="로그인 페이지로 가기" onClick={() => onNavigate?.("login")}>
            <span aria-hidden="true" style={{ width: 40, height: 40, borderRadius: "50%", background: "#E9EDF1", color: "#8A9098", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
            </span>
            <span className="gk-sb-label" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
              <b style={{ fontSize: 15, fontWeight: 700 }}>로그인하기</b>
              <span style={{ fontSize: 13, color: COLORS.muted, whiteSpace: "nowrap" }}>내 고정지출 관리하기</span>
            </span>
            <svg className="gk-sb-label" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.muted} strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        )}
        {menu && user && (
          <div className="gk-noti gk-menu" role="menu" aria-label="내 계정">
            <div style={{ padding: "18px 20px 14px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${COLORS.border}` }}>
              <span aria-hidden="true" style={{ width: 44, height: 44, borderRadius: "50%", background: COLORS.accent, color: "#fff", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{initialOf(user.name)}</span>
              <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                <b style={{ fontSize: 16 }}>{user.name}님</b>
                <span style={{ fontSize: 13, color: COLORS.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</span>
              </span>
            </div>
            <div style={{ padding: 8, display: "flex", flexDirection: "column" }}>
              <button type="button" role="menuitem" className="gk-menu__item" onClick={() => { setMenu(false); onNavigate?.("settings"); }}>내 정보 · 설정</button>
              <button type="button" role="menuitem" className="gk-menu__item" style={{ color: "#D9534F" }} onClick={() => { setMenu(false); onLogout?.(); }}>로그아웃</button>
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
          style={{
            position: "relative",
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: 0,
            background: COLORS.iconButtonBg,
            color: COLORS.iconButtonFg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          {Icons.bell}
          {notificationCount > 0 && (
            <span
              key={notificationCount}
              style={{
                animation: "gkBadgePop .35s ease",
                position: "absolute",
                top: 6,
                right: 5,
                minWidth: 18,
                height: 18,
                padding: "0 5px",
                boxSizing: "border-box",
                borderRadius: 999,
                background: COLORS.badge,
                boxShadow: `0 0 0 2px ${COLORS.iconButtonBg}`,
                fontSize: 11,
                fontWeight: 700,
                color: COLORS.text,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
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
      {toast && <Toast key={toast} text={toast} onDone={() => setToast(null)} />}
    </nav>
  );
}
