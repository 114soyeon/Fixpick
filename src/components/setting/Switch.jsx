/** 켜고 끄는 스위치 (모양은 styles/setting.css의 .set-switch) */
const Switch = ({ on, onChange, label }) => (
  <input
    type="checkbox"
    className="set-switch"
    aria-label={label}
    checked={on}
    onChange={(e) => onChange(e.target.checked)}
  />
);

export default Switch;
