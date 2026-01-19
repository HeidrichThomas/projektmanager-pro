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
import PrivateAppointmentCalendar from "@/components/private/PrivateAppointmentCalendar";
import PrivateAppointmentForm from "@/components/private/PrivateAppointmentForm";
import PrivateDocumentManager from "@/components/private/PrivateDocumentManager";

export default function PrivateThemeDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const themeId = urlParams.get('id');

    const [showActivityForm, setShowActivityForm] = useState(false);
    const [editingActivity, setEditingActivity] = useState(null);
    const [showAppointmentForm, setShowAppointmentForm] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState(null);

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

    const { data: appointments = [] } = useQuery({
        queryKey: ['privateAppointments', themeId],
        queryFn: () => base44.entities.PrivateAppointment.filter({ theme_id: themeId }, '-start_date')
    });

    const { data: documents = [] } = useQuery({
        queryKey: ['privateDocuments', themeId],
        queryFn: () => base44.entities.PrivateDocument.filter({ theme_id: themeId }, '-created_date')
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

    const createAppointmentMutation = useMutation({
        mutationFn: (data) => base44.entities.PrivateAppointment.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['privateAppointments', themeId] });
            setShowAppointmentForm(false);
            setEditingAppointment(null);
        }
    });

    const updateAppointmentMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.PrivateAppointment.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['privateAppointments', themeId] });
            setShowAppointmentForm(false);
            setEditingAppointment(null);
        }
    });

    const deleteAppointmentMutation = useMutation({
        mutationFn: (id) => base44.entities.PrivateAppointment.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['privateAppointments', themeId] });
        }
    });

    const handleSaveActivity = (data) => {
        if (editingActivity) {
            updateActivityMutation.mutate({ id: editingActivity.id, data });
        } else {
            createActivityMutation.mutate({ ...data, theme_id: themeId });
        }
    };

    const handleSaveAppointment = (data) => {
        if (editingAppointment) {
            updateAppointmentMutation.mutate({ id: editingAppointment.id, data });
        } else {
            createAppointmentMutation.mutate({ ...data, theme_id: themeId });
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
                        <PrivateAppointmentCalendar
                            appointments={appointments}
                            onAdd={() => { setEditingAppointment(null); setShowAppointmentForm(true); }}
                            onEdit={(apt) => { setEditingAppointment(apt); setShowAppointmentForm(true); }}
                            onDelete={(apt) => {
                                if (confirm("Termin löschen?")) {
                                    deleteAppointmentMutation.mutate(apt.id);
                                }
                            }}
                        />
                    </TabsContent>

                    <TabsContent value="documents">
                        <PrivateDocumentManager
                            themeId={themeId}
                            documents={documents}
                        />
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

                {showAppointmentForm && (
                    <PrivateAppointmentForm
                        appointment={editingAppointment}
                        onSave={handleSaveAppointment}
                        onClose={() => {
                            setShowAppointmentForm(false);
                            setEditingAppointment(null);
                        }}
                    />
                )}
            </div>
        </div>
    );
}