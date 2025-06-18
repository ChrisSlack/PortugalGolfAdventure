import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Crown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Round, Match, Player, Team, Score } from "@shared/schema";
import { courses } from "@/lib/courseData";

interface MatchplayLeaderboardProps {
  day: 1 | 2 | 3;
  players: Player[];
  teams: Team[];
  rounds: Round[];
}

export default function MatchplayLeaderboard({ day, players = [], teams = [], rounds = [] }: MatchplayLeaderboardProps) {
  const { data: allMatches = [] } = useQuery<Match[]>({
    queryKey: ["/api/matches"]
  });

  const { data: allScores = [] } = useQuery<Score[]>({
    queryKey: ["/api/scores/all"]
  });

  const dayRounds = rounds?.filter(r => r.day === day) || [];
  const dayMatches = allMatches?.filter(match => 
    dayRounds.some(round => round.id === match.roundId)
  ) || [];

  const mainRound = dayRounds[0];
  const selectedCourse = mainRound ? courses.find(c => c.id === mainRound.course) : null;

  const getTeamName = (teamId: number): string => {
    if (!teams || !Array.isArray(teams)) return "Unknown Team";
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : "Unknown Team";
  };

  const getPlayerName = (playerId: number): string => {
    if (!players || !Array.isArray(players)) return "Unknown Player";
    const player = players.find(p => p.id === playerId);
    return player ? `${player.firstName} ${player.lastName}` : "Unknown Player";
  };

  const calculateStablefordPoints = (playerId: number, roundId: number): number => {
    if (!selectedCourse || !mainRound) return 0;
    
    const player = players.find(p => p.id === playerId);
    if (!player) return 0;

    const playerScores = allScores.filter(s => s.playerId === playerId && s.roundId === roundId);
    let totalPoints = 0;

    for (const score of playerScores) {
      const hole = selectedCourse.holes.find(h => h.hole === score.hole);
      if (!hole) continue;

      const handicap = player.handicap || 0;
      const holeHandicap = hole.handicap;
      
      // Calculate handicap strokes for this hole
      const handicapStrokes = Math.floor((handicap * holeHandicap + 17) / 18);
      const netScore = Math.max(score.score - handicapStrokes, 1);
      
      // Calculate Stableford points based on net score vs par
      const diff = netScore - hole.par;
      if (diff <= -2) totalPoints += 4;      // Eagle or better
      else if (diff === -1) totalPoints += 3; // Birdie
      else if (diff === 0) totalPoints += 2;  // Par
      else if (diff === 1) totalPoints += 1;  // Bogey
      // Double bogey or worse = 0 points
    }

    return totalPoints;
  };

  if (!mainRound || !selectedCourse || dayMatches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>Day {day} Matchplay Leaderboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No matchplay rounds set up for Day {day}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-5 w-5" />
          <span>Day {day} Matchplay Leaderboard - {selectedCourse.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dayMatches.map((match, index) => (
            <div key={match.id} className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-blue-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Crown className="h-4 w-4 text-golf-green" />
                  <span className="font-medium">Fourball {index + 1}</span>
                </div>
                <Badge variant="outline" className="text-golf-green border-golf-green">
                  {match.status === 'active' ? 'In Progress' : match.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-white rounded border">
                  <div className="font-medium text-golf-green mb-2">
                    {getTeamName(match.teamA)}
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>{getPlayerName(match.pairAPlayer1)}</span>
                      <span className="font-bold text-golf-green">
                        {calculateStablefordPoints(match.pairAPlayer1, mainRound.id)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{getPlayerName(match.pairAPlayer2)}</span>
                      <span className="font-bold text-golf-green">
                        {calculateStablefordPoints(match.pairAPlayer2, mainRound.id)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-white rounded border">
                  <div className="font-medium text-blue-600 mb-2">
                    {getTeamName(match.teamB)}
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>{getPlayerName(match.pairBPlayer1)}</span>
                      <span className="font-bold text-blue-600">
                        {calculateStablefordPoints(match.pairBPlayer1, mainRound.id)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{getPlayerName(match.pairBPlayer2)}</span>
                      <span className="font-bold text-blue-600">
                        {calculateStablefordPoints(match.pairBPlayer2, mainRound.id)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 text-center">
                <Badge variant="secondary">
                  Match Status: AS (All Square)
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}