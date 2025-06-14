import { useState, useEffect } from "react";
import { Coins } from "lucide-react";
import FinesTracker from "@/components/FinesTracker";
import { storage } from "@/lib/storage";

interface Fine {
  id: string;
  player: string;
  type: string;
  amount: number;
  description: string;
  timestamp: string;
}

export default function Fines() {
  const [players, setPlayers] = useState<string[]>([]);
  const [fines, setFines] = useState<Fine[]>([]);

  useEffect(() => {
    const savedPlayers = storage.getPlayers();
    const savedFines = storage.getFines();
    setPlayers(savedPlayers);
    setFines(savedFines);
  }, []);

  const handleAddFine = (fineData: Omit<Fine, 'id' | 'timestamp'>) => {
    const newFine: Fine = {
      ...fineData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    
    const updatedFines = [...fines, newFine];
    setFines(updatedFines);
    storage.setFines(updatedFines);
  };

  return (
    <div className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center mb-8">
          <Coins className="h-8 w-8 text-golf-gold mr-3" />
          <h1 className="text-3xl font-bold text-golf-green">Fines Tracker</h1>
        </div>
        
        <FinesTracker
          players={players}
          fines={fines}
          onAddFine={handleAddFine}
        />
      </div>
    </div>
  );
}
