import { Router, type IRouter } from "express";
import { calls } from "./calls.js";

const router: IRouter = Router();

router.get("/summary", (_req, res) => {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const todayCalls = calls.filter(c => new Date(c.startTime) >= todayStart);
  const activeCalls = calls.filter(c => c.status === "active");
  const escalatedCalls = calls.filter(c => c.escalated || c.status === "escalated");
  const highRiskCalls = todayCalls.filter(c => c.riskLevel === "high" || c.riskLevel === "critical");

  const emotionCounts: Record<string, number> = {};
  todayCalls.forEach(c => {
    emotionCounts[c.primaryEmotion] = (emotionCounts[c.primaryEmotion] || 0) + 1;
  });

  const total = todayCalls.length || 1;
  const emotionDistribution = Object.entries(emotionCounts).map(([emotion, count]) => ({
    emotion,
    count,
    percentage: Math.round((count / total) * 100),
  }));

  const avgConfidenceScore = todayCalls.length > 0
    ? Math.round(
        todayCalls.reduce((sum, c) => sum + (c.confidenceScore || 0), 0) / todayCalls.length
      )
    : 0;

  const peakStressHour = "14:00 – 15:00";

  res.json({
    totalCallsToday: todayCalls.length,
    activeCalls: activeCalls.length,
    escalatedCalls: escalatedCalls.length,
    avgConfidenceScore,
    emotionDistribution,
    peakStressHour,
    highRiskCallsToday: highRiskCalls.length,
  });
});

router.get("/emotion-trends", (_req, res) => {
  const hours = Array.from({ length: 24 }, (_, i) => {
    const h = i.toString().padStart(2, "0");
    const isPeak = i >= 10 && i <= 18;
    const base = isPeak ? 5 : 2;
    const stressedBase = (i >= 11 && i <= 16) ? 12 : 3;

    return {
      hour: `${h}:00`,
      stressed: Math.round(stressedBase + Math.random() * (isPeak ? 8 : 4)),
      drunk: Math.round((i >= 20 || i <= 2 ? 6 : 1) + Math.random() * 4),
      abusive: Math.round(base + Math.random() * (isPeak ? 5 : 2)),
      pain: Math.round(base + Math.random() * (isPeak ? 6 : 3)),
      calm: Math.round(10 + Math.random() * 15),
    };
  });
  res.json(hours);
});

router.get("/call-volume", (_req, res) => {
  const hours = Array.from({ length: 24 }, (_, i) => {
    const h = i.toString().padStart(2, "0");
    const isPeak = i >= 9 && i <= 17;
    const isNight = i >= 22 || i <= 5;
    const baseCount = isNight ? 2 : isPeak ? 15 : 8;

    const count = Math.round(baseCount + Math.random() * (isPeak ? 12 : 6));
    const highRisk = Math.round(count * (0.1 + Math.random() * 0.25));

    return {
      hour: `${h}:00`,
      count,
      highRisk,
    };
  });
  res.json(hours);
});

export default router;
