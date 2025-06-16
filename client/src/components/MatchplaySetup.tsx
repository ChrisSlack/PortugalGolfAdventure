import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Trophy, Target, Plus, Calendar } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Player, Team, Round } from "@shared/schema";
import type { Course } from "@/lib/types";

interface MatchplaySetupProps {
  course: Course;
  golfDay: 1 | 2 | 3;
  onMatchCreated: (roundId: number) => void;
}

interface PairingSetup {
  teamA: number;
  teamB: number;
  pairAPlayer1: number;
  pairAPlayer2: number;
  pairBPlayer1: number;
  pairBPlayer2: number;
}

interface IndividualPairing {
  player1: number;
  player2: number;
}

export default function MatchplaySetup({ course, golfDay, onMatchCreated }: MatchplaySetupProps) {
  const [setupOpen, setSetupOpen] = useState(false);
  const [selectedTeamA, setSelectedTeamA] = useState<number>();
  const [selectedTeamB, setSelectedTeamB] = useState<number>();
  const [fourballPairings, setFourballPairings] = useState<PairingSetup[]>([]);
  const [individualPairings, setIndividualPairings] = useState<IndividualPairing[]>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/teams"]
  });

  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ["/api/players"]
  });

  const createRoundMutation = useMutation({
    mutationFn: async (roundData: any) => {
      const response = await apiRequest("POST", "/api/rounds", roundData);
      return await response.json();
    },
    onSuccess: (round) => {
      queryClient.invalidateQueries({ queryKey: ["/api/rounds"] });
      onMatchCreated(round.id);
      setSetupOpen(false);
      toast({
        title: "Success",
        description: `Day ${golfDay} matchplay round created successfully`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create matchplay round",
        variant: "destructive",
      });
    }
  });

  const createMatchMutation = useMutation({
    mutationFn: async (matchData: any) => {
      const response = await apiRequest("POST", "/api/matches", matchData);
      return await response.json();
    }
  });

  const createIndividualMatchMutation = useMutation({
    mutationFn: async (matchData: any) => {
      const response = await apiRequest("POST", "/api/individual-matches", matchData);
      return await response.json();
    }
  });

  const getTeamPlayers = (teamId: number): Player[] => {
    return players.filter(p => p.teamId === teamId);
  };

  const addFourballPairing = () => {
    if (!selectedTeamA || !selectedTeamB) {
      toast({
        title: "Error",
        description: "Please select both teams first",
        variant: "destructive",
      });
      return;
    }

    const teamAPlayers = getTeamPlayers(selectedTeamA);
    const teamBPlayers = getTeamPlayers(selectedTeamB);

    if (teamAPlayers.length < 2 || teamBPlayers.length < 2) {
      toast({
        title: "Error",
        description: "Each team needs at least 2 players",
        variant: "destructive",
      });
      return;
    }

    // Auto-select first available players for each team
    const newPairing: PairingSetup = {
      teamA: selectedTeamA,
      teamB: selectedTeamB,
      pairAPlayer1: teamAPlayers[0].id,
      pairAPlayer2: teamAPlayers[1].id,
      pairBPlayer1: teamBPlayers[0].id,
      pairBPlayer2: teamBPlayers[1].id,
    };

    setFourballPairings([...fourballPairings, newPairing]);
  };

  const updatePairing = (index: number, field: keyof PairingSetup, value: number) => {
    const updated = [...fourballPairings];
    updated[index] = { ...updated[index], [field]: value };
    setFourballPairings(updated);
  };

  const removePairing = (index: number) => {
    setFourballPairings(fourballPairings.filter((_, i) => i !== index));
  };

  const addIndividualPairing = () => {
    const teamAPlayers = getTeamPlayers(selectedTeamA!);
    const teamBPlayers = getTeamPlayers(selectedTeamB!);

    if (teamAPlayers.length > 0 && teamBPlayers.length > 0) {
      setIndividualPairings([
        ...individualPairings,
        {
          player1: teamAPlayers[0].id,
          player2: teamBPlayers[0].id
        }
      ]);
    }
  };

  const createMatchplayRound = async () => {
    if (fourballPairings.length === 0) {
      toast({
        title: "Error",
        description: "Please set up at least one fourball pairing",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create the round
      const roundData = {
        course: course.id,
        date: `2025-07-0${golfDay === 3 ? 5 : golfDay + 1}`, // July 2, 3, 5
        players: [],
        format: "betterball",
        day: golfDay
      };

      const round = await createRoundMutation.mutateAsync(roundData);

      // Create fourball matches
      for (const pairing of fourballPairings) {
        await createMatchMutation.mutateAsync({
          roundId: round.id,
          teamA: pairing.teamA,
          teamB: pairing.teamB,
          pairAPlayer1: pairing.pairAPlayer1,
          pairAPlayer2: pairing.pairAPlayer2,
          pairBPlayer1: pairing.pairBPlayer1,
          pairBPlayer2: pairing.pairBPlayer2,
          matchType: "fourball"
        });
      }

      // Create individual matches for Day 3
      if (golfDay === 3 && individualPairings.length > 0) {
        for (const pairing of individualPairings) {
          await createIndividualMatchMutation.mutateAsync({
            roundId: round.id,
            player1: pairing.player1,
            player2: pairing.player2
          });
        }
      }

    } catch (error) {
      console.error("Failed to create matchplay round:", error);
    }
  };

  const getPlayerName = (playerId: number): string => {
    const player = players.find(p => p.id === playerId);
    return player ? `${player.firstName} ${player.lastName}` : "Unknown";
  };

  const getTeamName = (teamId: number): string => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : "Unknown Team";
  };

  return (
    <Dialog open={setupOpen} onOpenChange={setSetupOpen}>
      <DialogTrigger asChild>
        <Button className="golf-green text-white">
          <Calendar className="h-4 w-4 mr-2" />
          Set Up Day {golfDay} Matchplay
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Day {golfDay} Matchplay Setup - {course.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Format Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Format</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Betterball Stableford:</strong> 2-player pairs from each team compete</p>
                <p><strong>Scoring:</strong> Best Stableford score from each pair counts per hole</p>
                {golfDay === 3 && (
                  <p><strong>Day 3 Special:</strong> Individual matchplay PLUS team fourball</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Team Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Team A</label>
              <Select value={selectedTeamA?.toString()} onValueChange={(value) => setSelectedTeamA(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Team A" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.name} ({getTeamPlayers(team.id).length} players)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Team B</label>
              <Select value={selectedTeamB?.toString()} onValueChange={(value) => setSelectedTeamB(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Team B" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.name} ({getTeamPlayers(team.id).length} players)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fourball Pairings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Fourball Pairings</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addFourballPairing}
                  disabled={!selectedTeamA || !selectedTeamB}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Pairing
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fourballPairings.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No pairings set up yet</p>
              ) : (
                <div className="space-y-4">
                  {fourballPairings.map((pairing, index) => (
                    <Card key={index} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium">Match {index + 1}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePairing(index)}
                            className="text-red-500"
                          >
                            Remove
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6">
                          {/* Team A Pair */}
                          <div>
                            <h5 className="font-medium text-blue-600 mb-2">
                              {getTeamName(pairing.teamA)}
                            </h5>
                            <div className="space-y-2">
                              <Select
                                value={pairing.pairAPlayer1.toString()}
                                onValueChange={(value) => updatePairing(index, 'pairAPlayer1', parseInt(value))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {getTeamPlayers(pairing.teamA).map((player) => (
                                    <SelectItem key={player.id} value={player.id.toString()}>
                                      {player.firstName} {player.lastName} (HCP: {player.handicap || 0})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              
                              <Select
                                value={pairing.pairAPlayer2.toString()}
                                onValueChange={(value) => updatePairing(index, 'pairAPlayer2', parseInt(value))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {getTeamPlayers(pairing.teamA).map((player) => (
                                    <SelectItem key={player.id} value={player.id.toString()}>
                                      {player.firstName} {player.lastName} (HCP: {player.handicap || 0})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Team B Pair */}
                          <div>
                            <h5 className="font-medium text-red-600 mb-2">
                              {getTeamName(pairing.teamB)}
                            </h5>
                            <div className="space-y-2">
                              <Select
                                value={pairing.pairBPlayer1.toString()}
                                onValueChange={(value) => updatePairing(index, 'pairBPlayer1', parseInt(value))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {getTeamPlayers(pairing.teamB).map((player) => (
                                    <SelectItem key={player.id} value={player.id.toString()}>
                                      {player.firstName} {player.lastName} (HCP: {player.handicap || 0})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              
                              <Select
                                value={pairing.pairBPlayer2.toString()}
                                onValueChange={(value) => updatePairing(index, 'pairBPlayer2', parseInt(value))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {getTeamPlayers(pairing.teamB).map((player) => (
                                    <SelectItem key={player.id} value={player.id.toString()}>
                                      {player.firstName} {player.lastName} (HCP: {player.handicap || 0})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Individual Matches for Day 3 */}
          {golfDay === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Individual Matchplay (Day 3 Only)</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addIndividualPairing}
                    disabled={!selectedTeamA || !selectedTeamB}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Individual Match
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {individualPairings.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No individual matches set up yet</p>
                ) : (
                  <div className="space-y-2">
                    {individualPairings.map((pairing, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <span>
                          {getPlayerName(pairing.player1)} vs {getPlayerName(pairing.player2)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIndividualPairings(individualPairings.filter((_, i) => i !== index))}
                          className="text-red-500"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Create Button */}
          <Button
            onClick={createMatchplayRound}
            className="w-full golf-green text-white"
            disabled={fourballPairings.length === 0 || createRoundMutation.isPending}
          >
            {createRoundMutation.isPending ? "Creating..." : `Create Day ${golfDay} Matchplay Round`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}