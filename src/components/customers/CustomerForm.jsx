import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Building2, User, MapPin, Phone, Smartphone, Mail, Globe, Save, X } from "lucide-react";

export default function CustomerForm({ open, onClose, onSave, customer }) {
    const [formData, setFormData] = useState({
        company: "",
        contact_name: "",
        type: "customer",
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

    useEffect(() => {
        if (customer) {
            setFormData(customer);
        } else {
            setFormData({
                company: "",
                contact_name: "",
                type: "customer",
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
    }, [customer, open]);

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
                        
                        <div>
                            <Label className="text-slate-700 font-medium">Ansprechpartner</Label>
                            <div className="relative mt-1.5">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    value={formData.contact_name}
                                    onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                                    className="pl-10"
                                    placeholder="Name des Ansprechpartners"
                                />
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
                            <Label className="text-slate-700 font-medium">Website</Label>
                            <div className="relative mt-1.5">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    value={formData.website}
                                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                                    className="pl-10"
                                    placeholder="www.firma.de"
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