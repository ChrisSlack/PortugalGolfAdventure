import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Crown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Round, Match, Player, Team } from "@shared/schema";
import { courses } from "@/lib/courseData";

interface MatchplayLeaderboardProps {
  day: 1 | 2 | 3;
  players: Player[];
  teams: Team[];
  rounds: Round[];
}

export default function MatchplayLeaderboard({ day, players, teams, rounds }: MatchplayLeaderboardProps) {
  // Query data for matches
  const { data: allMatches = [] } = useQuery<Match[]>({
    queryKey: ["/api/matches"]
  });

  // Filter data for the selected day
  const dayRounds = rounds.filter(r => r.day === day);
  const dayMatches = allMatches.filter(match => 
    dayRounds.some(round => round.id === match.roundId)
  );

  // Get the main round for this day
  const mainRound = dayRounds[0];
  const selectedCourse = mainRound ? courses.find(c => c.id === mainRound.course) : null;

  const getTeamName = (teamId: number): string => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : "Unknown Team";
  };

  const getPlayerName = (playerId: number): string => {
    const player = players.find(p => p.id === playerId);
    return player ? `${player.firstName} ${player.lastName}` : "Unknown";
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
                {/* Team A */}
                <div className="p-3 bg-white rounded border">
                  <div className="font-medium text-golf-green mb-2">
                    {getTeamName(match.teamA)}
                  </div>
                  <div className="text-sm space-y-1">
                    <div>{getPlayerName(match.pairAPlayer1)}</div>
                    <div>{getPlayerName(match.pairAPlayer2)}</div>
                  </div>
                </div>
                
                {/* VS */}
                <div className="flex items-center justify-center md:col-span-0">
                  <span className="text-gray-400 font-bold">VS</span>
                </div>
                
                {/* Team B */}
                <div className="p-3 bg-white rounded border">
                  <div className="font-medium text-blue-600 mb-2">
                    {getTeamName(match.teamB)}
                  </div>
                  <div className="text-sm space-y-1">
                    <div>{getPlayerName(match.pairBPlayer1)}</div>
                    <div>{getPlayerName(match.pairBPlayer2)}</div>
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