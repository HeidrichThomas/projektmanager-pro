import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, User, Mail, Phone, Smartphone, Briefcase } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function SectorContactDialog({ open, onClose, sector }) {
    const [showForm, setShowForm] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        company: "",
        position: "",
        email: "",
        phone: "",
        mobile_phone: "",
        notes: ""
    });

    const queryClient = useQueryClient();

    const { data: contacts = [] } = useQuery({
        queryKey: ['sectorContacts', sector?.id],
        queryFn: () => base44.entities.SectorContact.filter({ sector_id: sector.id }),
        enabled: !!sector?.id
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.SectorContact.create({ ...data, sector_id: sector.id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sectorContacts'] });
            setShowForm(false);
            setFormData({ name: "", company: "", position: "", email: "", phone: "", mobile_phone: "", notes: "" });
            toast.success("Kontakt erfolgreich angelegt");
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.SectorContact.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sectorContacts'] });
            setShowForm(false);
            setEditingContact(null);
            toast.success("Kontakt aktualisiert");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.SectorContact.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sectorContacts'] });
            toast.success("Kontakt gelöscht");
        }
    });

    const handleEdit = (contact) => {
        setEditingContact(contact);
        setFormData(contact);
        setShowForm(true);
    };

    const handleSave = () => {
        if (editingContact) {
            updateMutation.mutate({ id: editingContact.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-slate-600" />
                        Kontakte verwalten: {sector?.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    <Button onClick={() => { setEditingContact(null); setFormData({ name: "", company: "", position: "", email: "", phone: "", mobile_phone: "", notes: "" }); setShowForm(true); }} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Neuen Kontakt anlegen
                    </Button>

                    {showForm && (
                        <Card className="border-2 border-slate-200">
                            <CardContent className="p-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Name *</Label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            placeholder="Max Mustermann"
                                            className="mt-1.5"
                                        />
                                    </div>
                                    <div>
                                        <Label>Firma</Label>
                                        <Input
                                            value={formData.company}
                                            onChange={(e) => setFormData({...formData, company: e.target.value})}
                                            placeholder="Firma GmbH"
                                            className="mt-1.5"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>Position</Label>
                                    <Input
                                        value={formData.position}
                                        onChange={(e) => setFormData({...formData, position: e.target.value})}
                                        placeholder="Geschäftsführer"
                                        className="mt-1.5"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>E-Mail</Label>
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            placeholder="email@firma.de"
                                            className="mt-1.5"
                                        />
                                    </div>
                                    <div>
                                        <Label>Telefon</Label>
                                        <Input
                                            value={formData.phone}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            placeholder="+49 123 456789"
                                            className="mt-1.5"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>Mobil</Label>
                                    <Input
                                        value={formData.mobile_phone}
                                        onChange={(e) => setFormData({...formData, mobile_phone: e.target.value})}
                                        placeholder="+49 170 1234567"
                                        className="mt-1.5"
                                    />
                                </div>

                                <div>
                                    <Label>Notizen</Label>
                                    <Textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                        placeholder="Zusätzliche Informationen..."
                                        className="mt-1.5"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button onClick={handleSave} className="flex-1">
                                        Speichern
                                    </Button>
                                    <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                                        Abbrechen
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {contacts.length > 0 ? (
                        <div className="space-y-3">
                            {contacts.map((contact) => (
                                <Card key={contact.id} className="group hover:shadow-md transition-all">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <User className="w-4 h-4 text-slate-400" />
                                                    <h3 className="font-semibold text-slate-900">{contact.name}</h3>
                                                </div>
                                                
                                                <div className="space-y-1 text-sm text-slate-600">
                                                    {contact.company && (
                                                        <div className="flex items-center gap-2">
                                                            <Briefcase className="w-3 h-3 text-slate-400" />
                                                            <span>{contact.company}</span>
                                                            {contact.position && <span className="text-slate-400">• {contact.position}</span>}
                                                        </div>
                                                    )}
                                                    {contact.email && (
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="w-3 h-3 text-slate-400" />
                                                            <a href={`mailto:${contact.email}`} className="text-indigo-600 hover:text-indigo-700">
                                                                {contact.email}
                                                            </a>
                                                        </div>
                                                    )}
                                                    {contact.phone && (
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="w-3 h-3 text-slate-400" />
                                                            <a href={`tel:${contact.phone}`} className="hover:text-slate-900">
                                                                {contact.phone}
                                                            </a>
                                                        </div>
                                                    )}
                                                    {contact.mobile_phone && (
                                                        <div className="flex items-center gap-2">
                                                            <Smartphone className="w-3 h-3 text-slate-400" />
                                                            <a href={`tel:${contact.mobile_phone}`} className="hover:text-slate-900">
                                                                {contact.mobile_phone}
                                                            </a>
                                                        </div>
                                                    )}
                                                    {contact.notes && (
                                                        <p className="text-slate-500 mt-2 text-xs">{contact.notes}</p>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="flex gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleEdit(contact)}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        if (confirm(`Kontakt "${contact.name}" wirklich löschen?`)) {
                                                            deleteMutation.mutate(contact.id);
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
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500">
                            Noch keine Kontakte angelegt
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}