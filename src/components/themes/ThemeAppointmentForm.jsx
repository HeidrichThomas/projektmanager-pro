import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X, MapPin, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function ThemeAppointmentForm({ open, onClose, onSave, appointment }) {
    const [formData, setFormData] = useState({
        theme_id: "",
        title: "",
        description: "",
        start_date: new Date().toISOString().slice(0, 16),
        end_date: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
        location: "",
        participants: [],
        reminder: false
    });

    const { data: themes = [] } = useQuery({
        queryKey: ['themes'],
        queryFn: () => base44.entities.Theme.list(),
        enabled: open
    });

    useEffect(() => {
        if (appointment) {
            setFormData({
                ...appointment,
                start_date: appointment.start_date?.slice(0, 16) || "",
                end_date: appointment.end_date?.slice(0, 16) || ""
            });
        } else if (open) {
            setFormData({
                theme_id: "",
                title: "",
                description: "",
                start_date: new Date().toISOString().slice(0, 16),
                end_date: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
                location: "",
                participants: [],
                reminder: false
            });
        }
    }, [appointment, open]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {appointment ? "Termin bearbeiten" : "Neuer Termin"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div>
                        <Label>Thema *</Label>
                        <Select
                            value={formData.theme_id}
                            onValueChange={(value) => setFormData({...formData, theme_id: value})}
                            required
                        >
                            <SelectTrigger className="mt-1.5">
                                <SelectValue placeholder="Thema auswählen" />
                            </SelectTrigger>
                            <SelectContent>
                                {themes.map((theme) => (
                                    <SelectItem key={theme.id} value={theme.id}>
                                        {theme.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Titel *</Label>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            placeholder="z.B. Kundenbesprechung"
                            className="mt-1.5"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Startdatum & -uhrzeit *</Label>
                            <Input
                                type="datetime-local"
                                value={formData.start_date}
                                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                                className="mt-1.5"
                                required
                            />
                        </div>
                        <div>
                            <Label>Enddatum & -uhrzeit</Label>
                            <Input
                                type="datetime-local"
                                value={formData.end_date}
                                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                                className="mt-1.5"
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Ort</Label>
                        <div className="relative mt-1.5">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                placeholder="z.B. Konferenzraum A"
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Beschreibung</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="Details zum Termin..."
                            className="mt-1.5 h-24"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>
                            <X className="w-4 h-4 mr-2" />
                            Abbrechen
                        </Button>
                        <Button type="submit" className="bg-slate-800 hover:bg-slate-900">
                            <Save className="w-4 h-4 mr-2" />
                            Speichern
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}