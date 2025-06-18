import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, Trophy } from "lucide-react";
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
    
    const handicapStrokes = (handicap as number) >= holeHandicap ? Math.floor((handicap as number) / 18) + ((handicap as number) % 18 >= holeHandicap ? 1 : 0) : 0;
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

  const calculateMatchResult = (match: Match): { teamAScore: number, teamBScore: number, winner: string } => {
    if (!mainRound) return { teamAScore: 0, teamBScore: 0, winner: "TIE" };

    const teamAScore = calculateBetterballScore(match.pairAPlayer1, match.pairAPlayer2, mainRound.id);
    const teamBScore = calculateBetterballScore(match.pairBPlayer1, match.pairBPlayer2, mainRound.id);

    let winner = "TIE";
    if (teamAScore > teamBScore) winner = "TEAM A";
    else if (teamBScore > teamAScore) winner = "TEAM B";

    return { teamAScore, teamBScore, winner };
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

          {/* Overall Team Scores */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className={`p-4 rounded-lg text-center ${teamATotal > teamBTotal ? 'bg-green-100 border-2 border-green-500' : 'bg-blue-100 border-2 border-blue-500'}`}>
              <div className="font-bold text-lg text-blue-600">Team A</div>
              <div className="text-2xl font-bold">{teamATotal}</div>
              {teamATotal > teamBTotal && <Crown className="h-5 w-5 mx-auto text-yellow-500 mt-1" />}
            </div>
            <div className={`p-4 rounded-lg text-center ${teamBTotal > teamATotal ? 'bg-green-100 border-2 border-green-500' : 'bg-red-100 border-2 border-red-500'}`}>
              <div className="font-bold text-lg text-red-600">Team B</div>
              <div className="text-2xl font-bold">{teamBTotal}</div>
              {teamBTotal > teamATotal && <Crown className="h-5 w-5 mx-auto text-yellow-500 mt-1" />}
            </div>
          </div>

          {/* Individual Fourball Results */}
          <div className="space-y-4">
            {dayMatches.map((match, index) => {
              const result = calculateMatchResult(match);
              return (
                <div key={match.id} className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-blue-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Crown className="h-4 w-4 text-golf-green" />
                      <span className="font-medium">Fourball {index + 1}</span>
                    </div>
                    <Badge variant="outline" className="text-golf-green border-golf-green">
                      {result.winner === "TIE" ? "Tied" : `${result.winner} Wins`}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-3 rounded border-l-4 ${result.teamAScore > result.teamBScore ? 'bg-green-50 border-l-green-500' : 'bg-white border-l-blue-500'}`}>
                      <div className="font-medium text-blue-600 mb-2">Team A</div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>{getPlayerName(match.pairAPlayer1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{getPlayerName(match.pairAPlayer2)}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-right">
                        <span className="text-lg font-bold text-blue-600">{result.teamAScore}</span>
                        <span className="text-sm text-gray-600 ml-1">points</span>
                      </div>
                    </div>

                    <div className={`p-3 rounded border-l-4 ${result.teamBScore > result.teamAScore ? 'bg-green-50 border-l-green-500' : 'bg-white border-l-red-500'}`}>
                      <div className="font-medium text-red-600 mb-2">Team B</div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>{getPlayerName(match.pairBPlayer1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{getPlayerName(match.pairBPlayer2)}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-right">
                        <span className="text-lg font-bold text-red-600">{result.teamBScore}</span>
                        <span className="text-sm text-gray-600 ml-1">points</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}