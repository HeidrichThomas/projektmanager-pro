import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { 
    ArrowLeft, Building2, Calendar, Lightbulb, 
    Pencil, Trash2, User, Briefcase, Plus, Clock
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "sonner";

import ThemeForm from "@/components/themes/ThemeForm";
import ThemeActivityForm from "@/components/themes/ThemeActivityForm";
import ThemeActivityTimeline from "@/components/themes/ThemeActivityTimeline";
import DocumentManagement from "@/components/themes/DocumentManagement";

const statusConfig = {
    geplant: { label: "Geplant", color: "bg-blue-100 text-blue-700 border-blue-200" },
    in_arbeit: { label: "In Arbeit", color: "bg-amber-100 text-amber-700 border-amber-200" },
    pausiert: { label: "Pausiert", color: "bg-slate-100 text-slate-700 border-slate-200" },
    abgeschlossen: { label: "Abgeschlossen", color: "bg-emerald-100 text-emerald-700 border-emerald-200" }
};

export default function ThemeDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const themeId = urlParams.get('id');

    const [showThemeForm, setShowThemeForm] = useState(false);
    const [showActivityForm, setShowActivityForm] = useState(false);
    const [editingActivity, setEditingActivity] = useState(null);
    const [showDocuments, setShowDocuments] = useState(false);

    const queryClient = useQueryClient();

    const { data: themes = [] } = useQuery({
        queryKey: ['themes'],
        queryFn: () => base44.entities.Theme.list()
    });

    const { data: sectors = [] } = useQuery({
        queryKey: ['sectors'],
        queryFn: () => base44.entities.Sector.list()
    });

    const { data: companies = [] } = useQuery({
        queryKey: ['themeCompanies'],
        queryFn: () => base44.entities.ThemeCompany.list()
    });

    const { data: activities = [], isLoading: loadingActivities } = useQuery({
        queryKey: ['themeActivities', themeId],
        queryFn: () => base44.entities.ThemeActivity.filter({ theme_id: themeId }, '-activity_date'),
        enabled: !!themeId
    });

    const theme = themes.find(t => t.id === themeId);
    const sector = theme?.sector_id ? sectors.find(s => s.id === theme.sector_id) : null;
    const status = theme ? (statusConfig[theme.status] || statusConfig.geplant) : null;
    const themeCompanies = theme?.company_ids ? companies.filter(c => theme.company_ids.includes(c.id)) : [];

    const updateThemeMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.Theme.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['themes'] });
            setShowThemeForm(false);
            toast.success("Thema aktualisiert");
        }
    });

    const deleteThemeMutation = useMutation({
        mutationFn: (id) => base44.entities.Theme.delete(id),
        onSuccess: () => {
            window.location.href = createPageUrl("Themes");
        }
    });

    const createActivityMutation = useMutation({
        mutationFn: (data) => base44.entities.ThemeActivity.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['themeActivities', themeId] });
            setShowActivityForm(false);
            toast.success("Aktivität erfolgreich angelegt");
        }
    });

    const updateActivityMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.ThemeActivity.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['themeActivities', themeId] });
            setShowActivityForm(false);
            setEditingActivity(null);
            toast.success("Aktivität aktualisiert");
        }
    });

    const deleteActivityMutation = useMutation({
        mutationFn: (id) => base44.entities.ThemeActivity.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['themeActivities', themeId] });
            toast.success("Aktivität gelöscht");
        }
    });

    const handleProgressChange = (value) => {
        updateThemeMutation.mutate({ id: themeId, data: { progress: value[0] } });
    };

    const handleActivitySave = (data) => {
        if (editingActivity) {
            updateActivityMutation.mutate({ id: editingActivity.id, data });
        } else {
            createActivityMutation.mutate(data);
        }
    };

    if (!theme) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-8">
                <div className="max-w-5xl mx-auto">
                    <Skeleton className="h-8 w-48 mb-4" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link to={createPageUrl("Themes")} className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Zurück zu Themen
                    </Link>
                    
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center shrink-0">
                                <Lightbulb className="w-8 h-8 text-amber-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{theme.name}</h1>
                                
                                <div className="mt-1 space-y-1">
                                    {sector && (
                                        <p className="text-slate-500 flex items-center gap-2">
                                            <Briefcase className="w-4 h-4" />
                                            {sector.name}
                                        </p>
                                    )}
                                </div>
                                
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <Badge variant="secondary" className={`${status.color} border`}>
                                        {status.label}
                                    </Badge>
                                    {theme.start_date && (
                                        <Badge variant="outline">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {format(new Date(theme.start_date), "dd.MM.yyyy", { locale: de })}
                                            {theme.end_date && ` - ${format(new Date(theme.end_date), "dd.MM.yyyy", { locale: de })}`}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setShowThemeForm(true)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Bearbeiten
                            </Button>
                            <Button 
                                variant="outline" 
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => {
                                    if (confirm("Möchten Sie dieses Thema wirklich löschen?")) {
                                        deleteThemeMutation.mutate(themeId);
                                    }
                                }}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Progress Card */}
                <Card className="mb-8 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-slate-700">Themenfortschritt</span>
                                    <span className="text-2xl font-bold text-slate-900">{theme.progress || 0}%</span>
                                </div>
                                <Progress value={theme.progress || 0} className="h-3" />
                            </div>
                            <div className="sm:w-48">
                                <p className="text-xs text-slate-500 mb-2">Fortschritt anpassen:</p>
                                <Slider
                                    value={[theme.progress || 0]}
                                    onValueChange={handleProgressChange}
                                    max={100}
                                    step={5}
                                />
                            </div>
                        </div>
                        {theme.description && (
                            <p className="mt-4 pt-4 border-t text-slate-600">{theme.description}</p>
                        )}
                    </CardContent>
                </Card>

                {/* Companies */}
                {themeCompanies.length > 0 && (
                    <Card className="mb-8 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-slate-600" />
                                Beteiligte Firmen
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                {themeCompanies.map(company => (
                                    <div key={company.id} className="group p-4 border rounded-lg hover:border-amber-300 transition-colors relative">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => {
                                                if (confirm(`${company.company_name} wirklich entfernen?`)) {
                                                    const newCompanyIds = theme.company_ids.filter(id => id !== company.id);
                                                    updateThemeMutation.mutate({ 
                                                        id: themeId, 
                                                        data: { ...theme, company_ids: newCompanyIds } 
                                                    });
                                                }
                                            }}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                        <h4 className="font-semibold text-slate-900 mb-2 pr-8">{company.company_name}</h4>
                                        {(company.street || company.city) && (
                                            <p className="text-sm text-slate-600 mb-3">
                                                {company.street && `${company.street}, `}
                                                {company.postal_code} {company.city}
                                            </p>
                                        )}
                                        {company.contact_persons && company.contact_persons.length > 0 && (
                                            <div className="space-y-2 mt-3 pt-3 border-t">
                                                <p className="text-xs font-medium text-slate-500 uppercase">Ansprechpartner</p>
                                                <div className="grid sm:grid-cols-2 gap-2">
                                                    {company.contact_persons.map((contact, idx) => (
                                                        <div key={idx} className="p-2 bg-slate-50 rounded">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <User className="w-3 h-3 text-slate-500" />
                                                                <span className="text-sm font-medium text-slate-900">{contact.name}</span>
                                                            </div>
                                                            {contact.position && (
                                                                <p className="text-xs text-slate-600 ml-5">{contact.position}</p>
                                                            )}
                                                            <div className="text-xs text-slate-500 ml-5 space-y-0.5 mt-1">
                                                                {contact.phone && <div>☎ {contact.phone}</div>}
                                                                {contact.mobile_phone && <div>📱 {contact.mobile_phone}</div>}
                                                                {contact.email && (
                                                                    <a href={`mailto:${contact.email}`} className="text-amber-600 hover:text-amber-700 block">
                                                                        ✉ {contact.email}
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Activities Timeline */}
                <Card className="mb-8 shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Clock className="w-5 h-5 text-slate-600" />
                                Chronologischer Verlauf
                            </CardTitle>
                            <div className="flex gap-2">
                                <Button onClick={() => setShowDocuments(true)} variant="outline">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Dokumente ({documents.length})
                                </Button>
                                <Button onClick={() => { setEditingActivity(null); setShowActivityForm(true); }} className="bg-slate-800 hover:bg-slate-900">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Neue Aktivität
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loadingActivities ? (
                            <div className="space-y-4">
                                {Array(3).fill(0).map((_, i) => (
                                    <Skeleton key={i} className="h-24 w-full" />
                                ))}
                            </div>
                        ) : (
                            <ThemeActivityTimeline
                                activities={activities}
                                onEdit={(activity) => { setEditingActivity(activity); setShowActivityForm(true); }}
                                onDelete={(activity) => {
                                    if (confirm("Aktivität wirklich löschen?")) {
                                        deleteActivityMutation.mutate(activity.id);
                                    }
                                }}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Forms */}
            <ThemeForm
                open={showThemeForm}
                onClose={() => setShowThemeForm(false)}
                onSave={(data) => updateThemeMutation.mutate({ id: themeId, data })}
                theme={theme}
            />

            <ThemeActivityForm
                open={showActivityForm}
                onClose={() => { setShowActivityForm(false); setEditingActivity(null); }}
                onSave={handleActivitySave}
                activity={editingActivity}
                themeId={themeId}
            />

            <DocumentManagement
                open={showDocuments}
                onClose={() => setShowDocuments(false)}
                themeId={themeId}
            />
        </div>
    );
}