import { useQueryClient } from "@tanstack/react-query";
import { 
  useListCalls, 
  useGetCall, 
  useCreateCall, 
  useUpdateCall,
  getListCallsQueryKey,
  getGetCallQueryKey
} from "@workspace/api-client-react";

export function useCallsData() {
  return useListCalls({
    query: {
      refetchInterval: 5000, // Auto-refresh calls every 5s for live dashboard
    }
  });
}

export function useCallDetails(id: number) {
  return useGetCall(id, {
    query: {
      enabled: !!id,
      refetchInterval: 5000,
    }
  });
}

export function useCreateNewCall() {
  const queryClient = useQueryClient();
  return useCreateCall({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCallsQueryKey() });
      }
    }
  });
}

export function useUpdateCallStatus() {
  const queryClient = useQueryClient();
  return useUpdateCall({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListCallsQueryKey() });
        if (data.id) {
          queryClient.invalidateQueries({ queryKey: getGetCallQueryKey(data.id) });
        }
      }
    }
  });
}
