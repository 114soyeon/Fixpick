import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { getPayCategories, getMyMethods, addMyMethod, deleteMyMethod } from "@/api/payment";

/*
    결제 수단 리액트 쿼리 훅 (queries/subs.js 와 같은 방식)
    - usePayCategories : 카드사·은행 사전 18행 (설정 > 결제 수단 추가 창의 선택 상자)
    - usePayMethods    : 내가 등록한 카드·계좌 (설정 우측 카드 + 항목 추가 모달 드롭다운)
    - 등록·삭제가 끝나면 ["payment-methods"] 캐시를 비워서 화면이 바로 새로고침
*/

const methods = "payment-methods";
const categories = "payment-categories";

// 카드사·은행 사전
export const usePayCategories = () => {
    return useQuery({ queryKey: [categories], queryFn: getPayCategories });
};

// 내가 등록한 결제 수단
export const usePayMethods = () => {
    const userId = useAuthStore((state) => state.user?.id);
    return useQuery({ queryKey: [methods, userId], queryFn: getMyMethods });
};

// 결제 수단 등록 (설정 > "+ 결제 수단 추가")
export const useAddPayMethod = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input) => addMyMethod(input),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [methods] }),
    });
};

// 결제 수단 삭제
export const useDeletePayMethod = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => deleteMyMethod(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [methods] }),
    });
};
