import { useMemo } from "react";
import { useCategories } from "@/queries/subs";
import { iconByName } from "@/constants/categories";

/*
 * 카테고리 정보를 DB(categories 테이블)에서 가져와요 — 리액트 쿼리 useCategories
 *   name   : 화면에 보이는 이름 (예: "주거·공과")
 *   example: 예시 문구         (예: "월세·관리비·공과금")
 *   icon   : 아이콘 컴포넌트   (DB의 아이콘 이름 → constants/categories.js iconByName)
 *   chart  : 차트·막대·진한 칩 색 (예: #4C8DF6)
 *   color  : 아이콘·글자 색       (예: #154A7D)
 *   bg     : 아이콘 박스·연한 배경 색 (예: #E1EEF9)
 *
 * 사용법: const catOf = useCategoryOf();  catOf("home").name / catOf("home").chart
 * 모르는 key면 "기타" 정보를 돌려줘요
 */

// DB를 아직 불러오는 중일 때 (이름은 비우고, 아이콘·색은 회색으로 잠깐 보여줘요)
const LOADING = { key: "etc", name: "", example: "", icon: iconByName(), chart: "#E3EAF0", color: "#8A9098", bg: "#F1F3F5" };

// DB 한 줄 → 화면에서 쓰는 모양
const toInfo = (c) => ({
  key: c.key,
  name: c.name,
  example: c.example,
  icon: iconByName(c.icon),
  chart: c.chart,
  color: c.color,
  bg: c.bg,
});

export function useCategoryOf() {
  const { data: categories } = useCategories();

  return useMemo(() => {
    // { home: { name, icon, chart, ... }, phone: {...}, ... }
    const byKey = Object.fromEntries((categories ?? []).map((c) => [c.key, toInfo(c)]));
    return (key) => byKey[key] ?? byKey.etc ?? LOADING;
  }, [categories]);
}

/** 대시보드 카드에 넣는 CSS 변수 (dashboard.css 의 --cat-color / --cat-tint / --cat-ink 를 DB 색으로 덮어써요) */
export const dashCatVars = (c) => ({ "--cat-color": c.chart, "--cat-tint": c.bg, "--cat-ink": c.color });
