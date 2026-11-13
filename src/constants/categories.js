/* 카테고리 아이콘
 * 카테고리 정보(이름·색·아이콘 이름)는 모두 DB categories 테이블에 있어요 → hooks/useCategoryOf.js
 * DB의 icon 칸에는 Lucide 아이콘 "이름"("Building2")이 글자로 들어 있어요.
 * 글자로는 화면에 못 그려서, 이름 → 아이콘으로 바꾸는 표만 여기에 둬요.
 * DB에 새 아이콘 이름을 넣으면 이 표에도 추가해 주세요 (표에 없는 이름이면 "기타" 아이콘 Shapes) */
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

const ICONS = {
  Building2,
  BusFront,
  CarFront,
  CirclePlay,
  PiggyBank,
  Shapes,
  ShieldCheck,
  Smartphone,
  WashingMachine,
};

/** DB 아이콘 이름("Building2") → 아이콘 컴포넌트. 없거나 모르는 이름이면 Shapes */
export const iconByName = (name) => ICONS[name] ?? Shapes;
