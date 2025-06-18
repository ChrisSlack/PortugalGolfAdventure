import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, BarChart3, Calculator, Trophy } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { courses } from "@/lib/courseData";
import ScoreEntryFixed from "@/components/ScoreEntryFixed";
import type { Round, Player, Score, Team } from "@shared/schema";

export default function Scoring() {
  const [scoreEntryOpen, setScoreEntryOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedHole, setSelectedHole] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'scores' | 'stats'>('scores');
  const [scoreMode, setScoreMode] = useState<'gross' | 'net' | 'stableford'>('gross');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rounds = [] } = useQuery<Round[]>({
    queryKey: ['/api/rounds']
  });

  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ['/api/players']
  });

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ['/api/teams']
  });

  const { data: allScores = [] } = useQuery<Score[]>({
    queryKey: ['/api/scores/all']
  });

  // Get the current round (only one should exist)
  const currentRound = rounds[0];
  const currentCourse = currentRound ? courses.find(c => c.id === currentRound.course) : null;

  // Create new round mutation
  const createRound = useMutation({
    mutationFn: async (courseId: string) => {
      const golfDays = [
        { date: '2025-07-02', course: 'nau', day: 1 },
        { date: '2025-07-03', course: 'amendoeira', day: 2 }, 
        { date: '2025-07-05', course: 'quinta', day: 3 }
      ];
      
      const dayInfo = golfDays.find(d => d.course === courseId) || golfDays[0];
      
      return fetch('/api/rounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course: courseId,
          date: dayInfo.date,
          day: dayInfo.day,
          format: 'stroke'
        })
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rounds'] });
      toast({
        title: "Round created",
        description: "New scorecard ready for scoring",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating round",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete round mutation
  const deleteRound = useMutation({
    mutationFn: async (roundId: number) => {
      return fetch(`/api/rounds/${roundId}`, {
        method: 'DELETE'
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rounds'] });
      queryClient.invalidateQueries({ queryKey: ['/api/scores/all'] });
      toast({
        title: "Round deleted",
        description: "Scorecard and all scores removed",
      });
    }
  });

  const handleScoreEdit = (player: Player, hole: number) => {
    setSelectedPlayer(player);
    setSelectedHole(hole);
    setScoreEntryOpen(true);
  };

  const getPlayerScore = (playerId: number, hole: number): number | undefined => {
    const score = allScores.find(s => s.playerId === playerId && s.hole === hole && s.roundId === currentRound?.id);
    return score?.score;
  };

  const getPlayerStats = (playerId: number, hole: number) => {
    const score = allScores.find(s => s.playerId === playerId && s.hole === hole && s.roundId === currentRound?.id);
    return {
      threePutt: score?.threePutt || false,
      pickedUp: score?.pickedUp || false,
      inWater: score?.inWater || false,
      inBunker: score?.inBunker || false,
    };
  };

  const calculateStablefordPoints = (player: Player, hole: number): number => {
    const grossScore = getPlayerScore(player.id, hole);
    if (!grossScore || !currentCourse) return 0;
    
    const holeData = currentCourse.holes.find(h => h.hole === hole);
    if (!holeData) return 0;
    
    const par = holeData.par;
    const handicap = player.handicap || 0;
    const holeHandicap = holeData.handicap;
    
    // Calculate strokes received
    const strokesReceived = Math.floor(handicap / 18) + (handicap % 18 >= holeHandicap ? 1 : 0);
    const netScore = grossScore - strokesReceived;
    
    // Calculate Stableford points
    const diff = netScore - par;
    if (diff <= -2) return 4; // Eagle or better
    if (diff === -1) return 3; // Birdie
    if (diff === 0) return 2;  // Par
    if (diff === 1) return 1;  // Bogey
    return 0; // Double bogey or worse
  };

  const getScoreClass = (score: number | undefined, par: number): string => {
    if (!score) return 'bg-gray-100 text-gray-400';
    const diff = score - par;
    if (diff <= -2) return 'bg-yellow-200 text-yellow-800'; // Eagle
    if (diff === -1) return 'bg-green-200 text-green-800'; // Birdie
    if (diff === 0) return 'bg-blue-200 text-blue-800'; // Par
    if (diff === 1) return 'bg-orange-200 text-orange-800'; // Bogey
    if (diff === 2) return 'bg-red-200 text-red-800'; // Double bogey
    return 'bg-red-300 text-red-900'; // Triple bogey or worse
  };

  if (!currentRound && rounds.length === 0) {
    return (
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">No Active Round</h1>
            <p className="text-gray-600 mb-6">Create a new round to start scoring</p>
            <div className="flex gap-4 justify-center">
              {courses.map(course => (
                <Button
                  key={course.id}
                  onClick={() => createRound.mutate(course.id)}
                  disabled={createRound.isPending}
                >
                  {course.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCourse) {
    return (
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Course Not Found</h1>
            <p className="text-gray-600">Unable to load course data for scoring.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Scoring</h1>
            <p className="text-gray-600">
              {currentCourse.name} - Day {currentRound.day}
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteRound.mutate(currentRound.id)}
            disabled={deleteRound.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Round
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Scorecard
            </CardTitle>
            
            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'scores' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('scores')}
              >
                Scores
              </Button>
              <Button
                variant={viewMode === 'stats' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('stats')}
                className="flex items-center gap-1"
              >
                <BarChart3 className="h-4 w-4" />
                Stats
              </Button>
            </div>

            {/* Score Mode Toggle */}
            {viewMode === 'scores' && (
              <div className="flex gap-2 mt-2">
                <p className="text-sm text-gray-600 mr-2">Scoring Mode:</p>
                <Button
                  variant={scoreMode === 'gross' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setScoreMode('gross')}
                >
                  Gross
                </Button>
                <Button
                  variant={scoreMode === 'net' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setScoreMode('net')}
                >
                  Net
                </Button>
                <Button
                  variant={scoreMode === 'stableford' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setScoreMode('stableford')}
                  className="flex items-center gap-1"
                >
                  <Calculator className="h-4 w-4" />
                  Stableford
                </Button>
              </div>
            )}
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-2 border-b font-medium">Player</th>
                    {Array.from({ length: 18 }, (_, i) => i + 1).map(hole => (
                      <th key={hole} className="text-center p-2 border-b font-medium min-w-[50px]">
                        {hole}
                      </th>
                    ))}
                    <th className="text-center p-2 border-b font-medium">Total</th>
                  </tr>
                  <tr>
                    <td className="p-2 border-b text-sm text-gray-600">Par</td>
                    {currentCourse.holes.map(hole => (
                      <td key={hole.hole} className="text-center p-2 border-b text-sm text-gray-600">
                        {hole.par}
                      </td>
                    ))}
                    <td className="text-center p-2 border-b text-sm text-gray-600">
                      {currentCourse.holes.reduce((sum, hole) => sum + hole.par, 0)}
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {players.map(player => {
                    // Get player's team to determine color
                    const playerTeam = teams.find(t => t.id === player.teamId);
                    const teamIndex = teams.findIndex(t => t.id === player.teamId);
                    const teamColor = teamIndex === 0 ? 'border-l-blue-500' : 'border-l-red-500';
                    
                    return (
                    <tr key={player.id}>
                      <td className={`p-2 border-b font-medium border-l-4 ${teamColor}`}>
                        <div className="flex items-center space-x-2">
                          <span>{player.firstName} {player.lastName}</span>
                        </div>
                      </td>
                      {Array.from({ length: 18 }, (_, i) => i + 1).map(hole => {
                        const score = getPlayerScore(player.id, hole);
                        const holeData = currentCourse.holes.find(h => h.hole === hole);
                        const par = holeData?.par || 4;
                        const stats = getPlayerStats(player.id, hole);
                        
                        let displayValue = '-';
                        let cellClass = 'text-center p-2 border-b cursor-pointer hover:bg-gray-50';
                        
                        if (score) {
                          if (scoreMode === 'gross') {
                            displayValue = score.toString();
                            cellClass += ' ' + getScoreClass(score, par);
                          } else if (scoreMode === 'net') {
                            const handicap = player.handicap || 0;
                            const holeHandicap = holeData?.handicap || 18;
                            const strokesReceived = Math.floor(handicap / 18) + (handicap % 18 >= holeHandicap ? 1 : 0);
                            const netScore = score - strokesReceived;
                            displayValue = netScore.toString();
                            cellClass += ' ' + getScoreClass(netScore, par);
                          } else if (scoreMode === 'stableford') {
                            const points = calculateStablefordPoints(player, hole);
                            displayValue = points.toString();
                            cellClass += points > 2 ? ' bg-green-200 text-green-800' : 
                                        points === 2 ? ' bg-blue-200 text-blue-800' :
                                        points === 1 ? ' bg-orange-200 text-orange-800' : 
                                        ' bg-gray-200 text-gray-600';
                          }
                        }

                        return (
                          <td 
                            key={hole}
                            className={cellClass}
                            onClick={() => handleScoreEdit(player, hole)}
                          >
                            {viewMode === 'scores' ? (
                              displayValue
                            ) : (
                              <div className="flex justify-center gap-1">
                                {stats.threePutt && <Badge variant="secondary" className="text-xs">3P</Badge>}
                                {stats.pickedUp && <Badge variant="secondary" className="text-xs">PU</Badge>}
                                {stats.inWater && <Badge variant="secondary" className="text-xs">H2O</Badge>}
                                {stats.inBunker && <Badge variant="secondary" className="text-xs">B</Badge>}
                              </div>
                            )}
                          </td>
                        );
                      })}
                      <td className="text-center p-2 border-b font-bold">
                        {scoreMode === 'stableford' 
                          ? Array.from({ length: 18 }, (_, i) => i + 1)
                              .reduce((sum, hole) => sum + calculateStablefordPoints(player, hole), 0)
                          : allScores
                              .filter(s => s.playerId === player.id && s.roundId === currentRound.id)
                              .reduce((sum, s) => {
                                if (scoreMode === 'net') {
                                  const holeData = currentCourse.holes.find(h => h.hole === s.hole);
                                  const handicap = player.handicap || 0;
                                  const holeHandicap = holeData?.handicap || 18;
                                  const strokesReceived = Math.floor(handicap / 18) + (handicap % 18 >= holeHandicap ? 1 : 0);
                                  return sum + (s.score - strokesReceived);
                                }
                                return sum + s.score;
                              }, 0)
                        }
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Score Entry Dialog */}
        {selectedPlayer && (
          <ScoreEntryFixed
            isOpen={scoreEntryOpen}
            onClose={() => setScoreEntryOpen(false)}
            player={`${selectedPlayer.firstName} ${selectedPlayer.lastName}`}
            hole={selectedHole}
            roundId={currentRound.id}
            playerId={selectedPlayer.id}
            currentScore={getPlayerScore(selectedPlayer.id, selectedHole)}
            currentStats={getPlayerStats(selectedPlayer.id, selectedHole)}
          />
        )}
      </div>
    </div>
  );
}