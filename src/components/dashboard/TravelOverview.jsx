import React, { useState, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navigation, Calendar, Building2, FolderKanban, TrendingUp, FileDown, Plus, Trash2, Edit2 } from "lucide-react";
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

    const { data: themeActivities = [] } = useQuery({
        queryKey: ['themeActivities'],
        queryFn: () => base44.entities.ThemeActivity.list()
    });

    const { data: manualEntries = [] } = useQuery({
        queryKey: ['manualTravelEntries'],
        queryFn: () => base44.entities.ManualTravelEntry.list()
    });

    const { data: projects = [] } = useQuery({
        queryKey: ['projects'],
        queryFn: () => base44.entities.Project.list()
    });

    const { data: themes = [] } = useQuery({
        queryKey: ['themes'],
        queryFn: () => base44.entities.Theme.list()
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
        const projectActivities = activities
            .filter(a => a.requires_travel && a.travel_distance_km)
            .map(a => ({ ...a, source: 'project' }));
        
        const businessActivities = themeActivities
            .filter(a => a.requires_travel && a.travel_distance_km)
            .map(a => ({ ...a, source: 'theme' }));
        
        return [...projectActivities, ...businessActivities]
            .sort((a, b) => new Date(b.activity_date) - new Date(a.activity_date));
    }, [activities, themeActivities]);

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
            
            // Skip project filter for theme activities
            const projectMatch = filterProject === "all" || 
                                 item.source === 'theme' || 
                                 item.project_id === filterProject;
            
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
                } else if (item.type === 'activity' && item.source === 'project') {
                    const project = projects.find(p => p.id === item.project_id);
                    customerMatch = project && project.customer_id === filterCustomer;
                } else if (item.source === 'theme') {
                    // Theme activities: check if company_id matches
                    customerMatch = item.company_id === filterCustomer;
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

    const handleExportPDF = async () => {
        const element = document.getElementById('travel-report-content');
        if (!element) return;
        
        // Clone and style for PDF
        const clonedElement = element.cloneNode(true);
        clonedElement.style.position = 'absolute';
        clonedElement.style.left = '-9999px';
        clonedElement.style.top = '0';
        clonedElement.style.width = '1150px';
        clonedElement.style.padding = '15px';
        clonedElement.style.backgroundColor = '#ffffff';
        clonedElement.style.fontSize = '7px';
        clonedElement.style.lineHeight = '1';
        
        // Remove selects and replace with text
        const selectContainers = clonedElement.querySelectorAll('button[role="combobox"]');
        selectContainers.forEach(btn => {
            btn.style.display = 'none';
        });
        
        // Remove edit and delete buttons
        const actionButtons = clonedElement.querySelectorAll('button');
        actionButtons.forEach(btn => {
            btn.style.display = 'none';
        });
        
        // Make table compact and consistent
        const table = clonedElement.querySelector('table');
        if (table) {
            table.style.fontSize = '8px';
            table.style.lineHeight = '1.2';
            const cells = clonedElement.querySelectorAll('th, td');
            cells.forEach(cell => {
                cell.style.padding = '4px 5px';
                cell.style.fontSize = '8px';
                cell.style.lineHeight = '1.3';
                cell.style.verticalAlign = 'middle';
                cell.style.whiteSpace = 'normal';
            });
        }
        
        document.body.appendChild(clonedElement);
        
        try {
            const canvas = await html2canvas(clonedElement, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });
            
            const imgData = canvas.toDataURL("image/png", 1.0);
            const pdf = new jsPDF("l", "mm", "a4");
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pdfWidth - 20;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            let position = 10;
            pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
            
            let heightLeft = imgHeight - (pdfHeight - 20);
            
            while (heightLeft > 0) {
                pdf.addPage();
                position = -(imgHeight - heightLeft) + 10;
                pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
                heightLeft -= (pdfHeight - 20);
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
                    <h2 className="text-xl font-bold text-slate-900 mb-1 print:text-[10px] print:mb-0 print:font-bold">Fahrtenbericht</h2>
                    <p className="text-sm text-slate-600 print:text-[8px] print:leading-tight">
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

                <div className="flex flex-wrap gap-3 mb-4 print:gap-1 print:mb-1">
                    <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                        <SelectTrigger className="w-28 print:!w-16 print:!h-6 print:!text-[8px] print:!px-1 print:!py-0">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map(year => (
                                <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(v)}>
                        <SelectTrigger className="w-48 print:!w-24 print:!h-6 print:!text-[8px] print:!px-1 print:!py-0">
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
                        <SelectTrigger className="w-40 print:!w-24 print:!h-6 print:!text-[8px] print:!px-1 print:!py-0">
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
                        <SelectTrigger className="w-40 print:!w-24 print:!h-6 print:!text-[8px] print:!px-1 print:!py-0">
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

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4 print:bg-slate-100 print:p-2 print:mb-2 print:rounded print:border print:border-slate-300">
                    <div className="flex items-center justify-between">
                        <div className="print:flex print:items-center print:gap-2">
                            <div className="text-sm text-slate-600 mb-1 print:text-[8px] print:mb-0 print:leading-tight">Gesamt:</div>
                            <div className="text-3xl font-bold text-blue-600 print:text-[8px] print:font-bold print:leading-tight">
                                {monthlyTotal.toFixed(1)} km
                            </div>
                            <div className="text-xs text-slate-500 mt-1 print:text-[8px] print:mt-0 print:leading-tight">
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
                                <TableHead className="w-28 py-6 print:!py-[3px] print:!px-[3px] print:!text-[8px] print:!font-bold print:!leading-tight">Datum</TableHead>
                                <TableHead className="py-6 print:!py-[3px] print:!px-[3px] print:!text-[8px] print:!font-bold print:!leading-tight">Projekt</TableHead>
                                <TableHead className="py-6 print:!py-[3px] print:!px-[3px] print:!text-[8px] print:!font-bold print:!leading-tight">Kunde</TableHead>
                                <TableHead className="py-6 print:!py-[3px] print:!px-[3px] print:!text-[8px] print:!font-bold print:!leading-tight">Aktivität</TableHead>
                                <TableHead className="text-right py-6 print:!py-[3px] print:!px-[3px] print:!text-[8px] print:!font-bold print:!leading-tight">km</TableHead>
                                <TableHead className="text-right py-6 print:!py-[3px] print:!px-[3px] print:!text-[8px] print:!font-bold print:!leading-tight">Satz</TableHead>
                                <TableHead className="text-right py-6 print:!py-[3px] print:!px-[3px] print:!text-[8px] print:!font-bold print:!leading-tight">Betrag</TableHead>
                                <TableHead className="w-12 print:hidden"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredActivities.length > 0 ? (
                                filteredActivities.map(item => {
                                    const project = item.project_id ? getProject(item.project_id) : null;
                                    
                                    let customer = null;
                                    if (item.type === 'manual' && item.customer_id) {
                                        customer = getCustomer(item.customer_id);
                                    } else if (item.source === 'theme' && item.company_id) {
                                        customer = getCustomer(item.company_id);
                                    } else if (project) {
                                        customer = getCustomer(project.customer_id);
                                    }
                                    
                                    const rate = calculateTaxRate(item.date);
                                    const amount = item.distance * rate;
                                    
                                    return (
                                        <TableRow key={`${item.type}-${item.id}`} className="hover:bg-slate-50 print:hover:bg-transparent">
                                            <TableCell className="text-sm py-6 print:!py-[3px] print:!px-[3px] print:!text-[8px] print:!leading-tight print:!font-normal">
                                               <Calendar className="w-3 h-3 text-slate-400 print:hidden inline mr-1" />
                                               {format(parseISO(item.date), "dd.MM.yy", { locale: de })}
                                            </TableCell>
                                            <TableCell className="text-sm py-6 print:!py-[3px] print:!px-[3px] print:!text-[8px] print:!leading-tight print:!font-normal">
                                               <FolderKanban className="w-3 h-3 text-slate-400 print:hidden inline mr-1" />
                                               <span className="break-words">
                                                   {item.source === 'theme' 
                                                       ? themes.find(t => t.id === item.theme_id)?.name || 'Business'
                                                       : project?.name || 'N/A'}
                                               </span>
                                            </TableCell>
                                            <TableCell className="text-sm py-6 print:!py-[3px] print:!px-[3px] print:!text-[8px] print:!leading-tight print:!font-normal">
                                               <Building2 className="w-3 h-3 text-slate-400 print:hidden inline mr-1" />
                                               <span className="break-words">{customer?.company || 'N/A'}</span>
                                            </TableCell>
                                            <TableCell className="text-sm py-6 print:!py-[3px] print:!px-[3px] print:!text-[8px] print:!leading-tight print:!font-normal">
                                               <div className="break-words">{item.title}</div>
                                            </TableCell>
                                            <TableCell className="text-sm text-right py-6 print:!py-[3px] print:!px-[3px] print:!text-[8px] print:!leading-tight print:!font-normal">
                                               <Badge variant="secondary" className="font-mono print:border-0 print:bg-transparent print:p-0 print:text-[8px] print:font-normal">
                                                   {item.distance?.toFixed(1)}
                                               </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-right py-6 print:!py-[3px] print:!px-[3px] print:!text-[8px] print:!leading-tight print:!font-normal">
                                               {(rate * 100).toFixed(0)}
                                            </TableCell>
                                            <TableCell className="text-sm text-right py-6 print:!py-[3px] print:!px-[3px] print:!text-[8px] print:!leading-tight print:!font-normal">
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