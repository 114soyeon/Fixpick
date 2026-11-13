import { useMySub } from "@/queries/subs";
import { fromDbRow } from "@/utils/common/dbItem";
import { toFixItem } from "@/utils/fix/fixItems";
import { loadEdits } from "@/utils/fix/fixStorage";

/* 내 고정지출 목록(Fix)과 상세(FixDetail)가 같이 쓰는 훅 */

/** DB 에서 내 고정지출 "원본" 목록 (다가오는 결제 카드가 써요) */
export const useRawFixItems = () => {
  const { data: rows } = useMySub();
  return (rows ?? []).map(fromDbRow); // DB 한 줄 → 항목 (utils/dbItem.js)
};

/** 목록·상세에서 보여줄 전체 고정지출 (추가·수정·삭제가 모두 반영돼요) */
export function useFixItems() {
  const added = useRawFixItems(); // DB 에서 내 고정지출을 읽어요
  const edits = loadEdits();

  return added
    .map(toFixItem)
    .map((item) => ({ ...item, ...edits[item.id] })); // 수정본이 있으면 덮어쓰기
}
