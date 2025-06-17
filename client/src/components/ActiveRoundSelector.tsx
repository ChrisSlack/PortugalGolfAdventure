import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Club, Users, Play, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Round } from "@shared/schema";

interface ActiveRoundSelectorProps {
  onRoundChange?: (roundId: number | null) => void;
}

export default function ActiveRoundSelector({ onRoundChange }: ActiveRoundSelectorProps) {
  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: rounds = [] } = useQuery<Round[]>({
    queryKey: ['/api/rounds']
  });

  const createRoundMutation = useMutation({
    mutationFn: async (roundData: any) => {
      return await apiRequest('POST', '/api/rounds', roundData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rounds'] });
    }
  });

  const activeRound = selectedRoundId ? rounds.find(r => r.id === selectedRoundId) : null;

  const handleRoundSelect = (roundId: string) => {
    const id = parseInt(roundId);
    setSelectedRoundId(id);
    onRoundChange?.(id);
  };

  const createNewRound = () => {
    const today = new Date().toISOString().split('T')[0];
    const newRound = {
      course: "nau",
      date: today,
      players: [],
      format: "stroke",
      day: null
    };
    
    createRoundMutation.mutate(newRound);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Club className="mr-2 h-5 w-5" />
          Active Scorecard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Select onValueChange={handleRoundSelect} value={selectedRoundId?.toString() || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a round to score" />
                </SelectTrigger>
                <SelectContent>
                  {rounds.map(round => (
                    <SelectItem key={round.id} value={round.id.toString()}>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{round.course.toUpperCase()} - {new Date(round.date).toLocaleDateString()}</span>
                        {round.day && <Badge variant="secondary">Day {round.day}</Badge>}
                        <Badge variant={round.format === 'betterball' ? 'default' : 'outline'}>
                          {round.format}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={createNewRound} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Round
            </Button>
          </div>

          {activeRound && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-green-800">
                    {activeRound.course.toUpperCase()} Course
                  </h3>
                  <p className="text-sm text-green-600">
                    {new Date(activeRound.date).toLocaleDateString()} • {activeRound.format} format
                    {activeRound.day && ` • Day ${activeRound.day}`}
                  </p>
                </div>
                <Badge variant="default" className="bg-green-600">
                  <Play className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
            </div>
          )}

          {!selectedRoundId && rounds.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <Club className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No rounds available. Create a new round to start scoring.</p>
            </div>
          )}

          {!selectedRoundId && rounds.length > 0 && (
            <div className="text-center py-4 text-gray-500">
              <p>Select a round above to view scores and leaderboards.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}