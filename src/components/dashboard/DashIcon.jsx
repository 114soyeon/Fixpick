/* 메인(대시보드) 카테고리 아이콘 */
import { LINE_ICON as line } from "@/constants/dashboard";
const ICON_PATHS = {
  building: (<><path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" /><path d="M6 11H4.5A1.5 1.5 0 0 0 3 12.5V21h3M18 9h1.5A1.5 1.5 0 0 1 21 10.5V21h-3M3 21h18M10 7h4M10 11h4M10 21v-3a2 2 0 0 1 4 0v3" /></>),
  phone: (<><rect x="6.5" y="2.5" width="11" height="19" rx="2.5" /><path d="M11 18h2" /></>),
  play: (<><circle cx="12" cy="12" r="9" /><path d="M10 8.5l5.5 3.5-5.5 3.5z" /></>),
  washer: (<><rect x="3.5" y="2.5" width="17" height="19" rx="2.5" /><path d="M7 6h2M16 6h.01" /><circle cx="12" cy="13.5" r="4.5" /><path d="M12 18a2.25 2.25 0 0 0 0-4.5 2.25 2.25 0 0 1 0-4.5" /></>),
  shield: (<><path d="M12 3l8 3v6c0 4.8-3.4 8-8 9-4.6-1-8-4.2-8-9V6z" /><path d="M9 12l2 2 4-4" /></>),
  piggy: (<><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z" /><path d="M2 9v1c0 1.1.9 2 2 2h1M16 11h.01" /></>),
  bus: (<><rect x="4" y="3" width="16" height="15" rx="3" /><path d="M4 11h16M7 18v3M17 18v3M9 7h6" /><circle cx="8" cy="14.5" r="1" /><circle cx="16" cy="14.5" r="1" /></>),
  car: (<><path d="m21 8-2 2-1.5-3.7A2 2 0 0 0 15.646 5H8.4a2 2 0 0 0-1.903 1.257L5 10 3 8" /><path d="M7 14h.01M17 14h.01" /><rect x="3" y="10" width="18" height="8" rx="2" /><path d="M5 18v2M19 18v2" /></>),
  shapes: (<><path d="M8.3 10a.7.7 0 0 1-.6-1.1L11.4 3a.7.7 0 0 1 1.2 0l3.7 5.9a.7.7 0 0 1-.6 1.1Z" /><rect x="3" y="14" width="7" height="7" rx="1" /><circle cx="17.5" cy="17.5" r="3.5" /></>),
};
export const Icon = ({ name, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...line} aria-hidden="true">{ICON_PATHS[name]}</svg>
);
