import { useState } from "react";

const ALERT_OPTIONS = ["30일 전", "7일 전", "3일 전", "1일 전"];

const AlertSettings = () => {
  const [payAlert, setPayAlert] = useState("1일 전");
  const [endAlert, setEndAlert] = useState("7일 전");

  return (
    <section className="card">
      <h3>알림</h3>

      <div className="alert-row">
        <span>결제 알림</span>
        <div className="segment">
          {ALERT_OPTIONS.map((opt) => (
            <button
              key={opt}
              className={payAlert === opt ? "active" : ""}
              onClick={() => setPayAlert(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="alert-row">
        <span>만기 전 알림</span>
        <div className="segment">
          {ALERT_OPTIONS.map((opt) => (
            <button
              key={opt}
              className={endAlert === opt ? "active" : ""}
              onClick={() => setEndAlert(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AlertSettings;
