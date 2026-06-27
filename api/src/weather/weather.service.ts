import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface WeatherData {
  city: string;
  temperature: number;
  feelsLike: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  alert?: string;
}

// Function: WeatherService
// Kya kar raha hai: OpenWeatherMap API se real-time weather data fetch aur format karne ka dedicated service hai.
@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly baseUrl = 'https://api.openweathermap.org/data/2.5';

  constructor(private config: ConfigService) {}

  // Function: getCurrentWeather
  // Kya kar raha hai: OpenWeatherMap ke API ko call karta hai. Agar koi city pass na ho, toh .env se 'OPENWEATHER_CITY' (default 'London') nikaalta hai aur metric units (Celsius) mein weather nikaalta hai.
  // Relation / Backend: AlertsService.processWeatherAlert() (cron job & manual trigger) isko call karta hai weather data nikaalne ke liye.
  async getCurrentWeather(city?: string): Promise<WeatherData> {
    const targetCity = city || this.config.get('OPENWEATHER_CITY', 'London');
    const apiKey = this.config.get('OPENWEATHER_API_KEY');

    try {
      const { data } = await axios.get(`${this.baseUrl}/weather`, {
        params: { q: targetCity, appid: apiKey, units: 'metric' },
      });

      return {
        city: data.name,
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        icon: data.weather[0].icon,
        alert: this.detectAlert(data),
      };
    } catch (err) {
      this.logger.error(`Failed to fetch weather for ${targetCity}`, err.message);
      throw err;
    }
  }

  // Function: detectAlert
  // Kya kar raha hai: Incoming weather data ke base par extreme conditions check karta hai (jaise temp > 38C, temp < -10C, wind > 20m/s, ya thunderstorm/heavy rain). Agar match ho toh special warning string return karta hai.
  private detectAlert(data: any): string | undefined {
    const temp = data.main.temp;
    const windSpeed = data.wind.speed;
    const weatherId = data.weather[0].id;

    if (temp > 38) return '🌡️ Extreme heat warning!';
    if (temp < -10) return '🥶 Extreme cold warning!';
    if (windSpeed > 20) return '💨 High wind warning!';
    if (weatherId >= 200 && weatherId < 300) return '⛈️ Thunderstorm alert!';
    if (weatherId >= 500 && weatherId < 510) return '🌧️ Heavy rain alert!';
    if (weatherId >= 600 && weatherId < 700) return '❄️ Snowstorm alert!';
    return undefined;
  }

  // Function: formatMessage
  // Kya kar raha hai: Telegram par bhejane ke liye weather data ko sundar Markdown formatted text mein convert karta hai.
  // Relation / Backend: AlertsService.processWeatherAlert() isko call karke broadcast message generate karta hai.
  formatMessage(weather: WeatherData): string {
    const lines = [
      `🌍 *Weather Alert — ${weather.city}*`,
      `🌡 Temperature: ${weather.temperature}°C (feels like ${weather.feelsLike}°C)`,
      `🌤 Condition: ${weather.description}`,
      `💧 Humidity: ${weather.humidity}%`,
      `💨 Wind: ${weather.windSpeed} m/s`,
    ];
    if (weather.alert) {
      lines.unshift(`⚠️ *${weather.alert}*\n`);
    }
    return lines.join('\n');
  }
}
