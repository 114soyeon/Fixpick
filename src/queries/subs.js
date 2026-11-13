import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCategories, addSubs, updateSubs, deleteSubs, getSubs, getMySubs } from "../api/subs";

// 카테고리 목록
export const useCategories = () => {
    return useQuery({ queryKey: ["category"], queryFn: getCategories })
}

const subs = "subscriptions";

// 고정 지출 항목 목록
export const useSubs = () => {
    return useQuery({ queryKey: [subs], queryFn: getSubs })
}

// 고정 지출 항목 추가
export const useAddSub = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input) => addSubs(input),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [subs] })
    })
}

// 고정 지출 항목 수정
export const useUpdateSub = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id, data}) => updateSubs(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [subs] })
  });
};

// 고정 지출 항목 삭제
export const useDeleteSub = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteSubs(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [subs] })
  });
};

// 내 고정지출 목록 리스트
export const useMySub = () => {
    return useQuery({queryKey: [subs], queryFn: getMySubs})
}