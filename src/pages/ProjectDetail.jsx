import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format as formatDate } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { 
    ArrowLeft, Building2, Calendar, FolderKanban, 
    Plus, Phone, FileText, CheckSquare, Pencil, Trash2, User, Clock, Euro
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "sonner";

import ProjectForm from "@/components/projects/ProjectForm";
import ActivityForm from "@/components/activities/ActivityForm";
import ActivityTimeline from "@/components/activities/ActivityTimeline";
import TaskForm from "@/components/tasks/TaskForm";
import TaskList from "@/components/tasks/TaskList";
import TimeTracker from "@/components/time/TimeTracker";
import ManualTimeEntry from "@/components/time/ManualTimeEntry";
import TimeCalendar from "@/components/time/TimeCalendar";
import BillingDialog from "@/components/time/BillingDialog";
import BilledTimesList from "@/components/time/BilledTimesList";
import EditTimeEntry from "@/components/time/EditTimeEntry";
import TimeReport from "@/components/time/TimeReport";
import FloatingTimer from "@/components/time/FloatingTimer";

const statusConfig = {
    geplant: { label: "Geplant", color: "bg-blue-100 text-blue-700 border-blue-200" },
    in_arbeit: { label: "In Arbeit", color: "bg-amber-100 text-amber-700 border-amber-200" },
    pausiert: { label: "Pausiert", color: "bg-slate-100 text-slate-700 border-slate-200" },
    abgeschlossen: { label: "Abgeschlossen", color: "bg-emerald-100 text-emerald-700 border-emerald-200" }
};

export default function ProjectDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

    const [showProjectForm, setShowProjectForm] = useState(false);
    const [showActivityForm, setShowActivityForm] = useState(false);
    const [editingActivity, setEditingActivity] = useState(null);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [activeTab, setActiveTab] = useState("activities");
    const [showManualTime, setShowManualTime] = useState(false);
    const [showBilling, setShowBilling] = useState(false);
    const [showEditTime, setShowEditTime] = useState(false);
    const [editingTimeEntry, setEditingTimeEntry] = useState(null);
    const [showTimeReport, setShowTimeReport] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [showFloatingTimer, setShowFloatingTimer] = useState(true);

    const queryClient = useQueryClient();

    const { data: projects = [] } = useQuery({
        queryKey: ['projects'],
        queryFn: () => base44.entities.Project.list()
    });

    const { data: customers = [] } = useQuery({
        queryKey: ['customers'],
        queryFn: () => base44.entities.Customer.list()
    });

    const { data: activities = [], isLoading: loadingActivities } = useQuery({
        queryKey: ['activities', projectId],
        queryFn: () => base44.entities.Activity.filter({ project_id: projectId }, '-activity_date'),
        enabled: !!projectId
    });

    const { data: tasks = [], isLoading: loadingTasks } = useQuery({
        queryKey: ['tasks', projectId],
        queryFn: () => base44.entities.Task.filter({ project_id: projectId }),
        enabled: !!projectId
    });

    const { data: timeEntries = [], isLoading: loadingTime } = useQuery({
        queryKey: ['timeEntries', projectId],
        queryFn: () => base44.entities.TimeEntry.filter({ project_id: projectId }, '-date'),
        enabled: !!projectId
    });

    const project = projects.find(p => p.id === projectId);
    const customer = project ? customers.find(c => c.id === project.customer_id) : null;
    const status = project ? (statusConfig[project.status] || statusConfig.geplant) : null;

    // Mutations
    const updateProjectMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.Project.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            setShowProjectForm(false);
            toast.success("Projekt aktualisiert");
        }
    });

    const deleteProjectMutation = useMutation({
        mutationFn: (id) => base44.entities.Project.delete(id),
        onSuccess: () => {
            window.location.href = createPageUrl("Projects");
        }
    });

    const createActivityMutation = useMutation({
        mutationFn: (data) => base44.entities.Activity.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities', projectId] });
            setShowActivityForm(false);
            toast.success("Aktivität erfolgreich angelegt");
        }
    });

    const updateActivityMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.Activity.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities', projectId] });
            setShowActivityForm(false);
            setEditingActivity(null);
            toast.success("Aktivität aktualisiert");
        }
    });

    const deleteActivityMutation = useMutation({
        mutationFn: (id) => base44.entities.Activity.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities', projectId] });
            toast.success("Aktivität gelöscht");
        }
    });

    const createTaskMutation = useMutation({
        mutationFn: (data) => base44.entities.Task.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
            setShowTaskForm(false);
            toast.success("Aufgabe erfolgreich angelegt");
        }
    });

    const updateTaskMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
            setShowTaskForm(false);
            setEditingTask(null);
            toast.success("Aufgabe aktualisiert");
        }
    });

    const deleteTaskMutation = useMutation({
        mutationFn: (id) => base44.entities.Task.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
            toast.success("Aufgabe gelöscht");
        }
    });

    const createTimeEntryMutation = useMutation({
        mutationFn: (data) => base44.entities.TimeEntry.create({ ...data, project_id: projectId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timeEntries', projectId] });
            toast.success("Arbeitszeit erfasst");
        }
    });

    const updateTimeEntriesMutation = useMutation({
        mutationFn: async ({ ids, data }) => {
            await Promise.all(ids.map(id => base44.entities.TimeEntry.update(id, data)));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timeEntries', projectId] });
            toast.success("Zeiten abgerechnet");
        }
    });

    const updateTimeEntryMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.TimeEntry.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timeEntries', projectId] });
            toast.success("Zeiteintrag aktualisiert");
            setShowEditTime(false);
            setEditingTimeEntry(null);
        }
    });

    const deleteTimeEntryMutation = useMutation({
        mutationFn: (id) => base44.entities.TimeEntry.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timeEntries', projectId] });
            toast.success("Zeiteintrag gelöscht");
        }
    });

    const handleProgressChange = (value) => {
        updateProjectMutation.mutate({ id: projectId, data: { progress: value[0] } });
    };

    const handleActivitySave = (data) => {
        if (editingActivity) {
            updateActivityMutation.mutate({ id: editingActivity.id, data });
        } else {
            createActivityMutation.mutate(data);
        }
    };

    const handleTaskSave = (data) => {
        if (editingTask) {
            updateTaskMutation.mutate({ id: editingTask.id, data });
        } else {
            createTaskMutation.mutate(data);
        }
    };

    const handleTaskStatusChange = (task, newStatus) => {
        updateTaskMutation.mutate({ id: task.id, data: { ...task, status: newStatus } });
    };

    const handleTaskLogWork = (task, data) => {
        updateTaskMutation.mutate({ id: task.id, data: { ...task, ...data } });
    };

    const handleTimeSave = (data) => {
        createTimeEntryMutation.mutate({
            ...data,
            date: data.date || new Date().toISOString().slice(0, 10)
        });
        setShowManualTime(false);
    };

    const handleBilling = (entryIds, hourlyRate, totalAmount) => {
        const updates = {
            is_billed: true,
            billing_date: new Date().toISOString().slice(0, 10),
            hourly_rate: hourlyRate,
            amount: totalAmount / entryIds.length
        };
        updateTimeEntriesMutation.mutate({ ids: entryIds, data: updates });
        setShowBilling(false);
    };

    const handleEditTimeEntry = (entry) => {
        setEditingTimeEntry(entry);
        setShowEditTime(true);
    };

    const handleTimeEntrySave = (data) => {
        updateTimeEntryMutation.mutate({ id: editingTimeEntry.id, data });
    };

    if (!project) {
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
                    <Link to={createPageUrl("Projects")} className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Zurück zu Projekte
                    </Link>
                    
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center shrink-0">
                                <FolderKanban className="w-8 h-8 text-indigo-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{project.name}</h1>
                                {customer && (
                                    <div className="mt-1">
                                        <p className="text-slate-500 flex items-center gap-2">
                                            <Building2 className="w-4 h-4" />
                                            {customer.company}
                                        </p>
                                        {project.contact_person && (
                                            <p className="text-slate-500 flex items-center gap-2 text-sm">
                                                <User className="w-3 h-3" />
                                                {project.contact_person}
                                            </p>
                                        )}
                                    </div>
                                )}
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <Badge variant="secondary" className={`${status.color} border`}>
                                        {status.label}
                                    </Badge>
                                    {project.start_date && (
                                        <Badge variant="outline">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {format(new Date(project.start_date), "dd.MM.yyyy", { locale: de })}
                                            {project.end_date && ` - ${format(new Date(project.end_date), "dd.MM.yyyy", { locale: de })}`}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setShowProjectForm(true)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Bearbeiten
                            </Button>
                            <Button 
                                variant="outline" 
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => {
                                    if (confirm("Möchten Sie dieses Projekt wirklich löschen?")) {
                                        deleteProjectMutation.mutate(projectId);
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
                                    <span className="text-sm font-medium text-slate-700">Projektfortschritt</span>
                                    <span className="text-2xl font-bold text-slate-900">{project.progress || 0}%</span>
                                </div>
                                <Progress value={project.progress || 0} className="h-3" />
                            </div>
                            <div className="sm:w-48">
                                <p className="text-xs text-slate-500 mb-2">Fortschritt anpassen:</p>
                                <Slider
                                    value={[project.progress || 0]}
                                    onValueCommit={handleProgressChange}
                                    max={100}
                                    step={5}
                                />
                            </div>
                        </div>
                        {project.description && (
                            <p className="mt-4 pt-4 border-t text-slate-600">{project.description}</p>
                        )}
                    </CardContent>
                </Card>

                {/* Customer & Suppliers Info */}
                {customer && (
                    <Card className="mb-8 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-slate-600" />
                                Kundeninformationen
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                {customer.contact_name && (
                                    <div>
                                        <p className="text-slate-500">Ansprechpartner</p>
                                        <p className="font-medium">{customer.contact_name}</p>
                                    </div>
                                )}
                                {customer.phone && (
                                    <div>
                                        <p className="text-slate-500">Telefon</p>
                                        <a href={`tel:${customer.phone}`} className="font-medium text-indigo-600 hover:text-indigo-700">
                                            {customer.phone}
                                        </a>
                                    </div>
                                )}
                                {customer.email && (
                                    <div>
                                        <p className="text-slate-500">E-Mail</p>
                                        <a href={`mailto:${customer.email}`} className="font-medium text-indigo-600 hover:text-indigo-700">
                                            {customer.email}
                                        </a>
                                    </div>
                                )}
                                {(customer.street || customer.city) && (
                                    <div>
                                        <p className="text-slate-500">Adresse</p>
                                        <p className="font-medium">
                                            {customer.street && `${customer.street}, `}
                                            {customer.postal_code} {customer.city}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
                
                {/* Suppliers */}
                {project.supplier_ids && project.supplier_ids.length > 0 && (
                    <Card className="mb-8 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-purple-600" />
                                Beteiligte Lieferanten
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {project.supplier_ids.map(supplierId => {
                                    const supplier = customers.find(c => c.id === supplierId);
                                    if (!supplier) return null;
                                    return (
                                        <div key={supplierId} className="group p-3 border rounded-lg hover:border-purple-300 transition-colors relative">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => {
                                                    if (confirm(`${supplier.company} wirklich entfernen?`)) {
                                                        const newSupplierIds = project.supplier_ids.filter(id => id !== supplierId);
                                                        updateProjectMutation.mutate({ 
                                                            id: projectId, 
                                                            data: { ...project, supplier_ids: newSupplierIds } 
                                                        });
                                                    }
                                                }}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                            <p className="font-medium text-slate-900 pr-6">{supplier.company}</p>
                                            {supplier.contact_name && (
                                                <p className="text-sm text-slate-500">{supplier.contact_name}</p>
                                            )}
                                            {supplier.phone && (
                                                <a href={`tel:${supplier.phone}`} className="text-sm text-purple-600 hover:text-purple-700">
                                                    {supplier.phone}
                                                </a>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Tabs for Activities and Tasks */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <TabsList className="bg-slate-100">
                            <TabsTrigger value="activities" className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                Aktivitäten
                                <Badge variant="secondary" className="ml-1">{activities.length}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="tasks" className="flex items-center gap-2">
                                <CheckSquare className="w-4 h-4" />
                                Aufgaben
                                <Badge variant="secondary" className="ml-1">{tasks.length}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="time" className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Zeiterfassung
                            </TabsTrigger>
                            </TabsList>
                        
                        {activeTab === "activities" ? (
                            <Button onClick={() => { setEditingActivity(null); setShowActivityForm(true); }} className="bg-slate-800 hover:bg-slate-900">
                                <Plus className="w-4 h-4 mr-2" />
                                Neue Aktivität
                            </Button>
                        ) : activeTab === "tasks" ? (
                            <Button onClick={() => { setEditingTask(null); setShowTaskForm(true); }} className="bg-slate-800 hover:bg-slate-900">
                                <Plus className="w-4 h-4 mr-2" />
                                Neue Aufgabe
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button onClick={() => setShowManualTime(true)} variant="outline">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Manuell nachtragen
                                </Button>
                                <Button onClick={() => setShowBilling(true)} className="bg-green-600 hover:bg-green-700">
                                    <Euro className="w-4 h-4 mr-2" />
                                    Abrechnen
                                </Button>
                                <Button onClick={() => setShowTimeReport(true)} variant="outline">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Bericht
                                </Button>
                                </div>
                                )}
                    </div>

                    <TabsContent value="activities">
                        {loadingActivities ? (
                            <div className="space-y-4">
                                {Array(3).fill(0).map((_, i) => (
                                    <Skeleton key={i} className="h-24 w-full" />
                                ))}
                            </div>
                        ) : (
                            <ActivityTimeline
                                activities={activities}
                                onEdit={(activity) => { setEditingActivity(activity); setShowActivityForm(true); }}
                                onDelete={(activity) => {
                                    if (confirm("Aktivität wirklich löschen?")) {
                                        deleteActivityMutation.mutate(activity.id);
                                    }
                                }}
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="tasks">
                        {loadingTasks ? (
                            <div className="space-y-3">
                                {Array(3).fill(0).map((_, i) => (
                                    <Skeleton key={i} className="h-20 w-full" />
                                ))}
                            </div>
                        ) : (
                            <TaskList
                                tasks={tasks}
                                onEdit={(task) => { setEditingTask(task); setShowTaskForm(true); }}
                                onDelete={(task) => {
                                    if (confirm("Aufgabe wirklich löschen?")) {
                                        deleteTaskMutation.mutate(task.id);
                                    }
                                }}
                                onStatusChange={handleTaskStatusChange}
                                onLogWork={handleTaskLogWork}
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="time">
                        {loadingTime ? (
                            <div className="space-y-4">
                                <Skeleton className="h-64 w-full" />
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <TimeTracker onSave={handleTimeSave} projectId={projectId} />
                                    <TimeCalendar 
                                        timeEntries={timeEntries}
                                        selectedMonth={selectedMonth}
                                        onMonthChange={setSelectedMonth}
                                    />
                                </div>

                                <BilledTimesList 
                                    timeEntries={timeEntries}
                                    onEdit={handleEditTimeEntry}
                                    onDelete={(entry) => {
                                        if (confirm("Zeiteintrag wirklich löschen?")) {
                                            deleteTimeEntryMutation.mutate(entry.id);
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </TabsContent>
                    </Tabs>
                    </div>

            {/* Forms */}
            <ProjectForm
                open={showProjectForm}
                onClose={() => setShowProjectForm(false)}
                onSave={(data) => updateProjectMutation.mutate({ id: projectId, data })}
                project={project}
                customers={customers}
                suppliers={customers.filter(c => c.type === 'supplier' || c.type === 'both')}
            />

            <ActivityForm
                open={showActivityForm}
                onClose={() => { setShowActivityForm(false); setEditingActivity(null); }}
                onSave={handleActivitySave}
                activity={editingActivity}
                projectId={projectId}
            />

            <TaskForm
                open={showTaskForm}
                onClose={() => { setShowTaskForm(false); setEditingTask(null); }}
                onSave={handleTaskSave}
                task={editingTask}
                projectId={projectId}
            />

            <ManualTimeEntry
                open={showManualTime}
                onClose={() => setShowManualTime(false)}
                onSave={handleTimeSave}
                projectId={projectId}
            />

            <BillingDialog
                open={showBilling}
                onClose={() => setShowBilling(false)}
                onBill={handleBilling}
                timeEntries={timeEntries}
            />

            <EditTimeEntry
                open={showEditTime}
                onClose={() => { setShowEditTime(false); setEditingTimeEntry(null); }}
                onSave={handleTimeEntrySave}
                entry={editingTimeEntry}
            />

            <TimeReport
                open={showTimeReport}
                onClose={() => setShowTimeReport(false)}
                timeEntries={timeEntries}
                project={project}
                customer={customer}
            />

            {showFloatingTimer && project && (
                <FloatingTimer
                    projectId={projectId}
                    projectName={project.name}
                    onClose={() => setShowFloatingTimer(false)}
                />
            )}
            </div>
            );
            }