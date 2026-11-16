import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyBudget, saveMyBudget } from "@/api/budgets";

/*
  예산 리액트 쿼리 훅 (queries/payment.js 와 같은 방식)
  - useBudget   : 이번 달 예산 읽기 (설정 카드 초기값 + 대시보드)
  - useSaveBudget : 예산 저장 후 ["budgets"] 캐시를 비워서 화면 바로 갱신
*/

const budgets = "budgets";

export const useBudget = () => {
  return useQuery({ queryKey: [budgets], queryFn: getMyBudget });
};

export const useSaveBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (amount) => saveMyBudget(amount),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [budgets] }),
  });
};