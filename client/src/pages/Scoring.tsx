import Scorecard from "@/components/Scorecard";
import { useQuery } from "@tanstack/react-query";
import { courses } from "@/lib/courseData";
import type { Round, Player } from "@shared/schema";

export default function Scoring() {
  const { data: rounds = [] } = useQuery<Round[]>({
    queryKey: ['/api/rounds']
  });

  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ['/api/players']
  });

  // Get today's round (based on current date or Day 1 as default)
  const today = new Date();
  const golfDays = [
    { date: '2025-07-02', course: 'nau', day: 1 },
    { date: '2025-07-03', course: 'amendoeira', day: 2 }, 
    { date: '2025-07-05', course: 'quinta', day: 3 }
  ];
  
  const currentDay = golfDays.find(d => d.date === today.toISOString().split('T')[0]) || golfDays[0];
  const currentRound = rounds.find(r => r.course === currentDay.course && r.day === currentDay.day);
  const currentCourse = courses.find(c => c.id === currentDay.course);

  if (!currentCourse) {
    return (
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Course Not Found</h1>
            <p className="text-gray-600">Unable to load course data for scoring.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Scoring</h1>
          <p className="text-gray-600">
            {currentCourse.name} - Day {currentDay.day}
            {currentRound && ` (Round ID: ${currentRound.id})`}
          </p>
        </div>
        
        <Scorecard 
          course={currentCourse}
          players={players.map(p => `${p.firstName} ${p.lastName}`)}
          scores={{}}
          onScoreEdit={() => {}}
          roundId={currentRound?.id}
        />
      </div>
    </div>
  );
}