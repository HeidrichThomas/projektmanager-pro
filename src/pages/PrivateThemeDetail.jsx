import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, FileText, CheckSquare, Calendar, File } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PrivateActivityForm from "@/components/private/PrivateActivityForm";
import PrivateActivityTimeline from "@/components/private/PrivateActivityTimeline";
import PrivateTaskList from "@/components/private/PrivateTaskList";

export default function PrivateThemeDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const themeId = urlParams.get('id');

    const [showActivityForm, setShowActivityForm] = useState(false);
    const [editingActivity, setEditingActivity] = useState(null);

    const queryClient = useQueryClient();

    const { data: theme } = useQuery({
        queryKey: ['privateTheme', themeId],
        queryFn: () => base44.entities.PrivateTheme.list().then(themes => themes.find(t => t.id === themeId))
    });

    const { data: activities = [] } = useQuery({
        queryKey: ['privateActivities', themeId],
        queryFn: () => base44.entities.PrivateActivity.filter({ theme_id: themeId }, '-activity_date')
    });

    const { data: tasks = [] } = useQuery({
        queryKey: ['privateTasks', themeId],
        queryFn: () => base44.entities.PrivateTask.filter({ theme_id: themeId })
    });

    const createActivityMutation = useMutation({
        mutationFn: (data) => base44.entities.PrivateActivity.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['privateActivities', themeId] });
            setShowActivityForm(false);
            setEditingActivity(null);
        }
    });

    const updateActivityMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.PrivateActivity.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['privateActivities', themeId] });
            setShowActivityForm(false);
            setEditingActivity(null);
        }
    });

    const deleteActivityMutation = useMutation({
        mutationFn: (id) => base44.entities.PrivateActivity.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['privateActivities', themeId] });
        }
    });

    const handleSaveActivity = (data) => {
        if (editingActivity) {
            updateActivityMutation.mutate({ id: editingActivity.id, data });
        } else {
            createActivityMutation.mutate({ ...data, theme_id: themeId });
        }
    };

    if (!theme) {
        return <div className="p-6">Thema wird geladen...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <Link to={createPageUrl("PrivateThemes")}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Zurück zu Private Themen
                        </Button>
                    </Link>
                </div>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{theme.name}</h1>
                    {theme.description && (
                        <p className="text-slate-600">{theme.description}</p>
                    )}
                </div>

                <Tabs defaultValue="activities" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="activities">
                            <FileText className="w-4 h-4 mr-2" />
                            Aktivitäten
                        </TabsTrigger>
                        <TabsTrigger value="tasks">
                            <CheckSquare className="w-4 h-4 mr-2" />
                            Aufgaben
                        </TabsTrigger>
                        <TabsTrigger value="appointments">
                            <Calendar className="w-4 h-4 mr-2" />
                            Termine
                        </TabsTrigger>
                        <TabsTrigger value="documents">
                            <File className="w-4 h-4 mr-2" />
                            Dokumente
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="activities">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Aktivitäten</CardTitle>
                                    <Button onClick={() => { setEditingActivity(null); setShowActivityForm(true); }}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Neue Aktivität
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <PrivateActivityTimeline
                                    activities={activities}
                                    onEdit={(activity) => { setEditingActivity(activity); setShowActivityForm(true); }}
                                    onDelete={(activity) => {
                                        if (confirm("Aktivität löschen?")) {
                                            deleteActivityMutation.mutate(activity.id);
                                        }
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="tasks">
                        <Card>
                            <CardHeader>
                                <CardTitle>Aufgaben</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <PrivateTaskList themeId={themeId} tasks={tasks} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="appointments">
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-center text-slate-500">Termine-Verwaltung kommt bald...</p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="documents">
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-center text-slate-500">Dokumente-Verwaltung kommt bald...</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {showActivityForm && (
                    <PrivateActivityForm
                        activity={editingActivity}
                        onSave={handleSaveActivity}
                        onClose={() => {
                            setShowActivityForm(false);
                            setEditingActivity(null);
                        }}
                    />
                )}
            </div>
        </div>
    );
}