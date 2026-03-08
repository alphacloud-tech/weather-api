'use strict';

const { createCoreService } = require('@strapi/strapi').factories;

const WEATHER_CODE_MAP = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

const weatherCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

module.exports = createCoreService(
  'api::weather-search.weather-search',
  ({ strapi }) => ({
    getCacheKey(city) {
      return String(city).trim().toLowerCase();
    },

    getFromCache(city) {
      const key = this.getCacheKey(city);
      const cached = weatherCache.get(key);

      if (!cached) {
        return null;
      }

      if (Date.now() > cached.expiresAt) {
        weatherCache.delete(key);
        return null;
      }

      return cached.data;
    },

    setCache(city, data) {
      const key = this.getCacheKey(city);

      weatherCache.set(key, {
        data,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });
    },

    async searchAndStore(city) {
      const trimmedCity = String(city || '').trim();

      if (!trimmedCity) {
        throw Object.assign(new Error('City is required.'), { status: 400 });
      }

      // 1. Check memory cache
      const cachedData = this.getFromCache(trimmedCity);
      if (cachedData) {
        return {
          ...cachedData,
          dataSource: 'memory-cache',
        };
      }

      // 2. Check database
      const validSince = new Date(Date.now() - CACHE_TTL_MS).toISOString();

      const existingRecords = await strapi
        .documents('api::weather-search.weather-search')
        .findMany({
          filters: {
            city: {
              $eqi: trimmedCity,
            },
            fetchedAt: {
              $gte: validSince,
            },
          },
          sort: ['fetchedAt:desc'],
          limit: 1,
        });

      if (existingRecords.length > 0) {
        const dbRecord = existingRecords[0];

        // 3. Save DB result to cache
        this.setCache(trimmedCity, dbRecord);

        return {
          ...dbRecord,
          dataSource: 'database',
        };
      }

      // 4. Call Open-Meteo
      const location = await this.fetchLocation(trimmedCity);

      if (!location) {
        throw Object.assign(
          new Error(`No location found for "${trimmedCity}".`),
          { status: 404 }
        );
      }

      const weatherData = await this.fetchWeather(
        location.latitude,
        location.longitude
      );

      const payload = this.normalizeWeatherResponse(location, weatherData);

      // 5. Save to DB
      const savedRecord = await strapi
        .documents('api::weather-search.weather-search')
        .create({
          data: payload,
        });

      // 6. Save to cache
      this.setCache(trimmedCity, savedRecord);

      // 7. Return result
      return {
        ...savedRecord,
        dataSource: 'provider',
      };
    },

    async getHistory({ page = 1, pageSize = 10 }) {
      const start = (page - 1) * pageSize;

      const data = await strapi
        .documents('api::weather-search.weather-search')
        .findMany({
          sort: ['fetchedAt:desc'],
          start,
          limit: pageSize,
        });

      const total = await strapi
        .documents('api::weather-search.weather-search')
        .count();

      return {
        data,
        meta: {
          pagination: {
            page,
            pageSize,
            pageCount: Math.ceil(total / pageSize),
            total,
          },
        },
      };
    },

    async fetchLocation(city) {
      const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
      url.searchParams.set('name', city);
      url.searchParams.set('count', '1');
      url.searchParams.set('language', 'en');
      url.searchParams.set('format', 'json');

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw Object.assign(new Error('Failed to fetch location data.'), {
          status: 502,
        });
      }

      const result = await response.json();

      if (!result || !result.results || !result.results.length) {
        return null;
      }

      return result.results[0];
    },

    async fetchWeather(latitude, longitude) {
      const url = new URL('https://api.open-meteo.com/v1/forecast');
      url.searchParams.set('latitude', String(latitude));
      url.searchParams.set('longitude', String(longitude));
      url.searchParams.set(
        'current',
        'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m'
      );
      url.searchParams.set('timezone', 'auto');

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw Object.assign(new Error('Failed to fetch weather data.'), {
          status: 502,
        });
      }

      return response.json();
    },

    normalizeWeatherResponse(location, weatherData) {
      const current = weatherData && weatherData.current ? weatherData.current : {};

      return {
        city: location.name || '',
        country: location.country || '',
        latitude: location.latitude ?? null,
        longitude: location.longitude ?? null,
        temperatureC: current.temperature_2m ?? null,
        humidity: current.relative_humidity_2m ?? null,
        windSpeed: current.wind_speed_10m ?? null,
        windDirection: current.wind_direction_10m ?? null,
        weatherCode: current.weather_code ?? null,
        weatherText: WEATHER_CODE_MAP[current.weather_code] || 'Unknown',
        fetchedAt: current.time || new Date().toISOString(),
        provider: 'open-meteo',
        providerRaw: {
          location,
          weather: weatherData,
        },
      };
    },
  })
);