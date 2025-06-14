import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScoreEntry from "@/components/ScoreEntry";
import Leaderboard from "@/components/Leaderboard";
import TeamLeaderboard from "@/components/TeamLeaderboard";
import Scorecard from "@/components/Scorecard";
import RoundHistory from "@/components/RoundHistory";
import { courses } from "@/lib/courseData";
import { Course } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Play, Target, Users, Trophy, Loader2, History } from "lucide-react";
import type { Player, Team, Round, Score } from "@shared/schema";

export default function Scoring() {
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentRoundId, setCurrentRoundId] = useState<number | null>(null);
  const [scoreEntryOpen, setScoreEntryOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number>(0);
  const [selectedHole, setSelectedHole] = useState<number>(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch players and teams
  const { data: players = [], isLoading: playersLoading } = useQuery<Player[]>({
    queryKey: ['/api/players']
  });

  const { data: teams = [], isLoading: teamsLoading } = useQuery<Team[]>({
    queryKey: ['/api/teams']
  });

  // Fetch rounds
  const { data: rounds = [] } = useQuery<Round[]>({
    queryKey: ['/api/rounds']
  });

  // Fetch scores for current round
  const { data: scores = [] } = useQuery<Score[]>({
    queryKey: ['/api/scores', currentRoundId],
    queryFn: () => fetch(`/api/scores/${currentRoundId}`).then(res => res.json()),
    enabled: !!currentRoundId
  });

  // Create new round mutation
  const createRoundMutation = useMutation({
    mutationFn: async (roundData: { course: string; date: string; players: string[] }) => {
      const response = await apiRequest('POST', '/api/rounds', roundData);
      return await response.json();
    },
    onSuccess: (newRound) => {
      setCurrentRoundId(newRound.id);
      queryClient.invalidateQueries({ queryKey: ['/api/rounds'] });
      toast({
        title: "Round Started",
        description: `New round started at ${selectedCourse}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start new round",
        variant: "destructive",
      });
    }
  });

  // Create score mutation
  const createScoreMutation = useMutation({
    mutationFn: async (scoreData: { roundId: number; playerId: number; hole: number; score: number; threePutt?: boolean; pickedUp?: boolean; inWater?: boolean; inBunker?: boolean }) => {
      const response = await apiRequest('POST', '/api/scores', scoreData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scores', currentRoundId] });
      setScoreEntryOpen(false);
      toast({
        title: "Score Saved",
        description: "Score has been recorded successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save score",
        variant: "destructive",
      });
    }
  });

  const startNewRound = () => {
    if (!selectedCourse || players.length === 0) {
      toast({
        title: "Cannot Start Round",
        description: "Please select a course and add players first!",
        variant: "destructive"
      });
      return;
    }

    const roundDate = selectedDate || new Date().toISOString().split('T')[0];
    const playerNames = players.map(p => `${p.firstName} ${p.lastName}`);
    
    createRoundMutation.mutate({
      course: selectedCourse,
      date: roundDate,
      players: playerNames
    });
  };

  const handleScoreEdit = (playerName: string, hole: number) => {
    const player = players.find(p => `${p.firstName} ${p.lastName}` === playerName);
    if (player) {
      setSelectedPlayerId(player.id);
      setSelectedHole(hole);
      setScoreEntryOpen(true);
    }
  };

  const handleScoreSubmit = (playerName: string, hole: number, score: number, options: {
    threePutt: boolean;
    pickedUp: boolean;
    inWater: boolean;
    inBunker: boolean;
  }) => {
    if (!currentRoundId) return;

    const player = players.find(p => `${p.firstName} ${p.lastName}` === playerName);
    if (!player) return;

    createScoreMutation.mutate({
      roundId: currentRoundId,
      playerId: player.id,
      hole,
      score,
      ...options
    });
  };

  const currentCourse = courses.find(c => c.id === selectedCourse);
  const currentRound = rounds.find(r => r.id === currentRoundId);

  // Convert scores to the format expected by components
  const formattedScores: { [playerId: number]: { [hole: number]: number } } = {};
  scores.forEach(score => {
    if (!formattedScores[score.playerId]) {
      formattedScores[score.playerId] = {};
    }
    formattedScores[score.playerId][score.hole] = score.score;
  });

  // Convert to string-based format for Leaderboard component
  const stringFormattedScores: { [playerName: string]: { [hole: number]: number } } = {};
  const stringFormattedStatistics: { [playerName: string]: { [hole: number]: { threePutt: boolean; pickedUp: boolean; inWater: boolean; inBunker: boolean } } } = {};
  
  Object.entries(formattedScores).forEach(([playerId, scoreData]) => {
    const player = players.find(p => p.id === parseInt(playerId));
    if (player) {
      const playerName = `${player.firstName} ${player.lastName}`;
      stringFormattedScores[playerName] = scoreData;
      
      // Initialize statistics for this player
      stringFormattedStatistics[playerName] = {};
      scores.forEach(score => {
        if (score.playerId === parseInt(playerId)) {
          stringFormattedStatistics[playerName][score.hole] = {
            threePutt: score.threePutt || false,
            pickedUp: score.pickedUp || false,
            inWater: score.inWater || false,
            inBunker: score.inBunker || false
          };
        }
      });
    }
  });

  const roundDates = [
    { value: '2025-07-02', label: 'July 2, 2025 - NAU Morgado', course: 'nau' },
    { value: '2025-07-03', label: 'July 3, 2025 - Amendoeira', course: 'amendoeira' },
    { value: '2025-07-05', label: 'July 5, 2025 - Quinta do Lago', course: 'quinta' }
  ];

  if (playersLoading || teamsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Golf Scoring</h1>
        <p className="text-gray-600">Track scores and view leaderboards</p>
      </div>

      {!currentRound ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Play className="h-5 w-5 text-golf-green" />
              <span>Start New Round</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Select Date</Label>
                <Select value={selectedDate} onValueChange={(value) => {
                  setSelectedDate(value);
                  const dateInfo = roundDates.find(d => d.value === value);
                  if (dateInfo) {
                    setSelectedCourse(dateInfo.course);
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose round date" />
                  </SelectTrigger>
                  <SelectContent>
                    {roundDates.map((date) => (
                      <SelectItem key={date.value} value={date.value}>
                        {date.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="course">Golf Course</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-4">
              <p className="text-sm text-gray-600 mb-4">
                {players.length} players ready to play
              </p>
              <Button 
                onClick={startNewRound} 
                className="w-full golf-button"
                disabled={!selectedCourse || players.length === 0 || createRoundMutation.isPending}
              >
                {createRoundMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting Round...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start Round
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-golf-green" />
                  <span>Current Round</span>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setCurrentRoundId(null);
                    setSelectedCourse('');
                    setSelectedDate('');
                  }}
                >
                  End Round
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Course</p>
                  <p className="font-semibold">{currentCourse?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold">{currentRound?.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Players</p>
                  <p className="font-semibold">{players.length} active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="scorecard" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="scorecard" className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Scorecard</span>
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="flex items-center space-x-2">
                <Trophy className="h-4 w-4" />
                <span>Individual</span>
              </TabsTrigger>
              <TabsTrigger value="teams" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Teams</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center space-x-2">
                <History className="h-4 w-4" />
                <span>History</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scorecard">
              {currentCourse && (
                <Scorecard 
                  course={currentCourse}
                  players={players.map(p => `${p.firstName} ${p.lastName}`)}
                  scores={stringFormattedScores}
                  statistics={stringFormattedStatistics}
                  onScoreEdit={handleScoreEdit}
                  isEditable={true}
                />
              )}
            </TabsContent>

            <TabsContent value="leaderboard">
              {currentCourse && (
                <Leaderboard 
                  course={currentCourse}
                  players={players.map(p => `${p.firstName} ${p.lastName}`)}
                  scores={stringFormattedScores}
                />
              )}
            </TabsContent>

            <TabsContent value="teams">
              {currentCourse && (
                <TeamLeaderboard 
                  course={currentCourse}
                  players={players}
                  teams={teams}
                  scores={formattedScores}
                />
              )}
            </TabsContent>

            <TabsContent value="history">
              <RoundHistory 
                rounds={rounds}
                scores={scores}
                players={players}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}

      {currentCourse && (
        <ScoreEntry
          open={scoreEntryOpen}
          onOpenChange={setScoreEntryOpen}
          course={currentCourse}
          players={players.map(p => `${p.firstName} ${p.lastName}`)}
          selectedPlayer={players.find(p => p.id === selectedPlayerId) ? `${players.find(p => p.id === selectedPlayerId)?.firstName} ${players.find(p => p.id === selectedPlayerId)?.lastName}` : undefined}
          selectedHole={selectedHole}
          onScoreSubmit={handleScoreSubmit}
        />
      )}
    </div>
  );
}