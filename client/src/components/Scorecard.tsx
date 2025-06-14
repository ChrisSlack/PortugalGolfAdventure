import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, BarChart3 } from "lucide-react";
import { Course } from "@/lib/types";

interface ScorecardProps {
  course: Course;
  players: string[];
  scores: { [player: string]: { [hole: number]: number } };
  statistics?: { [player: string]: { [hole: number]: { threePutt: boolean; pickedUp: boolean; inWater: boolean; inBunker: boolean } } };
  onScoreEdit: (player: string, hole: number) => void;
  isEditable?: boolean;
}

export default function Scorecard({ course, players, scores, statistics, onScoreEdit, isEditable = true }: ScorecardProps) {
  const [viewMode, setViewMode] = useState<'scores' | 'stats'>('scores');

  const getScoreClass = (score: number | undefined, par: number): string => {
    if (!score) return 'bg-gray-100 text-gray-400';
    const diff = score - par;
    if (diff <= -2) return 'score-eagle'; // Eagle or better
    if (diff === -1) return 'score-birdie'; // Birdie
    if (diff === 0) return 'score-par'; // Par
    if (diff === 1) return 'score-bogey'; // Bogey
    if (diff === 2) return 'score-double'; // Double bogey
    return 'score-worse'; // Triple bogey or worse
  };

  const calculatePlayerTotal = (player: string) => {
    const playerScores = Object.values(scores[player] || {});
    const total = playerScores.reduce((sum, score) => sum + score, 0);
    const toPar = total - course.par;
    return { total, toPar };
  };

  const getStatisticsBadges = (player: string, hole: number) => {
    const stats = statistics?.[player]?.[hole];
    if (!stats) return [];
    
    const badges = [];
    if (stats.threePutt) badges.push({ text: '3P', color: 'bg-yellow-500' });
    if (stats.pickedUp) badges.push({ text: 'PU', color: 'bg-orange-500' });
    if (stats.inWater) badges.push({ text: 'W', color: 'bg-blue-500' });
    if (stats.inBunker) badges.push({ text: 'B', color: 'bg-amber-600' });
    
    return badges;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Scorecard</span>
          <div className="flex items-center space-x-2">
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
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Stats
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {viewMode === 'scores' ? (
          <div className="scorecard-grid">
            {/* Scores View */}
            <div className="sticky top-0 bg-white z-10 border-b pb-2 mb-4">
              <div className="grid grid-cols-19 gap-1 text-xs font-medium text-gray-600">
                <div className="col-span-2">Player</div>
                {course.holes.map(hole => (
                  <div key={hole.hole} className="text-center">
                    {hole.hole}
                  </div>
                ))}
                <div className="text-center">Total</div>
              </div>
              <div className="grid grid-cols-19 gap-1 text-xs text-gray-500 mt-1">
                <div className="col-span-2">Par</div>
                {course.holes.map(hole => (
                  <div key={hole.hole} className="text-center">
                    {hole.par}
                  </div>
                ))}
                <div className="text-center">{course.par}</div>
              </div>
            </div>

            {players.map(player => {
              const { total, toPar } = calculatePlayerTotal(player);
              return (
                <div key={player} className="grid grid-cols-19 gap-1 items-center py-2 border-b">
                  <div className="col-span-2 font-medium text-sm pr-2">
                    {player}
                  </div>
                  
                  {course.holes.map(hole => {
                    const score = scores[player]?.[hole.hole];
                    const hasScore = score !== undefined;
                    
                    return (
                      <div key={hole.hole} className="text-center relative">
                        {hasScore ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 w-8 p-0 text-xs ${getScoreClass(score, hole.par)} ${!isEditable ? 'cursor-default' : ''}`}
                            onClick={() => isEditable && onScoreEdit(player, hole.hole)}
                            disabled={!isEditable}
                          >
                            {isEditable && hasScore && <Edit className="h-3 w-3 absolute top-0 right-0" />}
                            {score}
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-xs bg-gray-100 text-gray-400"
                            onClick={() => isEditable && onScoreEdit(player, hole.hole)}
                            disabled={!isEditable}
                          >
                            -
                          </Button>
                        )}
                      </div>
                    );
                  })}
                  
                  <div className="text-center font-medium">
                    <div className="text-sm">{total || 0}</div>
                    {toPar !== 0 && (
                      <div className={`text-xs ${toPar > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {toPar > 0 ? '+' : ''}{toPar}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="statistics-grid">
            {/* Statistics View */}
            <div className="sticky top-0 bg-white z-10 border-b pb-2 mb-4">
              <div className="grid grid-cols-19 gap-1 text-xs font-medium text-gray-600">
                <div className="col-span-2">Player</div>
                {course.holes.map(hole => (
                  <div key={hole.hole} className="text-center">
                    {hole.hole}
                  </div>
                ))}
                <div className="text-center">Stats</div>
              </div>
            </div>

            {players.map(player => {
              return (
                <div key={player} className="grid grid-cols-19 gap-1 items-center py-2 border-b">
                  <div className="col-span-2 font-medium text-sm pr-2">
                    {player}
                  </div>
                  
                  {course.holes.map(hole => {
                    const badges = getStatisticsBadges(player, hole.hole);
                    
                    return (
                      <div key={hole.hole} className="text-center">
                        <div className="flex flex-col space-y-1">
                          {badges.map((badge, idx) => (
                            <Badge
                              key={idx}
                              className={`text-xs px-1 py-0 ${badge.color} text-white`}
                            >
                              {badge.text}
                            </Badge>
                          ))}
                          {badges.length === 0 && (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="text-center text-xs">
                    {/* Total statistics for player */}
                    <div className="space-y-1">
                      {statistics && Object.values(statistics[player] || {}).some(stat => stat.threePutt) && (
                        <Badge className="bg-yellow-500 text-white text-xs">
                          3P: {Object.values(statistics[player] || {}).filter(stat => stat.threePutt).length}
                        </Badge>
                      )}
                      {statistics && Object.values(statistics[player] || {}).some(stat => stat.inWater) && (
                        <Badge className="bg-blue-500 text-white text-xs">
                          W: {Object.values(statistics[player] || {}).filter(stat => stat.inWater).length}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}