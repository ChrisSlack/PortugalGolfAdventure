import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Course } from "@/lib/types";

interface ScoreEntryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course;
  players: string[];
  selectedPlayer?: string;
  selectedHole?: number;
  onScoreSubmit: (player: string, hole: number, score: number, options: {
    threePutt: boolean;
    pickedUp: boolean;
    inWater: boolean;
    inBunker: boolean;
  }) => void;
}

export default function ScoreEntry({ 
  open, 
  onOpenChange, 
  course, 
  players, 
  selectedPlayer, 
  selectedHole,
  onScoreSubmit 
}: ScoreEntryProps) {
  const [player, setPlayer] = useState(selectedPlayer || '');
  const [hole, setHole] = useState(selectedHole?.toString() || '');
  const [score, setScore] = useState<number | null>(null);
  const [threePutt, setThreePutt] = useState(false);
  const [pickedUp, setPickedUp] = useState(false);
  const [inWater, setInWater] = useState(false);
  const [inBunker, setInBunker] = useState(false);

  const handleSubmit = () => {
    if (!player || !hole || score === null) return;
    
    onScoreSubmit(player, parseInt(hole), score, {
      threePutt,
      pickedUp,
      inWater,
      inBunker
    });
    
    // Reset form
    setScore(null);
    setThreePutt(false);
    setPickedUp(false);
    setInWater(false);
    setInBunker(false);
    onOpenChange(false);
  };

  const selectedHoleData = course.holes.find(h => h.hole === parseInt(hole));
  const scoreDiff = score && selectedHoleData ? score - selectedHoleData.par : 0;
  
  const getScoreType = (diff: number): string => {
    if (diff <= -2) return 'Eagle or better';
    if (diff === -1) return 'Birdie';
    if (diff === 0) return 'Par';
    if (diff === 1) return 'Bogey';
    return 'Double Bogey+';
  };

  const getScoreColor = (diff: number): string => {
    if (diff <= -2) return 'text-yellow-600';
    if (diff === -1) return 'text-green-600';
    if (diff === 0) return 'text-gray-600';
    if (diff === 1) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Enter Score</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="hole-select">Select Hole</Label>
            <Select value={hole} onValueChange={setHole}>
              <SelectTrigger>
                <SelectValue placeholder="Choose hole..." />
              </SelectTrigger>
              <SelectContent>
                {course.holes.map(holeData => (
                  <SelectItem key={holeData.hole} value={holeData.hole.toString()}>
                    Hole {holeData.hole} (Par {holeData.par})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="player-select">Select Player</Label>
            <Select value={player} onValueChange={setPlayer}>
              <SelectTrigger>
                <SelectValue placeholder="Choose player..." />
              </SelectTrigger>
              <SelectContent>
                {players.map(playerName => (
                  <SelectItem key={playerName} value={playerName}>
                    {playerName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedHoleData && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Hole {selectedHoleData.hole}</span>
                <Badge variant="outline">Par {selectedHoleData.par}</Badge>
              </div>
              <div className="text-sm text-gray-600">
                <span>Distance: {selectedHoleData.yardage}m • Handicap: {selectedHoleData.handicap}</span>
              </div>
            </div>
          )}
          
          <div>
            <Label>Score</Label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(scoreValue => (
                <Button
                  key={scoreValue}
                  variant={score === scoreValue ? "default" : "outline"}
                  className={`px-3 py-2 ${score === scoreValue ? 'golf-green text-white' : ''}`}
                  onClick={() => setScore(scoreValue)}
                >
                  {scoreValue}
                </Button>
              ))}
            </div>
            {score && selectedHoleData && (
              <div className="mt-2 text-center">
                <span className={`font-medium ${getScoreColor(scoreDiff)}`}>
                  {getScoreType(scoreDiff)}
                  {scoreDiff !== 0 && ` (${scoreDiff > 0 ? '+' : ''}${scoreDiff})`}
                </span>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <Label className="text-base font-medium mb-3 block">Additional Score Information</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="three-putt"
                  checked={threePutt}
                  onCheckedChange={(checked) => setThreePutt(!!checked)}
                />
                <Label htmlFor="three-putt" className="text-sm font-normal cursor-pointer">
                  3-Putt (Three putts on green)
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="picked-up"
                  checked={pickedUp}
                  onCheckedChange={(checked) => setPickedUp(!!checked)}
                />
                <Label htmlFor="picked-up" className="text-sm font-normal cursor-pointer">
                  Picked Up (Ball not holed out)
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="in-water"
                  checked={inWater}
                  onCheckedChange={(checked) => setInWater(!!checked)}
                />
                <Label htmlFor="in-water" className="text-sm font-normal cursor-pointer">
                  In Water (Ball went into water hazard)
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="in-bunker"
                  checked={inBunker}
                  onCheckedChange={(checked) => setInBunker(!!checked)}
                />
                <Label htmlFor="in-bunker" className="text-sm font-normal cursor-pointer">
                  In Bunker (Ball landed in sand bunker)
                </Label>
              </div>
            </div>
            
            {(threePutt || pickedUp || inWater || inBunker) && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  Additional information recorded for this hole
                </p>
              </div>
            )}
          </div>
          
          <div className="flex space-x-4 pt-4">
            <Button 
              onClick={handleSubmit} 
              disabled={!player || !hole || score === null}
              className="flex-1 golf-green text-white hover:golf-light"
            >
              Save Score
            </Button>
            <Button 
              onClick={() => onOpenChange(false)} 
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
