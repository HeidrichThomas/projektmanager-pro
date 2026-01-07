import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Phone, Mail, Users, FileText, StickyNote, Upload, Save, X, Loader2 } from "lucide-react";

const typeConfig = {
    telefonat: { label: "Telefonat", icon: Phone, color: "text-green-600" },
    meeting: { label: "Meeting", icon: Users, color: "text-blue-600" },
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
        file_names: []
    });
    const [uploading, setUploading] = useState(false);

    const { data: customers = [] } = useQuery({
        queryKey: ['customers'],
        queryFn: () => base44.entities.Customer.list()
    });

    useEffect(() => {
        if (activity) {
            setFormData({
                ...activity,
                activity_date: activity.activity_date ? activity.activity_date.slice(0, 16) : new Date().toISOString().slice(0, 16)
            });
        } else {
            setFormData({
                project_id: projectId,
                type: "telefonat",
                title: "",
                content: "",
                contact_person: "",
                activity_date: new Date().toISOString().slice(0, 16),
                file_urls: [],
                file_names: []
            });
        }
    }, [activity, projectId, open]);

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
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-slate-700 font-medium">Gesprächspartner</Label>
                            <Select
                                value={formData.contact_person}
                                onValueChange={(value) => setFormData({...formData, contact_person: value})}
                            >
                                <SelectTrigger className="mt-1.5">
                                    <SelectValue placeholder="Auswählen" />
                                </SelectTrigger>
                                <SelectContent>
                                    {customers.map((customer) => (
                                        <SelectItem 
                                            key={customer.id} 
                                            value={customer.contact_name || customer.company}
                                        >
                                            {customer.company}
                                            {customer.contact_name && ` (${customer.contact_name})`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                    </div>
                    
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