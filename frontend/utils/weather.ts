export interface WeatherData {
    temperature: number;
    condition: string;
    location: string;
  }
  
  export async function getWeatherData(): Promise<WeatherData> {
    try {
      const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
      // You can make these coordinates dynamic using geolocation
      const lat = "40.7128";
      const lon = "-74.0060";
      
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`
      );
      
      const data = await response.json();
      
      return {
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main.toLowerCase(),
        location: data.name
      };
    } catch (error) {
      console.error('Error fetching weather:', error);
      return {
        temperature: 72,
        condition: "sunny",
        location: "San Francisco" // fallback data
      };
    }
  }