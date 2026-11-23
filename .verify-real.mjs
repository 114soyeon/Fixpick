import { readFileSync } from "node:fs";
import { createServer } from "vite";

const env = Object.fromEntries(
  readFileSync(".env", "utf8").split(/\r?\n/).filter(Boolean).filter((l) => l.includes("=")).map((l) => {
    const i = l.indexOf("=");
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
  })
);
const url = env.VITE_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY;

const res = await fetch(
  `${url}/rest/v1/subscriptions?select=id,name,amount,cycle,amount_type,day,month,week,custom_number,custom_text,start_date,expiry_date,created_at,categories(id,name,key,bg,color)&order=created_at.desc`,
  { headers: { apikey: key, Authorization: `Bearer ${key}` } }
);
const rows = await res.json();
console.log("DB 항목 수:", rows.length, "| HTTP", res.status);

const server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "error" });
const { fromDbRow } = await server.ssrLoadModule("/src/utils/common/dbItem.js");
const { bigPayments, BIG_AMOUNT } = await server.ssrLoadModule("/src/utils/common/payment.js");

const items = rows.map(fromDbRow);
const today = { year: 2026, month: 11, day: 23 };

// 1) Fix 목록 뱃지 조건 (ExpenseRow.jsx 와 동일)
console.log("\n=== 1) 목록 뱃지 조건: Number(amount) >= BIG_AMOUNT ===");
for (const it of items) {
  const isBig = Number(it.amount) >= BIG_AMOUNT;
  if (isBig || it.name.includes("주택청약")) {
    console.log(`  ${isBig ? "뱃지 ON " : "뱃지 OFF"} | ${it.name} | amount=${it.amount} (${typeof it.amount})`);
  }
}

// 2) 캘린더/상단 카드 bigPayments
console.log("\n=== 2) bigPayments(items, 2026-11-23, 4) ===");
const big = bigPayments(items, today, 4);
if (big.length === 0) console.log("  (빈 배열)");
for (const b of big) console.log(`  ${b.name} ${b.amount} ${b.date.toDateString()}`);
const inList = big.some((b) => b.name === "주택청약");
console.log("  → 주택청약 포함?", inList ? "YES" : "NO");

console.log("\n=== 3) 30만원 이상 + 3개월 안 전체 (우선순위 경쟁자) ===");
const all = bigPayments(items, today, 999);
for (const b of all) console.log(`  ${b.name} ${b.amount} ${b.date.toDateString()}`);
console.log("  → 주택청약 순위:", all.findIndex((b) => b.name === "주택청약") + 1, "/", all.length);

console.log("\n=== 4) 상단 카드 1건 ===");
const one = bigPayments(items, today, 1);
console.log(" ", one[0] ? `${one[0].name} ${one[0].amount}` : "(없음)");

await server.close();
