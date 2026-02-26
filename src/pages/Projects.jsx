import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, FolderKanban, LayoutGrid, Columns3 } from "lucide-react";
import { toast } from "sonner";

import ProjectForm from "@/components/projects/ProjectForm";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectKanban from "@/components/projects/ProjectKanban";

export default function Projects() {
    const [showForm, setShowForm] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [viewMode, setViewMode] = useState("kanban");

    const queryClient = useQueryClient();

    const { data: projects = [], isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: () => base44.entities.Project.list()
    });

    const { data: customers = [] } = useQuery({
        queryKey: ['customers'],
        queryFn: () => base44.entities.Customer.list()
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.Project.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            setShowForm(false);
            toast.success("Projekt erfolgreich angelegt");
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.Project.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            setShowForm(false);
            setEditingProject(null);
            toast.success("Projekt erfolgreich aktualisiert");
        }
    });

    const handleStatusChange = (projectId, newStatus) => {
        const project = projects.find(p => p.id === projectId);
        if (project) {
            updateMutation.mutate({ id: projectId, data: { ...project, status: newStatus } });
        }
    };

    const handleSave = (data) => {
        if (editingProject) {
            updateMutation.mutate({ id: editingProject.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (project) => {
        setEditingProject(project);
        setShowForm(true);
    };

    const getCustomer = (id) => customers.find(c => c.id === id);

    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
            getCustomer(p.customer_id)?.company?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Projekte</h1>
                        <p className="text-slate-500 mt-1">Verwalten Sie Ihre Projekte und deren Fortschritt</p>
                    </div>
                    <Button 
                        onClick={() => { setEditingProject(null); setShowForm(true); }} 
                        className="bg-slate-800 hover:bg-slate-900"
                        disabled={customers.length === 0}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Neues Projekt
                    </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            placeholder="Suche nach Projekt oder Kunde..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    
                    {viewMode === "grid" && (
                        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                            <TabsList className="bg-slate-100">
                                <TabsTrigger value="all">Alle</TabsTrigger>
                                <TabsTrigger value="geplant">Geplant</TabsTrigger>
                                <TabsTrigger value="in_arbeit">In Arbeit</TabsTrigger>
                                <TabsTrigger value="abgeschlossen">Abgeschlossen</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    )}

                    <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                        <Button
                            size="sm"
                            variant={viewMode === "kanban" ? "secondary" : "ghost"}
                            onClick={() => setViewMode("kanban")}
                            className="px-3"
                        >
                            <Columns3 className="w-4 h-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant={viewMode === "grid" ? "secondary" : "ghost"}
                            onClick={() => setViewMode("grid")}
                            className="px-3"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {customers.length === 0 && !isLoading && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                        Bitte legen Sie zuerst einen Kunden an, bevor Sie Projekte erstellen können.
                    </div>
                )}

                {isLoading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array(6).fill(0).map((_, i) => (
                            <div key={i} className="p-5 border rounded-xl">
                                <Skeleton className="h-12 w-12 rounded-xl mb-4" />
                                <Skeleton className="h-6 w-48 mb-2" />
                                <Skeleton className="h-4 w-32 mb-4" />
                                <Skeleton className="h-2 w-full mb-2" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        ))}
                    </div>
                ) : projects.length > 0 ? (
                    viewMode === "kanban" ? (
                        <ProjectKanban 
                            projects={projects} 
                            customers={customers}
                            onStatusChange={handleStatusChange}
                        />
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProjects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    customer={getCustomer(project.customer_id)}
                                />
                            ))}
                        </div>
                    )
                ) : (
                    <div className="text-center py-16">
                        <FolderKanban className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                        <h3 className="text-lg font-medium text-slate-700 mb-2">
                            {search || statusFilter !== "all" ? "Keine Projekte gefunden" : "Noch keine Projekte angelegt"}
                        </h3>
                        <p className="text-slate-500 mb-6">
                            {search || statusFilter !== "all" ? "Versuchen Sie andere Filteroptionen" : "Starten Sie Ihr erstes Projekt"}
                        </p>
                        {!search && statusFilter === "all" && customers.length > 0 && (
                            <Button onClick={() => setShowForm(true)} className="bg-slate-800 hover:bg-slate-900">
                                <Plus className="w-4 h-4 mr-2" />
                                Erstes Projekt anlegen
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <ProjectForm
                open={showForm}
                onClose={() => { setShowForm(false); setEditingProject(null); }}
                onSave={handleSave}
                project={editingProject}
                customers={customers}
                suppliers={customers.filter(c => c.type === 'supplier' || c.type === 'both')}
            />
        </div>
    );
}