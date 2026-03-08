# Weather Backend API

A simple weather backend built with Strapi 5. It fetches weather data from Open-Meteo, stores results in the database, and uses memory cache + DB fallback** to avoid unnecessary API calls.

## Features

- Search weather by city
- Fetch data from Open-Meteo
- Save weather result in Strapi database
- Return cached result for repeated searches
- Return DB result if already available and still fresh
- Weather search history endpoint

## Tech Stack

- Strapi 5
- Node.js
- SQLite / MySQL
- Open-Meteo API

## Project Flow

When a city is searched, the backend follows this order:

1. Check memory cache
2. If not in cache, check database
3. If not in database, call Open-Meteo
4. Save result to database
5. Save result to cache
6. Return result

## Requirements

Make sure these are installed:

- Node.js `20+`
- npm
- Git

Check versions:

```bash
node -v
npm -v
git --version
```

## Clone the Project

```bash
git clone https://github.com/alphacloud-tech/weather-api.git
cd weather-backend
```

## Install Dependencies

```bash
npm install
```

## Environment Setup

This project uses an `.env.example` file.

Copy it to `.env`:

### Windows CMD

```bash
copy .env.example .env
```

### PowerShell

```bash
Copy-Item .env.example .env
```

### Git Bash / macOS / Linux

```bash
cp .env.example .env
```

Then update the values inside `.env` if needed.

## Example `.env.example`

```env
HOST=0.0.0.0
PORT=1337

APP_KEYS=appKey1,appKey2,appKey3,appKey4
API_TOKEN_SALT=someApiTokenSalt
ADMIN_JWT_SECRET=someAdminJwtSecret
TRANSFER_TOKEN_SALT=someTransferTokenSalt
JWT_SECRET=someJwtSecret
ENCRYPTION_KEY=someEncryptionKey

DATABASE_CLIENT=sqlite
DATABASE_CONNECTION_TIMEOUT=60000
```

## Run the Project

Start Strapi in development mode:

```bash
npm run develop
```

The backend should run on:

```text
http://localhost:1337
```

Strapi admin panel:

```text
http://localhost:1337/admin
```

## First Time Setup

When running for the first time:

1. Start the project:

```bash
npm run develop
```

2. Open:

```text
http://localhost:1337/admin
```

3. Create your admin account

4. Strapi will create the database tables automatically

## API Endpoints

### 1. Search Weather

**POST** `/api/weather/search`

#### Request body

```json
{
  "city": "Lagos"
}
```

#### Example response

```json
{
  "success": true,
  "message": "Weather fetched and returned successfully.",
  "data": {
    "id": 1,
    "documentId": "abc123",
    "city": "Lagos",
    "country": "Nigeria",
    "latitude": 6.45,
    "longitude": 3.39,
    "temperatureC": 33.1,
    "humidity": 64,
    "windSpeed": 15,
    "windDirection": 207,
    "weatherCode": 2,
    "weatherText": "Partly cloudy",
    "fetchedAt": "2026-03-08T12:00:00.000Z",
    "provider": "open-meteo",
    "providerRaw": {},
    "dataSource": "provider"
  }
}
```

### `dataSource` values

The response may return one of these:

- `provider` → fetched from Open-Meteo
- `database` → returned from DB
- `memory-cache` → returned from in-memory cache

### 2. Weather History

GET `/api/weather/history`

#### Example

```text
GET http://localhost:1337/api/weather/history?page=1&pageSize=10
```

#### Example response

```json
{
  "success": true,
  "message": "Weather history fetched successfully.",
  "data": [],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "pageCount": 1,
      "total": 0
    }
  }
}
```

## Project Structure

```text
weather-backend/
├── config/
├── src/
│   ├── api/
│   │   └── weather-search/
│   │       ├── content-types/
│   │       │   └── weather-search/
│   │       │       └── schema.json
│   │       ├── controllers/
│   │       │   └── weather-search.js
│   │       ├── routes/
│   │       │   └── weather-search.js
│   │       └── services/
│   │           └── weather-search.js
│   ├── components/
│   └── extensions/
├── public/
├── .env.example
├── package.json
└── README.md
```

## How Caching Works

This project uses an in-memory cache with a time limit.

- First search for a city:
  - checks cache
  - checks DB
  - calls provider if needed
- Repeated search within cache time:
  - returns from cache
- If server restarts:
  - cache is cleared
  - DB becomes fallback
- If no recent record exists:
  - provider is called again

## Important Note

Memory cache is temporary:

- it is cleared when the server restarts
- it is not shared across multiple servers

For production, Redis would be a better cache solution.

## Useful Commands

Start dev server:

```bash
npm run develop
```

Start without watch mode:

```bash
npm run start
```

Build admin panel:

```bash
npm run build
```

Show Strapi commands:

```bash
npm run strapi
```

## Common Issues

### 1. Node version error

If Strapi fails with a Node version error, install Node `20+`.

Check:

```bash
node -v
```

### 2. Port already in use

If port `1337` is busy, change it in `.env`:

```env
PORT=1338
```

### 3. Database connection issue

If using MySQL:

- confirm MySQL is running
- confirm DB name is correct
- confirm username/password are correct

### 4. Empty result for city search

Make sure the city name is valid and supported by Open-Meteo geocoding.

## Notes

- This project currently keeps the weather search route open for easy testing
- No authentication is required for now
- The project is meant for learning, testing, and demonstration

## Future Improvements

- Add authentication
- Add validation library
- Add Swagger / OpenAPI docs
- Add Redis cache
- Add filtering on weather history
- Add unit tests

## Author

Built by ......
