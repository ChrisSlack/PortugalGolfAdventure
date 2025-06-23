import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, ShieldCheck, Users, Trash2, UserPlus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@shared/schema";

export default function Admin() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["/api/users"],
    queryFn: () => apiRequest("/api/users").then(res => res.json()),
  });

  const { data: rounds = [] } = useQuery({
    queryKey: ["/api/rounds"],
    queryFn: () => apiRequest("/api/rounds").then(res => res.json()),
  });

  const promoteUserMutation = useMutation({
    mutationFn: (userId: string) => 
      apiRequest(`/api/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ isAdmin: true }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "User promoted to admin successfully" });
    },
    onError: () => {
      toast({ title: "Failed to promote user", variant: "destructive" });
    },
  });

  const demoteUserMutation = useMutation({
    mutationFn: (userId: string) => 
      apiRequest(`/api/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ isAdmin: false }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Admin access removed successfully" });
    },
    onError: () => {
      toast({ title: "Failed to remove admin access", variant: "destructive" });
    },
  });

  const clearScorecardMutation = useMutation({
    mutationFn: (roundId: number) => 
      apiRequest(`/api/rounds/${roundId}/clear`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rounds"] });
      queryClient.invalidateQueries({ queryKey: ["/api/scores"] });
      toast({ title: "Scorecard cleared successfully" });
    },
    onError: () => {
      toast({ title: "Failed to clear scorecard", variant: "destructive" });
    },
  });

  const deleteRoundMutation = useMutation({
    mutationFn: (roundId: number) => 
      apiRequest(`/api/rounds/${roundId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rounds"] });
      toast({ title: "Round deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete round", variant: "destructive" });
    },
  });

  if (!currentUser?.isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Admin Access Required</h2>
              <p className="text-gray-600">You need admin privileges to access this page.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center space-x-3">
        <Shield className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Admin Panel</h1>
      </div>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>User Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading users...</p>
          ) : (
            <div className="space-y-4">
              {users.map((user: User) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {user.profileImageUrl && (
                      <img 
                        src={user.profileImageUrl} 
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    {user.isAdmin && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {!user.isAdmin ? (
                      <Button
                        size="sm"
                        onClick={() => promoteUserMutation.mutate(user.id)}
                        disabled={promoteUserMutation.isPending}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Make Admin
                      </Button>
                    ) : user.email !== "cslack815@gmail.com" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => demoteUserMutation.mutate(user.id)}
                        disabled={demoteUserMutation.isPending}
                      >
                        Remove Admin
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scorecard Management */}
      <Card>
        <CardHeader>
          <CardTitle>Scorecard Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rounds.map((round: any) => (
              <div key={round.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{round.course}</p>
                  <p className="text-sm text-gray-600">{round.date} - Day {round.day}</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => clearScorecardMutation.mutate(round.id)}
                    disabled={clearScorecardMutation.isPending}
                  >
                    Clear Scores
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteRoundMutation.mutate(round.id)}
                    disabled={deleteRoundMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete Round
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}