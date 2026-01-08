import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Cloud, CloudRain, Sun, CloudSnow, Calendar, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { base44 } from "@/api/base44Client";

export default function DateTimeWeather() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cityName, setCityName] = useState('');

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
            const fetchWeather = async (lat, lon, city) => {
                try {

                    // Hole Wetterdaten von Open-Meteo
                    const weatherResponse = await fetch(
                        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&timezone=Europe/Berlin`
                    );
                    const weatherData = await weatherResponse.json();

                    if (weatherData.current) {
                        const current = weatherData.current;
                        const weatherConditions = {
                            0: "Klar",
                            1: "Überwiegend klar",
                            2: "Teilweise bewölkt",
                            3: "Bewölkt",
                            45: "Nebel",
                            48: "Nebel",
                            51: "Leichter Nieselregen",
                            53: "Nieselregen",
                            55: "Dichter Nieselregen",
                            61: "Leichter Regen",
                            63: "Regen",
                            65: "Starkregen",
                            71: "Leichter Schnee",
                            73: "Schnee",
                            75: "Starker Schnee",
                            80: "Leichte Regenschauer",
                            81: "Regenschauer",
                            82: "Starke Regenschauer",
                            95: "Gewitter"
                        };

                        setWeather({
                            temperature: current.temperature_2m,
                            condition: weatherConditions[current.weather_code] || "Unbekannt",
                            wind_speed: current.wind_speed_10m,
                            humidity: current.relative_humidity_2m
                        });

                        setCityName(city);
                        localStorage.setItem('weatherCity', city);
                    }
                    setLoading(false);
                } catch (error) {
                    console.error("Fehler beim Abrufen des Wetters:", error);
                    setLoading(false);
                }
            };

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        try {
                            const cityResponse = await base44.integrations.Core.InvokeLLM({
                                prompt: `Gib mir die Stadt für diese Koordinaten: Latitude ${latitude}, Longitude ${longitude}. Nur die Stadtnamen als String, nichts anderes.`,
                                response_json_schema: {
                                    type: "object",
                                    properties: {
                                        city: { type: "string" }
                                    }
                                }
                            });
                            fetchWeather(latitude, longitude, cityResponse.city);
                            localStorage.setItem('weatherPostalCode', '');
                        } catch {
                            setLoading(false);
                        }
                    },
                    () => {
                        if (postalCode) {
                            setLoading(true);
                        } else {
                            setLoading(false);
                        }
                    }
                );
            } else if (postalCode) {
                setLoading(true);
            }
            }, []);

    const handleSavePostalCode = () => {
        if (tempPostalCode && tempPostalCode.length === 5) {
            setPostalCode(tempPostalCode);
            localStorage.setItem('weatherPostalCode', tempPostalCode);
            setEditMode(false);
            setLoading(true);
        }
    };

    const getWeatherIcon = (condition) => {
        if (!condition) return Cloud;
        const lower = condition.toLowerCase();
        if (lower.includes("regen") || lower.includes("rain")) return CloudRain;
        if (lower.includes("schnee") || lower.includes("snow")) return CloudSnow;
        if (lower.includes("sonne") || lower.includes("sun") || lower.includes("klar") || lower.includes("clear")) return Sun;
        return Cloud;
    };

    const WeatherIcon = weather ? getWeatherIcon(weather.condition) : Cloud;

    return (
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-4 shadow-lg mb-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-slate-300" />
                        <span className="text-lg font-semibold">
                            {format(currentTime, "EEEE, dd. MMMM yyyy", { locale: de })}
                        </span>
                    </div>
                    <div className="h-6 w-px bg-slate-600" />
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-slate-300" />
                        <span className="text-lg font-semibold">
                            {format(currentTime, "HH:mm:ss")}
                        </span>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="h-6 w-px bg-slate-600" />
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <Cloud className="w-6 h-6 text-slate-300 animate-pulse" />
                            <span className="text-slate-300">Lade...</span>
                        </div>
                    ) : weather ? (
                        <div className="flex items-center gap-3">
                            <WeatherIcon className="w-6 h-6 text-amber-300" />
                            <div>
                                <div className="text-2xl font-bold">{Math.round(weather.temperature)}°C</div>
                                <div className="text-xs text-slate-300">{weather.condition}</div>
                            </div>
                            {editMode ? (
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="text"
                                        value={tempPostalCode}
                                        onChange={(e) => setTempPostalCode(e.target.value)}
                                        placeholder="PLZ"
                                        maxLength={5}
                                        className="w-20 h-7 text-xs bg-slate-700 border-slate-600 text-white"
                                    />
                                    <Button 
                                        size="sm" 
                                        onClick={handleSavePostalCode}
                                        className="h-7 px-2 text-xs bg-slate-600 hover:bg-slate-700"
                                    >
                                        OK
                                    </Button>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => setEditMode(true)}
                                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                                >
                                    <MapPin className="w-3 h-3" />
                                    {cityName}
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="text-sm text-slate-400">Wetter nicht verfügbar</div>
                    )}
                </div>
            </div>
        </Card>
    );
}