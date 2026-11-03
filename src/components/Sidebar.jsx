import { useId } from "react";

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
      <rect x="2.5" y="8" width="16" height="12" rx="2.5" />
      <path d="M6 4.5h12.5A3 3 0 0 1 21.5 7.5V16M2.5 12h16M6 16h3" />
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
      <path d="M3 20.5h18" />
      <rect x="5" y="12" width="3.5" height="5.5" rx="1" />
      <rect x="10.25" y="8" width="3.5" height="9.5" rx="1" />
      <rect x="15.5" y="4" width="3.5" height="13.5" rx="1" />
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

const MENU_ITEMS = [
  { key: "home", label: "홈", icon: Icons.home },
  { key: "expenses", label: "내 고정지출", icon: Icons.expenses },
  { key: "calendar", label: "결제 캘린더", icon: Icons.calendar },
  { key: "report", label: "지출 리포트", icon: Icons.report },
  { key: "settings", label: "설정", icon: Icons.settings },
];

/** 캘린더 + 메모지 + 압정 로고 그림 */
function LogoMark({ size = 36 }) {
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
function Wordmark({ height = 26 }) {
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
`;

export default function Sidebar({
  active = "home",
  onNavigate,
  onAddClick,
  onNotificationClick,
  user = { name: "00", initial: "00", subscriptionCount: 5 },
  notificationCount = 2,
}) {
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

      {/* 로고 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 10px" }}>
        <LogoMark size={36} />
        <Wordmark height={26} />
      </div>

      {/* 메뉴 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {MENU_ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            className="gk-sidebar__item"
            aria-current={active === item.key ? "page" : undefined}
            onClick={() => onNavigate?.(item.key)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {/* 구독 추가 */}
      <button
        type="button"
        className="gk-sidebar__add"
        onClick={onAddClick}
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
        항목 추가
      </button>

      {/* 프로필 + 알림 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 10px 0",
          borderTop: `1px solid ${COLORS.border}`,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: COLORS.accent,
            color: "#FFFFFF",
            fontSize: 15,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {user.initial ?? user.name?.slice(0, 1)}
        </span>
        <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <b style={{ fontSize: 15, fontWeight: 700 }}>{user.name}님</b>
          <span style={{ fontSize: 13, color: COLORS.muted }}>구독 {user.subscriptionCount}개</span>
        </span>
        <button
          type="button"
          aria-label={notificationCount > 0 ? `알림 ${notificationCount}개` : "알림"}
          onClick={onNotificationClick}
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
              style={{
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
      </div>
    </nav>
  );
}