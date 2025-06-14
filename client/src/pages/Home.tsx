import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Club, Users, Smartphone, CalendarDays, Flag, TrendingUp, Coins, Vote, Sun } from "lucide-react";
import { scheduleData } from "@/lib/courseData";
import CumulativeLeaderboard from "@/components/CumulativeLeaderboard";
import { useQuery } from "@tanstack/react-query";
import type { Player, Team, Round, Score } from "@shared/schema";

export default function Home() {
  const today = new Date().toISOString().split('T')[0];
  const todaySchedule = scheduleData.find(item => item.date === today) || scheduleData[1]; // Default to July 2nd

  // Fetch data for cumulative leaderboards
  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ['/api/players']
  });

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ['/api/teams']
  });

  const { data: rounds = [] } = useQuery<Round[]>({
    queryKey: ['/api/rounds']
  });

  const { data: allScores = [] } = useQuery<Score[]>({
    queryKey: ['/api/scores/all'],
    queryFn: () => fetch('/api/scores/all').then(res => res.json())
  });

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-6 bg-gradient-to-r from-green-600 to-green-800 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">Portugal Golf Trip 2025</h1>
              <p className="text-xl md:text-2xl font-medium">July 1-6, 2025 • Vila Gale Cerro Alagoa</p>
            </div>
          </div>
        </div>

        {/* Trip Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="text-golf-green h-8 w-8 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">5 Days</h3>
              <p className="text-gray-600">Epic Golf Adventure</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Club className="text-golf-green h-8 w-8 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">3 Courses</h3>
              <p className="text-gray-600">Premium Portuguese Golf</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="text-golf-green h-8 w-8 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">Group Fun</h3>
              <p className="text-gray-600">Banter & Competition</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Smartphone className="text-golf-green h-8 w-8 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">Live Scoring</h3>
              <p className="text-gray-600">Real-time Tracking</p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Schedule Highlight */}
        <Card className="golf-green text-white mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <i className="fas fa-clock mr-3"></i>Today's Schedule
            </h2>
            <div className="golf-light rounded-lg p-4">
              <p className="text-lg font-medium mb-2">{todaySchedule.day}</p>
              {todaySchedule.course ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Departure:</span> {todaySchedule.departure}
                  </div>
                  <div>
                    <span className="font-medium">Tee Time:</span> {todaySchedule.teeTime}
                  </div>
                  <div>
                    <span className="font-medium">Course:</span> {todaySchedule.course}
                  </div>
                </div>
              ) : (
                <p className="text-sm">{todaySchedule.description}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Link href="/schedule">
            <Card className="hover:shadow-xl transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <CalendarDays className="text-golf-green h-8 w-8 mx-auto mb-3" />
                <h3 className="font-bold text-lg">Full Schedule</h3>
                <p className="text-gray-600 text-sm">Trip Itinerary</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/courses">
            <Card className="hover:shadow-xl transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Flag className="text-golf-green h-8 w-8 mx-auto mb-3" />
                <h3 className="font-bold text-lg">Golf Courses</h3>
                <p className="text-gray-600 text-sm">Course Info & Tips</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/scoring">
            <Card className="hover:shadow-xl transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <TrendingUp className="text-golf-green h-8 w-8 mx-auto mb-3" />
                <h3 className="font-bold text-lg">Live Scoring</h3>
                <p className="text-gray-600 text-sm">Track Your Game</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/fines">
            <Card className="hover:shadow-xl transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Coins className="text-golf-gold h-8 w-8 mx-auto mb-3" />
                <h3 className="font-bold text-lg">Fines Tracker</h3>
                <p className="text-gray-600 text-sm">Banter & Penalties</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/activities">
            <Card className="hover:shadow-xl transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Vote className="text-golf-green h-8 w-8 mx-auto mb-3" />
                <h3 className="font-bold text-lg">Friday Activities</h3>
                <p className="text-gray-600 text-sm">Vote for Fun</p>
              </CardContent>
            </Card>
          </Link>
          
          <Card className="hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <Sun className="text-golf-amber h-8 w-8 mx-auto mb-3" />
              <h3 className="font-bold text-lg">Weather</h3>
              <p className="text-gray-600 text-sm">Course Conditions</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
