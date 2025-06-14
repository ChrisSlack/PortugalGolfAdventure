import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, User } from "lucide-react";
import { Course } from "@/lib/types";

interface LeaderboardProps {
  course: Course;
  players: string[];
  scores: { [player: string]: { [hole: number]: number } };
}

export default function Leaderboard({ course, players, scores }: LeaderboardProps) {
  const calculatePlayerStats = (player: string) => {
    const playerScores = scores[player] || {};
    const completedScores = Object.values(playerScores).filter(score => score && score > 0);
    
    if (completedScores.length === 0) {
      return { total: 0, toPar: 0, holesCompleted: 0, average: 0 };
    }
    
    const total = completedScores.reduce((sum, score) => sum + score, 0);
    const holesCompleted = completedScores.length;
    const parForCompletedHoles = course.holes
      .slice(0, holesCompleted)
      .reduce((sum, hole) => sum + hole.par, 0);
    
    const toPar = total - parForCompletedHoles;
    const average = total / holesCompleted;
    
    return { total, toPar, holesCompleted, average };
  };

  const leaderboard = players.map(player => ({
    player,
    ...calculatePlayerStats(player)
  })).sort((a, b) => {
    // Sort by total score, then by holes completed
    if (a.holesCompleted === 0 && b.holesCompleted === 0) return 0;
    if (a.holesCompleted === 0) return 1;
    if (b.holesCompleted === 0) return -1;
    
    // If same number of holes completed, sort by total score
    if (a.holesCompleted === b.holesCompleted) {
      return a.total - b.total;
    }
    
    // If different holes completed, sort by to-par ratio
    const aRatio = a.toPar / a.holesCompleted;
    const bRatio = b.toPar / b.holesCompleted;
    return aRatio - bRatio;
  });

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Award className="h-6 w-6 text-yellow-600" />;
      default: return <User className="h-6 w-6 text-gray-400" />;
    }
  };

  const getPositionText = (position: number): string => {
    switch (position) {
      case 1: return '1st';
      case 2: return '2nd';
      case 3: return '3rd';
      default: return `${position}th`;
    }
  };

  if (players.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span>Leaderboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Add players to see the leaderboard!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span>Current Leaderboard</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.map((item, index) => {
            const position = index + 1;
            const toPar = item.toPar > 0 ? `+${item.toPar}` : item.toPar.toString();
            
            return (
              <div 
                key={item.player} 
                className={`flex items-center justify-between p-4 rounded-lg ${
                  position === 1 ? 'golf-light text-white' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {getPositionIcon(position)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`font-bold text-lg ${position === 1 ? 'text-white' : 'text-gray-900'}`}>
                        {getPositionText(position)} - {item.player}
                      </span>
                      {item.holesCompleted < 18 && (
                        <Badge variant="outline" className={position === 1 ? 'border-white text-white' : ''}>
                          {item.holesCompleted}/18
                        </Badge>
                      )}
                    </div>
                    <p className={`text-sm ${position === 1 ? 'text-white opacity-90' : 'text-gray-600'}`}>
                      {item.holesCompleted > 0 
                        ? `${item.total} strokes (${item.toPar === 0 ? 'Even' : toPar})`
                        : 'No scores yet'
                      }
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {item.holesCompleted > 0 && (
                    <div className={`text-2xl font-bold ${position === 1 ? 'text-white' : 'text-gray-900'}`}>
                      {item.toPar === 0 ? 'E' : toPar}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {leaderboard.some(item => item.holesCompleted > 0) && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium text-gray-700 mb-2">Round Statistics</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div>
                <span className="font-medium">Lowest Score:</span> {Math.min(...leaderboard.filter(p => p.total > 0).map(p => p.total)) || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Highest Score:</span> {Math.max(...leaderboard.filter(p => p.total > 0).map(p => p.total)) || 'N/A'}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
