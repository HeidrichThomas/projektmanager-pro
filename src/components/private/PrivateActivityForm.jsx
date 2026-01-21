import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { Upload, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function PrivateActivityForm({ activity, onSave, onClose }) {
    const formatDateForInput = (dateString) => {
        if (!dateString) return new Date().toISOString().slice(0, 16);
        return new Date(dateString).toISOString().slice(0, 16);
    };

    const [formData, setFormData] = useState({
        type: activity?.type || "notiz",
        title: activity?.title || "",
        content: activity?.content || "",
        company: activity?.company || "",
        contact_person: activity?.contact_person || "",
        activity_date: activity ? formatDateForInput(activity.activity_date) : new Date().toISOString().slice(0, 16),
        amount: activity?.amount || "",
        file_urls: activity?.file_urls || [],
        file_names: activity?.file_names || []
    });
    const [uploading, setUploading] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState("");
    const [manualCompany, setManualCompany] = useState(false);
    const [manualContact, setManualContact] = useState(false);

    const { data: customers = [] } = useQuery({
        queryKey: ['customers'],
        queryFn: () => base44.entities.Customer.list()
    });

    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
    const contactPersons = selectedCustomer?.contact_persons || [];

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setUploading(true);
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setFormData(prev => ({
            ...prev,
            file_urls: [...prev.file_urls, file_url],
            file_names: [...prev.file_names, file.name]
        }));
        setUploading(false);
    };

    const handleRemoveFile = (index) => {
        setFormData(prev => ({
            ...prev,
            file_urls: prev.file_urls.filter((_, i) => i !== index),
            file_names: prev.file_names.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            alert("Bitte geben Sie einen Titel ein");
            return;
        }
        const dataToSave = {
            type: formData.type,
            title: formData.title.trim(),
            content: formData.content.trim(),
            ...(formData.company && { company: formData.company.trim() }),
            ...(formData.contact_person && { contact_person: formData.contact_person.trim() }),
            activity_date: formData.activity_date ? new Date(formData.activity_date).toISOString() : new Date().toISOString(),
            ...(formData.amount && { amount: parseFloat(formData.amount) }),
            ...(formData.file_urls.length > 0 && { 
                file_urls: formData.file_urls,
                file_names: formData.file_names
            })
        };
        onSave(dataToSave);
        onClose();
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{activity ? "Aktivität bearbeiten" : "Neue Aktivität"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>Typ</Label>
                        <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="notiz">Notiz</SelectItem>
                                <SelectItem value="termin">Termin</SelectItem>
                                <SelectItem value="erinnerung">Erinnerung</SelectItem>
                                <SelectItem value="ausgabe">Ausgabe</SelectItem>
                                <SelectItem value="einnahme">Einnahme</SelectItem>
                                <SelectItem value="dokument">Dokument</SelectItem>
                                <SelectItem value="telefonat">Telefonat</SelectItem>
                                <SelectItem value="besuch">Besuch</SelectItem>
                                <SelectItem value="email">E-Mail</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Titel</Label>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <Label>Webseiten-Link (optional)</Label>
                        <Input
                            value={formData.link || ""}
                            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                            placeholder="https://..."
                            type="url"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Firma (optional)</Label>
                            {!manualCompany ? (
                                <div className="space-y-2">
                                    <Select 
                                        value={selectedCustomerId} 
                                        onValueChange={(value) => {
                                            setSelectedCustomerId(value);
                                            const customer = customers.find(c => c.id === value);
                                            if (customer) {
                                                setFormData({ ...formData, company: customer.company, contact_person: "" });
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Firma auswählen..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {customers.map(customer => (
                                                <SelectItem key={customer.id} value={customer.id}>
                                                    {customer.company}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setManualCompany(true);
                                            setSelectedCustomerId("");
                                            setFormData({ ...formData, company: "" });
                                        }}
                                        className="w-full text-xs"
                                    >
                                        Oder manuell eingeben
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Input
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        placeholder="Firmenname"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setManualCompany(false)}
                                        className="w-full text-xs"
                                    >
                                        Aus Kundenliste wählen
                                    </Button>
                                </div>
                            )}
                        </div>
                        <div>
                            <Label>Ansprechpartner (optional)</Label>
                            {!manualContact && selectedCustomerId && contactPersons.length > 0 ? (
                                <div className="space-y-2">
                                    <Select 
                                        value={formData.contact_person} 
                                        onValueChange={(value) => setFormData({ ...formData, contact_person: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Ansprechpartner wählen..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {contactPersons.map((contact, idx) => (
                                                <SelectItem key={idx} value={contact.name}>
                                                    {contact.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setManualContact(true);
                                            setFormData({ ...formData, contact_person: "" });
                                        }}
                                        className="w-full text-xs"
                                    >
                                        Oder manuell eingeben
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Input
                                        value={formData.contact_person}
                                        onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                                        placeholder="Name"
                                    />
                                    {selectedCustomerId && contactPersons.length > 0 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setManualContact(false)}
                                            className="w-full text-xs"
                                        >
                                            Aus Ansprechpartnern wählen
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <Label>Datum & Uhrzeit</Label>
                        <Input
                            type="datetime-local"
                            value={formData.activity_date}
                            onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
                        />
                    </div>

                    {(formData.type === "ausgabe" || formData.type === "einnahme") && (
                        <div>
                            <Label>Betrag (€)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                            />
                        </div>
                    )}

                    <div>
                        <Label>Beschreibung</Label>
                        <Textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            rows={4}
                        />
                    </div>

                    <div>
                        <Label>Dateien anhängen</Label>
                        <div className="flex gap-2">
                            <input
                                type="file"
                                onChange={handleFileUpload}
                                disabled={uploading}
                                className="hidden"
                                id="file-input"
                            />
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => document.getElementById('file-input')?.click()}
                                disabled={uploading}
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                {uploading ? "Wird hochgeladen..." : "Datei hinzufügen"}
                            </Button>
                        </div>
                        {formData.file_names.length > 0 && (
                            <div className="mt-2 space-y-2">
                                {formData.file_names.map((name, index) => (
                                    <div key={index} className="flex items-center justify-between bg-slate-100 p-2 rounded">
                                        <span className="text-sm text-slate-600">{name}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveFile(index)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Abbrechen
                        </Button>
                        <Button type="submit" disabled={uploading}>Speichern</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}