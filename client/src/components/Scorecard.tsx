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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-golf-green text-white">
                  <th className="px-2 py-2 text-left min-w-[80px]">Player</th>
                  {course.holes.map(hole => (
                    <th key={hole.hole} className="px-1 py-2 text-center min-w-[32px] text-xs">
                      {hole.hole}
                    </th>
                  ))}
                  <th className="px-2 py-2 text-center min-w-[50px] text-xs">Total</th>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-2 py-1 text-xs font-medium text-gray-600">Par</td>
                  {course.holes.map(hole => (
                    <td key={hole.hole} className="px-1 py-1 text-center text-xs text-gray-600">
                      {hole.par}
                    </td>
                  ))}
                  <td className="px-2 py-1 text-center text-xs font-medium text-gray-600">{course.par}</td>
                </tr>
              </thead>
              <tbody>
                {players.map(player => {
                  const { total, toPar } = calculatePlayerTotal(player);
                  return (
                    <tr key={player} className="border-b hover:bg-gray-50">
                      <td className="px-2 py-2 font-medium text-sm">
                        {player}
                      </td>
                      
                      {course.holes.map(hole => {
                        const score = scores[player]?.[hole.hole];
                        const hasScore = score !== undefined;
                        
                        return (
                          <td key={hole.hole} className="px-1 py-2 text-center">
                            {hasScore ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-7 w-7 p-0 text-xs relative ${getScoreClass(score, hole.par)} ${!isEditable ? 'cursor-default' : ''}`}
                                onClick={() => isEditable && onScoreEdit(player, hole.hole)}
                                disabled={!isEditable}
                              >
                                {isEditable && hasScore && <Edit className="h-2 w-2 absolute top-0 right-0" />}
                                {score}
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-xs bg-gray-100 text-gray-400"
                                onClick={() => isEditable && onScoreEdit(player, hole.hole)}
                                disabled={!isEditable}
                              >
                                -
                              </Button>
                            )}
                          </td>
                        );
                      })}
                      
                      <td className="px-2 py-2 text-center font-medium">
                        <div className="text-sm">{total || 0}</div>
                        {toPar !== 0 && (
                          <div className={`text-xs ${toPar > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {toPar > 0 ? '+' : ''}{toPar}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-golf-green text-white">
                  <th className="px-2 py-2 text-left min-w-[80px]">Player</th>
                  {course.holes.map(hole => (
                    <th key={hole.hole} className="px-1 py-2 text-center min-w-[32px] text-xs">
                      {hole.hole}
                    </th>
                  ))}
                  <th className="px-2 py-2 text-center min-w-[50px] text-xs">Totals</th>
                </tr>
              </thead>
              <tbody>
                {players.map(player => {
                  return (
                    <tr key={player} className="border-b hover:bg-gray-50">
                      <td className="px-2 py-2 font-medium text-sm">
                        {player}
                      </td>
                      
                      {course.holes.map(hole => {
                        const badges = getStatisticsBadges(player, hole.hole);
                        
                        return (
                          <td key={hole.hole} className="px-1 py-2 text-center">
                            <div className="flex flex-wrap gap-1 justify-center">
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
                          </td>
                        );
                      })}
                      
                      <td className="px-2 py-2 text-center">
                        <div className="flex flex-wrap gap-1 justify-center">
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
                          {statistics && Object.values(statistics[player] || {}).some(stat => stat.inBunker) && (
                            <Badge className="bg-amber-600 text-white text-xs">
                              B: {Object.values(statistics[player] || {}).filter(stat => stat.inBunker).length}
                            </Badge>
                          )}
                          {statistics && Object.values(statistics[player] || {}).some(stat => stat.pickedUp) && (
                            <Badge className="bg-orange-500 text-white text-xs">
                              PU: {Object.values(statistics[player] || {}).filter(stat => stat.pickedUp).length}
                            </Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}