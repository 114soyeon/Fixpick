/** 설정 카드 머리: [아이콘 박스] 제목 + 설명 */
const CardHead = ({ icon: Icon, color, bg, title, desc }) => (
  <div className="set-head">
    <span className="set-head-icon" style={{ background: bg }}>
      <Icon size={20} strokeWidth={1.7} color={color} />
    </span>
    <div>
      <h2 className="set-head-title">{title}</h2>
      <p className="set-head-desc">{desc}</p>
    </div>
  </div>
);

export default CardHead;
