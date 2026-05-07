import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Phone, MapPin, Users, Mail, StickyNote, FileText, MessageSquare,
    Calendar, Bell, TrendingDown, TrendingUp, Clock, Pencil, Trash2, Download, Link2, Building2, User
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const typeConfig = {
    notiz:       { label: "Notiz",       icon: StickyNote,    dot: "bg-yellow-500",  color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    termin:      { label: "Termin",      icon: Calendar,      dot: "bg-blue-500",    color: "bg-blue-100 text-blue-700 border-blue-200" },
    erinnerung:  { label: "Erinnerung",  icon: Bell,          dot: "bg-amber-500",   color: "bg-amber-100 text-amber-700 border-amber-200" },
    ausgabe:     { label: "Ausgabe",     icon: TrendingDown,  dot: "bg-red-500",     color: "bg-red-100 text-red-700 border-red-200" },
    einnahme:    { label: "Einnahme",    icon: TrendingUp,    dot: "bg-green-500",   color: "bg-green-100 text-green-700 border-green-200" },
    dokument:    { label: "Dokument",    icon: FileText,      dot: "bg-purple-500",  color: "bg-purple-100 text-purple-700 border-purple-200" },
    telefonat:   { label: "Telefonat",   icon: Phone,         dot: "bg-cyan-500",    color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
    besuch:      { label: "Besuch",      icon: MapPin,        dot: "bg-emerald-500", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    email:       { label: "E-Mail",      icon: Mail,          dot: "bg-indigo-500",  color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
};

function getConf(type) {
    return typeConfig[type] || { label: type, icon: Clock, dot: "bg-slate-400", color: "bg-slate-100 text-slate-700 border-slate-200" };
}

export default function PrivateChronologie({ activities, onEdit, onDelete }) {
    const sorted = [...activities].sort((a, b) => {
        const da = a.activity_date ? new Date(a.activity_date) : new Date(a.created_date);
        const db = b.activity_date ? new Date(b.activity_date) : new Date(b.created_date);
        return db - da;
    });

    if (sorted.length === 0) {
        return (
            <div className="text-center py-12 text-slate-400">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Noch keine Aktivitäten vorhanden</p>
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200" />
            <div className="space-y-6">
                {sorted.map((activity) => {
                    const conf = getConf(activity.type);
                    const Icon = conf.icon;
                    const date = activity.activity_date
                        ? new Date(activity.activity_date)
                        : new Date(activity.created_date);

                    return (
                        <div key={activity.id} className="relative flex gap-4 pl-14">
                            <div className={`absolute left-3 top-2 w-5 h-5 rounded-full border-2 border-white shadow flex items-center justify-center ${conf.dot}`}>
                                <Icon className="w-2.5 h-2.5 text-white" />
                            </div>

                            <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group/card">
                                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                                    <Badge variant="secondary" className={`${conf.color} border text-xs`}>
                                        {conf.label}
                                    </Badge>
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs text-slate-400 whitespace-nowrap flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {format(date, "dd.MM.yyyy – HH:mm 'Uhr'", { locale: de })}
                                        </span>
                                        <div className="flex gap-1 ml-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                            {activity.link && (
                                                <Button size="icon" variant="ghost" className="h-6 w-6 text-blue-400 hover:text-blue-600"
                                                    onClick={() => window.open(activity.link, '_blank')}>
                                                    <Link2 className="w-3 h-3" />
                                                </Button>
                                            )}
                                            <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-400 hover:text-slate-700"
                                                onClick={() => onEdit(activity)}>
                                                <Pencil className="w-3 h-3" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-6 w-6 text-red-400 hover:text-red-600"
                                                onClick={() => onDelete(activity)}>
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <h4 className="font-semibold text-slate-900 text-sm mb-1">{activity.title}</h4>

                                {(activity.company || activity.contact_person) && (
                                    <div className="flex flex-wrap gap-3 mb-1 text-xs text-slate-500">
                                        {activity.company && (
                                            <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{activity.company}</span>
                                        )}
                                        {activity.contact_person && (
                                            <span className="flex items-center gap-1"><User className="w-3 h-3" />{activity.contact_person}</span>
                                        )}
                                    </div>
                                )}

                                {activity.content && (
                                    <p className="text-sm text-slate-600 mt-1 whitespace-pre-line line-clamp-3">{activity.content}</p>
                                )}

                                {activity.amount != null && (
                                    <p className={`text-sm font-medium mt-2 ${activity.type === 'ausgabe' ? 'text-red-600' : 'text-green-600'}`}>
                                        {activity.type === 'ausgabe' ? '-' : '+'}{Number(activity.amount).toFixed(2)} €
                                    </p>
                                )}

                                {activity.file_urls?.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        {activity.file_urls.map((url, idx) => (
                                            <a key={idx} href={url} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
                                                <Download className="w-3 h-3" />
                                                {activity.file_names?.[idx] || `Datei ${idx + 1}`}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}