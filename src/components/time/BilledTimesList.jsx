import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Euro } from "lucide-react";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";

export default function BilledTimesList({ timeEntries }) {
    const billedEntries = timeEntries.filter(e => e.is_billed);
    
    if (billedEntries.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        Abgerechnete Zeiten
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-500 text-center py-8">Noch keine Zeiten abgerechnet</p>
                </CardContent>
            </Card>
        );
    }
    
    const totalAmount = billedEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        Abgerechnete Zeiten
                    </div>
                    <Badge className="bg-green-100 text-green-700">
                        Gesamt: {totalAmount.toFixed(2)} EUR
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {billedEntries.map(entry => (
                        <div key={entry.id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="font-medium text-slate-900">
                                        {format(parseISO(entry.date), "dd. MMMM yyyy", { locale: de })}
                                    </div>
                                    <div className="text-sm text-slate-600">
                                        Abgerechnet am: {entry.billing_date && format(parseISO(entry.billing_date), "dd.MM.yyyy", { locale: de })}
                                    </div>
                                </div>
                                <Badge variant="secondary" className="bg-green-100 text-green-700">
                                    <Euro className="w-3 h-3 mr-1" />
                                    {entry.amount?.toFixed(2)} EUR
                                </Badge>
                            </div>
                            <div className="flex gap-4 text-sm text-slate-600">
                                <span>{(entry.duration_minutes / 60).toFixed(2)}h</span>
                                <span>@ {entry.hourly_rate} EUR/h</span>
                            </div>
                            {entry.description && (
                                <p className="text-sm text-slate-600 mt-2 pt-2 border-t border-green-200">
                                    {entry.description}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}