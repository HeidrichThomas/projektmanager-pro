import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
    ArrowLeft, Layers, Pencil, Trash2, Plus, Clock, CheckSquare
} from "lucide-react";
import { toast } from "sonner";
import SubThemeForm from "@/components/themes/SubThemeForm";
import ThemeActivityForm from "@/components/themes/ThemeActivityForm";
import ThemeActivityTimeline from "@/components/themes/ThemeActivityTimeline";

const statusConfig = {
    geplant: { label: "Geplant", color: "bg-blue-100 text-blue-700 border-blue-200" },
    in_arbeit: { label: "In Arbeit", color: "bg-amber-100 text-amber-700 border-amber-200" },
    pausiert: { label: "Pausiert", color: "bg-slate-100 text-slate-700 border-slate-200" },
    abgeschlossen: { label: "Abgeschlossen", color: "bg-emerald-100 text-emerald-700 border-emerald-200" }
};

export default function SubThemeDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const subThemeId = urlParams.get('id');
    const parentThemeId = urlParams.get('themeId');

    const [showForm, setShowForm] = useState(false);
    const [showActivityForm, setShowActivityForm] = useState(false);
    const [editingActivity, setEditingActivity] = useState(null);
    const [newChecklistItem, setNewChecklistItem] = useState("");

    const queryClient = useQueryClient();

    const { data: subThemes = [] } = useQuery({
        queryKey: ['subThemes', parentThemeId],
        queryFn: () => base44.entities.SubTheme.filter({ parent_theme_id: parentThemeId }),
        enabled: !!parentThemeId
    });

    const { data: activities = [] } = useQuery({
        queryKey: ['themeActivities', subThemeId],
        queryFn: () => base44.entities.ThemeActivity.filter({ sub_theme_id: subThemeId }, '-activity_date'),
        enabled: !!subThemeId
    });

    const { data: checklistItems = [] } = useQuery({
        queryKey: ['checklistItems', subThemeId],
        queryFn: () => base44.entities.ChecklistItem.filter({ sub_theme_id: subThemeId }, 'order'),
        enabled: !!subThemeId
    });

    const subTheme = subThemes.find(st => st.id === subThemeId);
    const status = subTheme ? (statusConfig[subTheme.status] || statusConfig.geplant) : null;

    const updateSubThemeMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.SubTheme.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subThemes', parentThemeId] });
            setShowForm(false);
            toast.success("Unterthema aktualisiert");
        }
    });

    const deleteSubThemeMutation = useMutation({
        mutationFn: (id) => base44.entities.SubTheme.delete(id),
        onSuccess: () => {
            window.location.href = createPageUrl("ThemeDetail") + `?id=${parentThemeId}`;
        }
    });

    const createActivityMutation = useMutation({
        mutationFn: (data) => base44.entities.ThemeActivity.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['themeActivities', subThemeId] });
            setShowActivityForm(false);
            toast.success("Aktivität erstellt");
        }
    });

    const updateActivityMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.ThemeActivity.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['themeActivities', subThemeId] });
            setShowActivityForm(false);
            setEditingActivity(null);
            toast.success("Aktivität aktualisiert");
        }
    });

    const deleteActivityMutation = useMutation({
        mutationFn: (id) => base44.entities.ThemeActivity.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['themeActivities', subThemeId] });
            toast.success("Aktivität gelöscht");
        }
    });

    const createChecklistMutation = useMutation({
        mutationFn: (data) => base44.entities.ChecklistItem.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['checklistItems', subThemeId] });
            setNewChecklistItem("");
            toast.success("Punkt hinzugefügt");
        }
    });

    const updateChecklistMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.ChecklistItem.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['checklistItems', subThemeId] });
        }
    });

    const deleteChecklistMutation = useMutation({
        mutationFn: (id) => base44.entities.ChecklistItem.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['checklistItems', subThemeId] });
            toast.success("Punkt gelöscht");
        }
    });

    const handleActivitySave = (data) => {
        const activityData = {
            ...data,
            theme_id: parentThemeId,
            sub_theme_id: subThemeId
        };
        
        if (editingActivity) {
            updateActivityMutation.mutate({ id: editingActivity.id, data: activityData });
        } else {
            createActivityMutation.mutate(activityData);
        }
    };

    const handleAddChecklistItem = (e) => {
        e.preventDefault();
        if (!newChecklistItem.trim()) return;
        
        createChecklistMutation.mutate({
            sub_theme_id: subThemeId,
            title: newChecklistItem,
            order: checklistItems.length
        });
    };

    if (!subTheme) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-8">
                <div className="max-w-5xl mx-auto">
                    <Skeleton className="h-8 w-48 mb-4" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }

    const completedCount = checklistItems.filter(item => item.is_completed).length;
    const totalCount = checklistItems.length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <Link to={createPageUrl("ThemeDetail") + `?id=${parentThemeId}`} className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Zurück zum Hauptthema
                    </Link>
                    
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center shrink-0">
                                <Layers className="w-8 h-8 text-purple-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{subTheme.name}</h1>
                                
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <Badge variant="secondary" className={`${status.color} border`}>
                                        {status.label}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setShowForm(true)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Bearbeiten
                            </Button>
                            <Button 
                                variant="outline" 
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => {
                                    if (confirm("Möchten Sie dieses Unterthema wirklich löschen?")) {
                                        deleteSubThemeMutation.mutate(subThemeId);
                                    }
                                }}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <Card className="mb-8 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-slate-700">Fortschritt</span>
                            <span className="text-2xl font-bold text-slate-900">{subTheme.progress || 0}%</span>
                        </div>
                        <Progress value={subTheme.progress || 0} className="h-3" />
                        {subTheme.description && (
                            <p className="mt-4 pt-4 border-t text-slate-600">{subTheme.description}</p>
                        )}
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CheckSquare className="w-5 h-5 text-slate-600" />
                                    Checkliste
                                </CardTitle>
                                <span className="text-sm text-slate-500">
                                    {completedCount} / {totalCount}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddChecklistItem} className="flex gap-2 mb-4">
                                <Input
                                    value={newChecklistItem}
                                    onChange={(e) => setNewChecklistItem(e.target.value)}
                                    placeholder="Neuen Punkt hinzufügen..."
                                    className="flex-1"
                                />
                                <Button type="submit" size="sm">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </form>

                            <div className="space-y-2">
                                {checklistItems.length > 0 ? (
                                    checklistItems.map(item => (
                                        <div key={item.id} className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 group">
                                            <Checkbox
                                                checked={item.is_completed}
                                                onCheckedChange={(checked) => {
                                                    updateChecklistMutation.mutate({
                                                        id: item.id,
                                                        data: { ...item, is_completed: checked }
                                                    });
                                                }}
                                            />
                                            <span className={`flex-1 text-sm ${item.is_completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                                {item.title}
                                            </span>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-red-600"
                                                onClick={() => deleteChecklistMutation.mutate(item.id)}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-500 text-center py-4">
                                        Noch keine Punkte hinzugefügt
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-slate-600" />
                                    Aktivitäten
                                </CardTitle>
                                <Button 
                                    size="sm"
                                    onClick={() => { 
                                        setEditingActivity(null); 
                                        setShowActivityForm(true); 
                                    }} 
                                    className="bg-slate-800 hover:bg-slate-900"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Neu
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="max-h-[500px] overflow-y-auto">
                            <ThemeActivityTimeline
                                activities={activities}
                                onEdit={(activity) => { 
                                    setEditingActivity(activity); 
                                    setShowActivityForm(true); 
                                }}
                                onDelete={(activity) => {
                                    if (confirm("Aktivität wirklich löschen?")) {
                                        deleteActivityMutation.mutate(activity.id);
                                    }
                                }}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <SubThemeForm
                open={showForm}
                onClose={() => setShowForm(false)}
                onSave={(data) => updateSubThemeMutation.mutate({ id: subThemeId, data })}
                subTheme={subTheme}
                parentThemeId={parentThemeId}
            />

            <ThemeActivityForm
                open={showActivityForm}
                onClose={() => { 
                    setShowActivityForm(false); 
                    setEditingActivity(null); 
                }}
                onSave={handleActivitySave}
                activity={editingActivity}
                themeId={parentThemeId}
            />
        </div>
    );
}