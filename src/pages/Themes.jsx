import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Lightbulb } from "lucide-react";
import { toast } from "sonner";

import ThemeForm from "@/components/themes/ThemeForm";
import ThemeCard from "@/components/themes/ThemeCard";

export default function Themes() {
    const [showForm, setShowForm] = useState(false);
    const [editingTheme, setEditingTheme] = useState(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const queryClient = useQueryClient();

    const { data: themes = [], isLoading } = useQuery({
        queryKey: ['themes'],
        queryFn: () => base44.entities.Theme.list()
    });

    const { data: customers = [] } = useQuery({
        queryKey: ['customers'],
        queryFn: () => base44.entities.Customer.list()
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
        const matchesSearch = t.name?.toLowerCase().includes(search.toLowerCase()) ||
            getCustomer(t.customer_id)?.company?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || t.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Themen</h1>
                        <p className="text-slate-500 mt-1">Verwalten Sie Ihre Themen und deren Fortschritt</p>
                    </div>
                    <Button 
                        onClick={() => { setEditingTheme(null); setShowForm(true); }} 
                        className="bg-slate-800 hover:bg-slate-900"
                        disabled={customers.length === 0}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Neues Thema
                    </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            placeholder="Suche nach Thema oder Kunde..."
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

                {customers.length === 0 && !isLoading && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                        Bitte legen Sie zuerst einen Kunden an, bevor Sie Themen erstellen können.
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
                ) : filteredThemes.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredThemes.map((theme) => (
                            <ThemeCard
                                key={theme.id}
                                theme={theme}
                                customer={getCustomer(theme.customer_id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <Lightbulb className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                        <h3 className="text-lg font-medium text-slate-700 mb-2">
                            {search || statusFilter !== "all" ? "Keine Themen gefunden" : "Noch keine Themen angelegt"}
                        </h3>
                        <p className="text-slate-500 mb-6">
                            {search || statusFilter !== "all" ? "Versuchen Sie andere Filteroptionen" : "Starten Sie Ihr erstes Thema"}
                        </p>
                        {!search && statusFilter === "all" && customers.length > 0 && (
                            <Button onClick={() => setShowForm(true)} className="bg-slate-800 hover:bg-slate-900">
                                <Plus className="w-4 h-4 mr-2" />
                                Erstes Thema anlegen
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <ThemeForm
                open={showForm}
                onClose={() => { setShowForm(false); setEditingTheme(null); }}
                onSave={handleSave}
                theme={editingTheme}
                customers={customers}
                suppliers={customers.filter(c => c.type === 'supplier' || c.type === 'both')}
            />
        </div>
    );
}