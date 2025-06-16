import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPlayerSchema, insertTeamSchema, insertRoundSchema, insertScoreSchema, insertFineSchema, insertVoteSchema,
  insertMatchSchema, insertIndividualMatchSchema, insertStablefordScoreSchema, insertHoleResultSchema
} from "@shared/schema";

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

  app.get("/api/players/:id", async (req, res) => {
    try {
      const player = await storage.getPlayerById(parseInt(req.params.id));
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }
      res.json(player);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch player" });
    }
  });

  app.post("/api/players", async (req, res) => {
    try {
      console.log("Received player data:", req.body);
      const validatedData = insertPlayerSchema.parse(req.body);
      console.log("Validated player data:", validatedData);
      const player = await storage.createPlayer(validatedData);
      res.json(player);
    } catch (error) {
      console.error("Player creation error:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "Invalid player data" });
      }
    }
  });

  app.patch("/api/players/:id", async (req, res) => {
    try {
      const validatedData = insertPlayerSchema.partial().parse(req.body);
      const player = await storage.updatePlayer(parseInt(req.params.id), validatedData);
      res.json(player);
    } catch (error) {
      res.status(400).json({ message: "Failed to update player" });
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

  // Teams
  app.get("/api/teams", async (req, res) => {
    try {
      const teams = await storage.getTeams();
      res.json(teams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  app.get("/api/teams/:id", async (req, res) => {
    try {
      const team = await storage.getTeamById(parseInt(req.params.id));
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      res.json(team);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team" });
    }
  });

  app.get("/api/teams/:id/players", async (req, res) => {
    try {
      const players = await storage.getTeamPlayers(parseInt(req.params.id));
      res.json(players);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team players" });
    }
  });

  app.post("/api/teams", async (req, res) => {
    try {
      const validatedData = insertTeamSchema.parse(req.body);
      const team = await storage.createTeam(validatedData);
      res.json(team);
    } catch (error) {
      res.status(400).json({ message: "Invalid team data" });
    }
  });

  app.patch("/api/teams/:id", async (req, res) => {
    try {
      const validatedData = insertTeamSchema.partial().parse(req.body);
      const team = await storage.updateTeam(parseInt(req.params.id), validatedData);
      res.json(team);
    } catch (error) {
      res.status(400).json({ message: "Failed to update team" });
    }
  });

  app.delete("/api/teams/:id", async (req, res) => {
    try {
      await storage.deleteTeam(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete team" });
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
      console.log("Round creation request body:", req.body);
      const validatedData = insertRoundSchema.parse(req.body);
      console.log("Validated round data:", validatedData);
      const round = await storage.createRound(validatedData);
      res.json(round);
    } catch (error: any) {
      console.error("Round creation error:", error);
      res.status(400).json({ message: "Invalid round data", error: error.message || String(error) });
    }
  });

  app.delete("/api/rounds/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteRound(id);
      res.json({ message: "Round deleted successfully" });
    } catch (error) {
      console.error("Error deleting round:", error);
      res.status(500).json({ message: "Failed to delete round" });
    }
  });

  app.post("/api/rounds/:id/clear", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.clearRoundScores(id);
      res.json({ message: "Round scores cleared successfully" });
    } catch (error) {
      console.error("Error clearing round scores:", error);
      res.status(500).json({ message: "Failed to clear round scores" });
    }
  });

  // Scores
  app.get("/api/scores/all", async (req, res) => {
    try {
      const allScores = await storage.getAllScores();
      res.json(allScores);
    } catch (error) {
      console.error("Error fetching all scores:", error);
      res.status(500).json({ message: "Failed to fetch all scores" });
    }
  });

  app.get("/api/scores/:roundId", async (req, res) => {
    try {
      const roundId = parseInt(req.params.roundId);
      const scores = await storage.getScores(roundId);
      res.json(scores);
    } catch (error) {
      console.error("Error fetching scores for round:", req.params.roundId, error);
      res.status(500).json({ message: "Failed to fetch scores" });
    }
  });

  // Fallback scores endpoint for query parameters
  app.get("/api/scores", async (req, res) => {
    try {
      const roundId = req.query.roundId;
      if (!roundId) {
        res.json([]);
        return;
      }
      const scores = await storage.getScores(parseInt(roundId as string));
      res.json(scores);
    } catch (error) {
      console.error("Error fetching scores:", error);
      res.status(500).json({ message: "Failed to fetch scores" });
    }
  });

  app.post("/api/scores", async (req, res) => {
    try {
      console.log("Creating score with data:", req.body);
      const validatedData = insertScoreSchema.parse(req.body);
      const score = await storage.createScore(validatedData);
      console.log("Score created successfully:", score);
      res.json(score);
    } catch (error) {
      console.error("Error creating score:", error);
      res.status(400).json({ message: "Invalid score data" });
    }
  });

  app.patch("/api/scores/:id", async (req, res) => {
    try {
      const validatedData = insertScoreSchema.partial().parse(req.body);
      const updatedScore = await storage.updateScore(parseInt(req.params.id), validatedData);
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

  app.get("/api/fines/:playerId/:golfDay", async (req, res) => {
    try {
      const playerId = parseInt(req.params.playerId);
      const golfDay = req.params.golfDay;
      const fines = await storage.getFinesByPlayerAndDay(playerId, golfDay);
      res.json(fines);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch player fines" });
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

  // Matchplay API routes
  // Matches
  app.get("/api/matches", async (req, res) => {
    try {
      const roundId = req.query.roundId ? parseInt(req.query.roundId as string) : undefined;
      if (roundId) {
        const matches = await storage.getMatches(roundId);
        res.json(matches);
      } else {
        // Get all matches for leaderboard
        const allRounds = await storage.getRounds();
        const allMatches = [];
        for (const round of allRounds) {
          const matches = await storage.getMatches(round.id);
          allMatches.push(...matches);
        }
        res.json(allMatches);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  app.get("/api/matches/:roundId", async (req, res) => {
    try {
      const matches = await storage.getMatches(parseInt(req.params.roundId));
      res.json(matches);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  app.post("/api/matches", async (req, res) => {
    try {
      const validatedData = insertMatchSchema.parse(req.body);
      const match = await storage.createMatch(validatedData);
      res.json(match);
    } catch (error) {
      res.status(400).json({ message: "Invalid match data" });
    }
  });

  app.delete("/api/matches/:id", async (req, res) => {
    try {
      await storage.deleteMatch(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete match" });
    }
  });

  app.patch("/api/matches/:id", async (req, res) => {
    try {
      const validatedData = insertMatchSchema.partial().parse(req.body);
      const match = await storage.updateMatch(parseInt(req.params.id), validatedData);
      res.json(match);
    } catch (error) {
      res.status(400).json({ message: "Failed to update match" });
    }
  });

  // Individual matches
  app.get("/api/individual-matches/:roundId", async (req, res) => {
    try {
      const matches = await storage.getIndividualMatches(parseInt(req.params.roundId));
      res.json(matches);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch individual matches" });
    }
  });

  app.post("/api/individual-matches", async (req, res) => {
    try {
      const validatedData = insertIndividualMatchSchema.parse(req.body);
      const match = await storage.createIndividualMatch(validatedData);
      res.json(match);
    } catch (error) {
      res.status(400).json({ message: "Invalid individual match data" });
    }
  });

  // Stableford scores
  app.get("/api/stableford-scores/:roundId", async (req, res) => {
    try {
      const scores = await storage.getStablefordScores(parseInt(req.params.roundId));
      res.json(scores);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Stableford scores" });
    }
  });

  app.post("/api/stableford-scores", async (req, res) => {
    try {
      const validatedData = insertStablefordScoreSchema.parse(req.body);
      const score = await storage.createStablefordScore(validatedData);
      res.json(score);
    } catch (error) {
      res.status(400).json({ message: "Invalid Stableford score data" });
    }
  });

  app.patch("/api/stableford-scores/:id", async (req, res) => {
    try {
      const validatedData = insertStablefordScoreSchema.partial().parse(req.body);
      const score = await storage.updateStablefordScore(parseInt(req.params.id), validatedData);
      res.json(score);
    } catch (error) {
      res.status(400).json({ message: "Failed to update Stableford score" });
    }
  });

  // Hole results
  app.get("/api/hole-results/:matchId", async (req, res) => {
    try {
      const results = await storage.getHoleResults(parseInt(req.params.matchId));
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hole results" });
    }
  });

  app.post("/api/hole-results", async (req, res) => {
    try {
      const validatedData = insertHoleResultSchema.parse(req.body);
      const result = await storage.createHoleResult(validatedData);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: "Invalid hole result data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
