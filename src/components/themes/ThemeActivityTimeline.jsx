import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Phone, Users, Mail, Milestone, Pencil, Trash2, Download, Building2, User } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const activityTypes = {
    notiz: { label: "Notiz", icon: FileText, color: "bg-slate-100 text-slate-700 border-slate-300" },
    telefonat: { label: "Telefonat", icon: Phone, color: "bg-blue-100 text-blue-700 border-blue-300" },
    meeting: { label: "Meeting", icon: Users, color: "bg-purple-100 text-purple-700 border-purple-300" },
    email: { label: "E-Mail", icon: Mail, color: "bg-green-100 text-green-700 border-green-300" },
    dokument: { label: "Dokument", icon: FileText, color: "bg-orange-100 text-orange-700 border-orange-300" },
    meilenstein: { label: "Meilenstein", icon: Milestone, color: "bg-amber-100 text-amber-700 border-amber-300" }
};

export default function ThemeActivityTimeline({ activities, onEdit, onDelete }) {
    const { data: companies = [] } = useQuery({
        queryKey: ['themeCompanies'],
        queryFn: () => base44.entities.ThemeCompany.list()
    });

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
                const config = activityTypes[activity.type] || activityTypes.notiz;
                const Icon = config.icon;
                const company = companies.find(c => c.id === activity.company_id);
                
                return (
                    <div key={activity.id} className="group flex gap-3 p-4 hover:bg-slate-50 rounded-lg transition-all">
                        <div className={`w-10 h-10 rounded-full ${config.color.split(' ')[0]} flex items-center justify-center shrink-0`}>
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
                                        {format(new Date(activity.activity_date), "dd. MMM. yyyy", { locale: de })}
                                    </p>
                                    
                                    {company && (
                                        <div className="text-sm text-slate-600 mt-2 flex items-center gap-1">
                                            <Building2 className="w-3 h-3" />
                                            {company.company_name}
                                        </div>
                                    )}
                                    
                                    {activity.contact_person_ids && activity.contact_person_ids.length > 0 && (
                                        <div className="text-sm text-slate-600 mt-1 flex items-start gap-1">
                                            <User className="w-3 h-3 mt-0.5" />
                                            <span>{activity.contact_person_ids.join(', ')}</span>
                                        </div>
                                    )}
                                    
                                    {activity.file_urls && activity.file_urls.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {activity.file_urls.map((url, index) => (
                                                <a
                                                    key={index}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700 transition-colors"
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
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => onEdit(activity)}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => onDelete(activity)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
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