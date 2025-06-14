import { 
  players, rounds, scores, fines, votes,
  type Player, type Round, type Score, type Fine, type Vote,
  type InsertPlayer, type InsertRound, type InsertScore, type InsertFine, type InsertVote
} from "@shared/schema";

export interface IStorage {
  // Players
  getPlayers(): Promise<Player[]>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  deletePlayer(id: number): Promise<void>;
  
  // Rounds
  getRounds(): Promise<Round[]>;
  createRound(round: InsertRound): Promise<Round>;
  
  // Scores
  getScores(roundId: number): Promise<Score[]>;
  createScore(score: InsertScore): Promise<Score>;
  updateScore(id: number, score: number): Promise<Score>;
  
  // Fines
  getFines(): Promise<Fine[]>;
  createFine(fine: InsertFine): Promise<Fine>;
  
  // Votes
  getVotes(): Promise<Vote[]>;
  createVote(vote: InsertVote): Promise<Vote>;
  updateVote(id: number, count: number): Promise<Vote>;
  getVoteByActivity(activity: string): Promise<Vote | undefined>;
}

export class MemStorage implements IStorage {
  private players: Map<number, Player> = new Map();
  private rounds: Map<number, Round> = new Map();
  private scores: Map<number, Score> = new Map();
  private fines: Map<number, Fine> = new Map();
  private votes: Map<number, Vote> = new Map();
  private currentId = 1;

  // Players
  async getPlayers(): Promise<Player[]> {
    return Array.from(this.players.values());
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = this.currentId++;
    const player: Player = { 
      ...insertPlayer, 
      id, 
      createdAt: new Date()
    };
    this.players.set(id, player);
    return player;
  }

  async deletePlayer(id: number): Promise<void> {
    this.players.delete(id);
  }

  // Rounds
  async getRounds(): Promise<Round[]> {
    return Array.from(this.rounds.values());
  }

  async createRound(insertRound: InsertRound): Promise<Round> {
    const id = this.currentId++;
    const round: Round = {
      ...insertRound,
      id,
      createdAt: new Date()
    };
    this.rounds.set(id, round);
    return round;
  }

  // Scores
  async getScores(roundId: number): Promise<Score[]> {
    return Array.from(this.scores.values()).filter(score => score.roundId === roundId);
  }

  async createScore(insertScore: InsertScore): Promise<Score> {
    const id = this.currentId++;
    const score: Score = {
      ...insertScore,
      id,
      createdAt: new Date()
    };
    this.scores.set(id, score);
    return score;
  }

  async updateScore(id: number, scoreValue: number): Promise<Score> {
    const score = this.scores.get(id);
    if (!score) throw new Error('Score not found');
    
    const updatedScore = { ...score, score: scoreValue };
    this.scores.set(id, updatedScore);
    return updatedScore;
  }

  // Fines
  async getFines(): Promise<Fine[]> {
    return Array.from(this.fines.values());
  }

  async createFine(insertFine: InsertFine): Promise<Fine> {
    const id = this.currentId++;
    const fine: Fine = {
      ...insertFine,
      id,
      createdAt: new Date()
    };
    this.fines.set(id, fine);
    return fine;
  }

  // Votes
  async getVotes(): Promise<Vote[]> {
    return Array.from(this.votes.values());
  }

  async createVote(insertVote: InsertVote): Promise<Vote> {
    const id = this.currentId++;
    const vote: Vote = {
      ...insertVote,
      id,
      createdAt: new Date()
    };
    this.votes.set(id, vote);
    return vote;
  }

  async updateVote(id: number, count: number): Promise<Vote> {
    const vote = this.votes.get(id);
    if (!vote) throw new Error('Vote not found');
    
    const updatedVote = { ...vote, count };
    this.votes.set(id, updatedVote);
    return updatedVote;
  }

  async getVoteByActivity(activity: string): Promise<Vote | undefined> {
    return Array.from(this.votes.values()).find(vote => vote.activity === activity);
  }
}

export const storage = new MemStorage();
