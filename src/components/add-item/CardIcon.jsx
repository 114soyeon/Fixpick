import { useState } from "react";
import { CARD_LOGOS } from "../../constants/cardLogos";
import { BADGE, BADGE_COLOR_COUNT } from "../../constants/addItem";

const brokenLogos = new Set(); // 한 번 못 불러온 로고는 다시 시도하지 않아요

/** 카드사 로고 (로고가 없으면 이름 첫 글자 배지) */
export default function CardIcon({ name = "" }) {
  const logo = CARD_LOGOS[name];
  const [failed, setFailed] = useState(!logo || brokenLogos.has(logo));
  const [txt, ci] = BADGE[name] || [name.trim().slice(0, 1) || "?", [...name].reduce((n, ch) => n + ch.charCodeAt(0), 0) % BADGE_COLOR_COUNT];
  if (!failed) {
    return (
      <span aria-hidden="true" className="gk-card-logo">
        <img src={logo} alt="" width={30} height={30} onError={() => { brokenLogos.add(logo); setFailed(true); }} />
      </span>
    );
  }
  return (
    <span aria-hidden="true" className={`gk-card-badge is-c${ci} ${txt.length > 1 ? "is-long" : ""}`}>{txt}</span>
  );
}
