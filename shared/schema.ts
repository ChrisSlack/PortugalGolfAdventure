import { pgTable, text, serial, integer, boolean, timestamp, json, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  handicap: decimal("handicap", { precision: 4, scale: 1 }),
  teamId: integer("team_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  captainId: integer("captain_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rounds = pgTable("rounds", {
  id: serial("id").primaryKey(),
  course: text("course").notNull(),
  date: text("date").notNull(),
  players: json("players").$type<string[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const scores = pgTable("scores", {
  id: serial("id").primaryKey(),
  roundId: integer("round_id").notNull(),
  playerId: integer("player_id").notNull(),
  hole: integer("hole").notNull(),
  score: integer("score").notNull(),
  threePutt: boolean("three_putt").default(false),
  pickedUp: boolean("picked_up").default(false),
  inWater: boolean("in_water").default(false),
  inBunker: boolean("in_bunker").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const fines = pgTable("fines", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull(),
  type: text("type").notNull(),
  amount: integer("amount").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  activity: text("activity").notNull(),
  count: integer("count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPlayerSchema = createInsertSchema(players).omit({ id: true, createdAt: true }).extend({
  handicap: z.string().optional().transform((val) => val && val !== "" ? val : null),
  teamId: z.number().nullable().optional()
});
export const insertTeamSchema = createInsertSchema(teams).omit({ id: true, createdAt: true });
export const insertRoundSchema = createInsertSchema(rounds).omit({ id: true, createdAt: true });
export const insertScoreSchema = createInsertSchema(scores).omit({ id: true, createdAt: true });
export const insertFineSchema = createInsertSchema(fines).omit({ id: true, createdAt: true });
export const insertVoteSchema = createInsertSchema(votes).omit({ id: true, createdAt: true });

export type Player = typeof players.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type Round = typeof rounds.$inferSelect;
export type Score = typeof scores.$inferSelect;
export type Fine = typeof fines.$inferSelect;
export type Vote = typeof votes.$inferSelect;

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type InsertRound = z.infer<typeof insertRoundSchema>;
export type InsertScore = z.infer<typeof insertScoreSchema>;
export type InsertFine = z.infer<typeof insertFineSchema>;
export type InsertVote = z.infer<typeof insertVoteSchema>;
