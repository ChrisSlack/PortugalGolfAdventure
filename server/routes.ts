import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPlayerSchema, insertRoundSchema, insertScoreSchema, insertFineSchema, insertVoteSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Players
  app.get("/api/players", async (req, res) => {
    try {
      const players = await storage.getPlayers();
      res.json(players);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch players" });
    }
  });

  app.post("/api/players", async (req, res) => {
    try {
      const validatedData = insertPlayerSchema.parse(req.body);
      const player = await storage.createPlayer(validatedData);
      res.json(player);
    } catch (error) {
      res.status(400).json({ message: "Invalid player data" });
    }
  });

  app.delete("/api/players/:id", async (req, res) => {
    try {
      await storage.deletePlayer(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete player" });
    }
  });

  // Rounds
  app.get("/api/rounds", async (req, res) => {
    try {
      const rounds = await storage.getRounds();
      res.json(rounds);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rounds" });
    }
  });

  app.post("/api/rounds", async (req, res) => {
    try {
      const validatedData = insertRoundSchema.parse(req.body);
      const round = await storage.createRound(validatedData);
      res.json(round);
    } catch (error) {
      res.status(400).json({ message: "Invalid round data" });
    }
  });

  // Scores
  app.get("/api/scores/:roundId", async (req, res) => {
    try {
      const scores = await storage.getScores(parseInt(req.params.roundId));
      res.json(scores);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scores" });
    }
  });

  app.post("/api/scores", async (req, res) => {
    try {
      const validatedData = insertScoreSchema.parse(req.body);
      const score = await storage.createScore(validatedData);
      res.json(score);
    } catch (error) {
      res.status(400).json({ message: "Invalid score data" });
    }
  });

  app.patch("/api/scores/:id", async (req, res) => {
    try {
      const { score } = req.body;
      const updatedScore = await storage.updateScore(parseInt(req.params.id), score);
      res.json(updatedScore);
    } catch (error) {
      res.status(500).json({ message: "Failed to update score" });
    }
  });

  // Fines
  app.get("/api/fines", async (req, res) => {
    try {
      const fines = await storage.getFines();
      res.json(fines);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch fines" });
    }
  });

  app.post("/api/fines", async (req, res) => {
    try {
      const validatedData = insertFineSchema.parse(req.body);
      const fine = await storage.createFine(validatedData);
      res.json(fine);
    } catch (error) {
      res.status(400).json({ message: "Invalid fine data" });
    }
  });

  // Votes
  app.get("/api/votes", async (req, res) => {
    try {
      const votes = await storage.getVotes();
      res.json(votes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch votes" });
    }
  });

  app.post("/api/votes", async (req, res) => {
    try {
      const { activity } = req.body;
      const existingVote = await storage.getVoteByActivity(activity);
      
      if (existingVote) {
        const updatedVote = await storage.updateVote(existingVote.id, existingVote.count + 1);
        res.json(updatedVote);
      } else {
        const validatedData = insertVoteSchema.parse({ activity, count: 1 });
        const vote = await storage.createVote(validatedData);
        res.json(vote);
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid vote data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
