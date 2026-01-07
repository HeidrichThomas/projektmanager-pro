import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FolderKanban, Save, X, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function ProjectForm({ open, onClose, onSave, project, customers, suppliers }) {
    const availableSuppliers = suppliers || customers.filter(c => c.type === 'supplier' || c.type === 'both');
    
    const toggleSupplier = (supplierId) => {
        const currentIds = formData.supplier_ids || [];
        if (currentIds.includes(supplierId)) {
            setFormData({...formData, supplier_ids: currentIds.filter(id => id !== supplierId)});
        } else {
            setFormData({...formData, supplier_ids: [...currentIds, supplierId]});
        }
    };
    const [formData, setFormData] = useState({
        name: "",
        customer_id: "",
        supplier_ids: [],
        description: "",
        status: "geplant",
        progress: 0,
        start_date: "",
        end_date: ""
    });

    useEffect(() => {
        if (project) {
            setFormData(project);
        } else {
            setFormData({
                name: "",
                customer_id: "",
                supplier_ids: [],
                description: "",
                status: "geplant",
                progress: 0,
                start_date: "",
                end_date: ""
            });
        }
    }, [project, open]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <FolderKanban className="w-5 h-5 text-slate-600" />
                        {project ? "Projekt bearbeiten" : "Neues Projekt"}
                    </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                    <div>
                        <Label className="text-slate-700 font-medium">Projektname *</Label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="z.B. Website Redesign"
                            className="mt-1.5"
                            required
                        />
                    </div>
                    
                    <div>
                        <Label className="text-slate-700 font-medium">Kunde *</Label>
                        <Select
                            value={formData.customer_id}
                            onValueChange={(value) => setFormData({...formData, customer_id: value})}
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
                    
                    <div>
                        <Label className="text-slate-700 font-medium">Lieferanten</Label>
                        <div className="mt-1.5 max-h-40 overflow-y-auto border rounded-lg p-3 space-y-2">
                            {availableSuppliers.length > 0 ? (
                                availableSuppliers.map((supplier) => (
                                    <div key={supplier.id} className="flex items-center gap-2">
                                        <Checkbox
                                            checked={(formData.supplier_ids || []).includes(supplier.id)}
                                            onCheckedChange={() => toggleSupplier(supplier.id)}
                                        />
                                        <label className="text-sm cursor-pointer" onClick={() => toggleSupplier(supplier.id)}>
                                            {supplier.company}
                                        </label>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500">Keine Lieferanten verfügbar</p>
                            )}
                        </div>
                    </div>
                    
                    <div>
                        <Label className="text-slate-700 font-medium">Beschreibung</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="Projektbeschreibung..."
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
                            <Label className="text-slate-700 font-medium">Fortschritt</Label>
                            <div className="flex items-center gap-2 mt-1.5">
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.progress}
                                    onChange={(e) => setFormData({...formData, progress: parseInt(e.target.value) || 0})}
                                />
                                <span className="text-slate-500">%</span>
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