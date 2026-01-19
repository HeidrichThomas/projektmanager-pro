import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PrivateActivityForm({ activity, onSave, onClose }) {
    const [formData, setFormData] = useState({
        type: activity?.type || "notiz",
        title: activity?.title || "",
        content: activity?.content || "",
        activity_date: activity?.activity_date || new Date().toISOString().slice(0, 16),
        amount: activity?.amount || ""
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{activity ? "Aktivität bearbeiten" : "Neue Aktivität"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>Typ</Label>
                        <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="notiz">Notiz</SelectItem>
                                <SelectItem value="termin">Termin</SelectItem>
                                <SelectItem value="erinnerung">Erinnerung</SelectItem>
                                <SelectItem value="ausgabe">Ausgabe</SelectItem>
                                <SelectItem value="einnahme">Einnahme</SelectItem>
                                <SelectItem value="dokument">Dokument</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Titel</Label>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <Label>Datum & Uhrzeit</Label>
                        <Input
                            type="datetime-local"
                            value={formData.activity_date}
                            onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
                        />
                    </div>

                    {(formData.type === "ausgabe" || formData.type === "einnahme") && (
                        <div>
                            <Label>Betrag (€)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                            />
                        </div>
                    )}

                    <div>
                        <Label>Beschreibung</Label>
                        <Textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            rows={4}
                        />
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