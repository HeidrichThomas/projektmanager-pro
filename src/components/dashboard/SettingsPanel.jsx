import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings, Save } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPanel() {
    const [settings, setSettings] = useState({
        travelRate2025: 0.30,
        travelRate2026: 0.38,
        defaultStartLocation: "Gartenstraße 17, 89257 Illertissen",
        cutoffDate: "2026-01-01"
    });

    useEffect(() => {
        const saved = localStorage.getItem('app-settings');
        if (saved) {
            try {
                setSettings(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to load settings', e);
            }
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem('app-settings', JSON.stringify(settings));
        toast.success('Einstellungen gespeichert');
    };

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Settings className="w-5 h-5 text-slate-600" />
                    Einstellungen
                </CardTitle>
                <CardDescription>
                    Passen Sie die Kilometer-Pauschalen und andere Einstellungen an
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="rate2025">km-Pauschale bis 2025 (€)</Label>
                        <Input
                            id="rate2025"
                            type="number"
                            step="0.01"
                            value={settings.travelRate2025}
                            onChange={(e) => setSettings({...settings, travelRate2025: parseFloat(e.target.value)})}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="rate2026">km-Pauschale ab 2026 (€)</Label>
                        <Input
                            id="rate2026"
                            type="number"
                            step="0.01"
                            value={settings.travelRate2026}
                            onChange={(e) => setSettings({...settings, travelRate2026: parseFloat(e.target.value)})}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="cutoffDate">Stichtag für neue Pauschale</Label>
                        <Input
                            id="cutoffDate"
                            type="date"
                            value={settings.cutoffDate}
                            onChange={(e) => setSettings({...settings, cutoffDate: e.target.value})}
                        />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="startLocation">Standard-Startort für Fahrten</Label>
                        <Input
                            id="startLocation"
                            type="text"
                            value={settings.defaultStartLocation}
                            onChange={(e) => setSettings({...settings, defaultStartLocation: e.target.value})}
                        />
                    </div>
                </div>

                <div className="pt-4 border-t">
                    <Button onClick={handleSave} className="w-full md:w-auto">
                        <Save className="w-4 h-4 mr-2" />
                        Einstellungen speichern
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}