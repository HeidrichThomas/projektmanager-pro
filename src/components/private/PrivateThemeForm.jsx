import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Home, DollarSign, Users, Plane, GraduationCap, Package } from "lucide-react";

const categoryConfig = {
    familie_freunde: { label: "Familie / Freunde", icon: Users },
    gesundheit: { label: "Gesundheit", icon: Heart },
    finanzen: { label: "Finanzen", icon: DollarSign },
    haushalt: { label: "Haushalt", icon: Home },
    hobby: { label: "Hobby", icon: Package },
    urlaub: { label: "Urlaub", icon: Plane },
    bildung: { label: "Bildung", icon: GraduationCap },
    sonstiges: { label: "Sonstiges", icon: Package }
};

export default function PrivateThemeForm({ theme, onSave, onClose }) {
    const [formData, setFormData] = useState({
        name: theme?.name || "",
        category: theme?.category || "sonstiges",
        description: theme?.description || "",
        color: theme?.color || "slate"
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{theme ? "Thema bearbeiten" : "Neues privates Thema"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>Name</Label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="z.B. Familienurlaub 2026"
                            required
                        />
                    </div>

                    <div>
                        <Label>Kategorie</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(categoryConfig).map(([key, config]) => {
                                    const Icon = config.icon;
                                    return (
                                        <SelectItem key={key} value={key}>
                                            <div className="flex items-center gap-2">
                                                <Icon className="w-4 h-4" />
                                                {config.label}
                                            </div>
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Beschreibung</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Optionale Beschreibung..."
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Abbrechen
                        </Button>
                        <Button type="submit">
                            {theme ? "Speichern" : "Erstellen"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}