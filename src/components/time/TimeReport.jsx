import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Download, Printer } from "lucide-react";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";

export default function TimeReport({ open, onClose, timeEntries, project, customer }) {
    const totalMinutes = timeEntries.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0);
    const totalHours = (totalMinutes / 60).toFixed(2);
    const billedEntries = timeEntries.filter(e => e.is_billed);
    const unbilledEntries = timeEntries.filter(e => !e.is_billed);
    const totalBilledAmount = billedEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0);

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        const content = generateReportText();
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Zeitbericht_${project?.name}_${new Date().toISOString().slice(0, 10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const generateReportText = () => {
        let text = `ZEITBERICHT\n`;
        text += `===================\n\n`;
        text += `Projekt: ${project?.name || 'Unbekannt'}\n`;
        text += `Kunde: ${customer?.company || 'Unbekannt'}\n`;
        text += `Erstellt am: ${format(new Date(), "dd.MM.yyyy HH:mm", { locale: de })}\n\n`;
        text += `ZUSAMMENFASSUNG\n`;
        text += `-------------------\n`;
        text += `Gesamtstunden: ${totalHours}h\n`;
        text += `Nicht abgerechnet: ${unbilledEntries.length} Einträge\n`;
        text += `Abgerechnet: ${billedEntries.length} Einträge (${totalBilledAmount.toFixed(2)} EUR)\n\n`;
        
        text += `DETAILLIERTE ZEITEINTRÄGE\n`;
        text += `-------------------\n`;
        timeEntries.forEach(entry => {
            text += `\nDatum: ${format(parseISO(entry.date), "dd.MM.yyyy", { locale: de })}\n`;
            text += `Dauer: ${(entry.duration_minutes / 60).toFixed(2)}h\n`;
            if (entry.description) text += `Beschreibung: ${entry.description}\n`;
            if (entry.is_billed) {
                text += `Status: ABGERECHNET (${entry.amount?.toFixed(2)} EUR)\n`;
            } else {
                text += `Status: Nicht abgerechnet\n`;
            }
            text += `---\n`;
        });
        
        return text;
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto print:max-w-full print:shadow-none">
                <DialogHeader className="print:hidden">
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-slate-600" />
                        Zeitbericht
                    </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6 mt-4" id="printable-report">
                    <div className="text-center border-b pb-4">
                        <h1 className="text-2xl font-bold text-slate-900">Zeitbericht</h1>
                        <p className="text-slate-600 mt-2">
                            Projekt: <span className="font-semibold">{project?.name}</span>
                        </p>
                        {customer && (
                            <p className="text-slate-600">
                                Kunde: <span className="font-semibold">{customer.company}</span>
                            </p>
                        )}
                        <p className="text-sm text-slate-500 mt-2">
                            Erstellt am: {format(new Date(), "dd. MMMM yyyy, HH:mm", { locale: de })} Uhr
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-slate-900">{totalHours}h</div>
                            <div className="text-sm text-slate-600">Gesamtstunden</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-amber-600">{unbilledEntries.length}</div>
                            <div className="text-sm text-slate-600">Nicht abgerechnet</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">{totalBilledAmount.toFixed(2)} €</div>
                            <div className="text-sm text-slate-600">Abgerechnet</div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-3">Zeiteinträge</h3>
                        <div className="space-y-2">
                            {timeEntries.map(entry => (
                                <div key={entry.id} className={`p-3 rounded-lg border ${entry.is_billed ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-medium">
                                                {format(parseISO(entry.date), "dd. MMMM yyyy", { locale: de })}
                                            </div>
                                            {entry.description && (
                                                <div className="text-sm text-slate-600 mt-1">{entry.description}</div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold">{(entry.duration_minutes / 60).toFixed(2)}h</div>
                                            {entry.is_billed && (
                                                <div className="text-sm text-green-700">{entry.amount?.toFixed(2)} EUR</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t print:hidden">
                    <Button variant="outline" onClick={handleDownload}>
                        <Download className="w-4 h-4 mr-2" />
                        Als TXT speichern
                    </Button>
                    <Button onClick={handlePrint} className="bg-slate-800 hover:bg-slate-900">
                        <Printer className="w-4 h-4 mr-2" />
                        Drucken
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}