import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { LogoMark, Wordmark } from "@/components/common/Logo";
import { onAuthChange, updateUserPassword } from "@/api/auth";
import "@/styles/login.css"; // gk-login-* 클래스 재사용
import "@/styles/reset.css"; // 이 페이지만 쓰는 간격 (gk-reset-*)

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
    <div className="gk-login-page gk-reset-page">
      <section className="gk-login-form-wrap">
        {/* 로그인 페이지처럼 form 자체가 gk-login-form (칸 사이 22px) */}
        <form onSubmit={submit} noValidate className="gk-login-rise gk-login-form">
          <button type="button" className="gk-login-mobile-logo" onClick={() => navigate("/")} aria-label="고정콕 홈으로 가기">
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
            <>
              {/* 로그인 페이지 비밀번호 칸과 같은 구조 (gk-login-pw 안에 눈 버튼) */}
              <label className="gk-login-field">
                <span className="gk-login-label">새 비밀번호</span>
                <span className="gk-login-pw">
                  <input type={showPw ? "text" : "password"} autoComplete="new-password"
                    className="gk-login-input gk-login-input--pw" placeholder="8자 이상 입력하세요"
                    value={pw} onChange={(e) => { setPw(e.target.value); setError(""); }} />
                  <button type="button" className="gk-login-eye" aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 보기"} onClick={() => setShowPw((v) => !v)}>
                    {showPw ? <EyeOff size={20} strokeWidth={2} /> : <Eye size={20} strokeWidth={2} />}
                  </button>
                </span>
              </label>
              <label className="gk-login-field">
                <span className="gk-login-label">새 비밀번호 확인</span>
                <input type={showPw ? "text" : "password"} autoComplete="new-password"
                  className="gk-login-input" placeholder="한 번 더 입력하세요"
                  value={pw2} onChange={(e) => { setPw2(e.target.value); setError(""); }} />
                {/* 회원가입 비밀번호 확인과 같은 안내 (오류 문구가 떠 있을 땐 숨김) */}
                {pw2 && !error && (
                  <p className={`gk-reset-hint ${pw === pw2 ? "is-ok" : ""}`}>
                    {pw === pw2 ? "비밀번호가 일치해요" : "비밀번호를 똑같이 입력해 주세요"}
                  </p>
                )}
              </label>
              {error && <p role="alert" className="gk-login-alert">{error}</p>}
              {/* 회원가입 약관 박스 ~ 가입하기 버튼 간격(14px)과 같게 */}
              <button type="submit" className="gk-login-btn gk-reset-btn" disabled={busy}>
                {busy ? "저장 중이에요" : "새 비밀번호로 저장"}
              </button>
            </>
          )}

          {state === "error" && (
            <button type="button" className="gk-login-btn" onClick={() => navigate("/login")}>
              비밀번호 찾기 다시 하기
            </button>
          )}
        </form>
      </section>
    </div>
  );
}