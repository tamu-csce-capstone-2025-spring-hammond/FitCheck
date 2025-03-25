"use client";

import { useState, useEffect } from "react";
import { Calendar, Cloud, CloudRain, Sun, Thermometer } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/imported-ui/card";
import { Separator } from "@/components/imported-ui/separator";

export default function DateWeatherWidget() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Mock weather data - replace with actual API call
  const [weather] = useState({
    temperature: 72,
    condition: "sunny",
    location: "San Francisco",
  });

  // Update date every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Format date to display day of week, month, day
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(currentDate);

  // Format time to display hours and minutes
  const formattedTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(currentDate);

  // Function to render weather icon based on condition
  const renderWeatherIcon = () => {
    switch (weather.condition) {
      case "sunny":
        return <Sun className="h-10 w-10 text-yellow-500" />;
      case "cloudy":
        return <Cloud className="h-10 w-10 text-gray-500" />;
      case "rainy":
        return <CloudRain className="h-10 w-10 text-blue-500" />;
      default:
        return <Sun className="h-10 w-10 text-yellow-500" />;
    }
  };

  return (
    <Card className="w-full mx-auto md:mx-0  shadow-md">
      <CardHeader className="bg-primary/5 pb-2">
        <CardTitle className="flex items-center gap-2 text-xl font-medium">
          <Calendar className="h-5 w-5" />
          Date & Weather
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-col space-y-4">
          {/* Date Section */}
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold">{formattedDate}</h2>
            <p className="text-lg text-muted-foreground">{formattedTime}</p>
          </div>
          <Separator />
          {/* Weather Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {renderWeatherIcon()}
              <div>
                <h3 className="font-medium">{weather.location}</h3>
                <p className="text-muted-foreground">
                  {weather.condition.charAt(0).toUpperCase() +
                    weather.condition.slice(1)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Thermometer className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold">
                {weather.temperature}°F
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
