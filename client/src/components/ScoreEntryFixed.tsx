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
  const [score, setScore] = useState(currentScore.toString());
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

      return fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scoreData)
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scores/all'] });
      queryClient.invalidateQueries({ queryKey: [`/api/scores/${roundId}`] });
      toast({
        title: "Score saved",
        description: `${player} - Hole ${hole}: ${score}`,
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error saving score",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!score || isNaN(parseInt(score))) {
      toast({
        title: "Invalid score",
        description: "Please enter a valid number",
        variant: "destructive",
      });
      return;
    }
    saveScore.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enter Score</DialogTitle>
          <DialogDescription>
            {player} - Hole {hole}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="score">Score</Label>
            <Input
              id="score"
              type="number"
              min="1"
              max="15"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full"
              autoFocus
            />
          </div>

          <div className="space-y-3">
            <Label>Additional Stats</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="threePutt"
                checked={threePutt}
                onCheckedChange={(checked) => setThreePutt(checked === true)}
              />
              <Label htmlFor="threePutt" className="text-sm">3-Putt</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="pickedUp"
                checked={pickedUp}
                onCheckedChange={(checked) => setPickedUp(checked === true)}
              />
              <Label htmlFor="pickedUp" className="text-sm">Picked Up</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="inWater"
                checked={inWater}
                onCheckedChange={(checked) => setInWater(checked === true)}
              />
              <Label htmlFor="inWater" className="text-sm">In Water</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="inBunker"
                checked={inBunker}
                onCheckedChange={(checked) => setInBunker(checked === true)}
              />
              <Label htmlFor="inBunker" className="text-sm">In Bunker</Label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={saveScore.isPending} className="flex-1">
              {saveScore.isPending ? "Saving..." : "Save Score"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}