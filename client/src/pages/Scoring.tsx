import { useState } from "react";
import ActiveRoundSelector from "@/components/ActiveRoundSelector";
import Scorecard from "@/components/Scorecard";
import { useQuery } from "@tanstack/react-query";
import type { Round } from "@shared/schema";

export default function Scoring() {
  const [activeRoundId, setActiveRoundId] = useState<number | null>(null);
  
  const { data: rounds = [] } = useQuery<Round[]>({
    queryKey: ['/api/rounds']
  });

  // Auto-select first round if none selected
  if (!activeRoundId && rounds.length > 0) {
    setActiveRoundId(rounds[0].id);
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Active Round Selector */}
        <ActiveRoundSelector onRoundChange={setActiveRoundId} />
        
        {/* Scorecard - Only show when round is selected */}
        {activeRoundId && (
          <Scorecard roundId={activeRoundId} />
        )}
        
        {!activeRoundId && rounds.length === 0 && (
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">No Rounds Available</h1>
            <p className="text-gray-600">Create a new round above to start scoring.</p>
          </div>
        )}
      </div>
    </div>
  );
}