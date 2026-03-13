import { Router, type IRouter } from "express";
import {
  CreateCallBody,
  UpdateCallBody,
  GetCallParams,
  UpdateCallParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

type EmotionType = "stressed" | "drunk" | "abusive" | "pain" | "calm" | "unknown";
type RiskLevel = "low" | "medium" | "high" | "critical";
type CallStatus = "active" | "ended" | "escalated" | "resolved";
type Language = "english" | "tamil" | "hindi";

interface CallRecord {
  id: number;
  callerId: string;
  callerNumber: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  status: CallStatus;
  language: Language;
  primaryEmotion: EmotionType;
  riskLevel: RiskLevel;
  escalated: boolean;
  transcript?: string;
  detectedKeywords: string[];
  confidenceScore?: number;
  operatorId?: string;
}

let nextId = 1;
const calls: CallRecord[] = [];

function generateSampleCalls(): CallRecord[] {
  const emotions: EmotionType[] = ["stressed", "drunk", "abusive", "pain", "calm"];
  const risks: RiskLevel[] = ["low", "medium", "high", "critical"];
  const statuses: CallStatus[] = ["active", "ended", "escalated", "resolved"];
  const languages: Language[] = ["english", "tamil", "hindi"];
  const sampleNumbers = [
    "+1-555-0101", "+1-555-0182", "+1-555-0233", "+91-98765-43210",
    "+91-44-2345-6789", "+91-80-4567-8901", "+1-555-0344", "+1-555-0455",
  ];
  const sampleKeywords = [
    [], ["help"], ["fire", "help"], ["accident"],
    ["attack", "help"], [], ["emergency"], ["bleeding", "hurt"],
  ];

  const now = new Date();
  return sampleNumbers.map((num, i) => {
    const startTime = new Date(now.getTime() - (i * 8 + Math.random() * 5) * 60 * 1000);
    const emotion = emotions[i % emotions.length];
    const risk: RiskLevel = sampleKeywords[i].length > 0
      ? (emotion === "stressed" || emotion === "pain" ? "high" : "medium")
      : risks[i % risks.length];
    const status = i < 2 ? "active" : statuses[Math.floor(i / 2) % statuses.length];
    const rec: CallRecord = {
      id: nextId++,
      callerId: `CALLER-${1000 + i}`,
      callerNumber: num,
      startTime: startTime.toISOString(),
      endTime: status !== "active" ? new Date(startTime.getTime() + (3 + Math.random() * 10) * 60 * 1000).toISOString() : undefined,
      duration: status !== "active" ? Math.floor(3 * 60 + Math.random() * 600) : undefined,
      status,
      language: languages[i % languages.length],
      primaryEmotion: emotion,
      riskLevel: risk,
      escalated: status === "escalated",
      transcript: `This is a sample transcript for call ${i + 1}. ${sampleKeywords[i].join(" ")} Please respond quickly.`,
      detectedKeywords: sampleKeywords[i],
      confidenceScore: Math.round(55 + Math.random() * 40),
      operatorId: `OP-${(i % 3) + 1}`,
    };
    return rec;
  });
}

calls.push(...generateSampleCalls());

router.get("/", (_req, res) => {
  res.json(calls.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()));
});

router.post("/", (req, res) => {
  const parseResult = CreateCallBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid request", details: parseResult.error.errors });
    return;
  }

  const { callerNumber, language = "english", operatorId } = parseResult.data;

  const newCall: CallRecord = {
    id: nextId++,
    callerId: `CALLER-${1000 + nextId}`,
    callerNumber,
    startTime: new Date().toISOString(),
    status: "active",
    language: language as Language,
    primaryEmotion: "unknown",
    riskLevel: "low",
    escalated: false,
    detectedKeywords: [],
    operatorId,
  };

  calls.push(newCall);
  res.status(201).json(newCall);
});

router.get("/:id", (req, res) => {
  const parseResult = GetCallParams.safeParse(req.params);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }

  const call = calls.find(c => c.id === parseResult.data.id);
  if (!call) {
    res.status(404).json({ error: "Call not found" });
    return;
  }

  res.json(call);
});

router.patch("/:id", (req, res) => {
  const paramsResult = UpdateCallParams.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }

  const bodyResult = UpdateCallBody.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ error: "Invalid body", details: bodyResult.error.errors });
    return;
  }

  const callIndex = calls.findIndex(c => c.id === paramsResult.data.id);
  if (callIndex === -1) {
    res.status(404).json({ error: "Call not found" });
    return;
  }

  const updates = bodyResult.data;
  const call = calls[callIndex];

  if (updates.status !== undefined) call.status = updates.status as CallStatus;
  if (updates.escalated !== undefined) call.escalated = updates.escalated;
  if (updates.primaryEmotion !== undefined) call.primaryEmotion = updates.primaryEmotion as EmotionType;
  if (updates.riskLevel !== undefined) call.riskLevel = updates.riskLevel as RiskLevel;
  if (updates.transcript !== undefined) call.transcript = updates.transcript;
  if (updates.detectedKeywords !== undefined) call.detectedKeywords = updates.detectedKeywords;
  if (updates.confidenceScore !== undefined) call.confidenceScore = updates.confidenceScore;

  if (updates.escalated && !call.endTime) {
    call.status = "escalated";
  }

  res.json(call);
});

export { calls };
export default router;
