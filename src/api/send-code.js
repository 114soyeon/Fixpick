export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, message: "잘못된 요청이에요." });

  const email = (req.body?.email || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, message: "이메일 주소를 다시 확인해 주세요." });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!serviceKey || !resendKey) {
    return res.status(500).json({ ok: false, message: "서버 환경변수가 설정되지 않았어요." });
  }

  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };

  try {
    // 60초 쿨다운 — 최근 발송 기록이 있으면 거절
    const since = new Date(Date.now() - 60000).toISOString();
    const q = await fetch(
      `${process.env.VITE_SUPABASE_URL}/rest/v1/email_codes?email=eq.${encodeURIComponent(email)}` +
      `&created_at=gt.${encodeURIComponent(since)}&select=created_at`,
      { headers }
    );
    const recent = await q.json();
    if (Array.isArray(recent) && recent.length > 0) {
      return res.status(429).json({ ok: false, message: "60초 후 다시 요청할 수 있어요." });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));

    // 저장 (같은 이메일이면 갱신 + 시도 횟수 초기화)
    const upsert = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/email_codes`, {
      method: "POST",
      headers: { ...headers, Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ email, code, attempts: 0, created_at: new Date().toISOString() }),
    });
    if (!upsert.ok) throw new Error("인증번호 저장 실패");

    // Resend로 발송
    const send = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Fixpick <onboarding@resend.dev>",
        to: [email],
        subject: "고정콕 가입 인증번호",
        html: `
          <p>고정콕 가입 인증번호는 아래입니다.</p>
          <p style="font-size:28px;letter-spacing:8px;"><b>${code}</b></p>
          <p>3분 안에 입력해 주세요.</p>`,
      }),
    });
    if (!send.ok) {
      const err = await send.json().catch(() => ({}));
      console.error("Resend 발송 실패:", send.status, err);
      return res.status(502).json({ ok: false, message: "메일 발송에 실패했어요. 잠시 후 다시 시도해 주세요." });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: "서버 오류가 발생했어요." });
  }
}