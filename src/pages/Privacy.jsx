import { useNavigate } from "react-router-dom";
import { LogoMark, Wordmark } from "@/components/common/Logo";
import { TERMS } from "@/constants/signup";
import "@/styles/login.css";

const privacy = TERMS.find((t) => t.key === "privacy");

export default function Privacy() {
  const navigate = useNavigate();
  return (
    <div className="gk-login-page">
      <section className="gk-login-form-wrap">
        <div className="gk-login-rise gk-login-form" style={{ maxHeight: "80vh", overflowY: "auto" }}>
          <button type="button" className="gk-login-mobile-logo" onClick={() => navigate("/")} aria-label="고정콕 홈으로 가기">
            <LogoMark size={36} /><Wordmark height={26} />
          </button>

          <div className="gk-login-head">
            <h2 className="gk-login-head__title">{privacy.title}</h2>
            <p className="gk-login-head__desc">고정콕 개인정보 수집·이용에 관한 안내입니다.</p>
          </div>

          {privacy.body.map(([title, desc]) => (
            <div key={title} style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "#555", whiteSpace: "pre-line" }}>{desc}</p>
            </div>
          ))}

          <p style={{ fontSize: 13, color: "#888", marginTop: 20 }}>
            본 개인정보처리방침은 회원가입 시 동의하는 "개인정보 수집·이용 동의" 내용과 동일합니다.
          </p>

          <button type="button" className="gk-login-btn" onClick={() => navigate(-1)} style={{ marginTop: 20 }}>
            뒤로 가기
          </button>
        </div>
      </section>
    </div>
  );
}