import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckSquare, Save, X } from "lucide-react";

export default function TaskForm({ open, onClose, onSave, task, projectId }) {
    const [formData, setFormData] = useState({
        project_id: projectId,
        title: "",
        description: "",
        status: "offen",
        priority: "mittel",
        due_date: "",
        reminder_date: "",
        worked_hours: 0,
        work_log: []
    });

    useEffect(() => {
        if (task) {
            setFormData({
                ...task,
                reminder_date: task.reminder_date ? task.reminder_date.slice(0, 16) : ""
            });
        } else {
            setFormData({
                project_id: projectId,
                title: "",
                description: "",
                status: "offen",
                priority: "mittel",
                due_date: "",
                reminder_date: "",
                worked_hours: 0,
                work_log: []
            });
        }
    }, [task, projectId, open]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <CheckSquare className="w-5 h-5 text-slate-600" />
                        {task ? "Aufgabe bearbeiten" : "Neue Aufgabe"}
                    </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                    <div>
                        <Label className="text-slate-700 font-medium">Titel *</Label>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            placeholder="Was muss erledigt werden?"
                            className="mt-1.5"
                            required
                        />
                    </div>
                    
                    <div>
                        <Label className="text-slate-700 font-medium">Beschreibung</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="Weitere Details..."
                            className="mt-1.5"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-slate-700 font-medium">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData({...formData, status: value})}
                            >
                                <SelectTrigger className="mt-1.5">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="offen">Offen</SelectItem>
                                    <SelectItem value="in_arbeit">In Arbeit</SelectItem>
                                    <SelectItem value="erledigt">Erledigt</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div>
                            <Label className="text-slate-700 font-medium">Priorität</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(value) => setFormData({...formData, priority: value})}
                            >
                                <SelectTrigger className="mt-1.5">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="niedrig">Niedrig</SelectItem>
                                    <SelectItem value="mittel">Mittel</SelectItem>
                                    <SelectItem value="hoch">Hoch</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-slate-700 font-medium">Fällig am</Label>
                            <Input
                                type="date"
                                value={formData.due_date}
                                onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                                className="mt-1.5"
                            />
                        </div>
                        
                        <div>
                            <Label className="text-slate-700 font-medium">Erinnerung</Label>
                            <Input
                                type="datetime-local"
                                value={formData.reminder_date}
                                onChange={(e) => setFormData({...formData, reminder_date: e.target.value})}
                                className="mt-1.5"
                            />
                        </div>
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