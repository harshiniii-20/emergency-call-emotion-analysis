import { 
  useAnalyzeEmotion, 
  useDetectKeywords 
} from "@workspace/api-client-react";

export function useEmotionAnalyzer() {
  return useAnalyzeEmotion();
}

export function useKeywordDetector() {
  return useDetectKeywords();
}
