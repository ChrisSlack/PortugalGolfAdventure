import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Users, UserPlus, Edit, Trash2, Trophy, Star, Upload, Image as ImageIcon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Player, Team } from "@shared/schema";

export default function Players() {
  const [newPlayerOpen, setNewPlayerOpen] = useState(false);
  const [newTeamOpen, setNewTeamOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [logoUploadTeam, setLogoUploadTeam] = useState<Team | null>(null);
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        firstName: data.firstName,
        lastName: data.lastName,
        handicap: data.handicap || null,
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
        firstName: data.firstName,
        lastName: data.lastName,
        handicap: data.handicap || null,
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

  const updateTeamMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await apiRequest("PATCH", `/api/teams/${id}`, {
        name: data.name,
        captainId: data.captainId ? parseInt(data.captainId) : null
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      setEditingTeam(null);
      setNewTeamOpen(false);
      setTeamData({ name: "", captainId: "" });
      toast({ title: "Success", description: "Team updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update team", variant: "destructive" });
    }
  });

  const deleteTeamMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/teams/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      toast({ title: "Success", description: "Team deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete team", variant: "destructive" });
    }
  });

  const logoUploadMutation = useMutation({
    mutationFn: ({ teamId, file }: { teamId: number; file: File }) => {
      const formData = new FormData();
      formData.append('logo', file);
      return fetch(`/api/teams/${teamId}/logo`, {
        method: 'POST',
        body: formData,
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({ title: "Team logo uploaded successfully" });
      setLogoUploadTeam(null);
    },
    onError: () => {
      toast({ title: "Failed to upload logo", variant: "destructive" });
    },
  });

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && logoUploadTeam) {
      logoUploadMutation.mutate({ teamId: logoUploadTeam.id, file });
    }
    // Reset file input to allow re-uploading the same file
    if (event.target) {
      event.target.value = '';
    }
  };

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

  const handleTeamEdit = (team: Team) => {
    setEditingTeam(team);
    setTeamData({
      name: team.name,
      captainId: team.captainId?.toString() || ""
    });
    setNewTeamOpen(true);
  };

  const handleTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeam) {
      updateTeamMutation.mutate({ id: editingTeam.id, ...teamData });
    } else {
      createTeamMutation.mutate(teamData);
    }
  };

  const resetTeamForm = () => {
    setTeamData({ name: "", captainId: "" });
    setEditingTeam(null);
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
            <Dialog open={newTeamOpen} onOpenChange={(open) => {
              setNewTeamOpen(open);
              if (!open) {
                resetTeamForm();
              }
            }}>
              <DialogTrigger asChild>
                <Button className="golf-green text-white">
                  <Trophy className="h-4 w-4 mr-2" />
                  New Team
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingTeam ? "Edit Team" : "Create New Team"}</DialogTitle>
                  <DialogDescription>
                    {editingTeam ? "Update team details and captain" : "Create a new team and select a captain from the available players"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleTeamSubmit} className="space-y-4">
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
                    {editingTeam ? "Update Team" : "Create Team"}
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
                  <DialogDescription>
                    {editingPlayer ? "Update player information and team assignment" : "Add a new player with their handicap and team"}
                  </DialogDescription>
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
                    <div className="flex items-center space-x-2">
                      {team.logoUrl && (
                        <img 
                          src={team.logoUrl} 
                          alt={`${team.name} logo`}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      <span>{team.name}</span>
                      {team.captainId && <Star className="h-4 w-4 text-golf-gold" />}
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setLogoUploadTeam(team);
                          fileInputRef.current?.click();
                        }}
                        title="Upload team logo"
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTeamEdit(team)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTeamMutation.mutate(team.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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

        {/* Hidden file input for logo upload */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleLogoUpload}
          accept="image/*"
          style={{ display: 'none' }}
        />

        {/* Logo Upload Dialog */}
        <Dialog open={logoUploadTeam !== null} onOpenChange={() => setLogoUploadTeam(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Team Logo</DialogTitle>
              <DialogDescription>
                Select an image file to use as the team logo. Maximum file size: 5MB.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    {logoUploadMutation.isPending ? "Uploading..." : "Click the upload button above to select an image"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Supported formats: JPG, PNG, GIF (max 5MB)
                  </p>
                </div>
              </div>
              {logoUploadTeam?.logoUrl && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Current logo:</p>
                  <img 
                    src={logoUploadTeam.logoUrl} 
                    alt="Current team logo"
                    className="mx-auto w-16 h-16 rounded-full object-cover border"
                  />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}