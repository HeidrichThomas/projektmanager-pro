import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
    Phone, Users, MapPin, Mail, FileText, StickyNote, 
    Calendar, Clock, Building2, Milestone
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const typeConfig = {
    // Projekt-Aktivitäten
    telefonat:  { label: "Telefonat",  icon: Phone,      color: "bg-blue-100 text-blue-700 border-blue-200",    dot: "bg-blue-500" },
    meeting:    { label: "Meeting",    icon: Users,      color: "bg-violet-100 text-violet-700 border-violet-200", dot: "bg-violet-500" },
    besuch:     { label: "Besuch",     icon: MapPin,     color: "bg-orange-100 text-orange-700 border-orange-200", dot: "bg-orange-500" },
    email:      { label: "E-Mail",     icon: Mail,       color: "bg-sky-100 text-sky-700 border-sky-200",        dot: "bg-sky-500" },
    notiz:      { label: "Notiz",      icon: StickyNote, color: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: "bg-yellow-500" },
    dokument:   { label: "Dokument",   icon: FileText,   color: "bg-slate-100 text-slate-700 border-slate-200",  dot: "bg-slate-500" },
    // Themen-Aktivitäten
    meilenstein:{ label: "Meilenstein",icon: Milestone,  color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
    termin:     { label: "Termin",     icon: Calendar,   color: "bg-pink-100 text-pink-700 border-pink-200",     dot: "bg-pink-500" },
};

function getTypeConf(type) {
    return typeConfig[type] || { label: type, icon: Clock, color: "bg-slate-100 text-slate-700 border-slate-200", dot: "bg-slate-400" };
}

export default function CustomerTimeline({ open, onClose, customer, projects }) {
    const projectIds = (projects || []).map(p => p.id);

    const { data: allActivities = [] } = useQuery({
        queryKey: ['allActivities'],
        queryFn: () => base44.entities.Activity.list(),
        enabled: open && projectIds.length > 0
    });

    // Nur Aktivitäten der Kundenprojekte
    const activities = allActivities
        .filter(a => projectIds.includes(a.project_id))
        .map(a => ({
            ...a,
            _date: a.activity_date ? new Date(a.activity_date) : new Date(a.created_date),
            _project: projects.find(p => p.id === a.project_id)
        }))
        .sort((a, b) => b._date - a._date);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Building2 className="w-5 h-5 text-slate-600" />
                        Chronologie – {customer?.company}
                    </DialogTitle>
                    <p className="text-sm text-slate-500">{activities.length} Einträge, sortiert nach Datum</p>
                </DialogHeader>

                {activities.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>Noch keine Aktivitäten vorhanden</p>
                    </div>
                ) : (
                    <div className="relative mt-4">
                        {/* Vertikale Zeitstrahllinie */}
                        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200" />

                        <div className="space-y-6">
                            {activities.map((activity, idx) => {
                                const conf = getTypeConf(activity.type);
                                const Icon = conf.icon;
                                return (
                                    <div key={activity.id || idx} className="relative flex gap-4 pl-14">
                                        {/* Dot auf der Linie */}
                                        <div className={`absolute left-3 top-2 w-5 h-5 rounded-full border-2 border-white shadow flex items-center justify-center ${conf.dot}`}>
                                            <Icon className="w-2.5 h-2.5 text-white" />
                                        </div>

                                        <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Badge variant="secondary" className={`${conf.color} border text-xs`}>
                                                        {conf.label}
                                                    </Badge>
                                                    {activity._project && (
                                                        <span className="text-xs text-slate-400">
                                                            {activity._project.name}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-slate-400 whitespace-nowrap flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {format(activity._date, "dd.MM.yyyy – HH:mm 'Uhr'", { locale: de })}
                                                </span>
                                            </div>

                                            <h4 className="font-semibold text-slate-900 text-sm mb-1">{activity.title}</h4>

                                            {activity.contact_person && (
                                                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {activity.contact_person}
                                                </p>
                                            )}

                                            {activity.content && (
                                                <p className="text-sm text-slate-600 mt-1 line-clamp-3 whitespace-pre-line">
                                                    {activity.content}
                                                </p>
                                            )}

                                            {activity.appointment_date && (
                                                <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-blue-600 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    Folgetermin: {format(new Date(activity.appointment_date), "dd.MM.yyyy HH:mm 'Uhr'", { locale: de })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}