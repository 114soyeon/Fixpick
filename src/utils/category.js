import { ADD_CATEGORIES } from "../constants/addItem";
import { CATEGORY_STYLE } from "../constants/categories";

/* DB 카테고리 이름("구독 서비스", "금융·저축" 등) → 화면에서 쓰는 key("sub", "saving" 등)
 * 띄어쓰기·가운뎃점·빗금은 무시하고 비교해요. 모르는 이름이면 "etc" */
const norm = (name = "") => name.replace(/[\s·/]/g, "");

const NAMES = [
  ...ADD_CATEGORIES.map((c) => ({ key: c.key, name: c.name })),
  ...Object.entries(CATEGORY_STYLE).map(([key, c]) => ({ key, name: c.name })),
];

export function categoryKeyOf(name) {
  const n = norm(name);
  return NAMES.find((c) => norm(c.name) === n)?.key ?? "etc";
}
