import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { courses } from "@/lib/courseData";

interface ScoreEntryProps {
  isOpen: boolean;
  onClose: () => void;
  player: string;
  hole: number;
  roundId: number;
  playerId: number;
  currentScore?: number;
  currentStats?: {
    threePutt: boolean;
    pickedUp: boolean;
    inWater: boolean;
    inBunker: boolean;
  };
}

export default function ScoreEntryFixed({ 
  isOpen, 
  onClose, 
  player, 
  hole, 
  roundId, 
  playerId,
  currentScore = 0,
  currentStats = { threePutt: false, pickedUp: false, inWater: false, inBunker: false }
}: ScoreEntryProps) {
  const [score, setScore] = useState(currentScore > 0 ? currentScore.toString() : "");
  const [threePutt, setThreePutt] = useState(currentStats.threePutt);
  const [pickedUp, setPickedUp] = useState(currentStats.pickedUp);
  const [inWater, setInWater] = useState(currentStats.inWater);
  const [inBunker, setInBunker] = useState(currentStats.inBunker);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveScore = useMutation({
    mutationFn: async () => {
      const scoreData = {
        roundId,
        playerId,
        hole,
        score: parseInt(score),
        threePutt,
        pickedUp,
        inWater,
        inBunker
      };

      console.log("Saving score data:", scoreData);
      
      // Check if score already exists
      const existingScores = await apiRequest(`/api/scores/all`);
      const existingScore = existingScores.find((s: any) => 
        s.roundId === roundId && s.playerId === playerId && s.hole === hole
      );

      if (existingScore) {
        console.log("Updating existing score:", existingScore.id);
        return apiRequest(`/api/scores`, {
          method: "POST", 
          body: { ...scoreData, id: existingScore.id }
        });
      } else {
        console.log("Creating new score");
        return apiRequest("/api/scores", {
          method: "POST",
          body: scoreData
        });
      }
    },
    onSuccess: (data) => {
      console.log("Score saved successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/scores/all"] });
      toast({
        title: "Score saved",
        description: `${player} - Hole ${hole}: ${score} strokes`,
      });
      onClose();
    },
    onError: (error) => {
      console.error("Error saving score:", error);
      toast({
        title: "Error saving score",
        description: "Please try again",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!score || isNaN(parseInt(score))) {
      toast({
        title: "Invalid score",
        description: "Please select a score",
        variant: "destructive",
      });
      return;
    }
    saveScore.mutate();
  };

  // Get course information
  const currentCourse = courses.find(c => c.id === 'nau'); // Default to NAU for now
  const currentHoleData = currentCourse?.holes.find(h => h.hole === hole);

  const handleScoreSelect = (scoreValue: number) => {
    setScore(scoreValue.toString());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1 pb-2">
          <DialogTitle className="text-center text-lg font-semibold">Portugal Golf 2025</DialogTitle>
          <DialogDescription className="text-center text-sm text-gray-600">
            Record a score for {player}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hole Navigation */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={hole <= 1}
                className="p-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="text-center">
                <div className="text-lg font-bold">Hole {hole}</div>
                {currentHoleData && (
                  <div className="text-sm text-gray-600">
                    Par {currentHoleData.par} • Distance: {currentHoleData.distance}m • Handicap: {currentHoleData.handicap}
                  </div>
                )}
              </div>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={hole >= 18}
                className="p-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Player Info */}
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{player}</div>
          </div>

          {/* Hole Info Summary */}
          {currentHoleData && (
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-sm font-medium text-blue-900">Hole {hole}</div>
              <div className="text-sm text-blue-700">
                Distance: {currentHoleData.distance}m • Handicap: {currentHoleData.handicap}
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-blue-900">Par {currentHoleData.par}</span>
              </div>
            </div>
          )}

          {/* Score Selection Grid */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Score</Label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((scoreValue) => (
                <Button
                  key={scoreValue}
                  type="button"
                  variant={score === scoreValue.toString() ? "default" : "outline"}
                  className={`h-12 text-lg font-semibold ${
                    score === scoreValue.toString() 
                      ? "bg-golf-green text-white hover:bg-golf-green/90" 
                      : "border-gray-300 hover:border-golf-green"
                  }`}
                  onClick={() => handleScoreSelect(scoreValue)}
                >
                  {scoreValue}
                </Button>
              ))}
            </div>
          </div>

          {/* Additional Score Information */}
          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-700">Additional Score Information</Label>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="threePutt"
                  checked={threePutt}
                  onCheckedChange={(checked) => setThreePutt(checked === true)}
                  className="data-[state=checked]:bg-golf-green data-[state=checked]:border-golf-green"
                />
                <Label htmlFor="threePutt" className="text-sm text-gray-700">
                  3-Putt (Three putts on green)
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="pickedUp"
                  checked={pickedUp}
                  onCheckedChange={(checked) => setPickedUp(checked === true)}
                  className="data-[state=checked]:bg-golf-green data-[state=checked]:border-golf-green"
                />
                <Label htmlFor="pickedUp" className="text-sm text-gray-700">
                  Picked Up (Ball not holed out)
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="inWater"
                  checked={inWater}
                  onCheckedChange={(checked) => setInWater(checked === true)}
                  className="data-[state=checked]:bg-golf-green data-[state=checked]:border-golf-green"
                />
                <Label htmlFor="inWater" className="text-sm text-gray-700">
                  In Water (Ball went into water hazard)
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="inBunker"
                  checked={inBunker}
                  onCheckedChange={(checked) => setInBunker(checked === true)}
                  className="data-[state=checked]:bg-golf-green data-[state=checked]:border-golf-green"
                />
                <Label htmlFor="inBunker" className="text-sm text-gray-700">
                  In Bunker (Ball landed in sand bunker)
                </Label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 text-base border-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!score || saveScore.isPending}
              className="flex-1 h-12 text-base bg-golf-green hover:bg-golf-green/90"
            >
              {saveScore.isPending ? "Saving..." : "Save Score"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}