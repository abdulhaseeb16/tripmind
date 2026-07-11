// src/components/WeatherWidget.tsx
import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudSun, Compass } from 'lucide-react';

interface WeatherWidgetProps {
  destination: string;
}

interface ForecastDay {
  dayName: string;
  icon: React.ReactNode;
  tempMax: number;
  tempMin: number;
  condition: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ destination }) => {
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch mock weather matching destination or default
    const fetchWeather = async () => {
      setLoading(true);
      // Simulate API call to Open-Meteo
      await new Promise(resolve => setTimeout(resolve, 800));

      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const todayIdx = new Date().getDay();

      const weatherTypes = [
        { icon: <Sun className="h-5 w-5 text-amber-500" />, condition: 'Sunny', modifier: 0 },
        { icon: <CloudSun className="h-5 w-5 text-amber-500/80 text-blue-400" />, condition: 'Partly Cloudy', modifier: -2 },
        { icon: <Cloud className="h-5 w-5 text-gray-400" />, condition: 'Overcast', modifier: -4 },
        { icon: <CloudRain className="h-5 w-5 text-blue-500" />, condition: 'Rainy', modifier: -6 }
      ];

      const generated: ForecastDay[] = [];
      const baseTemp = destination.toLowerCase().includes('tokyo') || destination.toLowerCase().includes('kyoto') ? 22 : 28;

      for (let i = 0; i < 5; i++) {
        const index = (todayIdx + i) % 7;
        const typeIndex = Math.abs((todayIdx + i) * 3 + 2) % weatherTypes.length;
        const type = weatherTypes[typeIndex];

        generated.push({
          dayName: i === 0 ? 'Today' : daysOfWeek[index],
          icon: type.icon,
          tempMax: Math.round(baseTemp + type.modifier + Math.random() * 3),
          tempMin: Math.round(baseTemp - 8 + type.modifier - Math.random() * 2),
          condition: type.condition
        });
      }

      setForecast(generated);
      setLoading(false);
    };

    fetchWeather();
  }, [destination]);

  return (
    <div className="bg-white border border-brand-muted/10 rounded-card p-4 shadow-sm w-full">
      <div className="flex items-center justify-between border-b border-brand-muted/5 pb-2.5 mb-3">
        <div>
          <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider">Live Destination Weather</h4>
          <p className="text-[10px] text-brand-muted font-medium">{destination}</p>
        </div>
        <Compass className="h-4 w-4 text-brand-primary" />
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="h-5 w-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-2 text-center">
          {forecast.map((day, i) => (
            <div key={i} className="flex flex-col items-center p-1.5 rounded-lg hover:bg-brand-bg/50 transition-colors">
              <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">{day.dayName}</span>
              <div className="my-1.5">{day.icon}</div>
              <span className="text-xs font-bold text-brand-dark">{day.tempMax}°</span>
              <span className="text-[9px] text-brand-muted font-medium">{day.tempMin}°</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
