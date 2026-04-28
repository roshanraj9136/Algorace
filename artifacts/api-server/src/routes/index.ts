import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import problemsRouter from "./problems";
import matchesRouter from "./matches";
import submissionsRouter from "./submissions";
import leaderboardRouter from "./leaderboard";
import profileRouter from "./profile";
import matchmakingRouter from "./matchmaking";
import statsRouter from "./stats";
import friendsRouter from "./friends";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/problems", problemsRouter);
router.use("/matches", matchesRouter);
router.use("/submissions", submissionsRouter);
router.use("/leaderboard", leaderboardRouter);
router.use("/profile", profileRouter);
router.use("/matchmaking", matchmakingRouter);
router.use("/stats", statsRouter);
router.use("/friends", friendsRouter);

export default router;
