import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { scheduleData } from "@/lib/courseData";
import { Clock, MapPin, Car, Calendar, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

// Course descriptions and details
const courseDetails = {
  "NAU Morgado Course": {
    description: "The NAU Morgado Golf & Country Club features an 18-hole, par-73 championship course designed by European Golf Design. Located in Portimão near the Monchique mountains, this course offers wide fairways, strategic bunkers, and scenic views.",
    website: "https://www.nauhotels.com/en/nau-morgado-golf-country-club",
    navigationTime: "35 minutes"
  },
  "Amendoeira Golf Resort (Faldo Course)": {
    description: "The Faldo Course at Amendoeira Golf Resort is a par-72 championship design by Sir Nick Faldo, requiring strategic play and careful positioning. This course won Portugal's Best Golf Course title in 2016 from World Golf Awards.",
    website: "https://www.amendoeiraresort.com",
    navigationTime: "25 minutes"
  },
  "Quinta do Lago South Course": {
    description: "Quinta do Lago is part of the prestigious Golden Triangle and has hosted the Portuguese Open multiple times. The South Course features the famous par-3 15th hole requiring a 200-meter shot over a lake.",
    website: "https://www.quintadolagocc.com/en/quinta-do-lago",
    navigationTime: "45 minutes"
  }
};

export default function Schedule() {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  
  const navigateDay = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1);
    } else if (direction === 'next' && currentDayIndex < scheduleData.length - 1) {
      setCurrentDayIndex(currentDayIndex + 1);
    }
  };

  const currentItem = scheduleData[currentDayIndex];
  const courseDetail = currentItem.course ? courseDetails[currentItem.course as keyof typeof courseDetails] : null;

  return (
    <div className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-golf-green mb-8 text-center">Trip Schedule</h1>
        
        {/* Villa Gale Hotel Link */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-bold text-blue-900">Villa Gale Cerro Alagoa</h3>
                  <p className="text-sm text-blue-700">Our Base Hotel</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://maps.google.com/?q=Villa+Gale+Cerro+Alagoa+Albufeira+Portugal', '_blank')}
                className="text-blue-600 border-blue-300 hover:bg-blue-100"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Google Maps
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Day Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigateDay('prev')}
            disabled={currentDayIndex === 0}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous Day</span>
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">Day {currentDayIndex + 1} of {scheduleData.length}</p>
            <p className="font-medium text-gray-900">{currentItem.date}</p>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => navigateDay('next')}
            disabled={currentDayIndex === scheduleData.length - 1}
            className="flex items-center space-x-2"
          >
            <span>Next Day</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Current Day Display */}
        <Card className={currentItem.isSpecial ? "bg-yellow-50 border-yellow-200" : "bg-gray-50"}>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className={`${currentItem.isSpecial ? "bg-yellow-500" : "bg-green-700"} text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4`}>
                {currentDayIndex + 1}
              </div>
              <h3 className="text-xl font-bold">{currentItem.day}</h3>
            </div>
            
            <Card className="bg-white">
              <CardContent className="p-4">
                {currentItem.course ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-golf-green text-lg">{currentItem.course}</h4>
                      {currentItem.course === 'Quinta do Lago South Course' && (
                        <Badge className="bg-yellow-500 text-white">
                          <i className="fas fa-star mr-1"></i>Final Round Championship
                        </Badge>
                      )}
                    </div>
                    
                    {/* Course Description */}
                    {courseDetail && (
                      <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-gray-700 leading-relaxed">{courseDetail.description}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <div>
                          <span className="font-medium text-gray-700">Departure:</span>
                          <p className="text-golf-green font-bold">{currentItem.departure}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Car className="h-4 w-4 text-gray-500" />
                        <div>
                          <span className="font-medium text-gray-700">Navigation:</span>
                          <p className="text-golf-green font-bold">{courseDetail?.navigationTime || currentItem.travelTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <i className="fas fa-golf-ball text-gray-500"></i>
                        <div>
                          <span className="font-medium text-gray-700">Tee Time:</span>
                          <p className="text-golf-green font-bold">{currentItem.teeTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <div>
                          <span className="font-medium text-gray-700">Pick Up:</span>
                          <p className="text-golf-green font-bold">{currentItem.pickupTime}</p>
                        </div>
                      </div>
                    </div>
                    
                    {currentItem.duration && (
                      <div className="flex items-center space-x-2 mb-4">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-700">Duration:</span>
                        <span className="text-golf-green font-bold">{currentItem.duration}</span>
                      </div>
                    )}
                    
                    {/* Golf Course Website Link */}
                    {courseDetail && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(courseDetail.website, '_blank')}
                          className="text-golf-green border-golf-green hover:bg-golf-green hover:text-white"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Visit Course Website
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div>
                    <p className="text-gray-700">{currentItem.description}</p>
                    {currentItem.duration && (
                      <div className="flex items-center space-x-2 mt-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-700">Duration:</span>
                        <span className="text-golf-green font-bold">{currentItem.duration}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}