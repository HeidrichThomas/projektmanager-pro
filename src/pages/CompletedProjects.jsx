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
    CheckCircle2, Clock, Phone, FileText, Package, X
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function CompletedProjects() {
    const [search, setSearch] = useState("");
    const [selectedProject, setSelectedProject] = useState(null);

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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                        Abgeschlossene Projekte
                    </h1>
                    <p className="text-slate-500 mt-1">
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
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredProjects.map((project) => {
                            const customer = getCustomer(project.customer_id);

                            return (
                                <Card 
                                    key={project.id} 
                                    className="shadow-md hover:shadow-lg transition-all cursor-pointer"
                                    onClick={() => setSelectedProject(project)}
                                >
                                    <CardHeader className="bg-gradient-to-r from-emerald-50 to-white border-b">
                                        <div className="flex items-start gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center shrink-0">
                                                <FolderKanban className="w-6 h-6 text-emerald-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-slate-900 truncate">{project.name}</h3>
                                                {customer && (
                                                    <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                                                        <Building2 className="w-3 h-3" />
                                                        <span className="truncate">{customer.company}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            Abgeschlossen
                                        </Badge>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                        <h3 className="text-lg font-medium text-slate-700 mb-2">
                            {search ? "Keine abgeschlossenen Projekte gefunden" : "Noch keine abgeschlossenen Projekte"}
                        </h3>
                        <p className="text-slate-500">
                            {search ? "Versuchen Sie eine andere Suche" : "Abgeschlossene Projekte werden hier angezeigt"}
                        </p>
                    </div>
                )}

                {/* Project Details Dialog */}
                {selectedProject && (
                    <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
                        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-3 text-2xl">
                                    <FolderKanban className="w-6 h-6 text-emerald-600" />
                                    {selectedProject.name}
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-6 mt-4">
                                {selectedProject.description && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-700 mb-2">Beschreibung</h4>
                                        <p className="text-slate-600">{selectedProject.description}</p>
                                    </div>
                                )}

                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                            <Calendar className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">Projektzeitraum</p>
                                            <p className="text-sm font-medium text-slate-900">
                                                {selectedProject.start_date && format(new Date(selectedProject.start_date), "dd.MM.yyyy", { locale: de })}
                                                {selectedProject.end_date && ` - ${format(new Date(selectedProject.end_date), "dd.MM.yyyy", { locale: de })}`}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                                            <Clock className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">Gearbeitete Stunden</p>
                                            <p className="text-sm font-medium text-slate-900">
                                                {getTotalWorkedHours(selectedProject.id).toFixed(1)} Stunden
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                                            <FileText className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">Aufgaben</p>
                                            <p className="text-sm font-medium text-slate-900">
                                                {getProjectTasks(selectedProject.id).filter(t => t.status === 'erledigt').length} / {getProjectTasks(selectedProject.id).length} erledigt
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                                            <Phone className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">Aktivitäten</p>
                                            <p className="text-sm font-medium text-slate-900">
                                                {getProjectActivities(selectedProject.id).length} dokumentiert
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {(() => {
                                    const customer = getCustomer(selectedProject.customer_id);
                                    return customer && (
                                        <div className="bg-slate-50 rounded-lg p-4">
                                            <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                                <Building2 className="w-4 h-4" />
                                                Kundeninformationen
                                            </h4>
                                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                                {customer.contact_name && (
                                                    <div>
                                                        <p className="text-slate-500 text-xs">Ansprechpartner</p>
                                                        <p className="font-medium text-slate-900">{customer.contact_name}</p>
                                                    </div>
                                                )}
                                                {customer.phone && (
                                                    <div>
                                                        <p className="text-slate-500 text-xs">Telefon</p>
                                                        <p className="font-medium text-slate-900">{customer.phone}</p>
                                                    </div>
                                                )}
                                                {customer.email && (
                                                    <div>
                                                        <p className="text-slate-500 text-xs">E-Mail</p>
                                                        <p className="font-medium text-slate-900">{customer.email}</p>
                                                    </div>
                                                )}
                                                {customer.city && (
                                                    <div>
                                                        <p className="text-slate-500 text-xs">Stadt</p>
                                                        <p className="font-medium text-slate-900">{customer.city}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {(() => {
                                    const suppliers = getSuppliers(selectedProject.supplier_ids);
                                    return suppliers.length > 0 && (
                                        <div className="bg-purple-50 rounded-lg p-4">
                                            <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                                <Package className="w-4 h-4" />
                                                Beteiligte Lieferanten ({suppliers.length})
                                            </h4>
                                            <div className="grid sm:grid-cols-2 gap-3">
                                                {suppliers.map(supplier => (
                                                    <div key={supplier.id} className="bg-white rounded-lg p-3 border border-purple-100">
                                                        <p className="font-medium text-slate-900">{supplier.company}</p>
                                                        {supplier.contact_name && (
                                                            <p className="text-xs text-slate-500">{supplier.contact_name}</p>
                                                        )}
                                                        {supplier.products_services && (
                                                            <p className="text-xs text-slate-600 mt-1">
                                                                {supplier.products_services}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    );
}