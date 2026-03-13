import { Router, type IRouter } from "express";
import {
  AnalyzeEmotionBody,
  DetectKeywordsBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

type EmotionType = "stressed" | "drunk" | "abusive" | "pain" | "calm" | "unknown";
type RiskLevel = "low" | "medium" | "high" | "critical";

const EMERGENCY_KEYWORDS = [
  "help", "attack", "accident", "fire", "kill", "danger",
  "emergency", "hurt", "bleeding", "trapped", "abuse", "threat", "assault",
  "உதவி", "தாக்குதல்", "விபத்து", "தீ",
  "मदद", "हमला", "दुर्घटना", "आग",
];

function simulateEmotionAnalysis(
  transcript: string,
  language: string
): {
  primaryEmotion: EmotionType;
  confidenceScore: number;
  emotionBreakdown: { emotion: EmotionType; score: number }[];
  riskLevel: RiskLevel;
  timeline: { timestamp: number; emotion: EmotionType; intensity: number }[];
} {
  const lower = transcript.toLowerCase();

  const hasHelp = lower.includes("help") || lower.includes("please") || lower.includes("உதவி") || lower.includes("मदद");
  const hasAggression = lower.includes("attack") || lower.includes("kill") || lower.includes("assault") || lower.includes("abuse") || lower.includes("threat");
  const hasAccident = lower.includes("accident") || lower.includes("bleeding") || lower.includes("hurt") || lower.includes("pain") || lower.includes("विपत्ति");
  const hasFire = lower.includes("fire") || lower.includes("burning") || lower.includes("smoke");
  const hasDrunkSigns = lower.includes("drunk") || lower.includes("slur") || lower.includes("dizzy");
  const hasEmergency = lower.includes("emergency") || lower.includes("danger") || lower.includes("trapped");

  let stressed = 20 + Math.random() * 20;
  let drunk = 10 + Math.random() * 15;
  let abusive = 10 + Math.random() * 10;
  let pain = 10 + Math.random() * 10;
  let calm = 30 + Math.random() * 20;

  if (hasHelp || hasEmergency) { stressed += 30; calm -= 20; }
  if (hasAggression) { abusive += 40; stressed += 20; calm -= 30; }
  if (hasAccident) { pain += 35; stressed += 20; calm -= 20; }
  if (hasFire) { stressed += 35; calm -= 25; }
  if (hasDrunkSigns) { drunk += 40; calm -= 20; }

  stressed = Math.min(100, Math.max(0, stressed + (Math.random() * 10 - 5)));
  drunk = Math.min(100, Math.max(0, drunk + (Math.random() * 10 - 5)));
  abusive = Math.min(100, Math.max(0, abusive + (Math.random() * 10 - 5)));
  pain = Math.min(100, Math.max(0, pain + (Math.random() * 10 - 5)));
  calm = Math.min(100, Math.max(0, calm + (Math.random() * 10 - 5)));

  const emotions: { emotion: EmotionType; score: number }[] = [
    { emotion: "stressed", score: Math.round(stressed) },
    { emotion: "drunk", score: Math.round(drunk) },
    { emotion: "abusive", score: Math.round(abusive) },
    { emotion: "pain", score: Math.round(pain) },
    { emotion: "calm", score: Math.round(calm) },
  ];

  emotions.sort((a, b) => b.score - a.score);
  const primaryEmotion = emotions[0].emotion;
  const confidenceScore = Math.round(emotions[0].score);

  let riskLevel: RiskLevel = "low";
  if (primaryEmotion === "calm" && confidenceScore > 50) riskLevel = "low";
  else if (primaryEmotion === "stressed" && confidenceScore > 60) riskLevel = "high";
  else if (primaryEmotion === "pain" && confidenceScore > 60) riskLevel = "high";
  else if (primaryEmotion === "abusive" && confidenceScore > 50) riskLevel = "critical";
  else if (primaryEmotion === "drunk" && confidenceScore > 50) riskLevel = "medium";
  else riskLevel = "medium";

  const words = transcript.split(/\s+/);
  const segmentSize = Math.max(1, Math.floor(words.length / 8));
  const timeline = Array.from({ length: 8 }, (_, i) => {
    const segmentWords = words.slice(i * segmentSize, (i + 1) * segmentSize).join(" ").toLowerCase();
    let segEmotion: EmotionType = "calm";
    let intensity = 30 + Math.random() * 30;

    if (segmentWords.includes("help") || segmentWords.includes("emergency") || segmentWords.includes("danger")) {
      segEmotion = "stressed"; intensity = 70 + Math.random() * 30;
    } else if (segmentWords.includes("pain") || segmentWords.includes("hurt") || segmentWords.includes("bleeding")) {
      segEmotion = "pain"; intensity = 65 + Math.random() * 35;
    } else if (segmentWords.includes("attack") || segmentWords.includes("kill") || segmentWords.includes("threat")) {
      segEmotion = "abusive"; intensity = 75 + Math.random() * 25;
    } else if (i > 3 && primaryEmotion !== "calm") {
      segEmotion = primaryEmotion; intensity = 40 + Math.random() * 40;
    }

    return {
      timestamp: i * 5,
      emotion: segEmotion,
      intensity: Math.round(intensity),
    };
  });

  return { primaryEmotion, confidenceScore, emotionBreakdown: emotions, riskLevel, timeline };
}

router.post("/analyze", (req, res) => {
  const parseResult = AnalyzeEmotionBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid request", details: parseResult.error.errors });
    return;
  }

  const { transcript, language = "english" } = parseResult.data;
  const start = Date.now();

  const result = simulateEmotionAnalysis(transcript, language);

  res.json({
    ...result,
    language,
    processingTimeMs: Date.now() - start + Math.floor(Math.random() * 200 + 100),
  });
});

router.post("/keywords", (req, res) => {
  const parseResult = DetectKeywordsBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid request", details: parseResult.error.errors });
    return;
  }

  const { transcript, language = "english" } = parseResult.data;
  const lower = transcript.toLowerCase();
  const words = transcript.split(/\b/);

  const detectedKeywords: { keyword: string; position: number; severity: "low" | "medium" | "high" }[] = [];

  const severityMap: Record<string, "low" | "medium" | "high"> = {
    help: "high", attack: "high", accident: "high", fire: "high",
    kill: "high", trapped: "high", bleeding: "high", assault: "high",
    danger: "high", emergency: "high",
    hurt: "medium", abuse: "medium", threat: "medium",
    dizzy: "low", drunk: "low",
  };

  EMERGENCY_KEYWORDS.forEach((kw) => {
    const idx = lower.indexOf(kw);
    if (idx !== -1) {
      detectedKeywords.push({
        keyword: kw,
        position: idx,
        severity: severityMap[kw] || "medium",
      });
    }
  });

  const highRiskKeywords = detectedKeywords.filter(k => k.severity === "high");
  const alertTriggered = highRiskKeywords.length > 0;

  let highlightedTranscript = transcript;
  detectedKeywords.forEach(({ keyword }) => {
    const regex = new RegExp(`\\b${keyword}\\b`, "gi");
    highlightedTranscript = highlightedTranscript.replace(regex, `**${keyword}**`);
  });

  res.json({
    detectedKeywords,
    highlightedTranscript,
    alertTriggered,
    alertMessage: alertTriggered
      ? `High Risk Call – Escalate Immediately (Keywords: ${highRiskKeywords.map(k => k.keyword).join(", ")})`
      : undefined,
  });
});

export default router;
