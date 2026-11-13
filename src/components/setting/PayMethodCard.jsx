/*
 * 설정 오른쪽 아래: 결제 수단 카드
 * - methods: 등록한 결제 수단 [{ id, type, name, last4 }]
 * - items: 내가 등록한 고정지출 (결제 수단마다 몇 건 쓰는지 세요)
 * - onAddClick: "+ 결제 수단 추가" 버튼 (추가 창은 페이지에서 띄워요)
 */
import { CreditCard } from "lucide-react";
import CardIcon from "@/components/add-item/CardIcon"; // 카드사 로고 (없으면 첫 글자 배지)
import CardHead from "@/components/setting/CardHead";

const PayMethodCard = ({ methods, items, onAddClick }) => {
  // 이 결제 수단을 쓰는 고정지출 개수
  const countOf = (m) => items.filter((it) => it.payMethod === m.name).length;

  return (
    <section className="set-card set-pay">
      <CardHead icon={CreditCard} color="#7364C6" bg="#EDEAFE" title="결제 수단" desc="고정지출이 빠져나가는 카드·계좌" />
      {methods.length > 0 ? (
        <ul className="set-methods">
          {methods.map((m) => (
            <li key={m.id} className="set-method">
              <CardIcon name={m.name} />
              <div>
                <p className="set-method-name">{m.name}</p>
                <p className="set-method-sub">
                  {m.type === "card" ? "카드" : "계좌"} •••• {m.last4} · 고정지출 {countOf(m)}건
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="set-empty">아직 등록한 결제 수단이 없어요</p>
      )}
      <button type="button" className="set-btn-addpay" onClick={onAddClick}>
        + 결제 수단 추가
      </button>
    </section>
  );
};

export default PayMethodCard;
