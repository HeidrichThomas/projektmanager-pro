import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Navigation, MapPin, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function RouteSelector({ open, onClose, startLocation, destination, onSelectRoute }) {
    const [routes, setRoutes] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mapUrl, setMapUrl] = useState("");

    useEffect(() => {
        if (open && startLocation && destination) {
            calculateRoutes();
        }
    }, [open, startLocation, destination]);

    const calculateRoutes = async () => {
        setLoading(true);
        try {
            const result = await base44.integrations.Core.InvokeLLM({
                prompt: `Du bist ein Experte für Routenplanung in Deutschland.

Berechne 3 verschiedene Routen zwischen diesen Adressen:

Start: ${startLocation}
Ziel: ${destination}

WICHTIG:
1. Nutze aktuelle Google Maps Daten
2. Liefere 3 realistische Routenoptionen (schnellste, kürzeste, alternative)
3. Gib EINFACHE Strecke an (nur Hinfahrt, Rückfahrt wird verdoppelt)
4. Gib realistische Fahrzeiten an
5. Beschreibe die Hauptstraßen/Autobahnen jeder Route

Beispiel für jede Route:
- Distanz: nur Hinfahrt in km
- Fahrzeit: nur Hinfahrt in Minuten
- Beschreibung: Hauptstraßen/Autobahnen`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        routes: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string", description: "z.B. Schnellste Route, Kürzeste Route" },
                                    distance_km: { type: "number", description: "Einfache Strecke in km" },
                                    duration_minutes: { type: "number", description: "Einfache Fahrzeit in Minuten" },
                                    description: { type: "string", description: "Routenbeschreibung mit Hauptstraßen" }
                                },
                                required: ["name", "distance_km", "duration_minutes", "description"]
                            }
                        },
                        map_note: { type: "string", description: "Hinweis zur Route" }
                    },
                    required: ["routes"]
                }
            });

            if (result && result.routes) {
                setRoutes(result.routes);
                if (result.routes.length > 0) {
                    setSelectedRoute(0);
                }
                
                // Generate static map URL (using Google Static Maps concept)
                const startEncoded = encodeURIComponent(startLocation);
                const destEncoded = encodeURIComponent(destination);
                setMapUrl(`https://maps.googleapis.com/maps/api/staticmap?size=600x400&markers=color:green|label:A|${startEncoded}&markers=color:red|label:B|${destEncoded}&path=color:0x0000ff|weight:5&key=PLACEHOLDER`);
            }
        } catch (error) {
            console.error("Fehler beim Berechnen der Routen:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectRoute = () => {
        if (selectedRoute !== null && routes[selectedRoute]) {
            const route = routes[selectedRoute];
            const totalDistance = route.distance_km * 2; // Hin und zurück
            onSelectRoute({
                distance_km: totalDistance,
                route_description: route.description,
                duration_minutes: route.duration_minutes * 2
            });
            onClose();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Navigation className="w-5 h-5 text-blue-600" />
                        Route auswählen
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                        <p className="text-slate-600">Berechne Routen...</p>
                    </div>
                ) : (
                    <div className="space-y-6 mt-4">
                        {/* Route Info */}
                        <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                            <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-green-600 mt-1" />
                                <div className="flex-1">
                                    <div className="text-xs text-slate-500">Start</div>
                                    <div className="text-sm font-medium text-slate-900">{startLocation}</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-red-600 mt-1" />
                                <div className="flex-1">
                                    <div className="text-xs text-slate-500">Ziel</div>
                                    <div className="text-sm font-medium text-slate-900">{destination}</div>
                                </div>
                            </div>
                        </div>

                        {/* Map Placeholder */}
                        <div className="bg-slate-100 rounded-lg p-8 text-center border-2 border-dashed border-slate-300">
                            <Navigation className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                            <p className="text-sm text-slate-600">
                                Kartenvorschau mit Google Maps
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                Für die Visualisierung öffnen Sie <a 
                                    href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(startLocation)}&destination=${encodeURIComponent(destination)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    Google Maps
                                </a>
                            </p>
                        </div>

                        {/* Route Options */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-slate-900">Verfügbare Routen:</h3>
                            {routes.map((route, index) => (
                                <Card
                                    key={index}
                                    className={`p-4 cursor-pointer transition-all ${
                                        selectedRoute === index
                                            ? 'border-2 border-blue-600 bg-blue-50'
                                            : 'border border-slate-200 hover:border-blue-300'
                                    }`}
                                    onClick={() => setSelectedRoute(index)}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                                                selectedRoute === index ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                                            }`}>
                                                {index + 1}
                                            </div>
                                            <h4 className="font-semibold text-slate-900">{route.name}</h4>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-blue-600">
                                                {(route.distance_km * 2).toFixed(1)} km
                                            </div>
                                            <div className="text-xs text-slate-500">Hin & Zurück</div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Navigation className="w-4 h-4" />
                                            <span>Einfache Strecke: {route.distance_km.toFixed(1)} km</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Clock className="w-4 h-4" />
                                            <span>Ca. {route.duration_minutes} Min. einfach ({route.duration_minutes * 2} Min. gesamt)</span>
                                        </div>
                                        <div className="text-slate-600 mt-2">
                                            {route.description}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {routes.length === 0 && !loading && (
                            <div className="text-center py-8 text-slate-500">
                                <Navigation className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                <p>Keine Routen gefunden</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button variant="outline" onClick={onClose}>
                                Abbrechen
                            </Button>
                            <Button 
                                onClick={handleSelectRoute}
                                disabled={selectedRoute === null || routes.length === 0}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Navigation className="w-4 h-4 mr-2" />
                                Route übernehmen
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}