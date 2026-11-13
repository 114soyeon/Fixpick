import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCategories, addSubs, getMySubs } from "../api/subs";

// 카테고리 목록
export const useCategories = () => {
    return useQuery({queryKey: ["category"], queryFn: getCategories})
}

const subs = "subscriptions";
// 고정 지출 항목 추가
export const useAddSub = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input) => addSubs(input),
        onSuccess: () => queryClient.invalidateQueries({queryKey: [subs]})
    })
}

// 내 고정지출 목록 리스트
export const useMySub = () => {
    return useQuery({queryKey: [subs], queryFn: getMySubs})
}