import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Cloud, CloudRain, Sun, CloudSnow, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { base44 } from "@/api/base44Client";

export default function DateTimeWeather() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const response = await base44.integrations.Core.InvokeLLM({
                    prompt: "Gib mir das aktuelle Wetter für Illertissen, Deutschland (PLZ 89257). Ich brauche nur die Temperatur in Celsius und eine kurze Wetterbeschreibung (z.B. sonnig, bewölkt, regnerisch, etc.).",
                    add_context_from_internet: true,
                    response_json_schema: {
                        type: "object",
                        properties: {
                            temperature: { type: "number" },
                            condition: { type: "string" }
                        }
                    }
                });
                setWeather(response);
                setLoading(false);
            } catch (error) {
                console.error("Fehler beim Abrufen des Wetters:", error);
                setLoading(false);
            }
        };

        fetchWeather();
        const weatherInterval = setInterval(fetchWeather, 30 * 60 * 1000); // Alle 30 Minuten

        return () => clearInterval(weatherInterval);
    }, []);

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
                            <div className="text-xs text-slate-400">Illertissen</div>
                        </div>
                    ) : (
                        <div className="text-sm text-slate-400">Wetter nicht verfügbar</div>
                    )}
                </div>
            </div>
        </Card>
    );
}