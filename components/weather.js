
"use client";

import { useState } from "react";

export default function Weather() {

  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function getWeather() {

    if (city.trim() === "") {
      setError("Please enter a city name");
      setWeather(null);
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);

    try {

      // Step 1: Find city coordinates

      const cityResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
      );

      if (!cityResponse.ok) {
        throw new Error("Unable to find city");
      }

      const cityData = await cityResponse.json();

      if (!cityData.results || cityData.results.length === 0) {
        throw new Error("City not found");
      }

      const { latitude, longitude, name } = cityData.results[0];

      // Step 2: Get weather data

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`
      );

      if (!weatherResponse.ok) {
        throw new Error("Unable to fetch weather");
      }

      const weatherData = await weatherResponse.json();

      setWeather({
        city: name,
        temperature: weatherData.current.temperature_2m,
        humidity: weatherData.current.relative_humidity_2m,
        wind: weatherData.current.wind_speed_10m,
        code: weatherData.current.weather_code
      });

    }
    catch (err) {

      setError(err.message);

    }
    finally {

      setLoading(false);

    }

  }

  function getCondition(code) {

    if (code === 0) {
      return "Clear Sky";
    }
    else if (code <= 3) {
      return "Partly Cloudy";
    }
    else if (code <= 48) {
      return "Foggy";
    }
    else if (code <= 67) {
      return "Rainy";
    }
    else if (code <= 77) {
      return "Snowy";
    }
    else if (code <= 82) {
      return "Rain Showers";
    }
    else {
      return "Thunderstorm";
    }

  }

  return (

    <div className="weather-container">

      <h1>Weather App</h1>

      <input
        type="text"
        placeholder="Enter city name"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />

      <button onClick={getWeather}>
        Search Weather
      </button>

      {/* Loading State */}

      {loading && (
        <h3>Loading weather...</h3>
      )}

      {/* Error State */}

      {error && (
        <h3 className="error">{error}</h3>
      )}

      {/* Weather Data */}

      {weather && !loading && (

        <div className="weather-info">

          <h2>{weather.city}</h2>

          <h1>{weather.temperature}°C</h1>

          <h3>{getCondition(weather.code)}</h3>

          <p>Humidity: {weather.humidity}%</p>

          <p>Wind Speed: {weather.wind} km/h</p>

        </div>

      )}

    </div>

  );

}
