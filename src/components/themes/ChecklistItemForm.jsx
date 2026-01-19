import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Upload, FileText, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function ChecklistItemForm({ open, onClose, onSave, item }) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        status: "geplant",
        priority: "mittel",
        due_date: "",
        file_urls: [],
        file_names: []
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (item) {
            setFormData({
                title: item.title || "",
                description: item.description || "",
                status: item.status || "geplant",
                priority: item.priority || "mittel",
                due_date: item.due_date || "",
                file_urls: item.file_urls || [],
                file_names: item.file_names || []
            });
        } else {
            setFormData({
                title: "",
                description: "",
                status: "geplant",
                priority: "mittel",
                due_date: "",
                file_urls: [],
                file_names: []
            });
        }
    }, [item, open]);

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
            toast.success("Dateien hochgeladen");
        } catch (error) {
            toast.error("Fehler beim Hochladen");
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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title.trim()) return;
        onSave(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{item ? "Kachel bearbeiten" : "Neue Kachel"}</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>Titel *</Label>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Titel der Kachel..."
                            required
                        />
                    </div>

                    <div>
                        <Label>Beschreibung</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Details..."
                            rows={3}
                        />
                    </div>

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
                                    <SelectItem value="erledigt">Erledigt</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Priorität</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(value) => setFormData({ ...formData, priority: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="niedrig">Niedrig</SelectItem>
                                    <SelectItem value="mittel">Mittel</SelectItem>
                                    <SelectItem value="hoch">Hoch</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label>Fälligkeitsdatum</Label>
                        <Input
                            type="date"
                            value={formData.due_date}
                            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                            className="mt-1.5"
                        />
                    </div>

                    <div>
                        <Label>Dateien anhängen</Label>
                        <Input
                            type="file"
                            onChange={handleFileUpload}
                            multiple
                            disabled={uploading}
                            className="cursor-pointer mt-1.5"
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

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Abbrechen
                        </Button>
                        <Button type="submit" className="bg-slate-800 hover:bg-slate-900">
                            {item ? "Speichern" : "Erstellen"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}