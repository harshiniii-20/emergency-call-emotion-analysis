import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import emotionRouter from "./emotion.js";
import callsRouter from "./calls.js";
import analyticsRouter from "./analytics.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/emotion", emotionRouter);
router.use("/calls", callsRouter);
router.use("/analytics", analyticsRouter);

export default router;
