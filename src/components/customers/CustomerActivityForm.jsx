import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, MapPin, Users, Mail, StickyNote, FileText, MessageSquare } from "lucide-react";

const typeOptions = [
    { value: "telefonat", label: "Telefonat", icon: Phone },
    { value: "besuch", label: "Besuch", icon: MapPin },
    { value: "meeting", label: "Meeting", icon: Users },
    { value: "email", label: "E-Mail", icon: Mail },
    { value: "notiz", label: "Notiz", icon: StickyNote },
    { value: "memo", label: "Memo", icon: MessageSquare },
    { value: "dokument", label: "Dokument", icon: FileText },
];

const defaultForm = {
    type: "notiz",
    title: "",
    content: "",
    contact_person: "",
    activity_date: new Date().toISOString().slice(0, 16),
    appointment_date: "",
};

export default function CustomerActivityForm({ open, onClose, onSave, activity, customer }) {
    const [form, setForm] = useState(defaultForm);

    useEffect(() => {
        if (open) {
            if (activity) {
                setForm({
                    type: activity.type || "notiz",
                    title: activity.title || "",
                    content: activity.content || "",
                    contact_person: activity.contact_person || "",
                    activity_date: activity.activity_date ? activity.activity_date.slice(0, 16) : new Date().toISOString().slice(0, 16),
                    appointment_date: activity.appointment_date ? activity.appointment_date.slice(0, 16) : "",
                });
            } else {
                setForm(defaultForm);
            }
        }
    }, [open, activity]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...form,
            activity_date: form.activity_date ? new Date(form.activity_date).toISOString() : new Date().toISOString(),
            appointment_date: form.appointment_date ? new Date(form.appointment_date).toISOString() : null,
        });
    };

    const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {activity ? "Aktivität bearbeiten" : "Neue Aktivität"} – {customer?.company}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <div>
                        <Label>Art der Aktivität</Label>
                        <Select value={form.type} onValueChange={v => set("type", v)}>
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {typeOptions.map(o => (
                                    <SelectItem key={o.value} value={o.value}>
                                        <div className="flex items-center gap-2">
                                            <o.icon className="w-4 h-4" />
                                            {o.label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Titel / Betreff *</Label>
                        <Input
                            className="mt-1"
                            value={form.title}
                            onChange={e => set("title", e.target.value)}
                            placeholder="Kurze Beschreibung..."
                            required
                        />
                    </div>

                    <div>
                        <Label>Inhalt / Notiz</Label>
                        <Textarea
                            className="mt-1 min-h-[100px]"
                            value={form.content}
                            onChange={e => set("content", e.target.value)}
                            placeholder="Details, Gesprächsnotizen..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label>Ansprechpartner</Label>
                            <Input
                                className="mt-1"
                                value={form.contact_person}
                                onChange={e => set("contact_person", e.target.value)}
                                placeholder="Name..."
                            />
                        </div>
                        <div>
                            <Label>Datum & Uhrzeit</Label>
                            <Input
                                className="mt-1"
                                type="datetime-local"
                                value={form.activity_date}
                                onChange={e => set("activity_date", e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Folgetermin (optional)</Label>
                        <Input
                            className="mt-1"
                            type="datetime-local"
                            value={form.appointment_date}
                            onChange={e => set("appointment_date", e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>Abbrechen</Button>
                        <Button type="submit" className="bg-slate-800 hover:bg-slate-900">
                            {activity ? "Speichern" : "Anlegen"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}