import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";

export default function ManualTravelEntryForm({ open, onOpenChange, onSave, entry = null }) {
    const [formData, setFormData] = useState({
        date: format(new Date(), "yyyy-MM-dd"),
        title: "",
        start_location: "Gartenstraße 17, 89257 Illertissen",
        destination: "",
        distance_km: "",
        project_id: "",
        customer_id: "",
        notes: ""
    });
    const [calculatingDistance, setCalculatingDistance] = useState(false);

    React.useEffect(() => {
        if (entry) {
            setFormData({
                date: entry.date || format(new Date(), "yyyy-MM-dd"),
                title: entry.title || "",
                start_location: entry.start_location || "Gartenstraße 17, 89257 Illertissen",
                destination: entry.destination || "",
                distance_km: entry.distance_km || "",
                project_id: entry.project_id || "",
                customer_id: entry.customer_id || "",
                notes: entry.notes || ""
            });
        } else {
            setFormData({
                date: format(new Date(), "yyyy-MM-dd"),
                title: "",
                start_location: "Gartenstraße 17, 89257 Illertissen",
                destination: "",
                distance_km: "",
                project_id: "",
                customer_id: "",
                notes: ""
            });
        }
    }, [entry, open]);

    const { data: projects = [] } = useQuery({
        queryKey: ['projects'],
        queryFn: () => base44.entities.Project.list()
    });

    const { data: customers = [] } = useQuery({
        queryKey: ['customers'],
        queryFn: () => base44.entities.Customer.list()
    });

    const handleCalculateDistance = async () => {
        if (!formData.start_location || !formData.destination) {
            alert("Bitte Start- und Zielort eingeben");
            return;
        }

        setCalculatingDistance(true);
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Berechne die einfache Wegstrecke in Kilometern von "${formData.start_location}" nach "${formData.destination}". 
                Gib NUR die Gesamtstrecke für Hin- UND Rückfahrt (also 2x die einfache Strecke) als Zahl zurück.`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        total_distance_km: { type: "number" }
                    }
                }
            });

            if (response.total_distance_km) {
                setFormData({ ...formData, distance_km: response.total_distance_km.toFixed(1) });
            }
        } catch (error) {
            alert("Fehler bei der Berechnung der Entfernung");
        } finally {
            setCalculatingDistance(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title || !formData.distance_km) return;
        
        const dataToSave = {
            ...formData,
            distance_km: parseFloat(formData.distance_km)
        };
        
        if (entry) {
            onSave(entry.id, dataToSave);
        } else {
            onSave(dataToSave);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{entry ? "Fahrt bearbeiten" : "Manuelle Fahrt eintragen"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>Datum *</Label>
                        <Input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <Label>Zweck/Aktivität *</Label>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="z.B. Kundenbesuch, Meeting, Materialeinkauf"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Startort</Label>
                            <Input
                                value={formData.start_location}
                                onChange={(e) => setFormData({ ...formData, start_location: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Zielort</Label>
                            <Input
                                value={formData.destination}
                                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                placeholder="Zieladresse"
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Kilometer (Hin- und Rückfahrt) *</Label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                step="0.1"
                                value={formData.distance_km}
                                onChange={(e) => setFormData({ ...formData, distance_km: e.target.value })}
                                placeholder="z.B. 45.5"
                                required
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCalculateDistance}
                                disabled={calculatingDistance || !formData.start_location || !formData.destination}
                            >
                                {calculatingDistance ? "Berechne..." : "Berechnen"}
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Projekt (optional)</Label>
                            <Select
                                value={formData.project_id}
                                onValueChange={(value) => setFormData({ ...formData, project_id: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Projekt wählen" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={null}>Kein Projekt</SelectItem>
                                    {projects.map(project => (
                                        <SelectItem key={project.id} value={project.id}>
                                            {project.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Kunde (optional)</Label>
                            <Select
                                value={formData.customer_id}
                                onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Kunde wählen" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={null}>Kein Kunde</SelectItem>
                                    {customers.map(customer => (
                                        <SelectItem key={customer.id} value={customer.id}>
                                            {customer.company}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label>Notizen</Label>
                        <Textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Zusätzliche Informationen..."
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Abbrechen
                        </Button>
                        <Button type="submit">
                            {entry ? "Änderungen speichern" : "Fahrt speichern"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}