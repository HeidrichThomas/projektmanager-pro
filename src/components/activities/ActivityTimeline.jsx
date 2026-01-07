import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, Users, FileText, StickyNote, Pencil, Trash2, Download, ExternalLink, Handshake } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const typeConfig = {
    telefonat: { label: "Telefonat", icon: Phone, color: "bg-green-100 text-green-600 border-green-200" },
    meeting: { label: "Meeting", icon: Users, color: "bg-blue-100 text-blue-600 border-blue-200" },
    besuch: { label: "Besuch", icon: Handshake, color: "bg-indigo-100 text-indigo-600 border-indigo-200" },
    email: { label: "E-Mail", icon: Mail, color: "bg-purple-100 text-purple-600 border-purple-200" },
    notiz: { label: "Notiz", icon: StickyNote, color: "bg-amber-100 text-amber-600 border-amber-200" },
    dokument: { label: "Dokument", icon: FileText, color: "bg-slate-100 text-slate-600 border-slate-200" }
};

export default function ActivityTimeline({ activities, onEdit, onDelete }) {
    if (!activities || activities.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>Noch keine Aktivitäten vorhanden</p>
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-200" />
            
            <div className="space-y-6">
                {activities.map((activity) => {
                    const config = typeConfig[activity.type] || typeConfig.notiz;
                    const Icon = config.icon;
                    
                    return (
                        <div key={activity.id} className="relative pl-16">
                            <div className={`absolute left-3 w-7 h-7 rounded-full flex items-center justify-center border-2 ${config.color}`}>
                                <Icon className="w-3.5 h-3.5" />
                            </div>
                            
                            <Card className="p-4 hover:shadow-md transition-shadow group">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-semibold text-slate-900">{activity.title}</h4>
                                        <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                                            <Badge variant="outline" className={`${config.color} text-xs`}>
                                                {config.label}
                                            </Badge>
                                            <span>•</span>
                                            <span>
                                                {activity.activity_date && format(new Date(activity.activity_date), "dd.MM.yyyy 'um' HH:mm", { locale: de })}
                                            </span>
                                            {activity.contact_person && (
                                                <>
                                                    <span>•</span>
                                                    <span>{activity.contact_person}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="sm" variant="ghost" onClick={() => onEdit(activity)}>
                                            <Pencil className="w-3 h-3" />
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => onDelete(activity)} className="text-red-500 hover:text-red-700">
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                                
                                {activity.content && (
                                    <p className="text-sm text-slate-600 whitespace-pre-wrap mt-3">
                                        {activity.content}
                                    </p>
                                )}
                                
                                {activity.file_urls?.length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-slate-100">
                                        <p className="text-xs text-slate-500 mb-2">Angehängte Dateien:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {activity.file_urls.map((url, index) => (
                                                <a
                                                    key={index}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors"
                                                >
                                                    <Download className="w-3 h-3" />
                                                    {activity.file_names?.[index] || `Datei ${index + 1}`}
                                                    <ExternalLink className="w-3 h-3 ml-1" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}