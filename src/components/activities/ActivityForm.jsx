import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Phone, Mail, Users, FileText, StickyNote, Upload, Save, X, Loader2, Handshake, Plus, Trash2, MapPin, Navigation } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const typeConfig = {
    telefonat: { label: "Telefonat", icon: Phone, color: "text-green-600" },
    meeting: { label: "Meeting", icon: Users, color: "text-blue-600" },
    besuch: { label: "Besuch", icon: Handshake, color: "text-indigo-600" },
    email: { label: "E-Mail", icon: Mail, color: "text-purple-600" },
    notiz: { label: "Notiz", icon: StickyNote, color: "text-amber-600" },
    dokument: { label: "Dokument", icon: FileText, color: "text-slate-600" }
};

export default function ActivityForm({ open, onClose, onSave, activity, projectId }) {
    const [formData, setFormData] = useState({
        project_id: projectId,
        type: "telefonat",
        title: "",
        content: "",
        contact_person: "",
        activity_date: new Date().toISOString().slice(0, 16),
        file_urls: [],
        file_names: [],
        requires_travel: false,
        start_location: "Gartenstraße 17, 89257 Illertissen",
        destination_address: "",
        travel_distance_km: null
    });
    const [uploading, setUploading] = useState(false);
    const [selectedContactPerson, setSelectedContactPerson] = useState("");
    const [contactPersonsList, setContactPersonsList] = useState([]);
    const [calculatingDistance, setCalculatingDistance] = useState(false);
    const [project, setProject] = useState(null);

    const { data: customers = [] } = useQuery({
        queryKey: ['customers'],
        queryFn: () => base44.entities.Customer.list()
    });

    const { data: projects = [] } = useQuery({
        queryKey: ['projects'],
        queryFn: () => base44.entities.Project.list()
    });

    useEffect(() => {
        if (activity) {
            setFormData({
                ...activity,
                activity_date: activity.activity_date ? activity.activity_date.slice(0, 16) : new Date().toISOString().slice(0, 16),
                requires_travel: activity.requires_travel || false,
                start_location: activity.start_location || "Gartenstraße 17, 89257 Illertissen",
                destination_address: activity.destination_address || "",
                travel_distance_km: activity.travel_distance_km || null
            });
            // Parse existing contact persons (comma-separated string to array)
            const existingContacts = activity.contact_person ? activity.contact_person.split(', ').filter(c => c.trim()) : [];
            setContactPersonsList(existingContacts);
        } else {
            setFormData({
                project_id: projectId,
                type: "telefonat",
                title: "",
                content: "",
                contact_person: "",
                activity_date: new Date().toISOString().slice(0, 16),
                file_urls: [],
                file_names: [],
                requires_travel: false,
                start_location: "Gartenstraße 17, 89257 Illertissen",
                destination_address: "",
                travel_distance_km: null
            });
            setContactPersonsList([]);
        }
        setSelectedContactPerson("");
    }, [activity, projectId, open]);

    useEffect(() => {
        if (projectId) {
            const currentProject = projects.find(p => p.id === projectId);
            setProject(currentProject);
            
            // Set destination address from customer if available
            if (currentProject && currentProject.customer_id && !activity) {
                const customer = customers.find(c => c.id === currentProject.customer_id);
                if (customer && customer.street && customer.city) {
                    const address = `${customer.street}, ${customer.postal_code || ''} ${customer.city}`.trim();
                    setFormData(prev => ({...prev, destination_address: address}));
                }
            }
        }
    }, [projectId, projects, customers, activity]);

    const handleFileUpload = async (e) => {
        const files = e.target.files;
        if (!files.length) return;
        
        setUploading(true);
        const newUrls = [...(formData.file_urls || [])];
        const newNames = [...(formData.file_names || [])];
        
        for (const file of files) {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            newUrls.push(file_url);
            newNames.push(file.name);
        }
        
        setFormData({...formData, file_urls: newUrls, file_names: newNames});
        setUploading(false);
    };

    const removeFile = (index) => {
        const newUrls = formData.file_urls.filter((_, i) => i !== index);
        const newNames = formData.file_names.filter((_, i) => i !== index);
        setFormData({...formData, file_urls: newUrls, file_names: newNames});
    };

    const addContactPerson = () => {
        if (!selectedContactPerson || contactPersonsList.includes(selectedContactPerson)) return;
        const newList = [...contactPersonsList, selectedContactPerson];
        setContactPersonsList(newList);
        setFormData({...formData, contact_person: newList.join(', ')});
        setSelectedContactPerson("");
    };

    const removeContactPerson = (index) => {
        const newList = contactPersonsList.filter((_, i) => i !== index);
        setContactPersonsList(newList);
        setFormData({...formData, contact_person: newList.join(', ')});
    };

    const calculateDistance = async () => {
        if (!formData.start_location || !formData.destination_address) return;
        
        setCalculatingDistance(true);
        try {
            const result = await base44.integrations.Core.InvokeLLM({
                prompt: `Berechne die Fahrstrecke in Kilometern zwischen diesen beiden Adressen:
Start: ${formData.start_location}
Ziel: ${formData.destination_address}

Gib NUR die Gesamtkilometer für Hin- und Rückfahrt zurück (also die einfache Strecke mal 2).
Beispiel-Antwort: 45.6`,
                add_context_from_internet: true
            });
            
            const distance = parseFloat(result);
            if (!isNaN(distance)) {
                setFormData({...formData, travel_distance_km: distance});
            }
        } catch (error) {
            console.error("Fehler beim Berechnen der Entfernung:", error);
        } finally {
            setCalculatingDistance(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const TypeIcon = typeConfig[formData.type]?.icon || FileText;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <TypeIcon className={`w-5 h-5 ${typeConfig[formData.type]?.color}`} />
                        {activity ? "Aktivität bearbeiten" : "Neue Aktivität"}
                    </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                    <div>
                        <Label className="text-slate-700 font-medium">Art der Aktivität</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value) => setFormData({...formData, type: value})}
                        >
                            <SelectTrigger className="mt-1.5">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(typeConfig).map(([key, config]) => (
                                    <SelectItem key={key} value={key}>
                                        <div className="flex items-center gap-2">
                                            <config.icon className={`w-4 h-4 ${config.color}`} />
                                            {config.label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div>
                        <Label className="text-slate-700 font-medium">Titel/Betreff *</Label>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            placeholder="z.B. Abstimmung Projektstart"
                            className="mt-1.5"
                            required
                        />
                    </div>
                    
                    <div>
                        <Label className="text-slate-700 font-medium">Gesprächspartner</Label>
                        <div className="flex gap-2 mt-1.5">
                            <Select
                                value={selectedContactPerson}
                                onValueChange={setSelectedContactPerson}
                            >
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Auswählen" />
                                </SelectTrigger>
                                <SelectContent>
                                    {customers.flatMap((customer) => {
                                        const contacts = [];
                                        // Add all contact persons from contact_persons array
                                        if (customer.contact_persons && customer.contact_persons.length > 0) {
                                            customer.contact_persons.forEach(contact => {
                                                contacts.push({
                                                    value: `${contact.name} (${customer.company})`,
                                                    label: `${contact.name} (${customer.company})`,
                                                    position: contact.position
                                                });
                                            });
                                        }
                                        // Also add main contact if exists
                                        if (customer.contact_name) {
                                            contacts.push({
                                                value: `${customer.contact_name} (${customer.company})`,
                                                label: `${customer.contact_name} (${customer.company})`,
                                                position: null
                                            });
                                        }
                                        // Add company as fallback
                                        if (contacts.length === 0) {
                                            contacts.push({
                                                value: customer.company,
                                                label: customer.company,
                                                position: null
                                            });
                                        }
                                        return contacts;
                                    }).map((contact, index) => (
                                        <SelectItem key={index} value={contact.value}>
                                            {contact.label}
                                            {contact.position && <span className="text-xs text-slate-500"> - {contact.position}</span>}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button 
                                type="button" 
                                onClick={addContactPerson}
                                disabled={!selectedContactPerson}
                                size="icon"
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        
                        {contactPersonsList.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {contactPersonsList.map((person, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                                        <span className="text-sm font-medium text-slate-700">{person}</span>
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
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div>
                        <Label className="text-slate-700 font-medium">Datum & Uhrzeit</Label>
                        <Input
                            type="datetime-local"
                            value={formData.activity_date}
                            onChange={(e) => setFormData({...formData, activity_date: e.target.value})}
                            className="mt-1.5"
                        />
                    </div>

                    {(formData.type === 'besuch' || formData.type === 'meeting') && (
                        <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 space-y-4">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="requires_travel"
                                    checked={formData.requires_travel}
                                    onCheckedChange={(checked) => setFormData({...formData, requires_travel: checked})}
                                />
                                <Label htmlFor="requires_travel" className="text-slate-700 font-medium cursor-pointer">
                                    <MapPin className="w-4 h-4 inline mr-1" />
                                    Fahrt erforderlich (außer Haus)
                                </Label>
                            </div>

                            {formData.requires_travel && (
                                <>
                                    <div>
                                        <Label className="text-slate-700 font-medium">Start-Standort</Label>
                                        <Input
                                            value={formData.start_location}
                                            onChange={(e) => setFormData({...formData, start_location: e.target.value})}
                                            placeholder="Gartenstraße 17, 89257 Illertissen"
                                            className="mt-1.5"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-slate-700 font-medium">Zieladresse</Label>
                                        <Input
                                            value={formData.destination_address}
                                            onChange={(e) => setFormData({...formData, destination_address: e.target.value})}
                                            placeholder="Adresse des Kunden"
                                            className="mt-1.5"
                                        />
                                        {project && (
                                            <p className="text-xs text-slate-500 mt-1">
                                                Kundenadresse wird automatisch ausgefüllt
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-2 items-end">
                                        <div className="flex-1">
                                            <Label className="text-slate-700 font-medium">Kilometer (Hin & Zurück)</Label>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                value={formData.travel_distance_km || ''}
                                                onChange={(e) => setFormData({...formData, travel_distance_km: parseFloat(e.target.value) || null})}
                                                placeholder="0.0"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={calculateDistance}
                                            disabled={calculatingDistance || !formData.start_location || !formData.destination_address}
                                            variant="outline"
                                        >
                                            {calculatingDistance ? (
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            ) : (
                                                <Navigation className="w-4 h-4 mr-2" />
                                            )}
                                            Berechnen
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                    
                    <div>
                        <Label className="text-slate-700 font-medium">Inhalt/Notizen</Label>
                        <Textarea
                            value={formData.content}
                            onChange={(e) => setFormData({...formData, content: e.target.value})}
                            placeholder="Details zum Gespräch, vereinbarte Punkte..."
                            className="mt-1.5 min-h-[120px]"
                        />
                    </div>
                    
                    <div>
                        <Label className="text-slate-700 font-medium">Dateien anhängen</Label>
                        <div className="mt-1.5">
                            <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-slate-400 transition-colors">
                                {uploading ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                                ) : (
                                    <Upload className="w-5 h-5 text-slate-400" />
                                )}
                                <span className="text-sm text-slate-500">
                                    {uploading ? "Wird hochgeladen..." : "Dateien auswählen (PDF, Bilder, etc.)"}
                                </span>
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                        
                        {formData.file_names?.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {formData.file_names.map((name, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                                        <span className="text-sm text-slate-600 truncate">{name}</span>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => removeFile(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>
                            <X className="w-4 h-4 mr-2" />
                            Abbrechen
                        </Button>
                        <Button type="submit" className="bg-slate-800 hover:bg-slate-900" disabled={uploading}>
                            <Save className="w-4 h-4 mr-2" />
                            Speichern
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}