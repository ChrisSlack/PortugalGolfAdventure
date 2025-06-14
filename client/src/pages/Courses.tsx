import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { courses } from "@/lib/courseData";
import { MapPin, Flag, Award, Info } from "lucide-react";

export default function Courses() {
  const getHardestHole = (courseHoles: any[]) => {
    const hardest = courseHoles.reduce((prev, current) => 
      (prev.handicap < current.handicap) ? prev : current
    );
    return hardest;
  };

  const getEasiestHole = (courseHoles: any[]) => {
    const easiest = courseHoles.reduce((prev, current) => 
      (prev.handicap > current.handicap) ? prev : current
    );
    return easiest;
  };

  return (
    <div className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-golf-green mb-8 text-center">Golf Courses</h1>
        
        <div className="space-y-8">
          {courses.map((course, index) => {
            const hardestHole = getHardestHole(course.holes);
            const easiestHole = getEasiestHole(course.holes);
            const totalYardage = course.holes.reduce((sum, hole) => sum + hole.yardage, 0);
            
            return (
              <Card key={course.id} className="bg-white shadow-lg overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className={`${index % 2 === 1 ? 'order-2 lg:order-1' : 'order-1 lg:order-2'} p-6`}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-golf-green">{course.name}</h2>
                      <Badge variant="outline" className="border-golf-green text-golf-green">
                        Par {course.par}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{course.description}</p>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700 flex items-center">
                          <Flag className="h-4 w-4 mr-2" />
                          Par:
                        </span>
                        <span className="font-bold text-golf-green">{course.par}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700 flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          Total Length:
                        </span>
                        <span className="font-bold text-golf-green">{totalYardage.toLocaleString()}m</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">Holes:</span>
                        <span className="font-bold text-golf-green">18</span>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4 mb-4">
                      <h4 className="font-bold text-golf-green mb-2 flex items-center">
                        <Info className="h-4 w-4 mr-2" />
                        Course Highlights
                      </h4>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Hardest Hole:</strong> #{hardestHole.hole} (Par {hardestHole.par}, {hardestHole.yardage}m)
                      </p>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Easiest Hole:</strong> #{easiestHole.hole} (Par {easiestHole.par}, {easiestHole.yardage}m)
                      </p>
                      {course.signatureHole && (
                        <p className="text-sm text-gray-700">
                          <strong>Signature Hole:</strong> {course.signatureHole}
                        </p>
                      )}
                    </div>
                    
                    <Button 
                      className="w-full golf-green text-white hover:golf-light"
                      onClick={() => {
                        // Scroll to scorecard section or open modal
                        const scorecardSection = document.getElementById(`scorecard-${course.id}`);
                        if (scorecardSection) {
                          scorecardSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    >
                      <Award className="h-4 w-4 mr-2" />
                      View Full Scorecard
                    </Button>
                  </div>
                  
                  <div className={`${index % 2 === 1 ? 'order-1 lg:order-2' : 'order-2 lg:order-1'} h-64 lg:h-auto`}>
                    <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                      <div className="text-white text-center">
                        <i className="fas fa-golf-ball text-6xl mb-4 opacity-20"></i>
                        <p className="text-sm opacity-75">{course.name}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Full Scorecard */}
                <div id={`scorecard-${course.id}`} className="p-6 bg-gray-50 border-t">
                  <h3 className="text-xl font-bold text-golf-green mb-4">Full Scorecard</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="golf-green text-white">
                          <th className="px-3 py-2 text-left">Hole</th>
                          <th className="px-3 py-2 text-center">Par</th>
                          <th className="px-3 py-2 text-center">Yardage</th>
                          <th className="px-3 py-2 text-center">Handicap</th>
                        </tr>
                      </thead>
                      <tbody>
                        {course.holes.map((hole) => (
                          <tr key={hole.hole} className="border-b hover:bg-gray-50">
                            <td className="px-3 py-2 font-medium">{hole.hole}</td>
                            <td className="px-3 py-2 text-center font-medium">{hole.par}</td>
                            <td className="px-3 py-2 text-center">{hole.yardage}m</td>
                            <td className="px-3 py-2 text-center">{hole.handicap}</td>
                          </tr>
                        ))}
                        <tr className="golf-green text-white font-bold">
                          <td className="px-3 py-2">TOTAL</td>
                          <td className="px-3 py-2 text-center">{course.par}</td>
                          <td className="px-3 py-2 text-center">{totalYardage.toLocaleString()}m</td>
                          <td className="px-3 py-2 text-center">-</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
