import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';

// Function: WeatherModule
// Kya kar raha hai: OpenWeatherMap API se communication handle karne wale service ko ek module mein bundle karta hai.
@Module({
  // providers: WeatherService ko DI container mein register karta hai taaki yeh instantiate ho sake.
  providers: [WeatherService],
  
  // exports: WeatherService ko export karta hai taaki doosre modules (jaise AlertsModule) isko import karke 'getCurrentWeather' aur 'formatMessage' functions use kar sakein.
  exports: [WeatherService],
})
export class WeatherModule {}
