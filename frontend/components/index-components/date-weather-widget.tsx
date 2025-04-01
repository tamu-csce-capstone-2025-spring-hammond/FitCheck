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

interface WeatherData {
  temperature: number;
  condition: string;
  location: string;
}

export default function DateWeatherWidget() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 72,
    condition: "sunny",
    location: "Loading...",
  });

  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null
  );

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const API_KEY = 'ebba0dc5e5d49a49814ed13a26e738b5';

        if (!API_KEY) {
          throw new Error("API key is missing. Please check your .env.local file.");
        }

        // Fetch weather data
        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=hourly,daily&appid=${API_KEY}&units=imperial`
        );

        console.log("Weather API Response:", weatherResponse.status);

        if (!weatherResponse.ok) {
          const errorData = await weatherResponse.json();
          console.error("Weather API Error:", errorData);
          throw new Error(`Weather data fetch failed: ${errorData.message}`);
        }

        const weatherData = await weatherResponse.json();
        console.log("Weather data:", weatherData);

        // Fetch city name using Reverse Geocoding API
        const locationResponse = await fetch(
          `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
        );

        console.log("Location API Response:", locationResponse.status);

        if (!locationResponse.ok) {
          const errorData = await locationResponse.json();
          console.error("Location API Error:", errorData);
          throw new Error(`Location data fetch failed: ${errorData.message}`);
        }

        const locationData = await locationResponse.json();
        console.log("Location data:", locationData);

        const cityName = locationData[0]?.name || "Unknown Location";

        // Update weather state
        setWeather({
          temperature: Math.round(weatherData.current.temp),
          condition: weatherData.current.weather[0].main.toLowerCase(),
          location: cityName, // Use the city name instead of the timezone
        });
      } catch (error) {
        console.error("Error fetching weather or location:", error);
      }
    };

    if (coords) {
      fetchWeather(coords.lat, coords.lon);
    }
  }, [coords]);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("User's Location:", position.coords);
          setCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Fallback to a default location (e.g., New York)
          setCoords({ lat: 40.7128, lon: -74.0060 });
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      // Fallback to a default location (e.g., New York)
      setCoords({ lat: 40.7128, lon: -74.0060 });
    }
  }, []);

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
      case "clear":
        return <Sun className="h-10 w-10 text-yellow-500" />;
      case "clouds":
        return <Cloud className="h-10 w-10 text-gray-500" />;
      case "rain":
      case "drizzle":
        return <CloudRain className="h-10 w-10 text-blue-500" />;
      default:
        return <Sun className="h-10 w-10 text-yellow-500" />;
    }
  };

  return (
    <Card className="w-full mx-auto md:mx-0 shadow-md">
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