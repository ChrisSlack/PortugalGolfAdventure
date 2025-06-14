import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, UserPlus, Edit, Trash2, Trophy, Star } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Player, Team } from "@shared/schema";

export default function Players() {
  const [newPlayerOpen, setNewPlayerOpen] = useState(false);
  const [newTeamOpen, setNewTeamOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    handicap: "",
    teamId: ""
  });
  const [teamData, setTeamData] = useState({
    name: "",
    captainId: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: players = [], isLoading: playersLoading } = useQuery<Player[]>({
    queryKey: ["/api/players"]
  });

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/teams"]
  });

  const createPlayerMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/players", {
        ...data,
        handicap: data.handicap ? parseFloat(data.handicap) : null,
        teamId: data.teamId && data.teamId !== "none" ? parseInt(data.teamId) : null
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      setNewPlayerOpen(false);
      resetForm();
      toast({ title: "Success", description: "Player created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create player", variant: "destructive" });
    }
  });

  const updatePlayerMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await apiRequest("PATCH", `/api/players/${id}`, {
        ...data,
        handicap: data.handicap ? parseFloat(data.handicap) : null,
        teamId: data.teamId && data.teamId !== "none" ? parseInt(data.teamId) : null
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      setEditingPlayer(null);
      resetForm();
      toast({ title: "Success", description: "Player updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update player", variant: "destructive" });
    }
  });

  const deletePlayerMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/players/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      toast({ title: "Success", description: "Player deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete player", variant: "destructive" });
    }
  });

  const createTeamMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/teams", {
        ...data,
        captainId: data.captainId ? parseInt(data.captainId) : null
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      setNewTeamOpen(false);
      setTeamData({ name: "", captainId: "" });
      toast({ title: "Success", description: "Team created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create team", variant: "destructive" });
    }
  });

  const resetForm = () => {
    setFormData({ firstName: "", lastName: "", handicap: "", teamId: "none" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlayer) {
      updatePlayerMutation.mutate({ id: editingPlayer.id, ...formData });
    } else {
      createPlayerMutation.mutate(formData);
    }
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setFormData({
      firstName: player.firstName,
      lastName: player.lastName,
      handicap: player.handicap?.toString() || "",
      teamId: player.teamId?.toString() || "none"
    });
    setNewPlayerOpen(true);
  };

  const getTeamName = (teamId: number | null) => {
    if (!teamId) return "No Team";
    const team = teams.find((t: Team) => t.id === teamId);
    return team ? team.name : "Unknown Team";
  };

  const getCaptainName = (captainId: number | null) => {
    if (!captainId) return "No Captain";
    const captain = players.find((p: Player) => p.id === captainId);
    return captain ? `${captain.firstName} ${captain.lastName}` : "Unknown";
  };

  const teamStats = teams.map((team: Team) => {
    const teamPlayers = players.filter((p: Player) => p.teamId === team.id);
    const avgHandicap = teamPlayers.length > 0 
      ? teamPlayers.reduce((sum: number, p: Player) => sum + (parseFloat(p.handicap ?? "0") || 0), 0) / teamPlayers.length
      : 0;
    
    return {
      ...team,
      playerCount: teamPlayers.length,
      avgHandicap: avgHandicap.toFixed(1),
      players: teamPlayers
    };
  });

  if (playersLoading) {
    return <div className="flex justify-center items-center h-64">Loading players...</div>;
  }

  return (
    <div className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-golf-green mr-3" />
            <h1 className="text-3xl font-bold text-golf-green">Players & Teams</h1>
          </div>
          <div className="space-x-2">
            <Dialog open={newTeamOpen} onOpenChange={setNewTeamOpen}>
              <DialogTrigger asChild>
                <Button className="golf-green text-white">
                  <Trophy className="h-4 w-4 mr-2" />
                  New Team
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Team</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  createTeamMutation.mutate(teamData);
                }} className="space-y-4">
                  <div>
                    <Label>Team Name</Label>
                    <Input
                      value={teamData.name}
                      onChange={(e) => setTeamData({ ...teamData, name: e.target.value })}
                      placeholder="Enter team name"
                      required
                    />
                  </div>
                  <div>
                    <Label>Captain</Label>
                    <Select value={teamData.captainId} onValueChange={(value) => setTeamData({ ...teamData, captainId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select captain..." />
                      </SelectTrigger>
                      <SelectContent>
                        {players.map((player: Player) => (
                          <SelectItem key={player.id} value={player.id.toString()}>
                            {player.firstName} {player.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full golf-green text-white">
                    Create Team
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={newPlayerOpen} onOpenChange={(open) => {
              setNewPlayerOpen(open);
              if (!open) {
                setEditingPlayer(null);
                resetForm();
              }
            }}>
              <DialogTrigger asChild>
                <Button className="golf-green text-white">
                  <UserPlus className="h-4 w-4 mr-2" />
                  New Player
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingPlayer ? "Edit Player" : "Create New Player"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>First Name</Label>
                      <Input
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="First name"
                        required
                      />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Last name"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Handicap</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.handicap}
                      onChange={(e) => setFormData({ ...formData, handicap: e.target.value })}
                      placeholder="Golf handicap (e.g., 12.5)"
                    />
                  </div>
                  <div>
                    <Label>Team</Label>
                    <Select value={formData.teamId} onValueChange={(value) => setFormData({ ...formData, teamId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Team</SelectItem>
                        {teams.map((team: Team) => (
                          <SelectItem key={team.id} value={team.id.toString()}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full golf-green text-white">
                    {editingPlayer ? "Update Player" : "Create Player"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Teams Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-golf-green mb-4">Teams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamStats.map((team) => (
              <Card key={team.id} className="border-golf-green">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{team.name}</span>
                    {team.captainId && <Star className="h-4 w-4 text-golf-gold" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Players:</span>
                      <Badge variant="outline">{team.playerCount}/4</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Handicap:</span>
                      <span className="font-medium">{team.avgHandicap}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Captain:</span>
                      <span className="font-medium text-golf-green">{getCaptainName(team.captainId)}</span>
                    </div>
                    {team.players.length > 0 && (
                      <div className="mt-3">
                        <span className="text-sm text-gray-600">Members:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {team.players.map((player: Player) => (
                            <Badge key={player.id} variant="outline" className="text-xs">
                              {player.firstName} {player.lastName}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Players List */}
        <div>
          <h2 className="text-2xl font-bold text-golf-green mb-4">All Players</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {players.map((player: Player) => (
              <Card key={player.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-golf-green">
                      {player.firstName} {player.lastName}
                    </h3>
                    <div className="space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(player)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePlayerMutation.mutate(player.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Handicap:</span>
                      <span className="font-medium">{player.handicap || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Team:</span>
                      <Badge variant="outline" className="border-golf-green text-golf-green">
                        {getTeamName(player.teamId)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}