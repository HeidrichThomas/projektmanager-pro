import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Lightbulb, Briefcase, Building2, TrendingUp, Calendar, Users } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import ThemeForm from "@/components/themes/ThemeForm";
import ThemeCard from "@/components/themes/ThemeCard";
import SectorManagement from "@/components/themes/SectorManagement";
import ThemeCalendar from "@/components/themes/ThemeCalendar";
import ThemeCompanyManagement from "@/components/themes/ThemeCompanyManagement";

export default function Themes() {
    const [showForm, setShowForm] = useState(false);
    const [editingTheme, setEditingTheme] = useState(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [showSectorManagement, setShowSectorManagement] = useState(false);
    const [showCompanyManagement, setShowCompanyManagement] = useState(false);

    const queryClient = useQueryClient();

    const { data: themes = [], isLoading } = useQuery({
        queryKey: ['themes'],
        queryFn: () => base44.entities.Theme.list()
    });

    const { data: customers = [] } = useQuery({
        queryKey: ['customers'],
        queryFn: () => base44.entities.Customer.list()
    });

    const { data: activities = [] } = useQuery({
        queryKey: ['themeActivities'],
        queryFn: () => base44.entities.ThemeActivity.list()
    });

    const { data: sectors = [] } = useQuery({
        queryKey: ['sectors'],
        queryFn: () => base44.entities.Sector.list()
    });

    const { data: companies = [] } = useQuery({
        queryKey: ['themeCompanies'],
        queryFn: () => base44.entities.ThemeCompany.list()
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.Theme.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['themes'] });
            setShowForm(false);
            toast.success("Thema erfolgreich angelegt");
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.Theme.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['themes'] });
            setShowForm(false);
            setEditingTheme(null);
            toast.success("Thema erfolgreich aktualisiert");
        }
    });

    const handleSave = (data) => {
        if (editingTheme) {
            updateMutation.mutate({ id: editingTheme.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (theme) => {
        setEditingTheme(theme);
        setShowForm(true);
    };

    const getCustomer = (id) => customers.find(c => c.id === id);

    const filteredThemes = themes.filter(t => {
        const matchesSearch = t.name?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || t.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Dashboard Statistiken
    const stats = {
        total: themes.length,
        inProgress: themes.filter(t => t.status === 'in_arbeit').length,
        planned: themes.filter(t => t.status === 'geplant').length,
        completed: themes.filter(t => t.status === 'abgeschlossen').length,
        avgProgress: themes.length > 0 ? Math.round(themes.reduce((sum, t) => sum + (t.progress || 0), 0) / themes.length) : 0,
        recentActivities: activities.slice(0, 5),
        totalActivities: activities.length,
        totalCompanies: companies.length,
        totalSectors: sectors.length
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Business Themen</h1>
                        <p className="text-slate-500 mt-1">Dashboard zur Verwaltung Ihrer Business Themen und Aktivitäten</p>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            onClick={() => setShowCompanyManagement(true)} 
                            variant="outline"
                        >
                            <Building2 className="w-4 h-4 mr-2" />
                            Firmen
                        </Button>
                        <Button 
                            onClick={() => setShowSectorManagement(true)} 
                            variant="outline"
                        >
                            <Briefcase className="w-4 h-4 mr-2" />
                            Sparten
                        </Button>
                        <Button 
                            onClick={() => { setEditingTheme(null); setShowForm(true); }} 
                            className="bg-slate-800 hover:bg-slate-900"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Neues Thema
                        </Button>
                    </div>
                </div>

                {/* Dashboard Statistiken */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Gesamt Themen</CardTitle>
                            <Lightbulb className="w-4 h-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                            <p className="text-xs text-slate-500 mt-1">
                                {stats.inProgress} in Arbeit • {stats.planned} geplant
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Durchschnittlicher Fortschritt</CardTitle>
                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.avgProgress}%</div>
                            <p className="text-xs text-slate-500 mt-1">
                                {stats.completed} abgeschlossen
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Aktivitäten</CardTitle>
                            <Calendar className="w-4 h-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.totalActivities}</div>
                            <p className="text-xs text-slate-500 mt-1">
                                Gesamt erfasst
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Firmen & Sparten</CardTitle>
                            <Users className="w-4 h-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.totalCompanies}</div>
                            <p className="text-xs text-slate-500 mt-1">
                                {stats.totalSectors} Sparten
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            placeholder="Suche nach Thema..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    
                    <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                        <TabsList className="bg-slate-100">
                            <TabsTrigger value="all">Alle</TabsTrigger>
                            <TabsTrigger value="geplant">Geplant</TabsTrigger>
                            <TabsTrigger value="in_arbeit">In Arbeit</TabsTrigger>
                            <TabsTrigger value="abgeschlossen">Abgeschlossen</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>



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
                ) : filteredThemes.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredThemes.map((theme) => (
                            <ThemeCard
                                key={theme.id}
                                theme={theme}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <Lightbulb className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                        <h3 className="text-lg font-medium text-slate-700 mb-2">
                            {search || statusFilter !== "all" ? "Keine Business Themen gefunden" : "Noch keine Business Themen angelegt"}
                        </h3>
                        <p className="text-slate-500 mb-6">
                            {search || statusFilter !== "all" ? "Versuchen Sie andere Filteroptionen" : "Starten Sie Ihr erstes Business Thema"}
                        </p>
                        {!search && statusFilter === "all" && (
                            <Button onClick={() => setShowForm(true)} className="bg-slate-800 hover:bg-slate-900">
                                <Plus className="w-4 h-4 mr-2" />
                                Erstes Business Thema anlegen
                            </Button>
                        )}
                    </div>
                )}

                {/* Calendar */}
                <div className="mt-8">
                    <ThemeCalendar activities={activities} themes={themes} />
                </div>
            </div>

            <ThemeForm
                open={showForm}
                onClose={() => { setShowForm(false); setEditingTheme(null); }}
                onSave={handleSave}
                theme={editingTheme}
            />

            <ThemeCompanyManagement
                open={showCompanyManagement}
                onClose={() => setShowCompanyManagement(false)}
            />

            <SectorManagement
                open={showSectorManagement}
                onClose={() => setShowSectorManagement(false)}
            />
        </div>
    );
}