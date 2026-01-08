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
        <div className="space-y-3">
            {activities.map((activity) => {
                const config = typeConfig[activity.type] || typeConfig.notiz;
                const Icon = config.icon;
                
                return (
                    <div key={activity.id} className="group flex gap-3 p-4 hover:bg-slate-50 rounded-lg transition-all">
                        <div className={`w-10 h-10 rounded-full ${config.color.split(' ')[0]} flex items-center justify-center shrink-0`}>
                            <Icon className={`w-5 h-5 ${config.color.split(' ')[1]}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-slate-900 mb-1">{activity.title}</h4>
                                    
                                    {activity.content && (
                                        <p className="text-sm text-slate-600 mb-2 whitespace-pre-wrap">{activity.content}</p>
                                    )}
                                    
                                    <p className="text-sm text-slate-400">
                                        {activity.activity_date && format(new Date(activity.activity_date), "dd. MMM. yyyy", { locale: de })}
                                    </p>
                                    
                                    {activity.contact_person && (
                                        <p className="text-sm text-slate-600 mt-2">{activity.contact_person}</p>
                                    )}
                                    
                                    {activity.file_urls?.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {activity.file_urls.map((url, index) => (
                                                <a
                                                    key={index}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 rounded-lg text-sm text-slate-600 hover:bg-slate-200 transition-colors"
                                                >
                                                    <Download className="w-3 h-3" />
                                                    {activity.file_names?.[index] || `Datei ${index + 1}`}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex flex-col items-end gap-2">
                                    <Badge variant="outline" className={`${config.color} text-xs`}>
                                        {config.label}
                                    </Badge>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="sm" variant="ghost" onClick={() => onEdit(activity)}>
                                            <Pencil className="w-3 h-3" />
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => onDelete(activity)} className="text-red-500 hover:text-red-700">
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}