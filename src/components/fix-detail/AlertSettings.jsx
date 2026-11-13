import { ALERT_OPTIONS, DEFAULT_END_ALERT, DEFAULT_PAY_ALERT } from "@/constants/fix";

// 버튼 한 줄 (label: 왼쪽 글자, value: 선택된 값, onChange: 고를 때 실행)
const AlertRow = ({ label, value, onChange }) => (
  <div className="alert-row">
    <span>{label}</span>
    <div className="segment">
      {ALERT_OPTIONS.map((opt) => (
        <button
          key={opt}
          className={value === opt ? "active" : ""}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

// payDays: 결제 알림 며칠 전(숫자), endDays: 만기 전 알림 며칠 전(숫자)
// onChange: 버튼 고를 때 실행 — DB 패치({ payment_alert_days: 30 })
const AlertSettings = ({ payDays, endDays, onChange }) => {
  const payValue = payDays == null ? DEFAULT_PAY_ALERT : `${payDays}일 전`;
  const endValue = endDays == null ? DEFAULT_END_ALERT : `${endDays}일 전`;

  return (
    <section className="card">
      <h3>알림</h3>
      <AlertRow
        label="결제 알림"
        value={payValue}
        onChange={(opt) => onChange({ payment_alert_days: parseInt(opt, 10) })}
      />
      <AlertRow
        label="만기 전 알림"
        value={endValue}
        onChange={(opt) => onChange({ expiry_alert_days: parseInt(opt, 10) })}
      />
    </section>
  );
};

export default AlertSettings;