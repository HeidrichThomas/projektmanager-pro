import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Save, X, Upload, Trash2, FileText, Phone, Users, Mail, Milestone, User, MapPin } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Navigation } from "lucide-react";
import FileDropzone from "@/components/ui/file-dropzone";

const activityTypes = {
    notiz: { label: "Notiz", icon: FileText, color: "text-slate-600" },
    telefonat: { label: "Telefonat", icon: Phone, color: "text-blue-600" },
    meeting: { label: "Meeting", icon: Users, color: "text-purple-600" },
    email: { label: "E-Mail", icon: Mail, color: "text-green-600" },
    dokument: { label: "Dokument", icon: FileText, color: "text-orange-600" },
    meilenstein: { label: "Meilenstein", icon: Milestone, color: "text-amber-600" },
    besuch: { label: "Besuch", icon: MapPin, color: "text-teal-600" }
};

export default function ThemeActivityForm({ open, onClose, onSave, activity, themeId }) {
    const [formData, setFormData] = useState({
        type: "notiz",
        title: "",
        content: "",
        company_id: "",
        contact_person_ids: [],
        activity_date: new Date().toISOString().slice(0, 16),
        appointment_date: "",
        file_urls: [],
        file_names: [],
        requires_travel: false,
        own_travel: false,
        start_location: "Gartenstraße 17, 89257 Illertissen",
        destination_address: "",
        travel_distance_km: 0
    });
    const [uploading, setUploading] = useState(false);
    const [showAddContact, setShowAddContact] = useState(false);
    const [newContact, setNewContact] = useState({ name: "", position: "", phone: "", email: "" });
    const [calculatingDistance, setCalculatingDistance] = useState(false);

    const queryClient = useQueryClient();

    const { data: companies = [] } = useQuery({
        queryKey: ['themeCompanies'],
        queryFn: () => base44.entities.ThemeCompany.list(),
        enabled: open
    });

    const updateCompanyMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.ThemeCompany.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['themeCompanies'] });
            toast.success("Ansprechpartner hinzugefügt");
        }
    });

    useEffect(() => {
        if (activity) {
            setFormData({
                ...activity,
                contact_person_ids: activity.contact_person_ids || [],
                activity_date: activity.activity_date ? activity.activity_date.slice(0, 16) : new Date().toISOString().slice(0, 16),
                requires_travel: activity.requires_travel || false,
                own_travel: activity.own_travel || false,
                start_location: activity.start_location || "Gartenstraße 17, 89257 Illertissen",
                destination_address: activity.destination_address || "",
                travel_distance_km: activity.travel_distance_km || 0
            });
        } else if (open) {
            setFormData({
                type: "notiz",
                title: "",
                content: "",
                company_id: "",
                contact_person_ids: [],
                activity_date: new Date().toISOString().slice(0, 16),
                appointment_date: "",
                file_urls: [],
                file_names: [],
                requires_travel: false,
                own_travel: false,
                start_location: "Gartenstraße 17, 89257 Illertissen",
                destination_address: "",
                travel_distance_km: 0
            });
        }
    }, [activity, open]);

    const selectedCompany = companies.find(c => c.id === formData.company_id);
    const availableContacts = selectedCompany?.contact_persons || [];

    const toggleContact = (contactName) => {
        const currentIds = formData.contact_person_ids || [];
        if (currentIds.includes(contactName)) {
            setFormData({...formData, contact_person_ids: currentIds.filter(id => id !== contactName)});
        } else {
            setFormData({...formData, contact_person_ids: [...currentIds, contactName]});
        }
    };

    const handleAddNewContact = () => {
        if (!newContact.name.trim() || !selectedCompany) return;
        
        const updatedContacts = [...(selectedCompany.contact_persons || []), newContact];
        updateCompanyMutation.mutate({
            id: selectedCompany.id,
            data: { ...selectedCompany, contact_persons: updatedContacts }
        });
        
        setFormData({...formData, contact_person_ids: [...(formData.contact_person_ids || []), newContact.name]});
        setNewContact({ name: "", position: "", phone: "", email: "" });
        setShowAddContact(false);
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        setUploading(true);
        
        try {
            const uploadPromises = files.map(async (file) => {
                const result = await base44.integrations.Core.UploadFile({ file });
                return { url: result.file_url, name: file.name };
            });
            
            const uploads = await Promise.all(uploadPromises);
            setFormData({
                ...formData,
                file_urls: [...(formData.file_urls || []), ...uploads.map(u => u.url)],
                file_names: [...(formData.file_names || []), ...uploads.map(u => u.name)]
            });
        } catch (error) {
            console.error("Upload error:", error);
        } finally {
            setUploading(false);
        }
    };

    const removeFile = (index) => {
        const newUrls = [...formData.file_urls];
        const newNames = [...formData.file_names];
        newUrls.splice(index, 1);
        newNames.splice(index, 1);
        setFormData({ ...formData, file_urls: newUrls, file_names: newNames });
    };

    const handleCalculateDistance = async () => {
        if (!formData.start_location || !formData.destination_address) {
            toast.error("Bitte Start- und Zielort eingeben");
            return;
        }

        setCalculatingDistance(true);
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Nutze Google Maps um die Fahrtstrecke mit dem Auto von "${formData.start_location}" nach "${formData.destination_address}" zu ermitteln. 
                Gib NUR die einfache Strecke (one-way) in Kilometern als Zahl zurück.`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        one_way_km: { type: "number" }
                    }
                }
            });

            if (response.one_way_km && response.one_way_km > 0) {
                const totalDistance = response.one_way_km * 2;
                setFormData({ ...formData, travel_distance_km: parseFloat(totalDistance.toFixed(1)) });
                toast.success(`Entfernung berechnet: ${totalDistance.toFixed(1)} km (Hin- und Rückfahrt)`);
            } else {
                toast.error("Keine gültigen Entfernungsdaten erhalten");
            }
        } catch (error) {
            toast.error("Fehler bei der Berechnung der Entfernung");
        } finally {
            setCalculatingDistance(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...formData, theme_id: themeId });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {activity ? "Aktivität bearbeiten" : "Neue Aktivität"}
                    </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Art der Aktivität *</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => setFormData({...formData, type: value})}
                            >
                                <SelectTrigger className="mt-1.5">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(activityTypes).map(([key, config]) => {
                                        const Icon = config.icon;
                                        return (
                                            <SelectItem key={key} value={key}>
                                                <div className="flex items-center gap-2">
                                                    <Icon className={`w-4 h-4 ${config.color}`} />
                                                    {config.label}
                                                </div>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Datum & Uhrzeit *</Label>
                            <Input
                                type="datetime-local"
                                value={formData.activity_date}
                                onChange={(e) => setFormData({...formData, activity_date: e.target.value})}
                                className="mt-1.5"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Termin (optional)</Label>
                        <Input
                            type="datetime-local"
                            value={formData.appointment_date}
                            onChange={(e) => setFormData({...formData, appointment_date: e.target.value})}
                            className="mt-1.5"
                            placeholder="Zukünftiger Termin"
                        />
                    </div>

                    <div>
                        <Label>Titel/Betreff *</Label>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            placeholder="z.B. Besprechung Angebot"
                            className="mt-1.5"
                            required
                        />
                    </div>

                    <div>
                        <Label>Webseiten-Link (optional)</Label>
                        <Input
                            value={formData.link || ""}
                            onChange={(e) => setFormData({...formData, link: e.target.value})}
                            placeholder="https://..."
                            className="mt-1.5"
                            type="url"
                        />
                    </div>

                    <div>
                        <Label>Firma</Label>
                        <Select
                            value={formData.company_id}
                            onValueChange={(value) => setFormData({...formData, company_id: value, contact_person_ids: []})}
                        >
                            <SelectTrigger className="mt-1.5">
                                <SelectValue placeholder="Firma auswählen (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                                {companies.map((company) => (
                                    <SelectItem key={company.id} value={company.id}>
                                        {company.company_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedCompany && (
                        <div>
                            <Label>Ansprechpartner</Label>
                            {availableContacts.length > 0 && (
                                <div className="mt-1.5 space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3 bg-slate-50">
                                    {availableContacts.map((contact, index) => (
                                        <div key={index} className="flex items-start gap-2">
                                            <Checkbox
                                                id={`contact-${index}`}
                                                checked={formData.contact_person_ids?.includes(contact.name)}
                                                onCheckedChange={() => toggleContact(contact.name)}
                                            />
                                            <label htmlFor={`contact-${index}`} className="text-sm cursor-pointer flex-1">
                                                <div className="font-medium text-slate-900">{contact.name}</div>
                                                {contact.position && <div className="text-xs text-slate-500">{contact.position}</div>}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {!showAddContact ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowAddContact(true)}
                                    className="mt-2 w-full"
                                >
                                    <User className="w-4 h-4 mr-2" />
                                    Neuer Ansprechpartner
                                </Button>
                            ) : (
                                <div className="mt-2 p-3 border rounded-lg bg-white space-y-2">
                                    <Input
                                        placeholder="Name *"
                                        value={newContact.name}
                                        onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                                        size="sm"
                                    />
                                    <Input
                                        placeholder="Position"
                                        value={newContact.position}
                                        onChange={(e) => setNewContact({...newContact, position: e.target.value})}
                                        size="sm"
                                    />
                                    <Input
                                        placeholder="Telefon"
                                        value={newContact.phone}
                                        onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                                        size="sm"
                                    />
                                    <Input
                                        placeholder="E-Mail"
                                        type="email"
                                        value={newContact.email}
                                        onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                                        size="sm"
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={handleAddNewContact}
                                            disabled={!newContact.name.trim()}
                                            className="flex-1"
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            Hinzufügen
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setShowAddContact(false);
                                                setNewContact({ name: "", position: "", phone: "", email: "" });
                                            }}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <Label>Beschreibung/Notizen</Label>
                        <Textarea
                            value={formData.content}
                            onChange={(e) => setFormData({...formData, content: e.target.value})}
                            placeholder="Details zur Aktivität..."
                            className="mt-1.5 h-32"
                        />
                    </div>

                    {(formData.type === 'besuch' || formData.type === 'meeting') && (
                        <div className="border-t pt-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Checkbox
                                    id="requires_travel"
                                    checked={formData.requires_travel}
                                    onCheckedChange={(checked) => setFormData({...formData, requires_travel: checked})}
                                />
                                <Label htmlFor="requires_travel" className="cursor-pointer font-medium">
                                    <div className="flex items-center gap-2">
                                        <Navigation className="w-4 h-4 text-teal-600" />
                                        Fahrt erforderlich (außer Haus)
                                    </div>
                                </Label>
                            </div>

                            {formData.requires_travel && (
                                <div className="space-y-3 pl-6 border-l-2 border-teal-200">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="own_travel"
                                            checked={formData.own_travel}
                                            onCheckedChange={(checked) => setFormData({...formData, own_travel: checked})}
                                        />
                                        <Label htmlFor="own_travel" className="cursor-pointer font-medium">
                                            Eigene Fahrt (selbst gefahren)
                                        </Label>
                                    </div>

                                    <div>
                                        <Label>Startort</Label>
                                        <Input
                                            value={formData.start_location}
                                            onChange={(e) => setFormData({...formData, start_location: e.target.value})}
                                            placeholder="z.B. Gartenstraße 17, 89257 Illertissen"
                                            className="mt-1.5"
                                        />
                                    </div>

                                    <div>
                                        <Label>Zieladresse</Label>
                                        <Input
                                            value={formData.destination_address}
                                            onChange={(e) => setFormData({...formData, destination_address: e.target.value})}
                                            placeholder="z.B. Kundenadresse"
                                            className="mt-1.5"
                                        />
                                    </div>

                                    <div>
                                        <Label>Gesamtkilometer (Hin- & Rückfahrt)</Label>
                                        <div className="flex gap-2 mt-1.5">
                                            <Input
                                                type="number"
                                                step="0.1"
                                                value={formData.travel_distance_km}
                                                onChange={(e) => setFormData({...formData, travel_distance_km: parseFloat(e.target.value) || 0})}
                                                placeholder="0.0"
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleCalculateDistance}
                                                disabled={calculatingDistance || !formData.start_location || !formData.destination_address}
                                            >
                                                {calculatingDistance ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Navigation className="w-4 h-4" />
                                                )}
                                                <span className="ml-2">Berechnen</span>
                                            </Button>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Klicken Sie auf "Berechnen" um die Entfernung automatisch zu ermitteln
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <Label>Dateien anhängen</Label>
                        <FileDropzone
                            onFilesSelected={async (files) => {
                                setUploading(true);
                                try {
                                    const uploadPromises = files.map(async (file) => {
                                        const result = await base44.integrations.Core.UploadFile({ file });
                                        return { url: result.file_url, name: file.name };
                                    });
                                    
                                    const uploads = await Promise.all(uploadPromises);
                                    setFormData({
                                        ...formData,
                                        file_urls: [...(formData.file_urls || []), ...uploads.map(u => u.url)],
                                        file_names: [...(formData.file_names || []), ...uploads.map(u => u.name)]
                                    });
                                } catch (error) {
                                    console.error("Upload error:", error);
                                } finally {
                                    setUploading(false);
                                }
                            }}
                            multiple={true}
                            className="mt-2"
                        />
                        {uploading && <p className="text-sm text-slate-500 mt-2">Dateien werden hochgeladen...</p>}
                        
                        {formData.file_urls && formData.file_urls.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {formData.file_urls.map((url, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded border">
                                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-2">
                                            <FileText className="w-4 h-4" />
                                            {formData.file_names?.[index] || `Datei ${index + 1}`}
                                        </a>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeFile(index)}
                                            className="text-red-600"
                                        >
                                            <Trash2 className="w-3 h-3" />
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