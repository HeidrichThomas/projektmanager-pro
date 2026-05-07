import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Upload, File, FileText, Image as ImageIcon, Trash2, Download, Calendar, X, ZoomIn } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import FileDropzone from "@/components/ui/file-dropzone";

export default function PrivateDocumentManager({ themeId, documents, activities = [] }) {
    const [uploading, setUploading] = useState(false);
    const [previewDoc, setPreviewDoc] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "sonstiges",
        expiry_date: ""
    });
    const [selectedFile, setSelectedFile] = useState(null);

    const queryClient = useQueryClient();

    const createDocumentMutation = useMutation({
        mutationFn: (data) => base44.entities.PrivateDocument.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['privateDocuments', themeId] });
            setFormData({ title: "", description: "", category: "sonstiges", expiry_date: "" });
            setSelectedFile(null);
        }
    });

    const deleteDocumentMutation = useMutation({
        mutationFn: (id) => base44.entities.PrivateDocument.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['privateDocuments', themeId] });
        }
    });

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            if (!formData.title) {
                setFormData({ ...formData, title: file.name });
            }
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !formData.title) return;

        setUploading(true);
        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file: selectedFile });
            
            await createDocumentMutation.mutateAsync({
                theme_id: themeId,
                title: formData.title,
                description: formData.description,
                category: formData.category,
                expiry_date: formData.expiry_date || null,
                file_url: file_url,
                file_name: selectedFile.name
            });
        } finally {
            setUploading(false);
        }
    };

    const isImage = (filename) => /\.(jpg|jpeg|png|gif|webp)$/i.test(filename || "");
    const isPdf = (filename) => /\.pdf$/i.test(filename || "");

    // Sammle Dokumente aus Aktivitäten
    const activityDocuments = [];
    activities.forEach(activity => {
        if (activity.file_urls && activity.file_urls.length > 0) {
            activity.file_urls.forEach((url, index) => {
                activityDocuments.push({
                    id: `activity-${activity.id}-${index}`,
                    file_url: url,
                    file_name: activity.file_names?.[index] || `Datei ${index + 1}`,
                    title: activity.file_names?.[index] || `Datei ${index + 1}`,
                    description: `Von Aktivität: ${activity.title}`,
                    category: 'sonstiges',
                    source: 'activity',
                    activity_id: activity.id
                });
            });
        }
    });

    const allDocuments = [...documents, ...activityDocuments];

    return (
        <div className="space-y-6">
            <Card className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Neues Dokument/Bild hochladen</h3>
                <div className="space-y-4">
                    <div>
                        <Label>Datei auswählen</Label>
                        <FileDropzone
                            onFilesSelected={(files) => {
                                const file = files[0];
                                setSelectedFile(file);
                                if (!formData.title) {
                                    setFormData({ ...formData, title: file.name });
                                }
                            }}
                            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                            multiple={false}
                            className="mt-2"
                        />
                        {selectedFile && (
                            <p className="text-sm text-slate-600 mt-2">
                                Ausgewählt: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                            </p>
                        )}
                    </div>

                    <div>
                        <Label>Titel</Label>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Dokumenttitel"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Kategorie</Label>
                            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="vertrag">Vertrag</SelectItem>
                                    <SelectItem value="rechnung">Rechnung</SelectItem>
                                    <SelectItem value="versicherung">Versicherung</SelectItem>
                                    <SelectItem value="gesundheit">Gesundheit</SelectItem>
                                    <SelectItem value="finanzen">Finanzen</SelectItem>
                                    <SelectItem value="sonstiges">Sonstiges</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Ablaufdatum (optional)</Label>
                            <Input
                                type="date"
                                value={formData.expiry_date}
                                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Beschreibung (optional)</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={2}
                        />
                    </div>

                    <Button onClick={handleUpload} disabled={!selectedFile || !formData.title || uploading} className="w-full">
                        <Upload className="w-4 h-4 mr-2" />
                        {uploading ? "Wird hochgeladen..." : "Hochladen"}
                    </Button>
                </div>
            </Card>

            <div>
                <h3 className="font-semibold text-slate-900 mb-4">Dokumente & Bilder ({allDocuments.length})</h3>
                {allDocuments.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        <File className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p>Noch keine Dokumente hochgeladen</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {allDocuments.map(doc => (
                            <Card key={doc.id} className="overflow-hidden group">
                                {isImage(doc.file_name) ? (
                                    <div
                                        className="aspect-video bg-slate-100 relative overflow-hidden cursor-zoom-in"
                                        onClick={() => setPreviewDoc(doc)}
                                    >
                                        <img
                                            src={doc.file_url}
                                            alt={doc.title}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                                        />
                                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                                            <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                                        </div>
                                    </div>
                                ) : isPdf(doc.file_name) ? (
                                    <div
                                        className="aspect-video bg-slate-50 relative overflow-hidden cursor-pointer border-b border-slate-100"
                                        onClick={() => setPreviewDoc(doc)}
                                    >
                                        <iframe
                                            src={`${doc.file_url}#toolbar=0&navpanes=0&scrollbar=0`}
                                            className="w-full h-full pointer-events-none"
                                            title={doc.title}
                                        />
                                        <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors flex items-center justify-center">
                                            <ZoomIn className="w-8 h-8 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="aspect-video bg-slate-100 flex items-center justify-center">
                                        <FileText className="w-16 h-16 text-slate-400" />
                                    </div>
                                )}
                                <div className="p-4">
                                    <h4 className="font-semibold text-slate-900 mb-1 truncate">{doc.title}</h4>
                                    {doc.description && (
                                        <p className="text-sm text-slate-600 line-clamp-2 mb-2">{doc.description}</p>
                                    )}
                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                        <span>{doc.category}</span>
                                        {doc.expiry_date && (
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {format(new Date(doc.expiry_date), "dd.MM.yyyy", { locale: de })}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <Button size="sm" variant="outline" className="flex-1" asChild>
                                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                                <Download className="w-3 h-3 mr-1" />
                                                Öffnen
                                            </a>
                                        </Button>
                                        {doc.source !== 'activity' && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => {
                                                    if (confirm("Dokument löschen?")) {
                                                        deleteDocumentMutation.mutate(doc.id);
                                                    }
                                                }}
                                                className="text-red-600"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
            {/* Vorschau-Dialog */}
            <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
                <DialogContent className="max-w-4xl w-full p-2">
                    <div className="flex items-center justify-between px-4 py-2 border-b">
                        <span className="font-medium text-slate-900 truncate">{previewDoc?.title}</span>
                        <div className="flex gap-2 shrink-0">
                            <Button size="sm" variant="outline" asChild>
                                <a href={previewDoc?.file_url} target="_blank" rel="noopener noreferrer">
                                    <Download className="w-4 h-4 mr-1" />
                                    Öffnen
                                </a>
                            </Button>
                        </div>
                    </div>
                    <div className="w-full" style={{ height: "75vh" }}>
                        {previewDoc && isImage(previewDoc.file_name) ? (
                            <img
                                src={previewDoc.file_url}
                                alt={previewDoc.title}
                                className="w-full h-full object-contain"
                            />
                        ) : previewDoc && isPdf(previewDoc.file_name) ? (
                            <iframe
                                src={previewDoc.file_url}
                                className="w-full h-full rounded"
                                title={previewDoc?.title}
                            />
                        ) : null}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}