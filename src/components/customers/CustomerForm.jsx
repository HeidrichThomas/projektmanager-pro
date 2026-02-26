import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Building2, User, MapPin, Phone, Smartphone, Mail, Save, X, Plus, Trash2, Link2, Edit2 } from "lucide-react";

export default function CustomerForm({ open, onClose, onSave, customer }) {
    const [formData, setFormData] = useState({
        company: "",
        contact_name: "",
        contact_persons: [],
        type: "customer",
        products_services: "",
        street: "",
        postal_code: "",
        city: "",
        country: "Deutschland",
        phone: "",
        mobile_phone: "",
        fax: "",
        email: "",
        website: "",
        notes: ""
    });
    
    const [newContact, setNewContact] = useState({
        name: "",
        position: "",
        phone: "",
        email: ""
    });
    
    const [editingContactIndex, setEditingContactIndex] = useState(null);

    useEffect(() => {
        if (customer) {
            setFormData({...customer, contact_persons: customer.contact_persons || []});
        } else {
            setFormData({
                company: "",
                contact_name: "",
                contact_persons: [],
                type: "customer",
                products_services: "",
                street: "",
                postal_code: "",
                city: "",
                country: "Deutschland",
                phone: "",
                mobile_phone: "",
                fax: "",
                email: "",
                website: "",
                notes: ""
            });
        }
        setNewContact({ name: "", position: "", phone: "", email: "" });
        setEditingContactIndex(null);
    }, [customer, open]);

    const addContactPerson = () => {
        if (!newContact.name) return;
        
        if (editingContactIndex !== null) {
            const updatedContacts = [...formData.contact_persons];
            updatedContacts[editingContactIndex] = newContact;
            setFormData({
                ...formData,
                contact_persons: updatedContacts
            });
            setEditingContactIndex(null);
        } else {
            setFormData({
                ...formData,
                contact_persons: [...(formData.contact_persons || []), newContact]
            });
        }
        setNewContact({ name: "", position: "", phone: "", email: "" });
    };

    const editContactPerson = (index) => {
        setNewContact(formData.contact_persons[index]);
        setEditingContactIndex(index);
    };

    const removeContactPerson = (index) => {
        setFormData({
            ...formData,
            contact_persons: formData.contact_persons.filter((_, i) => i !== index)
        });
        if (editingContactIndex === index) {
            setNewContact({ name: "", position: "", phone: "", email: "" });
            setEditingContactIndex(null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Building2 className="w-5 h-5 text-slate-600" />
                        {customer ? "Kunde bearbeiten" : "Neuer Kunde"}
                    </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <Label className="text-slate-700 font-medium">Firma *</Label>
                            <div className="relative mt-1.5">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    value={formData.company}
                                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                                    className="pl-10"
                                    placeholder="Firmenname"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="md:col-span-2">
                            <Label className="text-slate-700 font-medium">Ansprechpartner</Label>
                            <div className="mt-3 space-y-3">
                                {formData.contact_persons && formData.contact_persons.length > 0 && (
                                    <div className="space-y-2">
                                        {formData.contact_persons.map((contact, index) => (
                                            <div key={index} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                                                <div className="flex-1">
                                                    <p className="font-medium text-slate-900">{contact.name}</p>
                                                    {contact.position && <p className="text-sm text-slate-600">{contact.position}</p>}
                                                    <div className="flex gap-3 mt-1 text-xs text-slate-500">
                                                        {contact.phone && <span>{contact.phone}</span>}
                                                        {contact.email && <span>{contact.email}</span>}
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => editContactPerson(index)}
                                                        className="text-slate-600 hover:text-slate-700 hover:bg-slate-100"
                                                    >
                                                        <Edit2 className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeContactPerson(index)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="border-2 border-dashed border-slate-200 rounded-lg p-3">
                                    <p className="text-sm font-medium text-slate-700 mb-2">
                                        {editingContactIndex !== null ? "Ansprechpartner bearbeiten" : "Neuer Ansprechpartner"}
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
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
                                        <Input
                                            placeholder="Telefon"
                                            value={newContact.phone}
                                            onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                                        />
                                        <Input
                                            placeholder="E-Mail"
                                            value={newContact.email}
                                            onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        {editingContactIndex !== null && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setNewContact({ name: "", position: "", phone: "", email: "" });
                                                    setEditingContactIndex(null);
                                                }}
                                                className="flex-1"
                                            >
                                                <X className="w-3 h-3 mr-1" />
                                                Abbrechen
                                            </Button>
                                        )}
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={addContactPerson}
                                            disabled={!newContact.name}
                                            className="flex-1"
                                        >
                                            {editingContactIndex !== null ? (
                                                <>
                                                    <Save className="w-3 h-3 mr-1" />
                                                    Speichern
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="w-3 h-3 mr-1" />
                                                    Hinzufügen
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <Label className="text-slate-700 font-medium">Typ *</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => setFormData({...formData, type: value})}
                            >
                                <SelectTrigger className="mt-1.5">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="customer">Kunde</SelectItem>
                                    <SelectItem value="supplier">Lieferant</SelectItem>
                                    <SelectItem value="both">Kunde & Lieferant</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        {(formData.type === "supplier" || formData.type === "both") && (
                            <div className="md:col-span-2">
                                <Label className="text-slate-700 font-medium">Produkte / Dienstleistungen</Label>
                                <Textarea
                                    value={formData.products_services}
                                    onChange={(e) => setFormData({...formData, products_services: e.target.value})}
                                    placeholder="Welche Produkte oder Dienstleistungen bietet dieser Lieferant an?"
                                    className="mt-1.5"
                                />
                            </div>
                        )}
                        
                        <div>
                            <Label className="text-slate-700 font-medium">Straße</Label>
                            <div className="relative mt-1.5">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    value={formData.street}
                                    onChange={(e) => setFormData({...formData, street: e.target.value})}
                                    className="pl-10"
                                    placeholder="Straße und Hausnummer"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <Label className="text-slate-700 font-medium">PLZ</Label>
                            <Input
                                value={formData.postal_code}
                                onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                                placeholder="12345"
                                className="mt-1.5"
                            />
                        </div>
                        
                        <div>
                            <Label className="text-slate-700 font-medium">Stadt</Label>
                            <Input
                                value={formData.city}
                                onChange={(e) => setFormData({...formData, city: e.target.value})}
                                placeholder="Stadt"
                                className="mt-1.5"
                            />
                        </div>
                        
                        <div>
                            <Label className="text-slate-700 font-medium">Land</Label>
                            <Input
                                value={formData.country}
                                onChange={(e) => setFormData({...formData, country: e.target.value})}
                                placeholder="Land"
                                className="mt-1.5"
                            />
                        </div>
                        
                        <div>
                            <Label className="text-slate-700 font-medium">Telefon</Label>
                            <div className="relative mt-1.5">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="pl-10"
                                    placeholder="+49 123 456789"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <Label className="text-slate-700 font-medium">Handy</Label>
                            <div className="relative mt-1.5">
                                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    value={formData.mobile_phone}
                                    onChange={(e) => setFormData({...formData, mobile_phone: e.target.value})}
                                    className="pl-10"
                                    placeholder="+49 170 1234567"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <Label className="text-slate-700 font-medium">Fax</Label>
                            <Input
                                value={formData.fax}
                                onChange={(e) => setFormData({...formData, fax: e.target.value})}
                                placeholder="+49 123 456780"
                                className="mt-1.5"
                            />
                        </div>
                        
                        <div>
                            <Label className="text-slate-700 font-medium">E-Mail</Label>
                            <div className="relative mt-1.5">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="pl-10"
                                    placeholder="info@firma.de"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <Label className="text-slate-700 font-medium">Link (optional)</Label>
                            <div className="relative mt-1.5">
                                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    value={formData.link || ""}
                                    onChange={(e) => setFormData({...formData, link: e.target.value})}
                                    className="pl-10"
                                    placeholder="https://..."
                                    type="url"
                                />
                            </div>
                        </div>
                        
                        <div className="md:col-span-2">
                            <Label className="text-slate-700 font-medium">Notizen</Label>
                            <Textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                placeholder="Zusätzliche Informationen..."
                                className="mt-1.5 min-h-[100px]"
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