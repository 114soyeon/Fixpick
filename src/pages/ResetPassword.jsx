import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { LogoMark, Wordmark } from "@/components/common/Logo";
import { onAuthChange, updateUserPassword } from "@/api/auth";
import "@/styles/login.css"; // gk-login-* 클래스 재사용

export default function ResetPassword() {
  const navigate = useNavigate();
  const [state, setState] = useState("checking"); // checking | ready | error
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // 링크를 열면 Supabase가 code → 세션으로 바꾸고 알려 줘요
    useEffect(() => {
        const q = new URLSearchParams(window.location.search);
        const h = new URLSearchParams(window.location.hash.slice(1)); // # 뒤쪽 파싱
        const err = h.get("error_description") || h.get("error") || q.get("error_description") || q.get("error");
        if (err) { setState("error"); return; } // 만료 링크면 바로 "링크가 만료됐어요" 표시
        const stop = onAuthChange((session) => { if (session) setState("ready"); });
        const t = setTimeout(() => setState((s) => (s === "checking" ? "error" : s)), 10000);
        return () => { stop(); clearTimeout(t); };
    }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (pw.length < 8) return setError("비밀번호는 8자 이상으로 만들어 주세요.");
    if (pw !== pw2) return setError("비밀번호가 서로 달라요.");
    setError("");
    setBusy(true);
    try {
      await updateUserPassword(pw);
      navigate("/", { replace: true }); // 재설정하면 세션이 열려서 바로 로그인 상태
    } catch {
      setError("비밀번호를 바꾸지 못했어요. 링크가 만료됐다면 다시 요청해 주세요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="gk-login-page">
      <section className="gk-login-form-wrap">
        <div className="gk-login-rise gk-login-form">
          <button type="button" className="gk-login-mobile-logo" onClick={() => navigate("/")}>
            <LogoMark size={36} /><Wordmark height={26} />
          </button>

          <div className="gk-login-head">
            <h2 className="gk-login-head__title">비밀번호 재설정</h2>
            <p className="gk-login-head__desc">
              {state === "error" ? "링크가 만료됐어요. 비밀번호 찾기를 다시 요청해 주세요."
                : state === "checking" ? "링크를 확인하고 있어요…"
                : "새 비밀번호를 입력해 주세요."}
            </p>
          </div>

          {state === "ready" && (
            <form onSubmit={submit} noValidate>
              <label className="gk-login-field">
                <span className="gk-login-label">새 비밀번호</span>
                <input type={showPw ? "text" : "password"} autoComplete="new-password"
                  className="gk-login-input" placeholder="8자 이상 입력하세요"
                  value={pw} onChange={(e) => { setPw(e.target.value); setError(""); }} />
              </label>
              <label className="gk-login-field">
                <span className="gk-login-label">새 비밀번호 확인</span>
                <input type={showPw ? "text" : "password"} autoComplete="new-password"
                  className="gk-login-input" placeholder="한 번 더 입력하세요"
                  value={pw2} onChange={(e) => { setPw2(e.target.value); setError(""); }} />
                <button type="button" className="gk-login-eye" onClick={() => setShowPw((v) => !v)}>
                  {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </label>
              {error && <p role="alert" className="gk-login-error">{error}</p>}
              <button type="submit" className="gk-login-btn" disabled={busy}>
                {busy ? "저장 중이에요" : "새 비밀번호로 저장"}
              </button>
            </form>
          )}

          {state === "error" && (
            <button className="gk-login-btn" onClick={() => navigate("/login")}>
              비밀번호 찾기 다시 하기
            </button>
          )}
        </div>
      </section>
    </div>
  );
}