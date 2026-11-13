/*
 * 결제 캘린더 오른쪽 목록의 결제 한 줄
 * [아이콘 박스] 이름(+보조 문구) ....... 금액
 * 아이콘은 constants/categories.js, 색(bg, color)은 DB categories(hooks/useCategoryColors.js)에서 가져와요
 */
import { amountText } from "@/utils/common/format";
import { categoryStyle } from "@/constants/categories";
import { useCategoryColors } from "@/hooks/useCategoryColors";

const PayItem = ({ item, sub }) => {
  const { icon: Icon } = categoryStyle(item.category);
  const { color, bg } = useCategoryColors()(item.category); // DB 색
  return (
    <li className="paycal-item">
      <span className="paycal-item-icon" style={{ background: bg }}>
        {Icon && <Icon size={16} strokeWidth={2} color={color} />}
      </span>
      <div className="paycal-item-info">
        <p className="paycal-item-name">{item.name}</p>
        {sub && <p className="paycal-item-sub">{sub}</p>}
      </div>
      <strong className="paycal-item-amount">{amountText(item)}</strong>
    </li>
  );
};

export default PayItem;
