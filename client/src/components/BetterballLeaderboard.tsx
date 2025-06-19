import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { Player, Team, Round, Score, Match } from "@shared/schema";
import { courses } from "@/lib/courseData";

interface BetterballLeaderboardProps {
  players: Player[];
  teams: Team[];
  rounds: Round[];
  allScores: Score[];
}

export default function BetterballLeaderboard({ players, teams, rounds, allScores }: BetterballLeaderboardProps) {
  const [selectedDay, setSelectedDay] = useState("1");

  const { data: allMatches = [] } = useQuery<Match[]>({
    queryKey: ["/api/matches"]
  });

  const getPlayerName = (playerId: number): string => {
    const player = players.find(p => p.id === playerId);
    return player ? `${player.firstName} ${player.lastName}` : "Unknown Player";
  };

  const dayRounds = rounds?.filter(r => r.day?.toString() === selectedDay) || [];
  const mainRound = dayRounds[0];
  const selectedCourse = mainRound ? courses.find(c => c.id === mainRound.course) : null;
  
  const dayMatches = allMatches?.filter(match => 
    dayRounds.some(round => round.id === match.roundId)
  ).slice(0, 2) || [];

  const calculatePlayerHoleStableford = (playerId: number, roundId: number, hole: number): number => {
    if (!selectedCourse) return 0;
    
    const player = players.find(p => p.id === playerId);
    if (!player) return 0;

    const score = allScores.find(s => s.playerId === playerId && s.roundId === roundId && s.hole === hole);
    if (!score) return 0;

    const holeData = selectedCourse.holes.find(h => h.hole === hole);
    if (!holeData) return 0;

    const handicap = player.handicap || 0;
    const holeHandicap = holeData.handicap;
    
    const numericHandicap = Number(handicap);
    const handicapStrokes = numericHandicap >= holeHandicap ? Math.floor(numericHandicap / 18) + (numericHandicap % 18 >= holeHandicap ? 1 : 0) : 0;
    const netScore = score.score - handicapStrokes;
    
    const diff = netScore - holeData.par;
    if (diff <= -2) return 4;
    else if (diff === -1) return 3;
    else if (diff === 0) return 2;
    else if (diff === 1) return 1;
    return 0;
  };

  const calculateBetterballScore = (player1Id: number, player2Id: number, roundId: number): number => {
    if (!selectedCourse || !mainRound) return 0;

    const playedHoles = new Set(allScores.filter(s => s.roundId === roundId).map(s => s.hole));
    let totalPoints = 0;

    for (const hole of Array.from(playedHoles)) {
      const player1Points = calculatePlayerHoleStableford(player1Id, roundId, hole);
      const player2Points = calculatePlayerHoleStableford(player2Id, roundId, hole);
      totalPoints += Math.max(player1Points, player2Points);
    }

    return totalPoints;
  };

  const calculateMatchResult = (match: Match): { 
    teamAScore: number, 
    teamBScore: number, 
    status: string,
    lastHolePlayed: number,
    teamAUp: number,
    teamBUp: number,
    isAllSquare: boolean
  } => {
    if (!mainRound) return { 
      teamAScore: 0, 
      teamBScore: 0, 
      status: "AS", 
      lastHolePlayed: 0,
      teamAUp: 0,
      teamBUp: 0,
      isAllSquare: true
    };

    const teamAScore = calculateBetterballScore(match.pairAPlayer1, match.pairAPlayer2, mainRound.id);
    const teamBScore = calculateBetterballScore(match.pairBPlayer1, match.pairBPlayer2, mainRound.id);

    // Get the last hole played
    const playedHoles = new Set(allScores.filter(s => s.roundId === mainRound.id).map(s => s.hole));
    const lastHolePlayed = playedHoles.size > 0 ? Math.max(...Array.from(playedHoles)) : 0;
    
    const diff = teamAScore - teamBScore;
    const isAllSquare = diff === 0;
    const teamAUp = diff > 0 ? diff : 0;
    const teamBUp = diff < 0 ? Math.abs(diff) : 0;
    
    let status = "AS";
    if (diff > 0) status = `${diff}UP`;
    else if (diff < 0) status = `${Math.abs(diff)}UP`;

    return { 
      teamAScore, 
      teamBScore, 
      status, 
      lastHolePlayed,
      teamAUp,
      teamBUp,
      isAllSquare
    };
  };

  const overallTeamScores = () => {
    let teamATotal = 0;
    let teamBTotal = 0;

    dayMatches.forEach(match => {
      const result = calculateMatchResult(match);
      teamATotal += result.teamAScore;
      teamBTotal += result.teamBScore;
    });

    return { teamATotal, teamBTotal };
  };

  const { teamATotal, teamBTotal } = overallTeamScores();

  if (!mainRound || !selectedCourse || dayMatches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-golf-green" />
            <span>Betterball Leaderboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select value={selectedDay} onValueChange={setSelectedDay}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Day 1</SelectItem>
                <SelectItem value="2">Day 2</SelectItem>
                <SelectItem value="3">Day 3</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-center text-gray-500">No betterball matches found for Day {selectedDay}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-golf-green" />
          <span>Betterball Leaderboard - {selectedCourse.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Day" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Day 1</SelectItem>
              <SelectItem value="2">Day 2</SelectItem>
              <SelectItem value="3">Day 3</SelectItem>
            </SelectContent>
          </Select>

          {/* Overall Team Scores - Ryder Cup Style */}
          <div className="mb-6 border rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
              Overall Match Score
            </div>
            <div className="grid grid-cols-3 h-[60px] sm:grid-cols-1 sm:h-auto">
              <div className={`p-3 flex items-center justify-center border-r-4 ${
                teamBTotal > teamATotal ? 'bg-red-50 border-r-red-500' : 'bg-gray-50 border-r-gray-300'
              }`}>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">Team B</div>
                  <div className="text-xl font-bold">{teamBTotal}</div>
                </div>
              </div>
              <div className="bg-white flex items-center justify-center">
                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-600">
                    {teamATotal === teamBTotal ? 'AS' : `${Math.abs(teamATotal - teamBTotal)} MATCH`}
                  </div>
                </div>
              </div>
              <div className={`p-3 flex items-center justify-center border-l-4 ${
                teamATotal > teamBTotal ? 'bg-blue-50 border-l-blue-500' : 'bg-gray-50 border-l-gray-300'
              }`}>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">Team A</div>
                  <div className="text-xl font-bold">{teamATotal}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Ryder Cup Style Fourball Results */}
          <div className="space-y-2">
            {dayMatches.map((match, index) => {
              const result = calculateMatchResult(match);
              return (
                <div key={match.id} className="border rounded-lg overflow-hidden">
                  {/* Header */}
                  <div className="bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
                    Fourball {index + 1}
                  </div>
                  
                  {/* Matchplay Scorecard Style Row - Team B | Hole | Team A */}
                  <div className="grid grid-cols-3 h-[70px] sm:grid-cols-1 sm:h-auto">
                    {/* Team B Cell (Left) */}
                    <div className={`p-3 flex flex-col justify-center border-r-4 ${
                      result.isAllSquare 
                        ? 'bg-gray-50 border-r-gray-300' 
                        : result.teamBUp > 0 
                          ? 'bg-red-50 border-r-red-500' 
                          : 'bg-gray-50 border-r-gray-300'
                    }`}>
                      <div className="text-sm font-normal text-red-600">
                        {getPlayerName(match.pairBPlayer1)}
                      </div>
                      <div className="text-sm font-normal text-red-600">
                        {getPlayerName(match.pairBPlayer2)}
                      </div>
                      {result.teamBUp > 0 && (
                        <div className="text-xs font-semibold text-red-700 mt-1">
                          {result.teamBUp} Up
                        </div>
                      )}
                    </div>

                    {/* Hole Number Cell (Center) */}
                    <div className="bg-white flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-800">
                          {result.lastHolePlayed || '-'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {result.lastHolePlayed ? 'HOLE' : 'START'}
                        </div>
                      </div>
                    </div>

                    {/* Team A Cell (Right) */}
                    <div className={`p-3 flex flex-col justify-center border-l-4 ${
                      result.isAllSquare 
                        ? 'bg-gray-50 border-l-gray-300' 
                        : result.teamAUp > 0 
                          ? 'bg-blue-50 border-l-blue-500' 
                          : 'bg-gray-50 border-l-gray-300'
                    }`}>
                      <div className="text-sm font-normal text-blue-600">
                        {getPlayerName(match.pairAPlayer1)}
                      </div>
                      <div className="text-sm font-normal text-blue-600">
                        {getPlayerName(match.pairAPlayer2)}
                      </div>
                      {result.teamAUp > 0 && (
                        <div className="text-xs font-semibold text-blue-700 mt-1">
                          {result.teamAUp} Up
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile responsive handled by Tailwind classes */}
      </CardContent>
    </Card>
  );
}