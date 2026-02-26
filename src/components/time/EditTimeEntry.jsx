import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Save, X, Clock } from "lucide-react";

export default function EditTimeEntry({ open, onClose, onSave, entry }) {
    const [formData, setFormData] = useState({
        date: "",
        start_time: "",
        end_time: "",
        duration_minutes: "",
        description: "",
        hourly_rate: "",
        amount: ""
    });

    useEffect(() => {
        if (entry) {
            setFormData({
                date: entry.date || "",
                start_time: entry.start_time || "",
                end_time: entry.end_time || "",
                duration_minutes: entry.duration_minutes || "",
                description: entry.description || "",
                hourly_rate: entry.hourly_rate || "",
                amount: entry.amount || ""
            });
        }
    }, [entry, open]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        let duration = formData.duration_minutes;
        if (formData.start_time && formData.end_time) {
            const start = new Date(`2000-01-01T${formData.start_time}`);
            const end = new Date(`2000-01-01T${formData.end_time}`);
            duration = Math.round((end - start) / 60000);
        }
        
        onSave({
            ...formData,
            duration_minutes: parseInt(duration)
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-slate-600" />
                        Arbeitszeit bearbeiten
                    </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div>
                        <Label>Datum *</Label>
                        <Input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({...formData, date: e.target.value})}
                            className="mt-1.5"
                            required
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Startzeit</Label>
                            <Input
                                type="time"
                                value={formData.start_time}
                                onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                                className="mt-1.5"
                            />
                        </div>
                        <div>
                            <Label>Endzeit</Label>
                            <Input
                                type="time"
                                value={formData.end_time}
                                onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                                className="mt-1.5"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <Label>Dauer in Minuten *</Label>
                        <Input
                            type="number"
                            value={formData.duration_minutes}
                            onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})}
                            className="mt-1.5"
                            required
                        />
                    </div>
                    
                    <div>
                        <Label>Beschreibung</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="mt-1.5"
                        />
                    </div>
                    
                    {entry?.is_billed && (
                        <>
                            <div>
                                <Label>Stundensatz (EUR)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.hourly_rate}
                                    onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
                                    className="mt-1.5"
                                />
                            </div>
                            <div>
                                <Label>Betrag (EUR)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                    className="mt-1.5"
                                />
                            </div>
                        </>
                    )}
                    
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