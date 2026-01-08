import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Trash2, Download, Plus, X, Save, Filter, Pencil } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const categoryConfig = {
    vertrag: { label: "Vertrag", color: "bg-blue-100 text-blue-700" },
    angebot: { label: "Angebot", color: "bg-purple-100 text-purple-700" },
    rechnung: { label: "Rechnung", color: "bg-green-100 text-green-700" },
    präsentation: { label: "Präsentation", color: "bg-amber-100 text-amber-700" },
    bericht: { label: "Bericht", color: "bg-slate-100 text-slate-700" },
    sonstiges: { label: "Sonstiges", color: "bg-gray-100 text-gray-700" }
};

export default function DocumentManagement({ open, onClose, themeId = null }) {
    const [showForm, setShowForm] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [editingDocument, setEditingDocument] = useState(null);
    const [formData, setFormData] = useState({
        theme_id: themeId || "",
        title: "",
        description: "",
        category: "sonstiges",
        file_url: "",
        file_name: "",
        file_size: 0
    });

    const queryClient = useQueryClient();

    const { data: documents = [] } = useQuery({
        queryKey: ['themeDocuments', themeId],
        queryFn: () => themeId 
            ? base44.entities.ThemeDocument.filter({ theme_id: themeId }, '-created_date')
            : base44.entities.ThemeDocument.list('-created_date'),
        enabled: open
    });

    const { data: themes = [] } = useQuery({
        queryKey: ['themes'],
        queryFn: () => base44.entities.Theme.list(),
        enabled: open && !themeId
    });

    const createDocumentMutation = useMutation({
        mutationFn: (data) => base44.entities.ThemeDocument.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['themeDocuments'] });
            setShowForm(false);
            resetForm();
            toast.success("Dokument erfolgreich hochgeladen");
        }
    });

    const updateDocumentMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.ThemeDocument.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['themeDocuments'] });
            setShowForm(false);
            setEditingDocument(null);
            resetForm();
            toast.success("Dokument aktualisiert");
        }
    });

    const deleteDocumentMutation = useMutation({
        mutationFn: (id) => base44.entities.ThemeDocument.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['themeDocuments'] });
            toast.success("Dokument gelöscht");
        }
    });

    const resetForm = () => {
        setFormData({
            theme_id: themeId || "",
            title: "",
            description: "",
            category: "sonstiges",
            file_url: "",
            file_name: "",
            file_size: 0
        });
        setEditingDocument(null);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            setFormData({
                ...formData,
                file_url,
                file_name: file.name,
                file_size: file.size,
                title: formData.title || file.name
            });
        } catch (error) {
            toast.error("Upload fehlgeschlagen");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingDocument) {
            updateDocumentMutation.mutate({ id: editingDocument.id, data: formData });
        } else {
            createDocumentMutation.mutate(formData);
        }
    };

    const handleEdit = (doc) => {
        setEditingDocument(doc);
        setFormData({
            theme_id: doc.theme_id || "",
            title: doc.title,
            description: doc.description || "",
            category: doc.category,
            file_url: doc.file_url,
            file_name: doc.file_name,
            file_size: doc.file_size
        });
        setShowForm(true);
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const filteredDocuments = documents.filter(doc => 
        categoryFilter === "all" || doc.category === categoryFilter
    );

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-slate-600" />
                        {showForm && editingDocument ? "Dokument bearbeiten" : (themeId ? "Themen-Dokumente" : "Dokumentenverwaltung")}
                    </DialogTitle>
                </DialogHeader>

                {!showForm ? (
                    <div className="mt-4">
                        <div className="flex flex-col sm:flex-row gap-3 mb-4">
                            <Button onClick={() => setShowForm(true)} className="bg-slate-800 hover:bg-slate-900">
                                <Plus className="w-4 h-4 mr-2" />
                                Neues Dokument hochladen
                            </Button>
                            
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="w-full sm:w-48">
                                    <SelectValue placeholder="Kategorie filtern" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Alle Kategorien</SelectItem>
                                    {Object.entries(categoryConfig).map(([key, config]) => (
                                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            {filteredDocuments.map((doc) => {
                                const theme = themes.find(t => t.id === doc.theme_id);
                                const category = categoryConfig[doc.category] || categoryConfig.sonstiges;
                                
                                return (
                                    <Card key={doc.id} className="p-4 hover:shadow-md transition-all group">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <FileText className="w-5 h-5 text-slate-400" />
                                                    <h3 className="font-semibold text-slate-900">{doc.title}</h3>
                                                </div>
                                                
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    <Badge variant="secondary" className={category.color}>
                                                        {category.label}
                                                    </Badge>
                                                    {theme && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {theme.name}
                                                        </Badge>
                                                    )}
                                                    <span className="text-xs text-slate-500">
                                                        {formatFileSize(doc.file_size)}
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        {format(new Date(doc.created_date), "dd.MM.yyyy", { locale: de })}
                                                    </span>
                                                </div>
                                                
                                                {doc.description && (
                                                    <p className="text-sm text-slate-600">{doc.description}</p>
                                                )}
                                                
                                                <p className="text-xs text-slate-500 mt-1">{doc.file_name}</p>
                                            </div>
                                            
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleEdit(doc)}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => window.open(doc.file_url, '_blank')}
                                                >
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        if (confirm("Dokument wirklich löschen?")) {
                                                            deleteDocumentMutation.mutate(doc.id);
                                                        }
                                                    }}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                            
                            {filteredDocuments.length === 0 && (
                                <p className="text-center py-8 text-slate-500">
                                    Noch keine Dokumente vorhanden
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        {!editingDocument && (
                            <div>
                                <Label>Datei hochladen *</Label>
                                <div className="mt-1.5">
                                    <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-slate-400 transition-colors bg-slate-50">
                                        <div className="text-center">
                                            <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                                            <p className="text-sm text-slate-600">
                                                {uploading ? "Wird hochgeladen..." : formData.file_name || "Datei auswählen"}
                                            </p>
                                        </div>
                                        <input
                                            type="file"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            disabled={uploading}
                                        />
                                    </label>
                                </div>
                            </div>
                        )}
                        
                        {editingDocument && (
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <p className="text-sm text-slate-600 mb-1">Aktuelle Datei:</p>
                                <p className="text-sm font-medium text-slate-900">{formData.file_name}</p>
                            </div>
                        )}

                        {!themeId && (
                            <div>
                                <Label>Thema</Label>
                                <Select
                                    value={formData.theme_id}
                                    onValueChange={(value) => setFormData({...formData, theme_id: value})}
                                >
                                    <SelectTrigger className="mt-1.5">
                                        <SelectValue placeholder="Thema auswählen (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {themes.map((theme) => (
                                            <SelectItem key={theme.id} value={theme.id}>
                                                {theme.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div>
                            <Label>Titel *</Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                placeholder="Dokumenttitel"
                                className="mt-1.5"
                                required
                            />
                        </div>

                        <div>
                            <Label>Kategorie</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => setFormData({...formData, category: value})}
                            >
                                <SelectTrigger className="mt-1.5">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(categoryConfig).map(([key, config]) => (
                                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Beschreibung</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                placeholder="Beschreibung des Dokuments..."
                                className="mt-1.5"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                                <X className="w-4 h-4 mr-2" />
                                Zurück
                            </Button>
                            <Button 
                                type="submit" 
                                className="bg-slate-800 hover:bg-slate-900"
                                disabled={!formData.file_url || !formData.title}
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {editingDocument ? "Aktualisieren" : "Speichern"}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}