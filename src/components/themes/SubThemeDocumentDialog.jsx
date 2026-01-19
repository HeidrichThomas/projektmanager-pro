import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Upload, X, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const categoryConfig = {
    vertrag: { label: "Vertrag", color: "bg-purple-100 text-purple-700" },
    angebot: { label: "Angebot", color: "bg-blue-100 text-blue-700" },
    rechnung: { label: "Rechnung", color: "bg-green-100 text-green-700" },
    präsentation: { label: "Präsentation", color: "bg-orange-100 text-orange-700" },
    bericht: { label: "Bericht", color: "bg-slate-100 text-slate-700" },
    sonstiges: { label: "Sonstiges", color: "bg-slate-100 text-slate-700" }
};

export default function SubThemeDocumentDialog({ open, onClose, subThemeId }) {
    const [showForm, setShowForm] = useState(false);
    const [editingDoc, setEditingDoc] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "sonstiges",
        file_url: "",
        file_name: "",
        file_size: 0
    });
    const [uploading, setUploading] = useState(false);

    const queryClient = useQueryClient();

    const { data: documents = [], isLoading } = useQuery({
        queryKey: ['subThemeDocuments', subThemeId],
        queryFn: () => base44.entities.SubThemeDocument.filter({ sub_theme_id: subThemeId }),
        enabled: open && !!subThemeId
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.SubThemeDocument.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subThemeDocuments', subThemeId] });
            toast.success("Dokument gespeichert");
            resetForm();
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.SubThemeDocument.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subThemeDocuments', subThemeId] });
            toast.success("Dokument aktualisiert");
            resetForm();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.SubThemeDocument.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subThemeDocuments', subThemeId] });
            toast.success("Dokument gelöscht");
        }
    });

    const resetForm = () => {
        setShowForm(false);
        setEditingDoc(null);
        setFormData({
            title: "",
            description: "",
            category: "sonstiges",
            file_url: "",
            file_name: "",
            file_size: 0
        });
    };

    useEffect(() => {
        if (editingDoc) {
            setFormData({
                title: editingDoc.title || "",
                description: editingDoc.description || "",
                category: editingDoc.category || "sonstiges",
                file_url: editingDoc.file_url || "",
                file_name: editingDoc.file_name || "",
                file_size: editingDoc.file_size || 0
            });
            setShowForm(true);
        }
    }, [editingDoc]);

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const result = await base44.integrations.Core.UploadFile({ file });
            setFormData({
                ...formData,
                file_url: result.file_url,
                file_name: file.name,
                file_size: file.size
            });
        } catch (error) {
            toast.error("Fehler beim Hochladen");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.file_url) {
            toast.error("Titel und Datei sind erforderlich");
            return;
        }

        const data = { ...formData, sub_theme_id: subThemeId };
        
        if (editingDoc) {
            updateMutation.mutate({ id: editingDoc.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Dokumente</DialogTitle>
                </DialogHeader>

                {!showForm ? (
                    <div className="space-y-4">
                        <Button
                            onClick={() => setShowForm(true)}
                            className="w-full bg-slate-800 hover:bg-slate-900"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Dokument hochladen
                        </Button>

                        {isLoading ? (
                            <p className="text-sm text-slate-500 text-center py-8">Lädt...</p>
                        ) : documents.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                <p>Noch keine Dokumente</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {documents.map((doc) => {
                                    const config = categoryConfig[doc.category] || categoryConfig.sonstiges;
                                    return (
                                        <div
                                            key={doc.id}
                                            className="border rounded-lg p-4 hover:shadow-md transition-shadow group"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-medium text-slate-900">{doc.title}</h4>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setEditingDoc(doc)}
                                                    >
                                                        <FileText className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-red-600"
                                                        onClick={() => {
                                                            if (confirm("Dokument wirklich löschen?")) {
                                                                deleteMutation.mutate(doc.id);
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                            {doc.description && (
                                                <p className="text-sm text-slate-600 mb-2">{doc.description}</p>
                                            )}
                                            <Badge className={`${config.color} text-xs mb-2`}>
                                                {config.label}
                                            </Badge>
                                            <a
                                                href={doc.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                                            >
                                                <FileText className="w-4 h-4" />
                                                {doc.file_name}
                                            </a>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Titel *</Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Dokumenttitel..."
                                required
                            />
                        </div>

                        <div>
                            <Label>Beschreibung</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Optional..."
                                rows={3}
                            />
                        </div>

                        <div>
                            <Label>Kategorie</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => setFormData({ ...formData, category: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(categoryConfig).map(([key, config]) => (
                                        <SelectItem key={key} value={key}>
                                            {config.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Datei hochladen *</Label>
                            <Input
                                type="file"
                                onChange={handleFileUpload}
                                disabled={uploading}
                                className="cursor-pointer"
                            />
                            {uploading && <p className="text-sm text-slate-500 mt-2">Lädt hoch...</p>}
                            {formData.file_name && (
                                <p className="text-sm text-slate-600 mt-2">
                                    <FileText className="w-4 h-4 inline mr-1" />
                                    {formData.file_name}
                                </p>
                            )}
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                                <X className="w-4 h-4 mr-2" />
                                Abbrechen
                            </Button>
                            <Button type="submit" className="flex-1 bg-slate-800 hover:bg-slate-900">
                                {editingDoc ? "Speichern" : "Hochladen"}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}