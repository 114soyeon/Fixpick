import { House, Wallet, CalendarCheck, ChartPie, Settings, Plus, Bell } from "lucide-react";
/* 사이드바 아이콘 (메뉴 key와 이름이 같아요) */

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

export const Icons = {
  home: (
    <House size={20} strokeWidth={2} />
  ),
  expenses: (
    <Wallet size={20} strokeWidth={2} />
  ),
  calendar: (
    <CalendarCheck size={20} strokeWidth={2} />
  ),
  report: (
    <ChartPie size={20} strokeWidth={2} />
  ),
  settings: (
    <Settings size={20} strokeWidth={2} />
  ),
  plus: (
    <Plus size={19} strokeWidth={2.4} />
  ),
  bell: (
    <Bell size={20} strokeWidth={2} />
  ),
};