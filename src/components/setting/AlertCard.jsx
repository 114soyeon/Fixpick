/*
 * 설정 왼쪽: 알림 카드 (스위치는 누르면 바로 저장)
 * - setting: useSetting() 값 (alerts, time)
 * 줄 순서: 결제일 알림 → 알림 시간 → 나머지 알림
 */
import { Bell } from "lucide-react";
import { saveSetting } from "../../utils/setting";
import { ALERTS, TIMES } from "../../constants/setting";
import CardHead from "./CardHead";
import Switch from "./Switch";

const AlertCard = ({ setting }) => {
  const setAlert = (key, on) => saveSetting({ alerts: { ...setting.alerts, [key]: on } });

  // 알림 한 줄: 제목 + 설명 ....... 스위치
  const alertRow = ([key, title, desc]) => (
    <li key={key} className="set-row">
      <div>
        <p className="set-row-title">{title}</p>
        <p className="set-row-desc">{desc}</p>
      </div>
      <Switch label={title} on={setting.alerts[key]} onChange={(on) => setAlert(key, on)} />
    </li>
  );

  return (
    <section className="set-card set-alert">
      <CardHead icon={Bell} color="#2F7FC0" bg="#DCEFFD" title="알림" desc="결제일 전에 미리 알려드려요" />
      <ul className="set-rows">
        {alertRow(ALERTS[0])}

        {/* 결제일 알림 바로 아래에 알림 시간 줄 */}
        <li className="set-row">
          <p className="set-row-title">알림 시간</p>
          <div className="set-seg" role="radiogroup" aria-label="알림 시간">
            {TIMES.map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={setting.time === value}
                className={setting.time === value ? "is-on" : ""}
                onClick={() => saveSetting({ time: value })}
              >
                {label}
              </button>
            ))}
          </div>
        </li>

        {ALERTS.slice(1).map(alertRow)}
      </ul>
    </section>
  );
};

export default AlertCard;
