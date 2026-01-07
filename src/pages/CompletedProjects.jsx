import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
    Search, FolderKanban, Building2, Calendar, 
    CheckCircle2, Clock, Phone, FileText, Package
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function CompletedProjects() {
    const [search, setSearch] = useState("");

    const { data: projects = [], isLoading: loadingProjects } = useQuery({
        queryKey: ['projects'],
        queryFn: () => base44.entities.Project.list()
    });

    const { data: customers = [] } = useQuery({
        queryKey: ['customers'],
        queryFn: () => base44.entities.Customer.list()
    });

    const { data: activities = [] } = useQuery({
        queryKey: ['activities'],
        queryFn: () => base44.entities.Activity.list()
    });

    const { data: tasks = [] } = useQuery({
        queryKey: ['tasks'],
        queryFn: () => base44.entities.Task.list()
    });

    const completedProjects = projects.filter(p => p.status === 'abgeschlossen');

    const getCustomer = (id) => customers.find(c => c.id === id);
    
    const getSuppliers = (supplierIds) => {
        if (!supplierIds || supplierIds.length === 0) return [];
        return supplierIds.map(id => customers.find(c => c.id === id)).filter(Boolean);
    };

    const getProjectActivities = (projectId) => {
        return activities.filter(a => a.project_id === projectId);
    };

    const getProjectTasks = (projectId) => {
        return tasks.filter(t => t.project_id === projectId);
    };

    const getTotalWorkedHours = (projectId) => {
        const projectTasks = getProjectTasks(projectId);
        return projectTasks.reduce((sum, task) => sum + (task.worked_hours || 0), 0);
    };

    const filteredProjects = completedProjects.filter(p => {
        const customer = getCustomer(p.customer_id);
        return p.name?.toLowerCase().includes(search.toLowerCase()) ||
            customer?.company?.toLowerCase().includes(search.toLowerCase());
    });

    if (loadingProjects) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-8">
                <div className="max-w-7xl mx-auto">
                    <Skeleton className="h-10 w-64 mb-8" />
                    <div className="space-y-6">
                        {Array(3).fill(0).map((_, i) => (
                            <Skeleton key={i} className="h-64 w-full" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-black dark:via-zinc-950 dark:to-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                        Abgeschlossene Projekte
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Übersicht aller erfolgreich abgeschlossenen Projekte mit Detailinformationen
                    </p>
                </div>

                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                        placeholder="Suche nach Projekt oder Kunde..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 max-w-md"
                    />
                </div>

                {filteredProjects.length > 0 ? (
                    <div className="space-y-6">
                        {filteredProjects.map((project) => {
                            const customer = getCustomer(project.customer_id);
                            const suppliers = getSuppliers(project.supplier_ids);
                            const projectActivities = getProjectActivities(project.id);
                            const projectTasks = getProjectTasks(project.id);
                            const totalHours = getTotalWorkedHours(project.id);
                            const completedTasks = projectTasks.filter(t => t.status === 'erledigt').length;

                            return (
                                <Card key={project.id} className="shadow-md hover:shadow-lg transition-shadow dark:bg-zinc-900 dark:border-zinc-800">
                                    <CardHeader className="bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-950 dark:to-zinc-900 border-b dark:border-zinc-800">
                                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900 dark:to-emerald-800 flex items-center justify-center shrink-0">
                                                    <FolderKanban className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <div>
                                                    <Link 
                                                        to={createPageUrl("ProjectDetail") + `?id=${project.id}`}
                                                        className="text-xl font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                                                    >
                                                        {project.name}
                                                    </Link>
                                                    {customer && (
                                                        <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2 mt-1">
                                                            <Building2 className="w-4 h-4" />
                                                            {customer.company}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 shrink-0">
                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                Abgeschlossen
                                            </Badge>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="p-6">
                                        {project.description && (
                                            <p className="text-slate-600 dark:text-slate-300 mb-6 pb-6 border-b dark:border-zinc-800">
                                                {project.description}
                                            </p>
                                        )}

                                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900 flex items-center justify-center shrink-0">
                                                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Projektzeitraum</p>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                        {project.start_date && format(new Date(project.start_date), "dd.MM.yyyy", { locale: de })}
                                                        {project.end_date && ` - ${format(new Date(project.end_date), "dd.MM.yyyy", { locale: de })}`}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900 flex items-center justify-center shrink-0">
                                                    <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Gearbeitete Stunden</p>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                        {totalHours.toFixed(1)} Stunden
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900 flex items-center justify-center shrink-0">
                                                    <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Aufgaben</p>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                        {completedTasks} / {projectTasks.length} erledigt
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900 flex items-center justify-center shrink-0">
                                                    <Phone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Aktivitäten</p>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                        {projectActivities.length} dokumentiert
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {customer && (
                                            <div className="bg-slate-50 dark:bg-zinc-800 rounded-lg p-4 mb-4">
                                                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                                                    <Building2 className="w-4 h-4" />
                                                    Kundeninformationen
                                                </h4>
                                                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                                    {customer.contact_name && (
                                                        <div>
                                                            <p className="text-slate-500 dark:text-slate-400 text-xs">Ansprechpartner</p>
                                                            <p className="font-medium text-slate-900 dark:text-white">{customer.contact_name}</p>
                                                        </div>
                                                    )}
                                                    {customer.phone && (
                                                        <div>
                                                            <p className="text-slate-500 dark:text-slate-400 text-xs">Telefon</p>
                                                            <p className="font-medium text-slate-900 dark:text-white">{customer.phone}</p>
                                                        </div>
                                                    )}
                                                    {customer.email && (
                                                        <div>
                                                            <p className="text-slate-500 dark:text-slate-400 text-xs">E-Mail</p>
                                                            <p className="font-medium text-slate-900 dark:text-white">{customer.email}</p>
                                                        </div>
                                                    )}
                                                    {customer.city && (
                                                        <div>
                                                            <p className="text-slate-500 dark:text-slate-400 text-xs">Stadt</p>
                                                            <p className="font-medium text-slate-900 dark:text-white">{customer.city}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {suppliers.length > 0 && (
                                            <div className="bg-purple-50 dark:bg-purple-950 rounded-lg p-4">
                                                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                                                    <Package className="w-4 h-4" />
                                                    Beteiligte Lieferanten ({suppliers.length})
                                                </h4>
                                                <div className="grid sm:grid-cols-2 gap-3">
                                                    {suppliers.map(supplier => (
                                                        <div key={supplier.id} className="bg-white dark:bg-zinc-900 rounded-lg p-3 border border-purple-100 dark:border-purple-800">
                                                            <p className="font-medium text-slate-900 dark:text-white">{supplier.company}</p>
                                                            {supplier.contact_name && (
                                                                <p className="text-xs text-slate-500 dark:text-slate-400">{supplier.contact_name}</p>
                                                            )}
                                                            {supplier.products_services && (
                                                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-1">
                                                                    {supplier.products_services}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {search ? "Keine abgeschlossenen Projekte gefunden" : "Noch keine abgeschlossenen Projekte"}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400">
                            {search ? "Versuchen Sie eine andere Suche" : "Abgeschlossene Projekte werden hier angezeigt"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}