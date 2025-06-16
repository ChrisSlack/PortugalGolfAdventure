import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Crown, Target } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Round, Match, StablefordScore, Player, Team } from "@shared/schema";
import { courses } from "@/lib/courseData";

interface MatchplayLeaderboardProps {
  players: Player[];
  teams: Team[];
}

// Calculate Stableford points
function calculateStablefordPoints(grossScore: number, par: number, handicap: number, holeHandicap: number): number {
  const strokesReceived = Math.floor(handicap / 18) + (handicap % 18 >= holeHandicap ? 1 : 0);
  const netScore = grossScore - strokesReceived;
  const scoreToPar = netScore - par;
  
  if (scoreToPar <= -3) return 5;
  if (scoreToPar === -2) return 4;
  if (scoreToPar === -1) return 3;
  if (scoreToPar === 0) return 2;
  if (scoreToPar === 1) return 1;
  return 0;
}

// Calculate match status
function calculateMatchStatus(holesWon: number, holesLost: number, holesPlayed: number): { status: string; leadingTeam: 'A' | 'B' | null } {
  const lead = holesWon - holesLost;
  const holesRemaining = 18 - holesPlayed;
  
  if (lead === 0) return { status: "AS", leadingTeam: null };
  
  const leadingTeam = lead > 0 ? 'A' : 'B';
  const absLead = Math.abs(lead);
  
  if (absLead > holesRemaining) {
    return { status: `${absLead}&${holesRemaining + 1}`, leadingTeam };
  }
  
  if (holesRemaining === 0) {
    return { status: `${absLead}UP`, leadingTeam };
  }
  
  return { status: `${absLead}UP`, leadingTeam };
}

export default function MatchplayLeaderboard({ players, teams }: MatchplayLeaderboardProps) {
  const { data: rounds = [] } = useQuery<Round[]>({
    queryKey: ["/api/rounds"]
  });

  const matchplayRounds = rounds.filter(r => r.format === "betterball" && r.day);
  
  // Get round IDs for each day
  const day1Round = matchplayRounds.find(r => r.day === 1);
  const day2Round = matchplayRounds.find(r => r.day === 2);
  const day3Round = matchplayRounds.find(r => r.day === 3);

  // Query data for all days - get all matches and filter by day
  const { data: allMatches = [] } = useQuery<Match[]>({
    queryKey: ["/api/matches"]
  });

  const { data: allStablefordScores = [] } = useQuery<StablefordScore[]>({
    queryKey: ["/api/stableford-scores"]
  });

  // Filter matches by day based on round association
  const day1Rounds = matchplayRounds.filter(r => r.day === 1);
  const day1Matches = allMatches.filter(match => 
    day1Rounds.some(round => round.id === match.roundId)
  );
  
  const day1Scores = allStablefordScores.filter(score =>
    day1Rounds.some(round => round.id === score.roundId)
  );

  // Filter Day 2 and Day 3 data
  const day2Rounds = matchplayRounds.filter(r => r.day === 2);
  const day2Matches = allMatches.filter(match => 
    day2Rounds.some(round => round.id === match.roundId)
  );
  const day2Scores = allStablefordScores.filter(score =>
    day2Rounds.some(round => round.id === score.roundId)
  );

  const day3Rounds = matchplayRounds.filter(r => r.day === 3);
  const day3Matches = allMatches.filter(match => 
    day3Rounds.some(round => round.id === match.roundId)
  );
  const day3Scores = allStablefordScores.filter(score =>
    day3Rounds.some(round => round.id === score.roundId)
  );

  const getMatchplayData = (day: 1 | 2 | 3) => {
    let round, matches, stablefordScores;
    
    if (day === 1) {
      round = day1Round;
      matches = day1Matches;
      stablefordScores = day1Scores;
    } else if (day === 2) {
      round = day2Round;
      matches = day2Matches;
      stablefordScores = day2Scores;
    } else {
      round = day3Round;
      matches = day3Matches;
      stablefordScores = day3Scores;
    }

    if (!round) return null;
    
    const course = courses.find(c => c.id === round.course);
    if (!course) return null;
    
    return { matches, stablefordScores, course, round };
  };

  const MatchDayResults = ({ day }: { day: 1 | 2 | 3 }) => {
    const data = getMatchplayData(day);
    if (!data || !data.course || data.matches.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          {!data ? `No matchplay rounds set up for Day ${day}` : 'No matches found for this round'}
        </div>
      );
    }

    const { matches, stablefordScores, course } = data;

    return (
      <div className="space-y-4">
        {matches.map((match, index) => {
          const teamA = teams.find(t => t.id === match.teamA);
          const teamB = teams.find(t => t.id === match.teamB);
          if (!teamA || !teamB) return null;

          // Get pair players
          const pairAPlayers = [
            players.find(p => p.id === match.pairAPlayer1),
            players.find(p => p.id === match.pairAPlayer2)
          ].filter(Boolean) as Player[];

          const pairBPlayers = [
            players.find(p => p.id === match.pairBPlayer1),
            players.find(p => p.id === match.pairBPlayer2)
          ].filter(Boolean) as Player[];

          // Calculate hole results
          const holeResults = (course?.holes || []).map(hole => {
            const pairAScores = pairAPlayers.map(player => {
              const score = stablefordScores.find(s => s.playerId === player.id && s.hole === hole.hole);
              return score ? score.stablefordPoints : 0;
            });
            
            const pairBScores = pairBPlayers.map(player => {
              const score = stablefordScores.find(s => s.playerId === player.id && s.hole === hole.hole);
              return score ? score.stablefordPoints : 0;
            });

            const bestA = Math.max(...pairAScores, 0);
            const bestB = Math.max(...pairBScores, 0);
            
            let winner: 'teamA' | 'teamB' | 'tie' = 'tie';
            if (bestA > bestB) winner = 'teamA';
            else if (bestB > bestA) winner = 'teamB';

            return { hole: hole.hole, winner, bestA, bestB };
          });

          const teamAWins = holeResults.filter(h => h.winner === 'teamA').length;
          const teamBWins = holeResults.filter(h => h.winner === 'teamB').length;
          const holesPlayed = holeResults.filter(h => h.bestA > 0 || h.bestB > 0).length;
          
          const matchStatus = calculateMatchStatus(teamAWins, teamBWins, holesPlayed);

          return (
            <Card key={match.id} className="border-golf-green">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">Match {index + 1}</span>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline" 
                      className={`text-lg px-3 py-1 ${
                        matchStatus.leadingTeam === 'A' ? 'bg-blue-100 text-blue-800' :
                        matchStatus.leadingTeam === 'B' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100'
                      }`}
                    >
                      {matchStatus.status}
                    </Badge>
                    {matchStatus.leadingTeam && (
                      <Crown className="h-4 w-4 text-golf-gold" />
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6 mb-4">
                  {/* Team A */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <h3 className="font-bold text-blue-600">{teamA.name}</h3>
                      {matchStatus.leadingTeam === 'A' && (
                        <Crown className="h-4 w-4 text-golf-gold" />
                      )}
                    </div>
                    <div className="text-sm space-y-1">
                      {pairAPlayers.map(player => (
                        <div key={player.id} className="flex justify-between">
                          <span>{player.firstName} {player.lastName}</span>
                          <Badge variant="outline" className="text-xs">
                            HCP: {player.handicap || 0}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <div className="text-sm font-medium text-blue-600">
                      Holes Won: {teamAWins}
                    </div>
                  </div>

                  {/* Team B */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <h3 className="font-bold text-red-600">{teamB.name}</h3>
                      {matchStatus.leadingTeam === 'B' && (
                        <Crown className="h-4 w-4 text-golf-gold" />
                      )}
                    </div>
                    <div className="text-sm space-y-1">
                      {pairBPlayers.map(player => (
                        <div key={player.id} className="flex justify-between">
                          <span>{player.firstName} {player.lastName}</span>
                          <Badge variant="outline" className="text-xs">
                            HCP: {player.handicap || 0}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <div className="text-sm font-medium text-red-600">
                      Holes Won: {teamBWins}
                    </div>
                  </div>
                </div>

                {/* Hole-by-Hole Progress */}
                {holesPlayed > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-2">Hole Progress ({holesPlayed}/18)</h4>
                    <div className="grid grid-cols-9 gap-1 mb-2">
                      {holeResults.slice(0, 9).map((result) => (
                        <div key={result.hole} className="text-center">
                          <div className="text-xs font-medium mb-1">{result.hole}</div>
                          <div className="h-6 flex items-center justify-center">
                            {result.winner === 'teamA' && <div className="w-4 h-4 bg-blue-500 rounded-full"></div>}
                            {result.winner === 'teamB' && <div className="w-4 h-4 bg-red-500 rounded-full"></div>}
                            {result.winner === 'tie' && <div className="w-4 h-4 bg-gray-300 rounded-full"></div>}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-9 gap-1">
                      {holeResults.slice(9).map((result) => (
                        <div key={result.hole} className="text-center">
                          <div className="text-xs font-medium mb-1">{result.hole}</div>
                          <div className="h-6 flex items-center justify-center">
                            {result.winner === 'teamA' && <div className="w-4 h-4 bg-blue-500 rounded-full"></div>}
                            {result.winner === 'teamB' && <div className="w-4 h-4 bg-red-500 rounded-full"></div>}
                            {result.winner === 'tie' && <div className="w-4 h-4 bg-gray-300 rounded-full"></div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  if (matchplayRounds.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-golf-green" />
            <span>Matchplay Leaderboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No matchplay rounds have been set up yet.
            <br />
            Visit the Matchplay page to create team competitions.
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
          <span>Live Matchplay Results</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="1" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="1">Day 1</TabsTrigger>
            <TabsTrigger value="2">Day 2</TabsTrigger>
            <TabsTrigger value="3">Day 3</TabsTrigger>
          </TabsList>
          
          <TabsContent value="1" className="mt-4">
            <MatchDayResults day={1} />
          </TabsContent>
          
          <TabsContent value="2" className="mt-4">
            <MatchDayResults day={2} />
          </TabsContent>
          
          <TabsContent value="3" className="mt-4">
            <MatchDayResults day={3} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}