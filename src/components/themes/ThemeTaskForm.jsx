import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ThemeTaskForm({ open, onClose, onSave, task }) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        column: "todo",
        priority: "medium",
        due_date: ""
    });

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title || "",
                description: task.description || "",
                column: task.column || "todo",
                priority: task.priority || "medium",
                due_date: task.due_date || ""
            });
        } else {
            setFormData({
                title: "",
                description: "",
                column: "todo",
                priority: "medium",
                due_date: ""
            });
        }
    }, [task, open]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title.trim()) return;
        onSave(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{task?.id ? "Kachel bearbeiten" : "Neue Kachel"}</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>Titel *</Label>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="z.B. Angebot erstellen"
                            required
                        />
                    </div>

                    <div>
                        <Label>Beschreibung</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Details zur Aufgabe..."
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Spalte</Label>
                            <Select
                                value={formData.column}
                                onValueChange={(value) => setFormData({ ...formData, column: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todo">Zu erledigen</SelectItem>
                                    <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                                    <SelectItem value="review">Überprüfung</SelectItem>
                                    <SelectItem value="done">Erledigt</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Priorität</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(value) => setFormData({ ...formData, priority: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Niedrig</SelectItem>
                                    <SelectItem value="medium">Mittel</SelectItem>
                                    <SelectItem value="high">Hoch</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label>Fälligkeitsdatum</Label>
                        <Input
                            type="date"
                            value={formData.due_date}
                            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Abbrechen
                        </Button>
                        <Button type="submit" className="bg-slate-800 hover:bg-slate-900">
                            {task?.id ? "Speichern" : "Erstellen"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}