import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export default function SubThemeForm({ open, onClose, onSave, subTheme, parentThemeId }) {
    const [formData, setFormData] = useState({
        parent_theme_id: parentThemeId || "",
        name: "",
        description: "",
        status: "geplant",
        progress: 0,
        start_date: "",
        end_date: ""
    });

    useEffect(() => {
        if (subTheme) {
            setFormData({
                parent_theme_id: subTheme.parent_theme_id || parentThemeId,
                name: subTheme.name || "",
                description: subTheme.description || "",
                status: subTheme.status || "geplant",
                progress: subTheme.progress || 0,
                start_date: subTheme.start_date || "",
                end_date: subTheme.end_date || ""
            });
        } else {
            setFormData({
                parent_theme_id: parentThemeId || "",
                name: "",
                description: "",
                status: "geplant",
                progress: 0,
                start_date: "",
                end_date: ""
            });
        }
    }, [subTheme, open, parentThemeId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;
        onSave(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{subTheme?.id ? "Unterthema bearbeiten" : "Neues Unterthema"}</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>Name des Unterthemas *</Label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="z.B. Website, App, Prozesse..."
                            required
                        />
                    </div>

                    <div>
                        <Label>Beschreibung</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Details zum Unterthema..."
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="geplant">Geplant</SelectItem>
                                    <SelectItem value="in_arbeit">In Arbeit</SelectItem>
                                    <SelectItem value="pausiert">Pausiert</SelectItem>
                                    <SelectItem value="abgeschlossen">Abgeschlossen</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Fortschritt: {formData.progress}%</Label>
                            <Slider
                                value={[formData.progress]}
                                onValueChange={(value) => setFormData({ ...formData, progress: value[0] })}
                                max={100}
                                step={5}
                                className="mt-2"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Startdatum</Label>
                            <Input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            />
                        </div>

                        <div>
                            <Label>Enddatum</Label>
                            <Input
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Abbrechen
                        </Button>
                        <Button type="submit" className="bg-slate-800 hover:bg-slate-900">
                            {subTheme?.id ? "Speichern" : "Erstellen"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}