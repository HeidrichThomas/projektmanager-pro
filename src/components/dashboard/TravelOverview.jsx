import React, { useState, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navigation, Calendar, Building2, FolderKanban, TrendingUp, Printer, FileDown, Plus, Trash2, Edit2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ManualTravelEntryForm from "@/components/travel/ManualTravelEntryForm";

export default function TravelOverview() {
    const queryClient = useQueryClient();
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    const [selectedMonth, setSelectedMonth] = useState(String(currentMonth));
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [filterProject, setFilterProject] = useState("all");
    const [filterCustomer, setFilterCustomer] = useState("all");
    const [showManualEntryForm, setShowManualEntryForm] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const reportRef = useRef(null);

    const { data: activities = [] } = useQuery({
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

    const calculateTaxRate = (date) => {
        const entryDate = parseISO(date);
        const cutoffDate = new Date('2026-01-01');
        return entryDate < cutoffDate ? 0.30 : 0.38;
    };

    const travelActivities = useMemo(() => {
        return activities
            .filter(a => a.requires_travel && a.travel_distance_km)
            .sort((a, b) => new Date(b.activity_date) - new Date(a.activity_date));
    }, [activities]);

    const allTravelData = useMemo(() => {
        const activities = travelActivities.map(a => ({
            ...a,
            type: 'activity',
            date: a.activity_date,
            distance: a.travel_distance_km
        }));
        
        const manual = manualEntries.map(m => ({
            ...m,
            type: 'manual',
            date: m.date,
            distance: m.distance_km
        }));
        
        return [...activities, ...manual].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
    }, [travelActivities, manualEntries]);

    const filteredActivities = useMemo(() => {
        return allTravelData.filter(item => {
            if (!item.date) return false;
            const date = parseISO(item.date);
            const month = date.getMonth() + 1;
            const yearMatch = date.getFullYear() === selectedYear;
            const projectMatch = filterProject === "all" || item.project_id === filterProject;
            
            let periodMatch;
            if (selectedMonth === "0") {
                periodMatch = true; // Ganzes Jahr
            } else if (selectedMonth === "Q1") {
                periodMatch = month >= 1 && month <= 3;
            } else if (selectedMonth === "Q2") {
                periodMatch = month >= 4 && month <= 6;
            } else if (selectedMonth === "Q3") {
                periodMatch = month >= 7 && month <= 9;
            } else if (selectedMonth === "Q4") {
                periodMatch = month >= 10 && month <= 12;
            } else {
                periodMatch = month === parseInt(selectedMonth);
            }
            
            let customerMatch = true;
            if (filterCustomer !== "all") {
                if (item.type === 'manual' && item.customer_id) {
                    customerMatch = item.customer_id === filterCustomer;
                } else if (item.type === 'activity') {
                    const project = projects.find(p => p.id === item.project_id);
                    customerMatch = project && project.customer_id === filterCustomer;
                }
            }
            
            return periodMatch && yearMatch && projectMatch && customerMatch;
        });
    }, [allTravelData, selectedMonth, selectedYear, filterProject, filterCustomer, projects]);

    const monthlyTotal = useMemo(() => {
        return filteredActivities.reduce((sum, item) => sum + (item.distance || 0), 0);
    }, [filteredActivities]);

    const estimatedDeduction = useMemo(() => {
        return filteredActivities.reduce((sum, item) => {
            const rate = calculateTaxRate(item.date);
            return sum + (item.distance * rate);
        }, 0);
    }, [filteredActivities]);

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

    const handleDeleteManualEntry = (id) => {
        if (confirm('Möchten Sie diesen manuellen Eintrag wirklich löschen?')) {
            deleteManualEntryMutation.mutate(id);
        }
    };

    const months = [
        { value: 1, label: 'Januar' }, { value: 2, label: 'Februar' }, { value: 3, label: 'März' },
        { value: 4, label: 'April' }, { value: 5, label: 'Mai' }, { value: 6, label: 'Juni' },
        { value: 7, label: 'Juli' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
        { value: 10, label: 'Oktober' }, { value: 11, label: 'November' }, { value: 12, label: 'Dezember' }
    ];

    const years = [currentYear - 1, currentYear, currentYear + 1];

    const handlePrint = () => {
        window.print();
    };

    const handleExportPDF = async () => {
        const element = document.getElementById('travel-report-content');
        if (!element) return;
        
        // Clone the element to avoid modifying the original
        const clonedElement = element.cloneNode(true);
        clonedElement.style.position = 'absolute';
        clonedElement.style.left = '-9999px';
        clonedElement.style.top = '0';
        clonedElement.style.width = '1200px';
        clonedElement.style.padding = '20px';
        clonedElement.style.backgroundColor = '#ffffff';
        document.body.appendChild(clonedElement);
        
        try {
            const canvas = await html2canvas(clonedElement, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 1200,
                windowHeight: clonedElement.scrollHeight
            });
            
            const imgData = canvas.toDataURL("image/png", 1.0);
            const pdf = new jsPDF("l", "mm", "a4");
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pdfWidth - 30;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            let position = 15;
            pdf.addImage(imgData, "PNG", 15, position, imgWidth, imgHeight);
            
            let heightLeft = imgHeight - (pdfHeight - 30);
            
            while (heightLeft > 0) {
                pdf.addPage();
                position = -(imgHeight - heightLeft) + 15;
                pdf.addImage(imgData, "PNG", 15, position, imgWidth, imgHeight);
                heightLeft -= (pdfHeight - 30);
            }
            
            const periodLabel = selectedMonth === "0" ? `Jahr_${selectedYear}` :
                               selectedMonth === "Q1" ? `Q1_${selectedYear}` :
                               selectedMonth === "Q2" ? `Q2_${selectedYear}` :
                               selectedMonth === "Q3" ? `Q3_${selectedYear}` :
                               selectedMonth === "Q4" ? `Q4_${selectedYear}` :
                               `${months.find(m => m.value === parseInt(selectedMonth))?.label}_${selectedYear}`;
            
            pdf.save(`Fahrtenbericht_${periodLabel}.pdf`);
        } finally {
            document.body.removeChild(clonedElement);
        }
    };

    return (
        <Card className="shadow-sm print:shadow-none print:border-0">
            <CardHeader className="pb-4 print:pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2 print:text-base">
                        <Navigation className="w-5 h-5 text-blue-600 print:w-4 print:h-4" />
                        Geschäftliche Fahrten
                    </CardTitle>
                    <div className="flex gap-2">
                        <Button onClick={() => setShowManualEntryForm(true)} size="sm" className="print:hidden">
                            <Plus className="w-4 h-4 mr-2" />
                            Manuelle Fahrt
                        </Button>
                        <Button onClick={handlePrint} variant="outline" size="sm" className="print:hidden">
                            <Printer className="w-4 h-4 mr-2" />
                            Drucken
                        </Button>
                        <Button onClick={handleExportPDF} variant="outline" size="sm" className="print:hidden">
                            <FileDown className="w-4 h-4 mr-2" />
                            PDF
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent ref={reportRef} className="print:!p-0">
                <div id="travel-report-content">
                <div className="mb-4 print:mb-1">
                    <h2 className="text-xl font-bold text-slate-900 mb-1 print:text-xs print:mb-0 print:font-bold">Fahrtenbericht</h2>
                    <p className="text-sm text-slate-600 print:text-[8px]">
                        {selectedMonth === "0" ? `Jahr ${selectedYear}` : 
                         selectedMonth === "Q1" ? `Q1 ${selectedYear}` :
                         selectedMonth === "Q2" ? `Q2 ${selectedYear}` :
                         selectedMonth === "Q3" ? `Q3 ${selectedYear}` :
                         selectedMonth === "Q4" ? `Q4 ${selectedYear}` :
                         `${months.find(m => m.value === parseInt(selectedMonth))?.label} ${selectedYear}`}
                        {filterProject !== "all" && ` • Projekt: ${projects.find(p => p.id === filterProject)?.name}`}
                        {filterCustomer !== "all" && ` • Kunde: ${customers.find(c => c.id === filterCustomer)?.company}`}
                    </p>
                </div>

                <div className="flex flex-wrap gap-3 mb-4 print:hidden">
                    <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                        <SelectTrigger className="w-28">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map(year => (
                                <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(v)}>
                        <SelectTrigger className="w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0">Ganzes Jahr</SelectItem>
                            {months.map(month => (
                                <SelectItem key={month.value} value={String(month.value)}>
                                    {month.label}
                                </SelectItem>
                            ))}
                            <SelectItem value="Q1">Erstes Quartal</SelectItem>
                            <SelectItem value="Q2">Zweites Quartal</SelectItem>
                            <SelectItem value="Q3">Drittes Quartal</SelectItem>
                            <SelectItem value="Q4">Viertes Quartal</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filterProject} onValueChange={setFilterProject}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Alle Projekte" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Alle Projekte</SelectItem>
                            {projects.map(project => (
                                <SelectItem key={project.id} value={project.id}>
                                    {project.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={filterCustomer} onValueChange={setFilterCustomer}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Alle Kunden" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Alle Kunden</SelectItem>
                            {customers.map(customer => (
                                <SelectItem key={customer.id} value={customer.id}>
                                    {customer.company}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4 print:bg-slate-100 print:p-1 print:mb-1 print:rounded print:border print:border-slate-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-slate-600 mb-1 print:text-[8px] print:mb-0 print:inline print:mr-2">Gesamt:</div>
                            <div className="text-3xl font-bold text-blue-600 print:text-[10px] print:font-bold print:inline print:mr-2">
                                {monthlyTotal.toFixed(1)} km
                            </div>
                            <div className="text-xs text-slate-500 mt-1 print:text-[8px] print:mt-0 print:inline">
                                ({filteredActivities.length} Fahrten, {estimatedDeduction.toFixed(2)} € absetzbar)
                            </div>
                        </div>
                        <TrendingUp className="w-12 h-12 text-blue-400 opacity-50 print:hidden" />
                    </div>
                </div>

                <div className="border rounded-lg overflow-hidden print:border-slate-400 print:rounded-none">
                    <Table className="print:!text-[8px]">
                        <TableHeader>
                            <TableRow className="bg-slate-50 print:bg-slate-200">
                                <TableHead className="w-28 py-6 print:!py-[2px] print:!text-[8px] print:!font-bold">Datum</TableHead>
                                <TableHead className="py-6 print:!py-[2px] print:!text-[8px] print:!font-bold">Projekt</TableHead>
                                <TableHead className="py-6 print:!py-[2px] print:!text-[8px] print:!font-bold">Kunde</TableHead>
                                <TableHead className="py-6 print:!py-[2px] print:!text-[8px] print:!font-bold">Aktivität</TableHead>
                                <TableHead className="text-right py-6 print:!py-[2px] print:!text-[8px] print:!font-bold">km</TableHead>
                                <TableHead className="text-right py-6 print:!py-[2px] print:!text-[8px] print:!font-bold">Satz</TableHead>
                                <TableHead className="text-right py-6 print:!py-[2px] print:!text-[8px] print:!font-bold">Betrag</TableHead>
                                <TableHead className="w-12 print:hidden"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredActivities.length > 0 ? (
                                filteredActivities.map(item => {
                                    const project = item.project_id ? getProject(item.project_id) : null;
                                    const customer = item.type === 'manual' && item.customer_id 
                                        ? getCustomer(item.customer_id)
                                        : project ? getCustomer(project.customer_id) : null;
                                    const rate = calculateTaxRate(item.date);
                                    const amount = item.distance * rate;
                                    
                                    return (
                                        <TableRow key={`${item.type}-${item.id}`} className="hover:bg-slate-50 print:hover:bg-transparent">
                                            <TableCell className="font-medium text-sm py-6 print:!py-[2px] print:!px-[3px] print:!text-[8px] print:!leading-none">
                                                <Calendar className="w-3 h-3 text-slate-400 print:hidden inline mr-1" />
                                                {format(parseISO(item.date), "dd.MM.yy", { locale: de })}
                                            </TableCell>
                                            <TableCell className="py-6 print:!py-[2px] print:!px-[3px] print:!text-[8px] print:!leading-none">
                                                <FolderKanban className="w-3 h-3 text-slate-400 print:hidden inline mr-1" />
                                                <span className="break-words text-sm print:text-[8px]">{project?.name || 'N/A'}</span>
                                            </TableCell>
                                            <TableCell className="py-6 print:!py-[2px] print:!px-[3px] print:!text-[8px] print:!leading-none">
                                                <Building2 className="w-3 h-3 text-slate-400 print:hidden inline mr-1" />
                                                <span className="break-words text-sm print:text-[8px]">{customer?.company || 'N/A'}</span>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600 py-6 print:!py-[2px] print:!px-[3px] print:!text-[8px] print:!leading-none">
                                                <div className="break-words">{item.title}</div>
                                            </TableCell>
                                            <TableCell className="text-right py-6 print:!py-[2px] print:!px-[3px] print:!text-[8px] print:!leading-none">
                                                <Badge variant="secondary" className="font-mono print:border-0 print:bg-transparent print:p-0 print:text-[8px] print:font-normal">
                                                    {item.distance?.toFixed(1)}
                                                </Badge>
                                                <div className="text-xs text-slate-400 mt-1 print:hidden">
                                                    ({(item.distance / 2).toFixed(1)} km × 2)
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right py-6 print:!py-[2px] print:!px-[3px] text-xs text-slate-500 print:!text-[8px] print:!leading-none">
                                                {(rate * 100).toFixed(0)}
                                            </TableCell>
                                            <TableCell className="text-right py-6 print:!py-[2px] print:!px-[3px] font-medium print:!text-[8px] print:!leading-none print:!font-semibold">
                                                {amount.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-right py-6 print:hidden">
                                                {item.type === 'manual' && (
                                                    <div className="flex gap-1 justify-end">
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
                                                            onClick={() => handleDeleteManualEntry(item.id)}
                                                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                                        <Navigation className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                        Keine Fahrten in diesem Zeitraum
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                </div>
            </CardContent>

            <ManualTravelEntryForm
                open={showManualEntryForm}
                onOpenChange={(open) => {
                    setShowManualEntryForm(open);
                    if (!open) setEditingEntry(null);
                }}
                onSave={handleSaveManualEntry}
                entry={editingEntry}
            />
        </Card>
    );
}