import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Heart, Home, DollarSign, Users, Plane, GraduationCap, Package } from "lucide-react";
import PrivateThemeCard from "@/components/private/PrivateThemeCard";
import PrivateThemeForm from "@/components/private/PrivateThemeForm";

const categoryConfig = {
    familie: { label: "Familie", icon: Users, color: "pink" },
    gesundheit: { label: "Gesundheit", icon: Heart, color: "red" },
    finanzen: { label: "Finanzen", icon: DollarSign, color: "green" },
    haushalt: { label: "Haushalt", icon: Home, color: "blue" },
    hobby: { label: "Hobby", icon: Package, color: "purple" },
    urlaub: { label: "Urlaub", icon: Plane, color: "teal" },
    bildung: { label: "Bildung", icon: GraduationCap, color: "amber" },
    sonstiges: { label: "Sonstiges", icon: Package, color: "slate" }
};

export default function PrivateThemes() {
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingTheme, setEditingTheme] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState("all");

    const queryClient = useQueryClient();

    const { data: themes = [], isLoading } = useQuery({
        queryKey: ['privateThemes'],
        queryFn: () => base44.entities.PrivateTheme.list('-created_date')
    });

    const { data: allAppointments = [] } = useQuery({
        queryKey: ['allPrivateAppointments'],
        queryFn: () => base44.entities.PrivateAppointment.list()
    });

    const { data: allDocuments = [] } = useQuery({
        queryKey: ['allPrivateDocuments'],
        queryFn: () => base44.entities.PrivateDocument.list()
    });

    const { data: allActivities = [] } = useQuery({
        queryKey: ['allPrivateActivities'],
        queryFn: () => base44.entities.PrivateActivity.list()
    });

    const { data: allTasks = [] } = useQuery({
        queryKey: ['allPrivateTasks'],
        queryFn: () => base44.entities.PrivateTask.list()
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.PrivateTheme.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['privateThemes'] });
            setShowForm(false);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.PrivateTheme.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['privateThemes'] });
            setShowForm(false);
            setEditingTheme(null);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.PrivateTheme.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['privateThemes'] });
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

    const handleDelete = (id) => {
        if (confirm("Möchten Sie dieses Thema wirklich löschen?")) {
            deleteMutation.mutate(id);
        }
    };

    const handleSearch = () => {
        setSearchQuery(searchInput);
    };

    const filteredThemes = themes.filter(theme => {
        const matchesCategory = selectedCategory === "all" || theme.category === selectedCategory;
        
        if (!searchQuery) return matchesCategory;
        
        const query = searchQuery.toLowerCase();
        
        // Suche in Thema
        if (theme.name?.toLowerCase().includes(query) || 
            theme.description?.toLowerCase().includes(query)) {
            return matchesCategory;
        }
        
        // Suche in Aktivitäten
        const themeActivities = allActivities.filter(a => a.theme_id === theme.id);
        const activityMatch = themeActivities.some(a => 
            a.title?.toLowerCase().includes(query) || 
            a.content?.toLowerCase().includes(query)
        );
        if (activityMatch) return matchesCategory;
        
        // Suche in Aufgaben
        const themeTasks = allTasks.filter(t => t.theme_id === theme.id);
        const taskMatch = themeTasks.some(t => 
            t.title?.toLowerCase().includes(query) || 
            t.description?.toLowerCase().includes(query)
        );
        if (taskMatch) return matchesCategory;
        
        // Suche in Terminen
        const themeAppointments = allAppointments.filter(apt => apt.theme_id === theme.id);
        const appointmentMatch = themeAppointments.some(apt => 
            apt.title?.toLowerCase().includes(query) || 
            apt.description?.toLowerCase().includes(query)
        );
        if (appointmentMatch) return matchesCategory;
        
        // Suche in Dokumenten
        const themeDocuments = allDocuments.filter(doc => doc.theme_id === theme.id);
        const documentMatch = themeDocuments.some(doc => 
            doc.title?.toLowerCase().includes(query) || 
            doc.description?.toLowerCase().includes(query)
        );
        
        return documentMatch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Private Themen</h1>
                        <p className="text-slate-600 mt-1">Organisieren Sie Ihr privates Leben</p>
                    </div>
                    <Button onClick={() => { setEditingTheme(null); setShowForm(true); }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Neues Thema
                    </Button>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Input
                            placeholder="Themen durchsuchen..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="pr-10"
                        />
                        <button
                            onClick={handleSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <Search className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        <Button
                            variant={selectedCategory === "all" ? "default" : "outline"}
                            onClick={() => setSelectedCategory("all")}
                            size="sm"
                        >
                            Alle
                        </Button>
                        {Object.entries(categoryConfig).map(([key, config]) => {
                            const Icon = config.icon;
                            return (
                                <Button
                                    key={key}
                                    variant={selectedCategory === key ? "default" : "outline"}
                                    onClick={() => setSelectedCategory(key)}
                                    size="sm"
                                >
                                    <Icon className="w-4 h-4 mr-1" />
                                    {config.label}
                                </Button>
                            );
                        })}
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-12">
                        <p className="text-slate-500">Lade Themen...</p>
                    </div>
                ) : filteredThemes.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                        <p className="text-slate-500 mb-4">
                            {searchQuery || selectedCategory !== "all" ? "Keine Themen gefunden" : "Noch keine privaten Themen vorhanden"}
                        </p>
                        {!searchQuery && selectedCategory === "all" && (
                            <Button onClick={() => setShowForm(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Erstes Thema erstellen
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredThemes.map(theme => {
                            const themeAppointments = allAppointments.filter(apt => apt.theme_id === theme.id);
                            const themeDocuments = allDocuments.filter(doc => doc.theme_id === theme.id);
                            return (
                                <PrivateThemeCard
                                    key={theme.id}
                                    theme={theme}
                                    appointments={themeAppointments}
                                    documents={themeDocuments}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            );
                        })}
                    </div>
                )}

                {showForm && (
                    <PrivateThemeForm
                        theme={editingTheme}
                        onSave={handleSave}
                        onClose={() => {
                            setShowForm(false);
                            setEditingTheme(null);
                        }}
                    />
                )}
            </div>
        </div>
    );
}