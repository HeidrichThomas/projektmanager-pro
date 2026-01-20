import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, Bell, TrendingDown, TrendingUp, File, Pencil, Trash2, Download, Phone, MapPin, Link2 } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const activityTypes = {
    notiz: { label: "Notiz", icon: FileText, color: "bg-slate-100 text-slate-700" },
    termin: { label: "Termin", icon: Calendar, color: "bg-blue-100 text-blue-700" },
    erinnerung: { label: "Erinnerung", icon: Bell, color: "bg-amber-100 text-amber-700" },
    ausgabe: { label: "Ausgabe", icon: TrendingDown, color: "bg-red-100 text-red-700" },
    einnahme: { label: "Einnahme", icon: TrendingUp, color: "bg-green-100 text-green-700" },
    dokument: { label: "Dokument", icon: File, color: "bg-purple-100 text-purple-700" },
    telefonat: { label: "Telefonat", icon: Phone, color: "bg-cyan-100 text-cyan-700" },
    besuch: { label: "Besuch", icon: MapPin, color: "bg-emerald-100 text-emerald-700" }
};

export default function PrivateActivityTimeline({ activities, onEdit, onDelete }) {
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
            <div className="absolute left-9 top-0 bottom-0 w-0.5 bg-slate-200" />
            
            {activities.map((activity) => {
                const config = activityTypes[activity.type] || activityTypes.notiz;
                const Icon = config.icon;
                
                return (
                    <div key={activity.id} className="relative group flex gap-3 p-4 hover:bg-slate-50 rounded-lg transition-all">
                        <div className={`relative z-10 w-10 h-10 rounded-full ${config.color.split(' ')[0]} flex items-center justify-center shrink-0 border-2 border-white`}>
                            <Icon className={`w-5 h-5 ${config.color.split(' ')[1]}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-900 mb-1">{activity.title}</h3>
                                    
                                    {activity.content && (
                                        <p className="text-sm text-slate-600 mb-2">{activity.content}</p>
                                    )}
                                    
                                    <p className="text-sm text-slate-400">
                                        {format(new Date(activity.activity_date), "dd. MMM. yyyy, HH:mm", { locale: de })} Uhr
                                    </p>
                                    
                                    {activity.amount && (
                                        <p className={`text-sm font-medium mt-2 ${activity.type === 'ausgabe' ? 'text-red-600' : 'text-green-600'}`}>
                                            {activity.type === 'ausgabe' ? '-' : '+'}{activity.amount.toFixed(2)} €
                                        </p>
                                    )}
                                    
                                    {activity.file_urls && activity.file_urls.length > 0 && (
                                        <div className="mt-3 space-y-1">
                                            {activity.file_urls.map((url, idx) => (
                                                <a
                                                    key={idx}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    {activity.file_names?.[idx] || `Datei ${idx + 1}`}
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
                                        {activity.link && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => window.open(activity.link, '_blank')}
                                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                            >
                                                <Link2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                        <Button size="sm" variant="ghost" onClick={() => onEdit(activity)}>
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => onDelete(activity)} className="text-red-600 hover:text-red-700">
                                            <Trash2 className="w-4 h-4" />
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