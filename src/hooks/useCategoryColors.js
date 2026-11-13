import { useMemo } from "react";
import { useCategories } from "@/queries/subs";
import { categoryStyle } from "@/constants/categories";

/*
 * 카테고리 색을 DB(categories 테이블)에서 가져와요 — 리액트 쿼리 useCategories
 *   chart: 차트·막대·진한 칩 색   (예: 주거 #4C8DF6)
 *   color: 아이콘·글자 색         (예: 주거 #154A7D)
 *   bg   : 아이콘 박스·연한 배경 색 (예: 주거 #E1EEF9)
 *
 * 사용법: const colorOf = useCategoryColors();  colorOf("home").chart
 * DB를 아직 불러오는 중이면 constants/categories.js 의 기본 색을 써요 (화면이 비지 않게)
 */

// DB 없을 때 쓰는 기본 색 (constants/categories.js)
const fallback = (key) => {
  const s = categoryStyle(key);
  return { chart: s.bar, color: s.color, bg: s.bg };
};

export function useCategoryColors() {
  const { data: categories } = useCategories();

  return useMemo(() => {
    // { home: { chart, color, bg }, phone: {...}, ... }
    const byKey = {};
    (categories ?? []).forEach((c) => {
      if (c.key) byKey[c.key] = { chart: c.chart, color: c.color, bg: c.bg };
    });
    // 모르는 key면 "기타" 색
    return (key) => byKey[key] ?? byKey.etc ?? fallback(key);
  }, [categories]);
}

/** 대시보드 카드에 넣는 CSS 변수 (dashboard.css 의 --cat-color / --cat-tint / --cat-ink 를 DB 색으로 덮어써요) */
export const dashCatVars = (c) => ({ "--cat-color": c.chart, "--cat-tint": c.bg, "--cat-ink": c.color });
