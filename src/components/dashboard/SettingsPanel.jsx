import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings, Save, Sun, Moon } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SettingsPanel({ open, onClose }) {
    const [settings, setSettings] = useState({
        travelRate2025: 0.30,
        travelRate2026: 0.38,
        defaultStartLocation: "Gartenstraße 17, 89257 Illertissen",
        cutoffDate: "2026-01-01",
        theme: "light"
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
        
        // Apply theme
        if (settings.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        
        toast.success('Einstellungen gespeichert');
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-slate-600" />
                        Einstellungen
                    </DialogTitle>
                    <DialogDescription>
                        Passen Sie die Kilometer-Pauschalen und andere Einstellungen an
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="theme">Darstellungsmodus</Label>
                        <Select
                            value={settings.theme}
                            onValueChange={(value) => setSettings({...settings, theme: value})}
                        >
                            <SelectTrigger id="theme">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">
                                    <div className="flex items-center gap-2">
                                        <Sun className="w-4 h-4" />
                                        Heller Modus
                                    </div>
                                </SelectItem>
                                <SelectItem value="dark">
                                    <div className="flex items-center gap-2">
                                        <Moon className="w-4 h-4" />
                                        Dunkler Modus
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
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

                    <div className="pt-4 border-t flex justify-end gap-3">
                        <Button variant="outline" onClick={onClose}>
                            Abbrechen
                        </Button>
                        <Button onClick={handleSave}>
                            <Save className="w-4 h-4 mr-2" />
                            Einstellungen speichern
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}