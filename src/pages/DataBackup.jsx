import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
    Database, Download, Upload, FileJson, 
    CheckCircle2, AlertCircle, Loader2
} from "lucide-react";
import { toast } from "sonner";

export default function DataBackup() {
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);

    const { data: customers = [] } = useQuery({
        queryKey: ['customers'],
        queryFn: () => base44.entities.Customer.list()
    });

    const { data: projects = [] } = useQuery({
        queryKey: ['projects'],
        queryFn: () => base44.entities.Project.list()
    });

    const { data: activities = [] } = useQuery({
        queryKey: ['activities'],
        queryFn: () => base44.entities.Activity.list()
    });

    const { data: tasks = [] } = useQuery({
        queryKey: ['tasks'],
        queryFn: () => base44.entities.Task.list()
    });

    const handleExport = () => {
        const backupData = {
            exportDate: new Date().toISOString(),
            version: "1.0",
            data: {
                customers,
                projects,
                activities,
                tasks
            },
            statistics: {
                customersCount: customers.length,
                projectsCount: projects.length,
                activitiesCount: activities.length,
                tasksCount: tasks.length
            }
        };

        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `projektmanager-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success("Daten erfolgreich exportiert");
    };

    const handleImport = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setImporting(true);
        setImportResult(null);

        try {
            const text = await file.text();
            const backupData = JSON.parse(text);

            if (!backupData.data) {
                throw new Error("Ungültiges Backup-Format");
            }

            const result = {
                customers: 0,
                projects: 0,
                activities: 0,
                tasks: 0,
                errors: []
            };

            // Import Customers
            if (backupData.data.customers && Array.isArray(backupData.data.customers)) {
                for (const customer of backupData.data.customers) {
                    try {
                        const { id, created_date, updated_date, created_by, ...customerData } = customer;
                        await base44.entities.Customer.create(customerData);
                        result.customers++;
                    } catch (error) {
                        result.errors.push(`Kunde "${customer.company}": ${error.message}`);
                    }
                }
            }

            // Import Projects
            if (backupData.data.projects && Array.isArray(backupData.data.projects)) {
                for (const project of backupData.data.projects) {
                    try {
                        const { id, created_date, updated_date, created_by, ...projectData } = project;
                        await base44.entities.Project.create(projectData);
                        result.projects++;
                    } catch (error) {
                        result.errors.push(`Projekt "${project.name}": ${error.message}`);
                    }
                }
            }

            // Import Activities
            if (backupData.data.activities && Array.isArray(backupData.data.activities)) {
                for (const activity of backupData.data.activities) {
                    try {
                        const { id, created_date, updated_date, created_by, ...activityData } = activity;
                        await base44.entities.Activity.create(activityData);
                        result.activities++;
                    } catch (error) {
                        result.errors.push(`Aktivität "${activity.title}": ${error.message}`);
                    }
                }
            }

            // Import Tasks
            if (backupData.data.tasks && Array.isArray(backupData.data.tasks)) {
                for (const task of backupData.data.tasks) {
                    try {
                        const { id, created_date, updated_date, created_by, ...taskData } = task;
                        await base44.entities.Task.create(taskData);
                        result.tasks++;
                    } catch (error) {
                        result.errors.push(`Aufgabe "${task.title}": ${error.message}`);
                    }
                }
            }

            setImportResult(result);
            
            if (result.errors.length === 0) {
                toast.success("Daten erfolgreich importiert");
            } else {
                toast.warning("Import abgeschlossen mit Warnungen");
            }

            // Refresh all queries
            window.location.reload();

        } catch (error) {
            toast.error("Import fehlgeschlagen: " + error.message);
            setImportResult({ errors: [error.message] });
        } finally {
            setImporting(false);
            event.target.value = '';
        }
    };

    const totalRecords = customers.length + projects.length + activities.length + tasks.length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Database className="w-8 h-8 text-slate-600" />
                        Datensicherung
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Exportieren und importieren Sie Ihre Daten zur Sicherung oder Migration
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <Card className="border-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Download className="w-5 h-5 text-emerald-600" />
                                Daten exportieren
                            </CardTitle>
                            <CardDescription>
                                Erstellen Sie eine Sicherungskopie aller Ihrer Daten
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="bg-slate-50 rounded-lg p-4">
                                    <p className="text-sm font-medium text-slate-700 mb-2">
                                        Aktuelle Datenmenge:
                                    </p>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-slate-500">Kunden/Lieferanten:</span>
                                            <span className="font-semibold ml-2">{customers.length}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">Projekte:</span>
                                            <span className="font-semibold ml-2">{projects.length}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">Aktivitäten:</span>
                                            <span className="font-semibold ml-2">{activities.length}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">Aufgaben:</span>
                                            <span className="font-semibold ml-2">{tasks.length}</span>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-slate-200">
                                        <span className="text-slate-500">Gesamt:</span>
                                        <span className="font-bold ml-2 text-slate-900">{totalRecords} Einträge</span>
                                    </div>
                                </div>
                                <Button 
                                    onClick={handleExport}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                                    disabled={totalRecords === 0}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Jetzt exportieren
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Upload className="w-5 h-5 text-blue-600" />
                                Daten importieren
                            </CardTitle>
                            <CardDescription>
                                Laden Sie eine Sicherungsdatei hoch und stellen Sie Daten wieder her
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Alert>
                                    <AlertCircle className="w-4 h-4" />
                                    <AlertDescription className="text-xs">
                                        Der Import fügt neue Datensätze hinzu. Bestehende Daten werden nicht überschrieben.
                                    </AlertDescription>
                                </Alert>
                                
                                <div>
                                    <Label htmlFor="import-file" className="text-slate-700 font-medium">
                                        Backup-Datei auswählen
                                    </Label>
                                    <div className="mt-2">
                                        <Input
                                            id="import-file"
                                            type="file"
                                            accept=".json"
                                            onChange={handleImport}
                                            disabled={importing}
                                            className="cursor-pointer"
                                        />
                                    </div>
                                </div>

                                {importing && (
                                    <div className="flex items-center justify-center gap-2 text-blue-600 py-4">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span className="font-medium">Importiere Daten...</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {importResult && (
                    <Card className="border-2 border-slate-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {importResult.errors.length === 0 ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-amber-600" />
                                )}
                                Import-Ergebnis
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="bg-emerald-50 rounded-lg p-4">
                                    <p className="text-sm font-medium text-emerald-900 mb-3">
                                        Erfolgreich importiert:
                                    </p>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-emerald-700">Kunden/Lieferanten:</span>
                                            <span className="font-semibold ml-2">{importResult.customers}</span>
                                        </div>
                                        <div>
                                            <span className="text-emerald-700">Projekte:</span>
                                            <span className="font-semibold ml-2">{importResult.projects}</span>
                                        </div>
                                        <div>
                                            <span className="text-emerald-700">Aktivitäten:</span>
                                            <span className="font-semibold ml-2">{importResult.activities}</span>
                                        </div>
                                        <div>
                                            <span className="text-emerald-700">Aufgaben:</span>
                                            <span className="font-semibold ml-2">{importResult.tasks}</span>
                                        </div>
                                    </div>
                                </div>

                                {importResult.errors.length > 0 && (
                                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                                        <p className="text-sm font-medium text-amber-900 mb-2">
                                            Warnungen ({importResult.errors.length}):
                                        </p>
                                        <div className="max-h-40 overflow-y-auto space-y-1">
                                            {importResult.errors.map((error, index) => (
                                                <p key={index} className="text-xs text-amber-800">
                                                    • {error}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card className="mt-6 bg-blue-50 border-blue-200">
                    <CardContent className="p-6">
                        <div className="flex gap-3">
                            <FileJson className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-900">
                                <p className="font-medium mb-1">Hinweise zur Datensicherung:</p>
                                <ul className="space-y-1 text-blue-800">
                                    <li>• Exportierte Daten werden als JSON-Datei gespeichert</li>
                                    <li>• Beim Import werden nur neue Datensätze hinzugefügt</li>
                                    <li>• System-Felder (ID, Erstellungsdatum) werden automatisch neu generiert</li>
                                    <li>• Erstellen Sie regelmäßig Backups zur Datensicherheit</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}