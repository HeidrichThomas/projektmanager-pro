import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { X, Building2, User } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function SubThemeForm({ open, onClose, onSave, subTheme, parentThemeId }) {
    const { data: companies = [] } = useQuery({
        queryKey: ['themeCompanies'],
        queryFn: () => base44.entities.ThemeCompany.list()
    });

    const [formData, setFormData] = useState({
        parent_theme_id: parentThemeId || "",
        name: "",
        description: "",
        company_ids: [],
        contact_person_ids: [],
        status: "geplant",
        progress: 0,
        start_date: "",
        end_date: ""
    });

    const [selectedContacts, setSelectedContacts] = useState([]);

    useEffect(() => {
        if (subTheme) {
            setFormData({
                parent_theme_id: subTheme.parent_theme_id || parentThemeId,
                name: subTheme.name || "",
                description: subTheme.description || "",
                company_ids: subTheme.company_ids || [],
                contact_person_ids: subTheme.contact_person_ids || [],
                status: subTheme.status || "geplant",
                progress: subTheme.progress || 0,
                start_date: subTheme.start_date || "",
                end_date: subTheme.end_date || ""
            });
        } else {
            setFormData({
                parent_theme_id: parentThemeId || "",
                name: "",
                description: "",
                company_ids: [],
                contact_person_ids: [],
                status: "geplant",
                progress: 0,
                start_date: "",
                end_date: ""
            });
        }
    }, [subTheme, open, parentThemeId]);

    useEffect(() => {
        const contacts = [];
        formData.company_ids.forEach(companyId => {
            const company = companies.find(c => c.id === companyId);
            if (company && company.contact_persons) {
                company.contact_persons.forEach((cp, idx) => {
                    contacts.push({
                        id: `${companyId}_${idx}`,
                        companyId: companyId,
                        companyName: company.company_name,
                        ...cp
                    });
                });
            }
        });
        setSelectedContacts(contacts);
    }, [formData.company_ids, companies]);

    const handleAddCompany = (companyId) => {
        if (!formData.company_ids.includes(companyId)) {
            setFormData({
                ...formData,
                company_ids: [...formData.company_ids, companyId]
            });
        }
    };

    const handleRemoveCompany = (companyId) => {
        setFormData({
            ...formData,
            company_ids: formData.company_ids.filter(id => id !== companyId)
        });
    };

    const selectedCompanies = companies.filter(c => formData.company_ids.includes(c.id));
    const availableCompanies = companies.filter(c => !formData.company_ids.includes(c.id));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;
        onSave(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{subTheme?.id ? "Unterthema bearbeiten" : "Neues Unterthema"}</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>Name des Unterthemas *</Label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="z.B. Website, App, Prozesse..."
                            required
                        />
                    </div>

                    <div>
                        <Label>Beschreibung</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Details zum Unterthema..."
                            rows={3}
                        />
                    </div>

                    <div>
                        <Label className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            Beteiligte Firmen
                        </Label>
                        
                        {selectedCompanies.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2 mt-2">
                                {selectedCompanies.map(company => (
                                    <Badge key={company.id} variant="secondary" className="px-3 py-1">
                                        {company.company_name}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveCompany(company.id)}
                                            className="ml-2 hover:text-red-600"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                        
                        {availableCompanies.length > 0 && (
                            <Select onValueChange={handleAddCompany}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Firma hinzufügen..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableCompanies.map(company => (
                                        <SelectItem key={company.id} value={company.id}>
                                            {company.company_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {selectedContacts.length > 0 && (
                        <div>
                            <Label className="flex items-center gap-2 mb-2">
                                <User className="w-4 h-4" />
                                Ansprechpartner auswählen
                            </Label>
                            <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                                {selectedContacts.map(contact => (
                                    <div key={contact.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={contact.id}
                                            checked={formData.contact_person_ids.includes(contact.id)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setFormData({
                                                        ...formData,
                                                        contact_person_ids: [...formData.contact_person_ids, contact.id]
                                                    });
                                                } else {
                                                    setFormData({
                                                        ...formData,
                                                        contact_person_ids: formData.contact_person_ids.filter(id => id !== contact.id)
                                                    });
                                                }
                                            }}
                                        />
                                        <label
                                            htmlFor={contact.id}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                                        >
                                            <div className="text-slate-900">{contact.name}</div>
                                            <div className="text-xs text-slate-500">
                                                {contact.companyName}
                                                {contact.position && ` • ${contact.position}`}
                                            </div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger>
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
                            <Label>Fortschritt: {formData.progress}%</Label>
                            <Slider
                                value={[formData.progress]}
                                onValueChange={(value) => setFormData({ ...formData, progress: value[0] })}
                                max={100}
                                step={5}
                                className="mt-2"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Startdatum</Label>
                            <Input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            />
                        </div>

                        <div>
                            <Label>Enddatum</Label>
                            <Input
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Abbrechen
                        </Button>
                        <Button type="submit" className="bg-slate-800 hover:bg-slate-900">
                            {subTheme?.id ? "Speichern" : "Erstellen"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}