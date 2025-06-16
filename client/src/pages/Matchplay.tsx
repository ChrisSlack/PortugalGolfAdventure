import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Calendar, Users, Target, Crown, Flag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import MatchplaySetup from "@/components/MatchplaySetup";
import MatchplayScorecard from "@/components/MatchplayScorecard";
import { courses } from "@/lib/courseData";
import type { Round, Match, IndividualMatch, StablefordScore, Player, Team } from "@shared/schema";

export default function Matchplay() {
  const [selectedDay, setSelectedDay] = useState<1 | 2 | 3>(1);
  const [selectedRound, setSelectedRound] = useState<number>();

  const { data: rounds = [] } = useQuery<Round[]>({
    queryKey: ["/api/rounds"]
  });

  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ["/api/players"]
  });

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/teams"]
  });

  const { data: matches = [] } = useQuery<Match[]>({
    queryKey: ["/api/matches", selectedRound],
    enabled: !!selectedRound
  });

  const { data: individualMatches = [] } = useQuery<IndividualMatch[]>({
    queryKey: ["/api/individual-matches", selectedRound],
    enabled: !!selectedRound && selectedDay === 3
  });

  const { data: stablefordScores = [] } = useQuery<StablefordScore[]>({
    queryKey: ["/api/stableford-scores", selectedRound],
    enabled: !!selectedRound
  });

  const matchplayRounds = rounds.filter(r => r.format === "betterball" && r.day === selectedDay);
  const selectedRoundData = rounds.find(r => r.id === selectedRound);
  const course = selectedRoundData ? courses.find(c => c.id === selectedRoundData.course) : null;

  const getGolfDayDate = (day: 1 | 2 | 3): string => {
    const dates = { 1: "July 2", 2: "July 3", 3: "July 5" };
    return dates[day];
  };

  const getTeamName = (teamId: number): string => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : "Unknown Team";
  };

  const getPlayerName = (playerId: number): string => {
    const player = players.find(p => p.id === playerId);
    return player ? `${player.firstName} ${player.lastName}` : "Unknown";
  };

  const calculateMatchStatus = (match: Match): { status: string; leadingTeam?: Team } => {
    // This would calculate based on hole results
    // For now, return placeholder
    return { status: "AS" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Trophy className="h-8 w-8 text-golf-green mr-3" />
            <h1 className="text-3xl font-bold text-golf-green">Portugal 2025 Matchplay</h1>
          </div>
        </div>

        {/* Day Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Golf Days</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedDay.toString()} onValueChange={(value) => setSelectedDay(parseInt(value) as 1 | 2 | 3)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="1">
                  <div className="text-center">
                    <div className="font-medium">Day 1</div>
                    <div className="text-xs text-gray-500">{getGolfDayDate(1)}</div>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="2">
                  <div className="text-center">
                    <div className="font-medium">Day 2</div>
                    <div className="text-xs text-gray-500">{getGolfDayDate(2)}</div>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="3">
                  <div className="text-center">
                    <div className="font-medium">Day 3</div>
                    <div className="text-xs text-gray-500">{getGolfDayDate(3)} (+ Individual)</div>
                  </div>
                </TabsTrigger>
              </TabsList>

              <TabsContent value={selectedDay.toString()} className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Format Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Format</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-golf-green" />
                        <span className="text-sm">Betterball Stableford</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-golf-green" />
                        <span className="text-sm">Best score per pair counts</span>
                      </div>
                      {selectedDay === 3 && (
                        <div className="flex items-center space-x-2">
                          <Crown className="h-4 w-4 text-golf-gold" />
                          <span className="text-sm">+ Individual matchplay</span>
                        </div>
                      )}
                      <div className="mt-4 p-3 bg-gray-50 rounded">
                        <h4 className="font-medium mb-2">Stableford Points</h4>
                        <div className="text-xs space-y-1">
                          <div>Albatross: 5 pts</div>
                          <div>Eagle: 4 pts</div>
                          <div>Birdie: 3 pts</div>
                          <div>Par: 2 pts</div>
                          <div>Bogey: 1 pt</div>
                          <div>Double bogey+: 0 pts</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Course Selection & Setup */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Course Setup</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {matchplayRounds.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-gray-500 mb-4">No matchplay rounds set up for Day {selectedDay}</p>
                          {courses.map(course => (
                            <div key={course.id} className="mb-2">
                              <MatchplaySetup
                                course={course}
                                golfDay={selectedDay}
                                onMatchCreated={(roundId) => setSelectedRound(roundId)}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium">Select Round</label>
                          <Select value={selectedRound?.toString()} onValueChange={(value) => setSelectedRound(parseInt(value))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a round..." />
                            </SelectTrigger>
                            <SelectContent>
                              {matchplayRounds.map((round) => {
                                const roundCourse = courses.find(c => c.id === round.course);
                                return (
                                  <SelectItem key={round.id} value={round.id.toString()}>
                                    {roundCourse?.name} - {round.date}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Match Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Match Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedRound && matches.length > 0 ? (
                        <div className="space-y-3">
                          {matches.map((match, index) => {
                            const { status } = calculateMatchStatus(match);
                            return (
                              <div key={match.id} className="p-3 border rounded">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium">Match {index + 1}</span>
                                  <Badge variant="outline">{status}</Badge>
                                </div>
                                <div className="text-sm text-gray-600">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                                    <span>{getTeamName(match.teamA)}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                                    <span>{getTeamName(match.teamB)}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          
                          {selectedDay === 3 && individualMatches.length > 0 && (
                            <div className="mt-4">
                              <h4 className="font-medium mb-2">Individual Matches</h4>
                              {individualMatches.map((match, index) => (
                                <div key={match.id} className="p-2 border rounded text-sm">
                                  {getPlayerName(match.player1)} vs {getPlayerName(match.player2)}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          {selectedRound ? "No matches found" : "Select a round to view matches"}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Matchplay Scorecard */}
                {selectedRound && course && matches.length > 0 && (
                  <div className="mt-8">
                    <h2 className="text-2xl font-bold text-golf-green mb-4">Live Scoring</h2>
                    {matches.map((match) => {
                      const teamA = teams.find(t => t.id === match.teamA);
                      const teamB = teams.find(t => t.id === match.teamB);
                      if (!teamA || !teamB) return null;

                      return (
                        <div key={match.id} className="mb-8">
                          <MatchplayScorecard
                            course={course}
                            match={match}
                            teamA={teamA}
                            teamB={teamB}
                            players={players}
                            stablefordScores={stablefordScores}
                            onScoreUpdate={(playerId, hole, grossScore) => {
                              // Handle score updates
                              console.log("Score update:", { playerId, hole, grossScore });
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}