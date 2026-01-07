import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Save, X, Euro } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function BillingDialog({ open, onClose, onBill, timeEntries }) {
    const [hourlyRate, setHourlyRate] = useState("");
    const [selectedEntries, setSelectedEntries] = useState([]);
    
    const totalMinutes = selectedEntries.reduce((sum, id) => {
        const entry = timeEntries.find(e => e.id === id);
        return sum + (entry?.duration_minutes || 0);
    }, 0);
    
    const totalHours = (totalMinutes / 60).toFixed(2);
    const totalAmount = (totalHours * parseFloat(hourlyRate || 0)).toFixed(2);
    
    const handleSubmit = (e) => {
        e.preventDefault();
        onBill(selectedEntries, parseFloat(hourlyRate), parseFloat(totalAmount));
        setSelectedEntries([]);
        setHourlyRate("");
    };
    
    const toggleEntry = (id) => {
        setSelectedEntries(prev => 
            prev.includes(id) ? prev.filter(eid => eid !== id) : [...prev, id]
        );
    };
    
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Euro className="w-5 h-5 text-green-600" />
                        Zeiten abrechnen
                    </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div>
                        <Label>Stundensatz (EUR) *</Label>
                        <Input
                            type="number"
                            step="0.01"
                            value={hourlyRate}
                            onChange={(e) => setHourlyRate(e.target.value)}
                            placeholder="z.B. 75.00"
                            className="mt-1.5"
                            required
                        />
                    </div>
                    
                    <div>
                        <Label className="mb-3 block">Nicht abgerechnete Zeiten auswählen</Label>
                        <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3">
                            {timeEntries.filter(e => !e.is_billed).map(entry => (
                                <div key={entry.id} className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded">
                                    <Checkbox
                                        checked={selectedEntries.includes(entry.id)}
                                        onCheckedChange={() => toggleEntry(entry.id)}
                                    />
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <span className="font-medium text-sm">{entry.date}</span>
                                            <span className="text-sm font-bold text-slate-700">
                                                {(entry.duration_minutes / 60).toFixed(2)}h
                                            </span>
                                        </div>
                                        {entry.description && (
                                            <p className="text-xs text-slate-500 mt-1">{entry.description}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {selectedEntries.length > 0 && (
                        <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Ausgewählte Stunden:</span>
                                <span className="font-semibold">{totalHours}h</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Stundensatz:</span>
                                <span className="font-semibold">{hourlyRate || 0} EUR</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                <span>Gesamtbetrag:</span>
                                <span className="text-green-600">{totalAmount} EUR</span>
                            </div>
                        </div>
                    )}
                    
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>
                            <X className="w-4 h-4 mr-2" />
                            Abbrechen
                        </Button>
                        <Button 
                            type="submit" 
                            className="bg-green-600 hover:bg-green-700"
                            disabled={selectedEntries.length === 0}
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Abrechnen
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}