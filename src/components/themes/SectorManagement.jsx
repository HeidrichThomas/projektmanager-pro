import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Users, Briefcase } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import SectorContactDialog from "./SectorContactDialog";

const colorOptions = [
    { value: "blue", label: "Blau", class: "bg-blue-100 text-blue-700 border-blue-200" },
    { value: "green", label: "Grün", class: "bg-green-100 text-green-700 border-green-200" },
    { value: "purple", label: "Lila", class: "bg-purple-100 text-purple-700 border-purple-200" },
    { value: "orange", label: "Orange", class: "bg-orange-100 text-orange-700 border-orange-200" },
    { value: "pink", label: "Pink", class: "bg-pink-100 text-pink-700 border-pink-200" },
    { value: "indigo", label: "Indigo", class: "bg-indigo-100 text-indigo-700 border-indigo-200" }
];

export default function SectorManagement({ open, onClose }) {
    const [showSectorForm, setShowSectorForm] = useState(false);
    const [editingSector, setEditingSector] = useState(null);
    const [showContactDialog, setShowContactDialog] = useState(false);
    const [selectedSector, setSelectedSector] = useState(null);
    const [formData, setFormData] = useState({ name: "", description: "", color: "blue" });

    const queryClient = useQueryClient();

    const { data: sectors = [] } = useQuery({
        queryKey: ['sectors'],
        queryFn: () => base44.entities.Sector.list()
    });

    const { data: contacts = [] } = useQuery({
        queryKey: ['sectorContacts'],
        queryFn: () => base44.entities.SectorContact.list()
    });

    const createSectorMutation = useMutation({
        mutationFn: (data) => base44.entities.Sector.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sectors'] });
            setShowSectorForm(false);
            setFormData({ name: "", description: "", color: "blue" });
            toast.success("Sparte erfolgreich angelegt");
        }
    });

    const updateSectorMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.Sector.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sectors'] });
            setShowSectorForm(false);
            setEditingSector(null);
            toast.success("Sparte aktualisiert");
        }
    });

    const deleteSectorMutation = useMutation({
        mutationFn: (id) => base44.entities.Sector.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sectors'] });
            toast.success("Sparte gelöscht");
        }
    });

    const handleEdit = (sector) => {
        setEditingSector(sector);
        setFormData(sector);
        setShowSectorForm(true);
    };

    const handleSave = () => {
        if (editingSector) {
            updateSectorMutation.mutate({ id: editingSector.id, data: formData });
        } else {
            createSectorMutation.mutate(formData);
        }
    };

    const handleManageContacts = (sector) => {
        setSelectedSector(sector);
        setShowContactDialog(true);
    };

    const getSectorContacts = (sectorId) => contacts.filter(c => c.sector_id === sectorId);

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-slate-600" />
                            Sparten verwalten
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        <Button onClick={() => { setEditingSector(null); setFormData({ name: "", description: "", color: "blue" }); setShowSectorForm(true); }} className="w-full">
                            <Plus className="w-4 h-4 mr-2" />
                            Neue Sparte anlegen
                        </Button>

                        {showSectorForm && (
                            <Card className="border-2 border-slate-200">
                                <CardContent className="p-4 space-y-4">
                                    <div>
                                        <Label>Name der Sparte *</Label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            placeholder="z.B. Öffentliche Einrichtung"
                                            className="mt-1.5"
                                        />
                                    </div>

                                    <div>
                                        <Label>Beschreibung</Label>
                                        <Textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            placeholder="Beschreibung der Sparte..."
                                            className="mt-1.5"
                                        />
                                    </div>

                                    <div>
                                        <Label>Farbe</Label>
                                        <div className="flex gap-2 mt-2">
                                            {colorOptions.map(color => (
                                                <button
                                                    key={color.value}
                                                    type="button"
                                                    onClick={() => setFormData({...formData, color: color.value})}
                                                    className={`w-12 h-12 rounded-lg border-2 transition-all ${
                                                        formData.color === color.value ? 'border-slate-900 scale-110' : 'border-slate-200'
                                                    } ${color.class.split(' ')[0]}`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button onClick={handleSave} className="flex-1">
                                            Speichern
                                        </Button>
                                        <Button variant="outline" onClick={() => setShowSectorForm(false)} className="flex-1">
                                            Abbrechen
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {sectors.length > 0 ? (
                            <div className="space-y-3">
                                {sectors.map((sector) => {
                                    const colorClass = colorOptions.find(c => c.value === sector.color)?.class || colorOptions[0].class;
                                    const sectorContacts = getSectorContacts(sector.id);
                                    
                                    return (
                                        <Card key={sector.id} className="group hover:shadow-md transition-all">
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <Badge className={`${colorClass} border`}>
                                                                {sector.name}
                                                            </Badge>
                                                            {sectorContacts.length > 0 && (
                                                                <Badge variant="outline" className="flex items-center gap-1">
                                                                    <Users className="w-3 h-3" />
                                                                    {sectorContacts.length} {sectorContacts.length === 1 ? 'Kontakt' : 'Kontakte'}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {sector.description && (
                                                            <p className="text-sm text-slate-600">{sector.description}</p>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleManageContacts(sector)}
                                                            className="text-slate-600"
                                                        >
                                                            <Users className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleEdit(sector)}
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => {
                                                                if (confirm(`Sparte "${sector.name}" wirklich löschen?`)) {
                                                                    deleteSectorMutation.mutate(sector.id);
                                                                }
                                                            }}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                Noch keine Sparten angelegt
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {selectedSector && (
                <SectorContactDialog
                    open={showContactDialog}
                    onClose={() => {
                        setShowContactDialog(false);
                        setSelectedSector(null);
                    }}
                    sector={selectedSector}
                />
            )}
        </>
    );
}