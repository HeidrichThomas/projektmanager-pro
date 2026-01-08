import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Lightbulb, Save, X, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ThemeForm({ open, onClose, onSave, theme, customers, suppliers }) {
    const availableSuppliers = suppliers || customers.filter(c => c.type === 'supplier' || c.type === 'both');
    const [selectedSupplierId, setSelectedSupplierId] = useState("");
    
    const [formData, setFormData] = useState({
        name: "",
        customer_id: "",
        contact_person: "",
        supplier_ids: [],
        description: "",
        status: "geplant",
        progress: 0,
        start_date: "",
        end_date: ""
    });

    useEffect(() => {
        if (theme) {
            setFormData(theme);
        } else {
            setFormData({
                name: "",
                customer_id: "",
                contact_person: "",
                supplier_ids: [],
                description: "",
                status: "geplant",
                progress: 0,
                start_date: "",
                end_date: ""
            });
        }
        setSelectedSupplierId("");
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
                        <Label className="text-slate-700 font-medium">Kunde *</Label>
                        <Select
                            value={formData.customer_id}
                            onValueChange={(value) => {
                                setFormData({...formData, customer_id: value, contact_person: ""});
                            }}
                            required
                        >
                            <SelectTrigger className="mt-1.5">
                                <SelectValue placeholder="Kunde auswählen" />
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