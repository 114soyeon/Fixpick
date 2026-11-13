/*
 * 지출 리포트: 카테고리 아이콘 박스 (색 배경 + 아이콘)
 * - CategoryCard(목록) / ChangeCard(목록) / MonthlyReport(항목 표)에서 써요
 * - category: 카테고리 key, size: 박스 크기(px)
 * - 색(bg, color)은 DB categories 에서 (hooks/useCategoryColors.js)
 */
import { categoryStyle } from "../../constants/categories";
import { useCategoryColors } from "../../hooks/useCategoryColors";

const CatIcon = ({ category, size = 26 }) => {
  const { icon: Icon } = categoryStyle(category);
  const { bg, color } = useCategoryColors()(category); // DB 색
  return (
    <span className="rpt-cat-icon" style={{ background: bg, width: size, height: size }}>
      {Icon && <Icon size={Math.round(size * 0.55)} strokeWidth={2} color={color} />}
    </span>
  );
};

export default CatIcon;
