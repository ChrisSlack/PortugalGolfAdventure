import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Coins, AlertTriangle, User, TrendingUp } from "lucide-react";
import { standardFines } from "@/lib/courseData";
import { useToast } from "@/hooks/use-toast";

interface Fine {
  id: string;
  player: string;
  type: string;
  amount: number;
  description: string;
  timestamp: string;
}

interface FinesTrackerProps {
  players: string[];
  fines: Fine[];
  onAddFine: (fine: Omit<Fine, 'id' | 'timestamp'>) => void;
}

export default function FinesTracker({ players, fines, onAddFine }: FinesTrackerProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [customDescription, setCustomDescription] = useState<string>('');
  const { toast } = useToast();

  const totalFines = fines.reduce((sum, fine) => sum + fine.amount, 0);
  
  const playerFines = players.reduce((acc, player) => {
    acc[player] = fines.filter(fine => fine.player === player).reduce((sum, fine) => sum + fine.amount, 0);
    return acc;
  }, {} as { [player: string]: number });

  const mostFined = Object.keys(playerFines).length > 0 
    ? Object.keys(playerFines).reduce((a, b) => playerFines[a] > playerFines[b] ? a : b)
    : '';

  const fineTypes = fines.reduce((acc, fine) => {
    acc[fine.type] = (acc[fine.type] || 0) + 1;
    return acc;
  }, {} as { [type: string]: number });

  const mostCommonFine = Object.keys(fineTypes).length > 0
    ? Object.keys(fineTypes).reduce((a, b) => fineTypes[a] > fineTypes[b] ? a : b)
    : '';

  const handleAddFine = (fineType: string, amount: number, description: string) => {
    if (!selectedPlayer) {
      toast({
        title: "No Player Selected",
        description: "Please select a player first!",
        variant: "destructive"
      });
      return;
    }

    const fineData = standardFines.find(f => f.type === fineType);
    if (!fineData) return;

    onAddFine({
      player: selectedPlayer,
      type: fineType,
      amount,
      description
    });

    toast({
      title: "Fine Added",
      description: `${selectedPlayer} fined ${amount} for ${fineData.name}`
    });
  };

  const sortedPlayerFines = Object.entries(playerFines)
    .sort((a, b) => b[1] - a[1])
    .filter(([_, amount]) => amount > 0);

  return (
    <div className="space-y-6">
      {/* Fines Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Coins className="text-golf-gold h-8 w-8 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-golf-green">€{totalFines}</h3>
            <p className="text-gray-600">Total Fines</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <User className="text-red-500 h-8 w-8 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-golf-green">{mostFined || '-'}</h3>
            <p className="text-gray-600">Most Fined Player</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="text-golf-amber h-8 w-8 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-golf-green">
              {mostCommonFine ? standardFines.find(f => f.type === mostCommonFine)?.name || '-' : '-'}
            </h3>
            <p className="text-gray-600">Most Common Fine</p>
          </CardContent>
        </Card>
      </div>

      {/* Player Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Add Fine</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Player</label>
            <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
              <SelectTrigger>
                <SelectValue placeholder="Choose player..." />
              </SelectTrigger>
              <SelectContent>
                {players.map(player => (
                  <SelectItem key={player} value={player}>
                    {player}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Standard Fines */}
      <Card>
        <CardHeader>
          <CardTitle>Standard Golf Fines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {standardFines.filter(fine => fine.type !== 'ladies-tee').map(fine => (
              <div key={fine.type} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-golf-green">{fine.name}</h4>
                  <Badge className={`${fine.amount === 1 ? 'bg-yellow-500' : 'bg-red-500'} text-white`}>
                    €{fine.amount}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{fine.description}</p>
                <Button 
                  onClick={() => handleAddFine(fine.type, fine.amount, fine.description)}
                  className="w-full golf-green text-white hover:golf-light"
                  disabled={!selectedPlayer}
                >
                  Add Fine
                </Button>
              </div>
            ))}
          </div>
          
          {/* Special Fine */}
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-red-600">Not Clearing Ladies Tee</h4>
              <Badge className="bg-red-600 text-white">€5</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-3">Drive failing to pass ladies tee box</p>
            <Button 
              onClick={() => handleAddFine('ladies-tee', 5, 'Drive failing to pass ladies tee box')}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={!selectedPlayer}
            >
              Add Major Fine
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Fines Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Fines Leaderboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedPlayerFines.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Coins className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No fines recorded yet. Start adding some banter!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedPlayerFines.map(([player, amount], index) => (
                <div key={player} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-golf-green text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <span className="font-bold text-lg">{player}</span>
                      <p className="text-sm text-gray-600">
                        {fines.filter(f => f.player === player).length} fines
                      </p>
                    </div>
                  </div>
                  <div className="text-golf-gold text-xl font-bold">
                    €{amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
