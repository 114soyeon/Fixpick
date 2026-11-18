// api/verify-code.js — 인증번호 확인 (5회 틀리면 잠금, 성공 시 코드 삭제)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, message: "잘못된 요청이에요." });

  const email = (req.body?.email || "").trim();
  const code = (req.body?.code || "").trim();
  if (!email || !/^\d{6}$/.test(code)) {
    return res.status(400).json({ ok: false, message: "인증번호 6자리를 입력해 주세요." });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return res.status(500).json({ ok: false, message: "서버 환경변수가 설정되지 않았어요." });
  }

  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };

  try {
    const q = await fetch(
      `${SUPABASE_URL}/rest/v1/email_codes?email=eq.${encodeURIComponent(email)}` +
      `&select=code,attempts,created_at`,
      { headers }
    );
    const rows = await q.json();
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row) return res.status(400).json({ ok: false, message: "인증번호를 먼저 받아 주세요." });

    // 3분 지나면 만료 (화면 타이머와 동일)
    if (Date.now() - new Date(row.created_at).getTime() > 180000) {
      return res.status(400).json({ ok: false, message: "시간이 지났어요. 인증번호를 다시 받아 주세요." });
    }
    // 5회 틀리면 잠금
    if (row.attempts >= 5) {
      return res.status(400).json({ ok: false, message: "시도가 너무 많아요. 인증번호를 다시 받아 주세요." });
    }
    // 불일치 → 시도 횟수 +1
    if (row.code !== code) {
      await fetch(`${SUPABASE_URL}/rest/v1/email_codes?email=eq.${encodeURIComponent(email)}`, {
        method: "PATCH",
        headers: { ...headers, Prefer: "return=minimal" },
        body: JSON.stringify({ attempts: row.attempts + 1 }),
      });
      return res.status(400).json({ ok: false, message: "인증번호가 맞지 않아요." });
    }

    // 성공 → 코드 삭제 (재사용 방지)
    await fetch(`${SUPABASE_URL}/rest/v1/email_codes?email=eq.${encodeURIComponent(email)}`, {
      method: "DELETE",
      headers: { ...headers, Prefer: "return=minimal" },
    });
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: "서버 오류가 발생했어요." });
  }
}