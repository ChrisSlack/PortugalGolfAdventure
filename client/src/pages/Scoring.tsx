import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScoreEntry from "@/components/ScoreEntry";
import Leaderboard from "@/components/Leaderboard";
import TeamLeaderboard from "@/components/TeamLeaderboard";
import { courses } from "@/lib/courseData";
import { Course } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Play, Target, Users, Trophy } from "lucide-react";
import type { Player, Team } from "@shared/schema";

export default function Scoring() {
  const [players, setPlayers] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentRound, setCurrentRound] = useState<{ course: string; date: string; players: string[] } | null>(null);
  const [scores, setScores] = useState<{ [player: string]: { [hole: number]: number } }>({});
  const [scoreEntryOpen, setScoreEntryOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [selectedHole, setSelectedHole] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    const savedPlayers = storage.getPlayers();
    const savedRound = storage.getCurrentRound();
    
    setPlayers(savedPlayers);
    
    if (savedRound) {
      setCurrentRound(savedRound);
      setSelectedCourse(savedRound.course);
      setSelectedDate(savedRound.date);
      const roundKey = `${savedRound.course}-${savedRound.date}`;
      const savedScores = storage.getScores(roundKey);
      setScores(savedScores);
    }
  }, []);

  const handlePlayersChange = (newPlayers: string[]) => {
    setPlayers(newPlayers);
  };

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
    const round = {
      course: selectedCourse,
      date: roundDate,
      players: [...players]
    };

    setCurrentRound(round);
    storage.setCurrentRound(round);
    
    // Initialize empty scores for all players
    const initialScores: { [player: string]: { [hole: number]: number } } = {};
    players.forEach(player => {
      initialScores[player] = {};
    });
    setScores(initialScores);
    
    const roundKey = `${selectedCourse}-${roundDate}`;
    storage.setScores(roundKey, initialScores);

    toast({
      title: "Round Started!",
      description: `New round started at ${courses.find(c => c.id === selectedCourse)?.name}`
    });
  };

  const handleScoreEdit = (player: string, hole: number) => {
    setSelectedPlayer(player);
    setSelectedHole(hole);
    setScoreEntryOpen(true);
  };

  const handleScoreSubmit = (player: string, hole: number, score: number) => {
    if (!currentRound) return;

    const newScores = { ...scores };
    if (!newScores[player]) newScores[player] = {};
    newScores[player][hole] = score;
    
    setScores(newScores);
    
    const roundKey = `${currentRound.course}-${currentRound.date}`;
    storage.setScores(roundKey, newScores);

    toast({
      title: "Score Saved",
      description: `${player} scored ${score} on hole ${hole}`
    });
  };

  const currentCourse = courses.find(c => c.id === selectedCourse);

  const roundDates = [
    { value: '2025-07-02', label: 'July 2, 2025 - NAU Morgado', course: 'nau' },
    { value: '2025-07-03', label: 'July 3, 2025 - Amendoeira', course: 'amendoeira' },
    { value: '2025-07-05', label: 'July 5, 2025 - Quinta do Lago', course: 'quinta' }
  ];

  return (
    <div className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center mb-8">
          <Target className="h-8 w-8 text-golf-green mr-3" />
          <h1 className="text-3xl font-bold text-golf-green">Live Scoring System</h1>
        </div>
        
        {/* Player Management */}
        <div className="mb-8">
          <PlayerManager players={players} onPlayersChange={handlePlayersChange} />
        </div>

        {/* Course Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Course & Round</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="course-select">Golf Course</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Course..." />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name} (Par {course.par})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="round-date">Round Date</Label>
                <Select value={selectedDate} onValueChange={(value) => {
                  setSelectedDate(value);
                  const roundData = roundDates.find(r => r.value === value);
                  if (roundData) {
                    setSelectedCourse(roundData.course);
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Date..." />
                  </SelectTrigger>
                  <SelectContent>
                    {roundDates.map(round => (
                      <SelectItem key={round.value} value={round.value}>
                        {round.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              onClick={startNewRound}
              className="mt-4 golf-green text-white hover:golf-light"
              disabled={!selectedCourse || players.length === 0}
            >
              <Play className="h-4 w-4 mr-2" />
              Start New Round
            </Button>
          </CardContent>
        </Card>

        {/* Live Scorecard */}
        {currentRound && currentCourse && (
          <div className="mb-8">
            <Scorecard
              course={currentCourse}
              players={currentRound.players}
              scores={scores}
              onScoreEdit={handleScoreEdit}
            />
          </div>
        )}

        {/* Current Leaderboard */}
        {currentRound && currentCourse && (
          <Leaderboard
            course={currentCourse}
            players={currentRound.players}
            scores={scores}
          />
        )}

        {/* Score Entry Modal */}
        {currentCourse && (
          <ScoreEntry
            open={scoreEntryOpen}
            onOpenChange={setScoreEntryOpen}
            course={currentCourse}
            players={currentRound?.players || []}
            selectedPlayer={selectedPlayer}
            selectedHole={selectedHole}
            onScoreSubmit={handleScoreSubmit}
          />
        )}
      </div>
    </div>
  );
}
