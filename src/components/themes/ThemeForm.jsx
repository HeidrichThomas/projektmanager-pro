import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Lightbulb, Save, X, Plus, Trash2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function ThemeForm({ open, onClose, onSave, theme, customers, suppliers }) {
    const availableSuppliers = suppliers || customers.filter(c => c.type === 'supplier' || c.type === 'both');
    const [selectedSupplierId, setSelectedSupplierId] = useState("");
    const [newContact, setNewContact] = useState({ name: "", position: "", phone: "", email: "" });

    const { data: sectors = [] } = useQuery({
        queryKey: ['sectors'],
        queryFn: () => base44.entities.Sector.list()
    });
    
    const [formData, setFormData] = useState({
        name: "",
        sector_id: "",
        customer_id: "",
        contact_person: "",
        contact_persons: [],
        supplier_ids: [],
        description: "",
        status: "geplant",
        progress: 0,
        start_date: "",
        end_date: ""
    });

    useEffect(() => {
        if (theme) {
            setFormData({
                ...theme,
                contact_persons: theme.contact_persons || []
            });
        } else {
            setFormData({
                name: "",
                sector_id: "",
                customer_id: "",
                contact_person: "",
                contact_persons: [],
                supplier_ids: [],
                description: "",
                status: "geplant",
                progress: 0,
                start_date: "",
                end_date: ""
            });
        }
        setSelectedSupplierId("");
        setNewContact({ name: "", position: "", phone: "", email: "" });
    }, [theme, open]);

    const addSupplier = () => {
        if (!selectedSupplierId) return;
        const currentIds = formData.supplier_ids || [];
        if (!currentIds.includes(selectedSupplierId)) {
            setFormData({...formData, supplier_ids: [...currentIds, selectedSupplierId]});
        }
        setSelectedSupplierId("");
    };

    const removeSupplier = (supplierId) => {
        const currentIds = formData.supplier_ids || [];
        setFormData({...formData, supplier_ids: currentIds.filter(id => id !== supplierId)});
    };

    const addContact = () => {
        if (!newContact.name.trim()) return;
        const currentContacts = formData.contact_persons || [];
        setFormData({
            ...formData,
            contact_persons: [...currentContacts, { ...newContact }]
        });
        setNewContact({ name: "", position: "", phone: "", email: "" });
    };

    const removeContact = (index) => {
        const currentContacts = formData.contact_persons || [];
        setFormData({
            ...formData,
            contact_persons: currentContacts.filter((_, i) => i !== index)
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Lightbulb className="w-5 h-5 text-amber-600" />
                        {theme ? "Thema bearbeiten" : "Neues Thema"}
                    </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                    <div>
                        <Label className="text-slate-700 font-medium">Themenname *</Label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="z.B. Digitalisierung"
                            className="mt-1.5"
                            required
                        />
                    </div>
                    
                    <div>
                        <Label className="text-slate-700 font-medium">Sparte</Label>
                        <Select
                            value={formData.sector_id}
                            onValueChange={(value) => setFormData({...formData, sector_id: value})}
                        >
                            <SelectTrigger className="mt-1.5">
                                <SelectValue placeholder="Sparte auswählen (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                                {sectors.map((sector) => (
                                    <SelectItem key={sector.id} value={sector.id}>
                                        {sector.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label className="text-slate-700 font-medium">Kunde</Label>
                        <Select
                            value={formData.customer_id}
                            onValueChange={(value) => {
                                setFormData({...formData, customer_id: value, contact_person: ""});
                            }}
                        >
                            <SelectTrigger className="mt-1.5">
                                <SelectValue placeholder="Kunde auswählen (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                                {customers.filter(c => c.type === 'customer' || c.type === 'both').map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.company}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    {formData.customer_id && (() => {
                        const selectedCustomer = customers.find(c => c.id === formData.customer_id);
                        const contactPersons = selectedCustomer?.contact_persons || [];
                        return contactPersons.length > 0 ? (
                            <div>
                                <Label className="text-slate-700 font-medium">Ansprechpartner</Label>
                                <Select
                                    value={formData.contact_person}
                                    onValueChange={(value) => setFormData({...formData, contact_person: value})}
                                >
                                    <SelectTrigger className="mt-1.5">
                                        <SelectValue placeholder="Ansprechpartner auswählen" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {contactPersons.map((contact, index) => (
                                            <SelectItem key={index} value={contact.name}>
                                                {contact.name}
                                                {contact.position && ` - ${contact.position}`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : null;
                    })()}

                    <div>
                        <Label className="text-slate-700 font-medium">Weitere Kontaktpersonen</Label>
                        <Card className="p-4 mt-1.5 bg-slate-50">
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        placeholder="Name *"
                                        value={newContact.name}
                                        onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                                    />
                                    <Input
                                        placeholder="Position"
                                        value={newContact.position}
                                        onChange={(e) => setNewContact({...newContact, position: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        placeholder="Telefon"
                                        value={newContact.phone}
                                        onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                                    />
                                    <Input
                                        placeholder="E-Mail"
                                        type="email"
                                        value={newContact.email}
                                        onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                                    />
                                </div>
                                <Button 
                                    type="button" 
                                    onClick={addContact}
                                    disabled={!newContact.name.trim()}
                                    variant="outline"
                                    className="w-full"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Kontakt hinzufügen
                                </Button>
                            </div>
                        </Card>
                        
                        {formData.contact_persons && formData.contact_persons.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {formData.contact_persons.map((contact, index) => (
                                    <Card key={index} className="p-3 bg-white">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <User className="w-4 h-4 text-slate-500" />
                                                    <span className="font-medium text-slate-900">{contact.name}</span>
                                                </div>
                                                {contact.position && (
                                                    <p className="text-sm text-slate-600">{contact.position}</p>
                                                )}
                                                <div className="flex gap-3 mt-1 text-sm text-slate-500">
                                                    {contact.phone && <span>{contact.phone}</span>}
                                                    {contact.email && <span>{contact.email}</span>}
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeContact(index)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div>
                        <Label className="text-slate-700 font-medium">Beteiligte Lieferanten</Label>
                        <div className="flex gap-2 mt-1.5">
                            <Select
                                value={selectedSupplierId}
                                onValueChange={setSelectedSupplierId}
                            >
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Lieferant auswählen" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableSuppliers.filter(s => !(formData.supplier_ids || []).includes(s.id)).map((supplier) => (
                                        <SelectItem key={supplier.id} value={supplier.id}>
                                            {supplier.company}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button 
                                type="button" 
                                onClick={addSupplier}
                                disabled={!selectedSupplierId}
                                size="icon"
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        
                        {formData.supplier_ids && formData.supplier_ids.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {formData.supplier_ids.map(supplierId => {
                                    const supplier = availableSuppliers.find(s => s.id === supplierId);
                                    if (!supplier) return null;
                                    return (
                                        <div key={supplierId} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                                            <span className="text-sm font-medium text-slate-700">{supplier.company}</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeSupplier(supplierId)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    
                    <div>
                        <Label className="text-slate-700 font-medium">Beschreibung</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="Themenbeschreibung..."
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
                                    <SelectItem value="geplant">Geplant</SelectItem>
                                    <SelectItem value="in_arbeit">In Arbeit</SelectItem>
                                    <SelectItem value="pausiert">Pausiert</SelectItem>
                                    <SelectItem value="abgeschlossen">Abgeschlossen</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div>
                            <Label className="text-slate-700 font-medium">Fortschritt ({formData.progress}%)</Label>
                            <div className="flex items-center gap-3 mt-3">
                                <Slider
                                    value={[formData.progress]}
                                    onValueChange={(value) => setFormData({...formData, progress: value[0]})}
                                    min={0}
                                    max={100}
                                    step={5}
                                    className="flex-1"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-slate-700 font-medium">Startdatum</Label>
                            <Input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                                className="mt-1.5"
                            />
                        </div>
                        
                        <div>
                            <Label className="text-slate-700 font-medium">Enddatum</Label>
                            <Input
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
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