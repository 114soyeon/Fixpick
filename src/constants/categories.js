/* 카테고리별 아이콘·색 (시안: 고정콕_카테고리컬러아이콘)
 * - icon : Lucide 아이콘 컴포넌트
 * - bg   : 칩·아이콘 박스 배경
 * - color: 아이콘·글자 색
 * - bar  : 차트 막대 색 (리포트에서 사용)
 * key는 constants/addItem.js의 ADD_CATEGORIES와 같아요. */
import {
  Building2,
  BusFront,
  CarFront,
  CirclePlay,
  PiggyBank,
  Shapes,
  ShieldCheck,
  Smartphone,
  WashingMachine,
} from "lucide-react";

export const CATEGORY_STYLE = {
  home:    { icon: Building2,      bg: "#E1EEF9", color: "#154A7D", bar: "#4C8DF6" }, // 주거
  phone:   { icon: Smartphone,     bg: "#DDF3F9", color: "#0A6480", bar: "#36C2CE" }, // 통신
  sub:     { icon: CirclePlay,     bg: "#FBE6EE", color: "#9E2152", bar: "#FF7EB3" }, // 구독
  rental:  { icon: WashingMachine, bg: "#DCF5F1", color: "#0C6B5E", bar: "#5ED3A0" }, // 가전 구독
  insure:  { icon: ShieldCheck,    bg: "#EEE9FF", color: "#5B3FC4", bar: "#9B8AFB" }, // 보험
  saving:  { icon: PiggyBank,      bg: "#F1EFCB", color: "#5E5300", bar: "#FFC94D" }, // 금융·저축
  transit: { icon: BusFront,       bg: "#FCEADD", color: "#A04508", bar: "#FF9466" }, // 교통
  car:     { icon: CarFront,       bg: "#EEF1F5", color: "#536579", bar: "#8796A8" }, // 자동차
  etc:     { icon: Shapes,         bg: "#F0ECE8", color: "#4E433C", bar: "#9A8D82" }, // 기타
};

/** 카테고리 key로 스타일 찾기 (모르는 key면 "기타") */
export const categoryStyle = (key) => CATEGORY_STYLE[key] ?? CATEGORY_STYLE.etc;
