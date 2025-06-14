import { 
  players, teams, rounds, scores, fines, votes,
  type Player, type Team, type Round, type Score, type Fine, type Vote,
  type InsertPlayer, type InsertTeam, type InsertRound, type InsertScore, type InsertFine, type InsertVote
} from "@shared/schema";

export interface IStorage {
  // Players
  getPlayers(): Promise<Player[]>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: number, player: Partial<InsertPlayer>): Promise<Player>;
  deletePlayer(id: number): Promise<void>;
  getPlayerById(id: number): Promise<Player | undefined>;
  
  // Teams
  getTeams(): Promise<Team[]>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: number, team: Partial<InsertTeam>): Promise<Team>;
  deleteTeam(id: number): Promise<void>;
  getTeamById(id: number): Promise<Team | undefined>;
  getTeamPlayers(teamId: number): Promise<Player[]>;
  
  // Rounds
  getRounds(): Promise<Round[]>;
  createRound(round: InsertRound): Promise<Round>;
  
  // Scores
  getScores(roundId: number): Promise<Score[]>;
  createScore(score: InsertScore): Promise<Score>;
  updateScore(id: number, scoreData: Partial<InsertScore>): Promise<Score>;
  
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
  private teams: Map<number, Team> = new Map();
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
      handicap: insertPlayer.handicap || null,
      teamId: insertPlayer.teamId || null,
      id, 
      createdAt: new Date()
    };
    this.players.set(id, player);
    return player;
  }

  async updatePlayer(id: number, updateData: Partial<InsertPlayer>): Promise<Player> {
    const player = this.players.get(id);
    if (!player) throw new Error('Player not found');
    
    const updatedPlayer = { 
      ...player, 
      ...updateData,
      handicap: updateData.handicap !== undefined ? updateData.handicap : player.handicap,
      teamId: updateData.teamId !== undefined ? updateData.teamId : player.teamId
    };
    this.players.set(id, updatedPlayer);
    return updatedPlayer;
  }

  async deletePlayer(id: number): Promise<void> {
    this.players.delete(id);
  }

  async getPlayerById(id: number): Promise<Player | undefined> {
    return this.players.get(id);
  }

  // Teams
  async getTeams(): Promise<Team[]> {
    return Array.from(this.teams.values());
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const id = this.currentId++;
    const team: Team = {
      ...insertTeam,
      captainId: insertTeam.captainId || null,
      id,
      createdAt: new Date()
    };
    this.teams.set(id, team);
    return team;
  }

  async updateTeam(id: number, updateData: Partial<InsertTeam>): Promise<Team> {
    const team = this.teams.get(id);
    if (!team) throw new Error('Team not found');
    
    const updatedTeam = { 
      ...team, 
      ...updateData,
      captainId: updateData.captainId !== undefined ? updateData.captainId : team.captainId
    };
    this.teams.set(id, updatedTeam);
    return updatedTeam;
  }

  async deleteTeam(id: number): Promise<void> {
    this.teams.delete(id);
  }

  async getTeamById(id: number): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async getTeamPlayers(teamId: number): Promise<Player[]> {
    return Array.from(this.players.values()).filter(player => player.teamId === teamId);
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
      threePutt: insertScore.threePutt || false,
      pickedUp: insertScore.pickedUp || false,
      inWater: insertScore.inWater || false,
      inBunker: insertScore.inBunker || false,
      id,
      createdAt: new Date()
    };
    this.scores.set(id, score);
    return score;
  }

  async updateScore(id: number, scoreData: Partial<InsertScore>): Promise<Score> {
    const score = this.scores.get(id);
    if (!score) throw new Error('Score not found');
    
    const updatedScore = { 
      ...score, 
      ...scoreData,
      threePutt: scoreData.threePutt !== undefined ? scoreData.threePutt : score.threePutt,
      pickedUp: scoreData.pickedUp !== undefined ? scoreData.pickedUp : score.pickedUp,
      inWater: scoreData.inWater !== undefined ? scoreData.inWater : score.inWater,
      inBunker: scoreData.inBunker !== undefined ? scoreData.inBunker : score.inBunker
    };
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
      description: insertFine.description || null,
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
      count: insertVote.count || 0,
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
