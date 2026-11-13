import { useState } from "react";
import {
  ALERT_OPTIONS,
  DEFAULT_END_ALERT,
  DEFAULT_PAY_ALERT,
} from "@/constants/fix";

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

const AlertSettings = () => {
  const [payAlert, setPayAlert] = useState(DEFAULT_PAY_ALERT);
  const [endAlert, setEndAlert] = useState(DEFAULT_END_ALERT);

  return (
    <section className="card">
      <h3>알림</h3>
      <AlertRow label="결제 알림" value={payAlert} onChange={setPayAlert} />
      <AlertRow label="만기 전 알림" value={endAlert} onChange={setEndAlert} />
    </section>
  );
};

export default AlertSettings;
