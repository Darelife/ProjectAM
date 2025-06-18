"use client";

import { MotionDiv } from "@/components/ui/motion";
import { Cloud, CloudRain, CloudSnow, Sun } from "lucide-react";
import { useState, useEffect } from "react";

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  location: string;
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 22,
    condition: "Sunny",
    icon: "sun",
    location: "New York",
  });

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "sunny":
        return <Sun className="w-8 h-8 text-yellow-500" />;
      case "cloudy":
        return <Cloud className="w-8 h-8 text-gray-400" />;
      case "rainy":
        return <CloudRain className="w-8 h-8 text-blue-400" />;
      case "snowy":
        return <CloudSnow className="w-8 h-8 text-blue-200" />;
      default:
        return <Sun className="w-8 h-8 text-yellow-500" />;
    }
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-xl p-6 shadow-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium gradient-text">Weather</h3>
        <span className="text-sm text-muted-foreground">{weather.location}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {getWeatherIcon(weather.condition)}
          <div>
            <div className="text-3xl font-bold">{weather.temperature}°C</div>
            <div className="text-sm text-muted-foreground">
              {weather.condition}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm text-muted-foreground">Forecast</div>
          <div className="flex items-center space-x-2 mt-2">
            {[22, 23, 21, 20].map((temp, index) => (
              <div
                key={index}
                className="text-center px-2 py-1 rounded-lg bg-background/50"
              >
                <div className="text-xs text-muted-foreground">
                  {["Mon", "Tue", "Wed", "Thu"][index]}
                </div>
                <div className="text-sm font-medium">{temp}°</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MotionDiv>
  );
} 