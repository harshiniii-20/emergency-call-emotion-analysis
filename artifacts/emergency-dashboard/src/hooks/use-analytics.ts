import { 
  useGetAnalyticsSummary, 
  useGetEmotionTrends, 
  useGetCallVolume 
} from "@workspace/api-client-react";

export function useAnalyticsSummaryData() {
  return useGetAnalyticsSummary({
    query: { refetchInterval: 15000 } // Refetch every 15s
  });
}

export function useEmotionTrendsData() {
  return useGetEmotionTrends({
    query: { refetchInterval: 30000 }
  });
}

export function useCallVolumeData() {
  return useGetCallVolume({
    query: { refetchInterval: 30000 }
  });
}
