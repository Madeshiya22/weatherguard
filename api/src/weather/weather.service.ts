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

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly baseUrl = 'https://api.openweathermap.org/data/2.5';

  constructor(private config: ConfigService) {}

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
