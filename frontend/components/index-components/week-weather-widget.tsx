"use client";

import { useState, useEffect } from "react";
import { Sun, Cloud, CloudRain, Thermometer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/imported-ui/card";

interface DailyForecast {
  dt: number;
  temp: { day: number };
  weather: { main: string; icon: string }[];
}

export default function WeeklyWeatherWidget() {
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    const fetchForecast = async (lat: number, lon: number) => {
      try {
        const API_KEY = 'ebba0dc5e5d49a49814ed13a26e738b5';

        const response = await fetch(
          `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&appid=${API_KEY}&units=imperial`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch weather forecast.");
        }

        const data = await response.json();
        setForecast(data.daily.slice(0, 5));
      } catch (error) {
        console.error("Error fetching forecast:", error);
      }
    };

    if (coords) {
      fetchForecast(coords.lat, coords.lon);
    }
  }, [coords]);

  // get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setCoords({ lat: 40.7128, lon: -74.006 });
        }
      );
    } else {
      setCoords({ lat: 40.7128, lon: -74.006 });
    }
  }, []);

  const renderIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "clear":
        return <Sun className="h-6 w-6 text-yellow-500" />;
      case "clouds":
        return <Cloud className="h-6 w-6 text-gray-500" />;
      case "rain":
      case "drizzle":
        return <CloudRain className="h-6 w-6 text-blue-500" />;
      default:
        return <Sun className="h-6 w-6 text-yellow-500" />;
    }
  };

  return (
    <Card className="w-full mx-auto md:mx-0 shadow-md">
      <CardContent className="pt-4">
        <div className="grid grid-cols-5 gap-4">
          {forecast.map((day, idx) => (
            <div key={idx} className="flex flex-col items-center p-2 bg-white rounded-lg shadow-sm">
              <span className="text-sm font-medium">
                {new Date(day.dt * 1000).toLocaleDateString("en-US", { weekday: "short" })}
              </span>
              {renderIcon(day.weather[0].main)}
              <div className="flex items-center gap-1 mt-1">
                <Thermometer className="h-4 w-4 text-red-500" />
                <span className="text-sm font-bold">{Math.round(day.temp.day)}°F</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
