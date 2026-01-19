import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function PrivateAppointmentForm({ appointment, onSave, onClose }) {
    const [formData, setFormData] = useState({
        title: appointment?.title || "",
        description: appointment?.description || "",
        start_date: appointment?.start_date || new Date().toISOString().slice(0, 16),
        end_date: appointment?.end_date || "",
        location: appointment?.location || "",
        reminder: appointment?.reminder || false
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{appointment ? "Termin bearbeiten" : "Neuer Termin"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>Titel</Label>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="z.B. Zahnarzttermin"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Startdatum & Uhrzeit</Label>
                            <Input
                                type="datetime-local"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label>Enddatum & Uhrzeit (optional)</Label>
                            <Input
                                type="datetime-local"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Ort (optional)</Label>
                        <Input
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="z.B. Dr. Müller, Hauptstraße 1"
                        />
                    </div>

                    <div>
                        <Label>Beschreibung</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            placeholder="Zusätzliche Informationen..."
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            checked={formData.reminder}
                            onCheckedChange={(checked) => setFormData({ ...formData, reminder: checked })}
                        />
                        <Label>Erinnerung aktivieren</Label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Abbrechen
                        </Button>
                        <Button type="submit">Speichern</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}