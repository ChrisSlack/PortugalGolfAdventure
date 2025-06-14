import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { scheduleData } from "@/lib/courseData";
import { Clock, MapPin, Car, Calendar } from "lucide-react";

export default function Schedule() {
  return (
    <div className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-golf-green mb-8 text-center">Trip Schedule</h1>
        
        <div className="space-y-6">
          {scheduleData.map((item, index) => (
            <Card key={item.date} className={item.isSpecial ? "bg-yellow-50 border-yellow-200" : "bg-gray-50"}>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className={`${item.isSpecial ? "bg-yellow-500" : "bg-green-700"} text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4`}>
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-bold">{item.day}</h3>
                </div>
                
                <Card className="bg-white">
                  <CardContent className="p-4">
                    {item.course ? (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-golf-green text-lg">{item.course}</h4>
                          {item.course === 'Quinta do Lago South Course' && (
                            <Badge className="bg-yellow-500 text-white">
                              <i className="fas fa-star mr-1"></i>Final Round Championship
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <div>
                              <span className="font-medium text-gray-700">Departure:</span>
                              <p className="text-golf-green font-bold">{item.departure}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Car className="h-4 w-4 text-gray-500" />
                            <div>
                              <span className="font-medium text-gray-700">Travel Time:</span>
                              <p className="text-golf-green font-bold">{item.travelTime}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <i className="fas fa-golf-ball text-gray-500"></i>
                            <div>
                              <span className="font-medium text-gray-700">Tee Time:</span>
                              <p className="text-golf-green font-bold">{item.teeTime}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <div>
                              <span className="font-medium text-gray-700">Pick Up:</span>
                              <p className="text-golf-green font-bold">{item.pickupTime}</p>
                            </div>
                          </div>
                        </div>
                        {item.duration && (
                          <div className="mt-3 text-sm text-gray-600">
                            <span className="font-medium">Duration:</span> {item.duration} (Golf & Drinks)
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <h4 className={`font-bold mb-2 ${item.isSpecial ? "text-yellow-600" : "text-golf-green"}`}>
                          {item.isSpecial ? "Free Day Activities" : 
                           item.description.includes("Arrival") ? "Arrival Day" : "Departure Day"}
                        </h4>
                        <p className="text-gray-700 mb-2">{item.description}</p>
                        {item.travelTime && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Car className="h-4 w-4" />
                            <span>
                              <span className="font-medium">Travel Time:</span> {item.travelTime}
                              {item.description.includes("Departure") && " • TBC based on flight times"}
                            </span>
                          </div>
                        )}
                        {item.isSpecial && (
                          <div className="text-sm text-gray-600 mt-2">
                            <span className="font-medium">Options:</span> Beach, Water Sports, Cultural Tours, Adventure Activities
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
