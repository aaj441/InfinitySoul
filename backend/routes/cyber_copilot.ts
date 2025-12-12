/**
 * Cyber Copilot API Routes
 * REST endpoints for the InfinitySoul cyber insurance platform
 */

import { Router, Request, Response } from "express";
import * as path from "path";
import { InfinitySoulCore } from "../orchestration/core";
import { QuestEngine } from "../services/quest_engine";

const router = Router();

// Initialize orchestrator
const config = {
  carrier_matrix_path: path.join(process.cwd(), "config/carrier_matrix.json"),
  contexts_dir: path.join(process.cwd(), "contexts"),
  min_revenue_threshold: 100000,
};

const infinitySoul = new InfinitySoulCore(config);
const questEngine = new QuestEngine();

/**
 * POST /api/cyber-copilot
 * Complete cyber insurance pipeline: qualify → assess → outreach
 */
router.post("/cyber-copilot", async (req: Request, res: Response) => {
  try {
    const { lead_data, niche } = req.body;

    if (!lead_data) {
      return res.status(400).json({
        error: "Missing required field: lead_data",
      });
    }

    const result = await infinitySoul.cyberCopilot({
      lead_data,
      niche,
    });

    res.json(result);
  } catch (error) {
    console.error("Error in /cyber-copilot:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/cyber-copilot/risk-assessment
 * Quick risk assessment only
 */
router.post("/cyber-copilot/risk-assessment", async (req: Request, res: Response) => {
  try {
    const { client_profile, niche = "generic" } = req.body;

    if (!client_profile) {
      return res.status(400).json({
        error: "Missing required field: client_profile",
      });
    }

    const result = await infinitySoul.quickRiskAssessment(client_profile, niche);

    res.json(result);
  } catch (error) {
    console.error("Error in /risk-assessment:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/cyber-copilot/intake-questions/:niche
 * Get intake questions for a specific niche
 */
router.get("/cyber-copilot/intake-questions/:niche?", (req: Request, res: Response) => {
  try {
    const niche = req.params.niche || "generic";
    const questions = infinitySoul.getIntakeQuestions(niche);

    res.json({
      niche,
      questions,
    });
  } catch (error) {
    console.error("Error in /intake-questions:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/cyber-copilot/context/:niche
 * Get context for a specific niche
 */
router.get("/cyber-copilot/context/:niche?", (req: Request, res: Response) => {
  try {
    const niche = req.params.niche || "generic";
    infinitySoul.setMode(niche);
    const context = infinitySoul.getCurrentContext();

    res.json(context);
  } catch (error) {
    console.error("Error in /context:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/cyber-copilot/set-mode
 * Set the active niche mode
 */
router.post("/cyber-copilot/set-mode", (req: Request, res: Response) => {
  try {
    const { niche } = req.body;

    if (!niche) {
      return res.status(400).json({
        error: "Missing required field: niche",
      });
    }

    const result = infinitySoul.setMode(niche);
    res.json(result);
  } catch (error) {
    console.error("Error in /set-mode:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/cyber-copilot/quests
 * Get today's quests
 */
router.get("/cyber-copilot/quests", (req: Request, res: Response) => {
  try {
    const userId = (req.query.user_id as string) || "default";
    const quests = questEngine.getTodayQuests(userId);

    res.json({
      date: new Date().toISOString().split("T")[0],
      quests,
      total: quests.length,
      completed: quests.filter((q) => q.completed).length,
    });
  } catch (error) {
    console.error("Error in /quests:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/cyber-copilot/quests/panic
 * Panic mode - get single highest priority quest
 */
router.get("/cyber-copilot/quests/panic", (req: Request, res: Response) => {
  try {
    const userId = (req.query.user_id as string) || "default";
    const quest = questEngine.panicMode(userId);

    res.json({
      panic_mode: true,
      quest,
      message: "Focus on this one thing. Ignore everything else.",
    });
  } catch (error) {
    console.error("Error in /quests/panic:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/cyber-copilot/quests/:questId/complete
 * Mark a quest as completed
 */
router.post("/cyber-copilot/quests/:questId/complete", (req: Request, res: Response) => {
  try {
    const { questId } = req.params;
    const userId = (req.body.user_id as string) || "default";

    const success = questEngine.completeQuest(userId, questId);

    res.json({
      success,
      quest_id: questId,
      message: success ? "Quest completed!" : "Failed to complete quest",
    });
  } catch (error) {
    console.error("Error in /quests/complete:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/cyber-copilot/health
 * Health check endpoint
 */
router.get("/cyber-copilot/health", (req: Request, res: Response) => {
  res.json({
    status: "operational",
    system: "InfinitySoul Cyber Copilot",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

export default router;
