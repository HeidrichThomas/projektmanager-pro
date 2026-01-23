import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Navigation, Calendar, Building2, MapPin, FileDown, TrendingUp, Plus, Edit2, Trash2 } from "lucide-react";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import ManualTravelEntryForm from "@/components/travel/ManualTravelEntryForm";

export default function TravelTracking() {
    const queryClient = useQueryClient();
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [showManualEntryForm, setShowManualEntryForm] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);

    const { data: activities = [], isLoading } = useQuery({
        queryKey: ['activities'],
        queryFn: () => base44.entities.Activity.list()
    });

    const { data: manualEntries = [] } = useQuery({
        queryKey: ['manualTravelEntries'],
        queryFn: () => base44.entities.ManualTravelEntry.list()
    });

    const { data: projects = [] } = useQuery({
        queryKey: ['projects'],
        queryFn: () => base44.entities.Project.list()
    });

    const { data: customers = [] } = useQuery({
        queryKey: ['customers'],
        queryFn: () => base44.entities.Customer.list()
    });

    const createManualEntryMutation = useMutation({
        mutationFn: (data) => base44.entities.ManualTravelEntry.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['manualTravelEntries']);
            setShowManualEntryForm(false);
            setEditingEntry(null);
        }
    });

    const updateManualEntryMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.ManualTravelEntry.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['manualTravelEntries']);
            setShowManualEntryForm(false);
            setEditingEntry(null);
        }
    });

    const deleteManualEntryMutation = useMutation({
        mutationFn: (id) => base44.entities.ManualTravelEntry.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['manualTravelEntries']);
        }
    });

    // Combine activities and manual entries
    const travelActivities = activities
        .filter(a => a.requires_travel && a.travel_distance_km)
        .map(a => ({ ...a, type: 'activity', date: a.activity_date, distance: a.travel_distance_km }));
    
    const manualTravelData = manualEntries.map(m => ({ 
        ...m, 
        type: 'manual', 
        date: m.date, 
        distance: m.distance_km 
    }));

    const allTravelData = [...travelActivities, ...manualTravelData].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );

    // Filter by selected year and month
    const filteredActivities = allTravelData.filter(item => {
        if (!item.date) return false;
        const date = parseISO(item.date);
        const yearMatch = date.getFullYear() === selectedYear;
        const monthMatch = selectedMonth === 0 || date.getMonth() + 1 === selectedMonth;
        return yearMatch && monthMatch;
    });

    // Calculate totals
    const calculateTaxRate = (date) => {
        const entryDate = parseISO(date);
        const cutoffDate = new Date('2026-01-01');
        return entryDate < cutoffDate ? 0.30 : 0.38;
    };

    const monthlyTotal = filteredActivities.reduce((sum, item) => sum + (item.distance || 0), 0);
    const yearlyTotal = allTravelData
        .filter(item => {
            if (!item.date) return false;
            return parseISO(item.date).getFullYear() === selectedYear;
        })
        .reduce((sum, item) => sum + (item.distance || 0), 0);

    const monthlyDeduction = filteredActivities.reduce((sum, item) => {
        const rate = calculateTaxRate(item.date);
        return sum + (item.distance * rate);
    }, 0);

    // Group by project
    const projectTotals = filteredActivities.reduce((acc, item) => {
        if (!item.project_id) return acc;
        if (!acc[item.project_id]) {
            acc[item.project_id] = {
                projectId: item.project_id,
                totalKm: 0,
                count: 0
            };
        }
        acc[item.project_id].totalKm += item.distance || 0;
        acc[item.project_id].count += 1;
        return acc;
    }, {});

    const getProject = (id) => projects.find(p => p.id === id);
    const getCustomer = (id) => customers.find(c => c.id === id);

    const handleSaveManualEntry = (...args) => {
        if (args.length === 2) {
            // Update: (id, data)
            updateManualEntryMutation.mutate({ id: args[0], data: args[1] });
        } else {
            // Create: (data)
            createManualEntryMutation.mutate(args[0]);
        }
    };

    const handleEditEntry = (entry) => {
        setEditingEntry(entry);
        setShowManualEntryForm(true);
    };

    const handleDeleteEntry = (id) => {
        if (confirm('Möchten Sie diesen Eintrag wirklich löschen?')) {
            deleteManualEntryMutation.mutate(id);
        }
    };

    const exportToCSV = () => {
        const headers = ['Datum', 'Projekt', 'Kunde', 'Aktivität', 'Von', 'Nach', 'Kilometer'];
        const rows = filteredActivities.map(a => {
            const project = getProject(a.project_id);
            const customer = project ? getCustomer(project.customer_id) : null;
            return [
                format(parseISO(a.activity_date), 'dd.MM.yyyy', { locale: de }),
                project?.name || '',
                customer?.company || '',
                a.title,
                a.start_location,
                a.destination_address,
                a.travel_distance_km?.toFixed(1) || '0'
            ];
        });
        
        rows.push(['', '', '', '', '', 'Gesamt:', monthlyTotal.toFixed(1)]);
        
        const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Fahrtenbuch_${selectedYear}_${String(selectedMonth).padStart(2, '0')}.csv`;
        link.click();
    };

    const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];
    const months = [
        { value: 1, label: 'Januar' },
        { value: 2, label: 'Februar' },
        { value: 3, label: 'März' },
        { value: 4, label: 'April' },
        { value: 5, label: 'Mai' },
        { value: 6, label: 'Juni' },
        { value: 7, label: 'Juli' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'Oktober' },
        { value: 11, label: 'November' },
        { value: 12, label: 'Dezember' }
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-8">
                <div className="max-w-7xl mx-auto">
                    <Skeleton className="h-10 w-64 mb-8" />
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        {Array(3).fill(0).map((_, i) => (
                            <Skeleton key={i} className="h-32" />
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
                        <Navigation className="w-8 h-8 text-blue-600" />
                        Fahrtenbuch
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Übersicht aller geschäftlichen Fahrten für die Steuererklärung
                    </p>
                </div>

                <div className="flex flex-wrap gap-4 mb-6">
                    <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map(year => (
                                <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0">Ganzes Jahr</SelectItem>
                            {months.map(month => (
                                <SelectItem key={month.value} value={String(month.value)}>
                                    {month.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button onClick={() => setShowManualEntryForm(true)} className="ml-auto">
                        <Plus className="w-4 h-4 mr-2" />
                        Manuelle Fahrt
                    </Button>
                    
                    <Button onClick={exportToCSV} variant="outline">
                        <FileDown className="w-4 h-4 mr-2" />
                        CSV Export
                    </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-slate-600">
                                {selectedMonth === 0 ? `Jahr ${selectedYear}` : `${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-600">
                                {monthlyTotal.toFixed(1)} km
                            </div>
                            <p className="text-sm text-slate-500 mt-1">
                                {filteredActivities.length} Fahrten
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-slate-600">Jahr {selectedYear}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-purple-600">
                                {yearlyTotal.toFixed(1)} km
                            </div>
                            <p className="text-sm text-slate-500 mt-1">
                                {allTravelData.filter(item => item.date && parseISO(item.date).getFullYear() === selectedYear).length} Fahrten
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-slate-600">
                                Steuerlich absetzbar {selectedMonth === 0 ? '' : '(Monat)'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-emerald-600">
                                {monthlyDeduction.toFixed(2)} €
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                0,30€/km bis 31.12.2025, 0,38€/km ab 01.01.2026
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {Object.keys(projectTotals).length > 0 && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                Kilometer nach Projekt
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {Object.values(projectTotals).map(({ projectId, totalKm, count }) => {
                                    const project = getProject(projectId);
                                    const customer = project ? getCustomer(project.customer_id) : null;
                                    return (
                                        <div key={projectId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <div>
                                                <div className="font-medium text-slate-900">{project?.name || 'Unbekanntes Projekt'}</div>
                                                {customer && (
                                                    <div className="text-sm text-slate-500 flex items-center gap-1">
                                                        <Building2 className="w-3 h-3" />
                                                        {customer.company}
                                                    </div>
                                                )}
                                                <div className="text-xs text-slate-400">{count} Fahrten</div>
                                            </div>
                                            <div className="text-lg font-bold text-blue-600">
                                                {totalKm.toFixed(1)} km
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Einzelne Fahrten
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {filteredActivities.length > 0 ? (
                            <div className="space-y-3">
                                {filteredActivities.map(item => {
                                    const project = item.project_id ? getProject(item.project_id) : null;
                                    const customer = item.type === 'manual' && item.customer_id 
                                        ? getCustomer(item.customer_id)
                                        : project ? getCustomer(project.customer_id) : null;
                                    const rate = calculateTaxRate(item.date);
                                    const amount = item.distance * rate;
                                    
                                    return (
                                        <div key={`${item.type}-${item.id}`} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <div className="font-medium text-slate-900">{item.title}</div>
                                                    <div className="text-sm text-slate-500">
                                                        {format(parseISO(item.date), "dd.MM.yyyy HH:mm", { locale: de })}
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <div className="text-right">
                                                        <div className="text-xl font-bold text-blue-600">
                                                            {item.distance?.toFixed(1)} km
                                                        </div>
                                                        <div className="text-xs text-slate-400">
                                                            ({(item.distance / 2).toFixed(1)} km × 2)
                                                        </div>
                                                        <div className="text-sm text-emerald-600 mt-1">
                                                            {amount.toFixed(2)} €
                                                        </div>
                                                    </div>
                                                    {item.type === 'manual' && (
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleEditEntry(item)}
                                                                className="h-8 w-8"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDeleteEntry(item.id)}
                                                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {project && (
                                                <div className="text-sm text-slate-600 mb-2">
                                                    <span className="font-medium">{project.name}</span>
                                                    {customer && <span> • {customer.company}</span>}
                                                </div>
                                            )}
                                            
                                            {item.type === 'activity' && (
                                                <div className="flex items-start gap-3 text-sm text-slate-500">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            <span className="font-medium">Von:</span>
                                                        </div>
                                                        <div className="ml-4">{item.start_location}</div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            <span className="font-medium">Nach:</span>
                                                        </div>
                                                        <div className="ml-4">{item.destination_address}</div>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {item.type === 'manual' && (item.start_location || item.destination) && (
                                                <div className="flex items-start gap-3 text-sm text-slate-500">
                                                    {item.start_location && (
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-1">
                                                                <MapPin className="w-3 h-3" />
                                                                <span className="font-medium">Von:</span>
                                                            </div>
                                                            <div className="ml-4">{item.start_location}</div>
                                                        </div>
                                                    )}
                                                    {item.destination && (
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-1">
                                                                <MapPin className="w-3 h-3" />
                                                                <span className="font-medium">Nach:</span>
                                                            </div>
                                                            <div className="ml-4">{item.destination}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-500">
                                <Navigation className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                <p>Keine Fahrten in diesem Monat</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <ManualTravelEntryForm
                open={showManualEntryForm}
                onOpenChange={(open) => {
                    setShowManualEntryForm(open);
                    if (!open) setEditingEntry(null);
                }}
                onSave={handleSaveManualEntry}
                entry={editingEntry}
            />
        </div>
    );
}