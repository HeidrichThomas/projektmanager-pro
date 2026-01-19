import React, { useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navigation, Calendar, Building2, FolderKanban, TrendingUp, Printer, FileDown } from "lucide-react";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function TravelOverview() {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [filterProject, setFilterProject] = useState("all");
    const [filterCustomer, setFilterCustomer] = useState("all");
    const reportRef = useRef(null);

    const { data: activities = [] } = useQuery({
        queryKey: ['activities'],
        queryFn: () => base44.entities.Activity.list()
    });

    const { data: projects = [] } = useQuery({
        queryKey: ['projects'],
        queryFn: () => base44.entities.Project.list()
    });

    const { data: customers = [] } = useQuery({
        queryKey: ['customers'],
        queryFn: () => base44.entities.Customer.list()
    });

    const travelActivities = useMemo(() => {
        return activities
            .filter(a => a.requires_travel && a.travel_distance_km)
            .sort((a, b) => new Date(b.activity_date) - new Date(a.activity_date));
    }, [activities]);

    const filteredActivities = useMemo(() => {
        return travelActivities.filter(a => {
            if (!a.activity_date) return false;
            const date = parseISO(a.activity_date);
            
            const monthMatch = date.getMonth() + 1 === selectedMonth;
            const yearMatch = date.getFullYear() === selectedYear;
            const projectMatch = filterProject === "all" || a.project_id === filterProject;
            
            let customerMatch = true;
            if (filterCustomer !== "all") {
                const project = projects.find(p => p.id === a.project_id);
                customerMatch = project && project.customer_id === filterCustomer;
            }
            
            return monthMatch && yearMatch && projectMatch && customerMatch;
        });
    }, [travelActivities, selectedMonth, selectedYear, filterProject, filterCustomer, projects]);

    const monthlyTotal = useMemo(() => {
        return filteredActivities.reduce((sum, a) => sum + (a.travel_distance_km || 0), 0);
    }, [filteredActivities]);

    const getProject = (id) => projects.find(p => p.id === id);
    const getCustomer = (id) => customers.find(c => c.id === id);

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
        if (!reportRef.current) return;
        
        const canvas = await html2canvas(reportRef.current, {
            scale: 2.5,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const imgWidth = 190;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        let heightLeft = imgHeight;
        let position = 10;
        
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= 287;
        
        while (heightLeft > 0) {
            position = heightLeft - imgHeight + 10;
            pdf.addPage();
            pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
            heightLeft -= 287;
        }
        
        const fileName = `Fahrtenbericht_${months.find(m => m.value === selectedMonth)?.label}_${selectedYear}.pdf`;
        pdf.save(fileName);
    };

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Navigation className="w-5 h-5 text-blue-600" />
                        Geschäftliche Fahrten
                    </CardTitle>
                    <div className="flex gap-2">
                        <Button onClick={handlePrint} variant="outline" size="sm">
                            <Printer className="w-4 h-4 mr-2" />
                            Drucken
                        </Button>
                        <Button onClick={handleExportPDF} variant="outline" size="sm">
                            <FileDown className="w-4 h-4 mr-2" />
                            PDF
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent ref={reportRef}>
                <div className="mb-4 print:mb-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-1">Fahrtenbericht</h2>
                    <p className="text-sm text-slate-600">
                        {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
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

                    <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map(month => (
                                <SelectItem key={month.value} value={String(month.value)}>
                                    {month.label}
                                </SelectItem>
                            ))}
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

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-slate-600 mb-1">Gesamtkilometer</div>
                            <div className="text-3xl font-bold text-blue-600">
                                {monthlyTotal.toFixed(1)} km
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                                {filteredActivities.length} Fahrten • {(monthlyTotal * 0.30).toFixed(2)} € absetzbar
                            </div>
                        </div>
                        <TrendingUp className="w-12 h-12 text-blue-400 opacity-50" />
                    </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead className="w-28 py-6">Datum</TableHead>
                                <TableHead className="py-6">Projekt</TableHead>
                                <TableHead className="py-6">Kunde</TableHead>
                                <TableHead className="py-6">Aktivität</TableHead>
                                <TableHead className="text-right py-6">Kilometer</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredActivities.length > 0 ? (
                                filteredActivities.map(activity => {
                                    const project = getProject(activity.project_id);
                                    const customer = project ? getCustomer(project.customer_id) : null;
                                    
                                    return (
                                        <TableRow key={activity.id} className="hover:bg-slate-50">
                                            <TableCell className="font-medium text-sm py-6">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3 text-slate-400" />
                                                    {format(parseISO(activity.activity_date), "dd.MM.yy", { locale: de })}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-6">
                                                <div className="flex items-center gap-1 text-sm">
                                                    <FolderKanban className="w-3 h-3 text-slate-400" />
                                                    <span className="truncate max-w-[150px]">{project?.name || 'N/A'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-6">
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Building2 className="w-3 h-3 text-slate-400" />
                                                    <span className="truncate max-w-[150px]">{customer?.company || 'N/A'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600 max-w-[200px] truncate py-6">
                                                {activity.title}
                                            </TableCell>
                                            <TableCell className="text-right py-6">
                                                <Badge variant="secondary" className="font-mono">
                                                    {activity.travel_distance_km?.toFixed(1)} km
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                        <Navigation className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                        Keine Fahrten in diesem Zeitraum
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}