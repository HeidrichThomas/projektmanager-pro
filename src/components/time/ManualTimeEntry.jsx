import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Save, X, Clock } from "lucide-react";

export default function ManualTimeEntry({ open, onClose, onSave, projectId }) {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().slice(0, 10),
        start_time: "",
        end_time: "",
        duration_minutes: "",
        description: ""
    });

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
        
        setFormData({
            date: new Date().toISOString().slice(0, 10),
            start_time: "",
            end_time: "",
            duration_minutes: "",
            description: ""
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-slate-600" />
                        Arbeitszeit manuell nachtragen
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
                        <Label>Oder direkt Dauer in Minuten *</Label>
                        <Input
                            type="number"
                            value={formData.duration_minutes}
                            onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})}
                            placeholder="z.B. 120 für 2 Stunden"
                            className="mt-1.5"
                            required={!formData.start_time || !formData.end_time}
                        />
                    </div>
                    
                    <div>
                        <Label>Beschreibung</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="Was wurde gemacht?"
                            className="mt-1.5"
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