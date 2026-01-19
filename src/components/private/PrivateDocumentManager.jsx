import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, File, Image, Trash2, Download, Calendar } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function PrivateDocumentManager({ themeId, documents }) {
    const [uploading, setUploading] = useState(false);
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

    const isImage = (filename) => {
        return /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
    };

    return (
        <div className="space-y-6">
            <Card className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Neues Dokument/Bild hochladen</h3>
                <div className="space-y-4">
                    <div>
                        <Label>Datei auswählen</Label>
                        <Input
                            type="file"
                            onChange={handleFileSelect}
                            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                        />
                        {selectedFile && (
                            <p className="text-sm text-slate-600 mt-1">
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
                <h3 className="font-semibold text-slate-900 mb-4">Dokumente & Bilder ({documents.length})</h3>
                {documents.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        <File className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p>Noch keine Dokumente hochgeladen</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {documents.map(doc => (
                            <Card key={doc.id} className="overflow-hidden group">
                                {isImage(doc.file_name) ? (
                                    <div className="aspect-video bg-slate-100 relative overflow-hidden">
                                        <img
                                            src={doc.file_url}
                                            alt={doc.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="aspect-video bg-slate-100 flex items-center justify-center">
                                        <File className="w-16 h-16 text-slate-400" />
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
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}