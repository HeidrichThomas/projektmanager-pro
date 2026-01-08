import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Trash2, User, Save, X, Pencil, Upload } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function ThemeCompanyManagement({ open, onClose }) {
    const [editingCompany, setEditingCompany] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [importing, setImporting] = useState(false);
    const [formData, setFormData] = useState({
        company_name: "",
        street: "",
        postal_code: "",
        city: "",
        country: "Deutschland",
        website: "",
        contact_persons: [],
        notes: ""
    });
    const [newContact, setNewContact] = useState({ 
        name: "", 
        position: "", 
        phone: "", 
        mobile_phone: "", 
        email: "" 
    });

    const queryClient = useQueryClient();

    const { data: companies = [] } = useQuery({
        queryKey: ['themeCompanies'],
        queryFn: () => base44.entities.ThemeCompany.list(),
        enabled: open
    });

    const createCompanyMutation = useMutation({
        mutationFn: (data) => base44.entities.ThemeCompany.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['themeCompanies'] });
            setShowForm(false);
            setEditingCompany(null);
            resetForm();
            toast.success("Firma erfolgreich angelegt");
        }
    });

    const updateCompanyMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.ThemeCompany.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['themeCompanies'] });
            setShowForm(false);
            setEditingCompany(null);
            resetForm();
            toast.success("Firma aktualisiert");
        }
    });

    const deleteCompanyMutation = useMutation({
        mutationFn: (id) => base44.entities.ThemeCompany.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['themeCompanies'] });
            toast.success("Firma gelöscht");
        }
    });

    const resetForm = () => {
        setFormData({
            company_name: "",
            street: "",
            postal_code: "",
            city: "",
            country: "Deutschland",
            website: "",
            contact_persons: [],
            notes: ""
        });
        setNewContact({ name: "", position: "", phone: "", mobile_phone: "", email: "" });
    };

    const handleEdit = (company) => {
        setEditingCompany(company);
        setFormData(company);
        setShowForm(true);
    };

    const handleNew = () => {
        setEditingCompany(null);
        resetForm();
        setShowForm(true);
    };

    const addContact = () => {
        if (!newContact.name.trim()) return;
        setFormData({
            ...formData,
            contact_persons: [...(formData.contact_persons || []), { ...newContact }]
        });
        setNewContact({ name: "", position: "", phone: "", mobile_phone: "", email: "" });
    };

    const removeContact = (index) => {
        setFormData({
            ...formData,
            contact_persons: formData.contact_persons.filter((_, i) => i !== index)
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingCompany) {
            updateCompanyMutation.mutate({ id: editingCompany.id, data: formData });
        } else {
            createCompanyMutation.mutate(formData);
        }
    };

    const handleImport = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            
            const schema = {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        company_name: { type: "string" },
                        street: { type: "string" },
                        postal_code: { type: "string" },
                        city: { type: "string" },
                        country: { type: "string" },
                        website: { type: "string" },
                        contact_name: { type: "string" },
                        contact_position: { type: "string" },
                        contact_phone: { type: "string" },
                        contact_mobile: { type: "string" },
                        contact_email: { type: "string" },
                        notes: { type: "string" }
                    }
                }
            };

            const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
                file_url,
                json_schema: schema
            });

            if (result.status === "success" && result.output) {
                const companies = result.output.map(row => {
                    const company = {
                        company_name: row.company_name || "",
                        street: row.street || "",
                        postal_code: row.postal_code || "",
                        city: row.city || "",
                        country: row.country || "Deutschland",
                        website: row.website || "",
                        notes: row.notes || "",
                        contact_persons: []
                    };

                    if (row.contact_name) {
                        company.contact_persons.push({
                            name: row.contact_name,
                            position: row.contact_position || "",
                            phone: row.contact_phone || "",
                            mobile_phone: row.contact_mobile || "",
                            email: row.contact_email || ""
                        });
                    }

                    return company;
                }).filter(c => c.company_name);

                await base44.entities.ThemeCompany.bulkCreate(companies);
                queryClient.invalidateQueries({ queryKey: ['themeCompanies'] });
                toast.success(`${companies.length} Firmen importiert`);
            } else {
                toast.error("Fehler beim Import: " + (result.details || "Unbekannter Fehler"));
            }
        } catch (error) {
            toast.error("Import fehlgeschlagen");
        } finally {
            setImporting(false);
            e.target.value = "";
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-slate-600" />
                        Firmen verwalten
                    </DialogTitle>
                </DialogHeader>

                {!showForm ? (
                    <div className="mt-4">
                        <div className="flex gap-2 mb-4">
                            <Button onClick={handleNew} className="bg-slate-800 hover:bg-slate-900">
                                <Plus className="w-4 h-4 mr-2" />
                                Neue Firma anlegen
                            </Button>
                            <label>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    disabled={importing}
                                    onClick={() => document.getElementById('excel-import').click()}
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    {importing ? "Importiere..." : "Excel Import"}
                                </Button>
                                <input
                                    id="excel-import"
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={handleImport}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        <div className="space-y-3">
                            {companies.map((company) => (
                                <Card key={company.id} className="p-4 hover:shadow-md transition-all group">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-slate-900 mb-1">{company.company_name}</h3>
                                            {(company.street || company.city) && (
                                                <p className="text-sm text-slate-600">
                                                    {company.street && `${company.street}, `}
                                                    {company.postal_code} {company.city}
                                                </p>
                                            )}
                                            {company.contact_persons && company.contact_persons.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {company.contact_persons.map((contact, idx) => (
                                                        <Badge key={idx} variant="secondary" className="text-xs">
                                                            <User className="w-3 h-3 mr-1" />
                                                            {contact.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleEdit(company)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => {
                                                    if (confirm(`${company.company_name} wirklich löschen?`)) {
                                                        deleteCompanyMutation.mutate(company.id);
                                                    }
                                                }}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                            {companies.length === 0 && (
                                <p className="text-center py-8 text-slate-500">Noch keine Firmen angelegt</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        <div>
                            <Label>Firmenname *</Label>
                            <Input
                                value={formData.company_name}
                                onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                                placeholder="z.B. Mustermann GmbH"
                                className="mt-1.5"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Straße & Hausnummer</Label>
                                <Input
                                    value={formData.street}
                                    onChange={(e) => setFormData({...formData, street: e.target.value})}
                                    placeholder="Musterstraße 123"
                                    className="mt-1.5"
                                />
                            </div>
                            <div>
                                <Label>Website</Label>
                                <Input
                                    value={formData.website}
                                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                                    placeholder="www.beispiel.de"
                                    className="mt-1.5"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label>PLZ</Label>
                                <Input
                                    value={formData.postal_code}
                                    onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                                    placeholder="12345"
                                    className="mt-1.5"
                                />
                            </div>
                            <div>
                                <Label>Stadt</Label>
                                <Input
                                    value={formData.city}
                                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                                    placeholder="Berlin"
                                    className="mt-1.5"
                                />
                            </div>
                            <div>
                                <Label>Land</Label>
                                <Input
                                    value={formData.country}
                                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                                    className="mt-1.5"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Ansprechpartner</Label>
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
                                    <div className="grid grid-cols-3 gap-3">
                                        <Input
                                            placeholder="Telefon"
                                            value={newContact.phone}
                                            onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                                        />
                                        <Input
                                            placeholder="Handy"
                                            value={newContact.mobile_phone}
                                            onChange={(e) => setNewContact({...newContact, mobile_phone: e.target.value})}
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
                                        Ansprechpartner hinzufügen
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
                                                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-slate-500">
                                                        {contact.phone && <span>☎ {contact.phone}</span>}
                                                        {contact.mobile_phone && <span>📱 {contact.mobile_phone}</span>}
                                                        {contact.email && <span>✉ {contact.email}</span>}
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
                            <Label>Notizen</Label>
                            <Textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                placeholder="Zusätzliche Informationen..."
                                className="mt-1.5"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                <X className="w-4 h-4 mr-2" />
                                Zurück
                            </Button>
                            <Button type="submit" className="bg-slate-800 hover:bg-slate-900">
                                <Save className="w-4 h-4 mr-2" />
                                Speichern
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}