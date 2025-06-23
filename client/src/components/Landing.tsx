import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Calendar, BarChart } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-golf-green to-green-600">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            Portugal Golf Trip 2025
          </h1>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Experience the ultimate golf adventure with real-time scoring, 
            team competitions, and comprehensive trip management.
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            size="lg"
            className="bg-white text-golf-green hover:bg-gray-100 font-semibold px-8 py-3"
          >
            Sign In to Continue
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader className="text-center">
              <Trophy className="h-12 w-12 text-yellow-300 mx-auto mb-2" />
              <CardTitle className="text-white">Live Scoring</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-100 text-center">
                Real-time hole-by-hole scoring with Stableford calculations
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-blue-300 mx-auto mb-2" />
              <CardTitle className="text-white">Team Matchplay</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-100 text-center">
                Betterball team competitions with live leaderboards
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader className="text-center">
              <Calendar className="h-12 w-12 text-purple-300 mx-auto mb-2" />
              <CardTitle className="text-white">Course Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-100 text-center">
                Detailed course information and daily schedules
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader className="text-center">
              <BarChart className="h-12 w-12 text-orange-300 mx-auto mb-2" />
              <CardTitle className="text-white">Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-100 text-center">
                Comprehensive statistics and performance tracking
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Trip Details */}
        <Card className="bg-white/10 backdrop-blur border-white/20 max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white mb-4">
              5-Day Golf Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">July 2-3</h3>
                <p className="text-green-100">NAU Morgado Course</p>
                <p className="text-green-100">Betterball Stableford</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">July 4</h3>
                <p className="text-green-100">Pine Cliffs Course</p>
                <p className="text-green-100">Rest & Activities</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">July 5-6</h3>
                <p className="text-green-100">Vila Sol Course</p>
                <p className="text-green-100">Final Championship</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}