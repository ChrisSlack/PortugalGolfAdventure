import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Course } from "@/lib/types";

interface ScorecardProps {
  course: Course;
  players: string[];
  scores: { [player: string]: { [hole: number]: number } };
  onScoreEdit: (player: string, hole: number) => void;
}

export default function Scorecard({ course, players, scores, onScoreEdit }: ScorecardProps) {
  const getScoreClass = (score: number | undefined, par: number): string => {
    if (!score) return 'bg-gray-100 text-gray-400';
    const diff = score - par;
    if (diff <= -2) return 'score-eagle'; // Eagle or better
    if (diff === -1) return 'score-birdie'; // Birdie
    if (diff === 0) return 'score-par'; // Par
    if (diff === 1) return 'score-bogey'; // Bogey
    return 'score-double-bogey'; // Double bogey or worse
  };

  const calculatePlayerTotal = (player: string): { total: number; toPar: number } => {
    const playerScores = scores[player] || {};
    const total = Object.values(playerScores).reduce((sum, score) => sum + (score || 0), 0);
    const completedHoles = Object.values(playerScores).filter(score => score && score > 0).length;
    
    if (completedHoles === 0) return { total: 0, toPar: 0 };
    
    const toPar = total - course.par;
    return { total, toPar };
  };

  const calculateHoleStats = (hole: number) => {
    const holeScores = players.map(p => scores[p]?.[hole]).filter(Boolean);
    if (holeScores.length === 0) return null;
    
    const best = Math.min(...holeScores);
    const worst = Math.max(...holeScores);
    const average = holeScores.reduce((sum, score) => sum + score, 0) / holeScores.length;
    
    return { best, worst, average: average.toFixed(1) };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{course.name} Scorecard</span>
          <Badge variant="outline" className="border-golf-green text-golf-green">
            Par {course.par}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="golf-green text-white">
                <th className="px-3 py-2 text-left">Hole</th>
                <th className="px-3 py-2 text-center">Par</th>
                <th className="px-3 py-2 text-center">Yds</th>
                <th className="px-3 py-2 text-center">HCP</th>
                {players.map(player => (
                  <th key={player} className="px-2 py-2 text-center text-xs">
                    {player}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {course.holes.map(hole => {
                const holeStats = calculateHoleStats(hole.hole);
                return (
                  <tr key={hole.hole} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium">{hole.hole}</td>
                    <td className="px-3 py-2 text-center font-medium">{hole.par}</td>
                    <td className="px-3 py-2 text-center text-sm">{hole.yardage}</td>
                    <td className="px-3 py-2 text-center text-sm">{hole.handicap}</td>
                    {players.map(player => {
                      const score = scores[player]?.[hole.hole];
                      const scoreClass = getScoreClass(score, hole.par);
                      return (
                        <td key={player} className="px-2 py-2 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`px-2 py-1 rounded text-sm font-medium ${scoreClass} hover:opacity-80`}
                            onClick={() => onScoreEdit(player, hole.hole)}
                          >
                            {score || '-'}
                          </Button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {/* Front 9 Total */}
              <tr className="bg-gray-100 font-medium">
                <td className="px-3 py-2">OUT</td>
                <td className="px-3 py-2 text-center">
                  {course.holes.slice(0, 9).reduce((sum, hole) => sum + hole.par, 0)}
                </td>
                <td className="px-3 py-2 text-center">
                  {course.holes.slice(0, 9).reduce((sum, hole) => sum + hole.yardage, 0)}
                </td>
                <td className="px-3 py-2 text-center">-</td>
                {players.map(player => {
                  const front9 = course.holes.slice(0, 9).reduce((sum, hole) => {
                    const score = scores[player]?.[hole.hole];
                    return sum + (score || 0);
                  }, 0);
                  return (
                    <td key={player} className="px-2 py-2 text-center font-medium">
                      {front9 || '-'}
                    </td>
                  );
                })}
              </tr>
              {/* Back 9 Total */}
              <tr className="bg-gray-100 font-medium">
                <td className="px-3 py-2">IN</td>
                <td className="px-3 py-2 text-center">
                  {course.holes.slice(9).reduce((sum, hole) => sum + hole.par, 0)}
                </td>
                <td className="px-3 py-2 text-center">
                  {course.holes.slice(9).reduce((sum, hole) => sum + hole.yardage, 0)}
                </td>
                <td className="px-3 py-2 text-center">-</td>
                {players.map(player => {
                  const back9 = course.holes.slice(9).reduce((sum, hole) => {
                    const score = scores[player]?.[hole.hole];
                    return sum + (score || 0);
                  }, 0);
                  return (
                    <td key={player} className="px-2 py-2 text-center font-medium">
                      {back9 || '-'}
                    </td>
                  );
                })}
              </tr>
              {/* Total */}
              <tr className="golf-green text-white font-bold">
                <td className="px-3 py-2">TOTAL</td>
                <td className="px-3 py-2 text-center">{course.par}</td>
                <td className="px-3 py-2 text-center">
                  {course.holes.reduce((sum, hole) => sum + hole.yardage, 0)}
                </td>
                <td className="px-3 py-2 text-center">-</td>
                {players.map(player => {
                  const { total, toPar } = calculatePlayerTotal(player);
                  const toParStr = toPar > 0 ? `+${toPar}` : toPar.toString();
                  return (
                    <td key={player} className="px-2 py-2 text-center">
                      <div className="text-sm">{total || '-'}</div>
                      <div className="text-xs opacity-90">{total ? (toPar === 0 ? 'E' : toParStr) : '-'}</div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 text-center">
          <Button 
            className="golf-gold text-white hover:golf-amber"
            onClick={() => {
              // This would open the score entry modal
              console.log('Open score entry modal');
            }}
          >
            <Edit className="h-4 w-4 mr-2" />
            Enter Scores
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
