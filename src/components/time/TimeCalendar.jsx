import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Clock, X } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { Button } from "@/components/ui/button";

export default function TimeCalendar({ timeEntries, selectedMonth, onMonthChange, onEditEntry, onDeleteEntry }) {
    const [selectedDay, setSelectedDay] = useState(null);
    const [showDayDetails, setShowDayDetails] = useState(false);
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const getHoursForDay = (day) => {
        const dayEntries = timeEntries.filter(entry => {
            if (!entry.date) return false;
            try {
                return isSameDay(parseISO(entry.date), day);
            } catch {
                return false;
            }
        });
        const totalMinutes = dayEntries.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0);
        return (totalMinutes / 60).toFixed(1);
    };
    
    const getTotalHours = () => {
        const totalMinutes = timeEntries.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0);
        return (totalMinutes / 60).toFixed(1);
    };

    const handleDayClick = (day) => {
        const dayEntries = timeEntries.filter(entry => {
            if (!entry.date) return false;
            try {
                return isSameDay(parseISO(entry.date), day);
            } catch {
                return false;
            }
        });
        if (dayEntries.length > 0) {
            setSelectedDay({ day, entries: dayEntries });
            setShowDayDetails(true);
        }
    };
    
    return (
        <>
        <Card>
            <CardHeader className="p-4">
                <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-600" />
                        Kalender
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={() => onMonthChange(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
                            className="px-2 py-1 text-xs hover:bg-slate-100 rounded"
                        >
                            ←
                        </button>
                        <span className="text-xs font-normal">
                            {format(selectedMonth, "MMM yyyy", { locale: de })}
                        </span>
                        <button
                            onClick={() => onMonthChange(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
                            className="px-2 py-1 text-xs hover:bg-slate-100 rounded"
                        >
                            →
                        </button>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
                        <div key={day} className="text-center text-[10px] font-semibold text-slate-500 py-1">
                            {day}
                        </div>
                    ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                    {Array((monthStart.getDay() + 6) % 7).fill(null).map((_, i) => (
                        <div key={`empty-${i}`} />
                    ))}
                    
                    {daysInMonth.map(day => {
                        const hours = parseFloat(getHoursForDay(day));
                        const hasHours = hours > 0;
                        const today = isToday(day);
                        
                        return (
                            <div
                                key={day.toISOString()}
                                onClick={() => handleDayClick(day)}
                                className={`
                                    p-1 rounded text-center text-[10px] transition-all
                                    ${hasHours ? 'cursor-pointer hover:scale-105' : ''}
                                    ${hasHours 
                                        ? 'bg-blue-50 border border-blue-200 font-semibold' 
                                        : 'bg-slate-50 border border-slate-200'
                                    }
                                    ${today ? 'ring-2 ring-red-500' : ''}
                                `}
                            >
                                <div className={today ? 'text-red-600 font-bold' : 'text-slate-600'}>{format(day, 'd')}</div>
                                {hasHours && (
                                    <div className="text-blue-700 font-bold">
                                        {hours}h
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                
                <div className="mt-3 pt-3 border-t flex items-center justify-between">
                    <span className="text-xs text-slate-600">Gesamt:</span>
                    <span className="text-lg font-bold text-slate-900">{getTotalHours()}h</span>
                </div>
            </CardContent>
        </Card>

        {/* Day Details Dialog */}
        <Dialog open={showDayDetails} onOpenChange={setShowDayDetails}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-slate-600" />
                        Zeiteinträge - {selectedDay && format(selectedDay.day, "dd. MMMM yyyy", { locale: de })}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-3 mt-4">
                    {selectedDay?.entries.map((entry) => (
                        <div key={entry.id} className="p-3 border rounded-lg bg-white hover:bg-slate-50 transition-colors">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-lg">{(entry.duration_minutes / 60).toFixed(2)}h</span>
                                        {entry.start_time && entry.end_time && (() => {
                                            try {
                                                return (
                                                    <span className="text-sm text-slate-500">
                                                        {format(parseISO(entry.start_time), "HH:mm")} - {format(parseISO(entry.end_time), "HH:mm")}
                                                    </span>
                                                );
                                            } catch {
                                                return null;
                                            }
                                        })()}
                                    </div>
                                    {entry.description && (
                                        <p className="text-sm text-slate-600 mt-1">{entry.description}</p>
                                    )}
                                    {entry.is_billed && (
                                        <div className="mt-2">
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                                Abgerechnet: {entry.amount?.toFixed(2)} EUR
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-1">
                                    {onEditEntry && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                setShowDayDetails(false);
                                                onEditEntry(entry);
                                            }}
                                        >
                                            Bearbeiten
                                        </Button>
                                    )}
                                    {onDeleteEntry && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                if (confirm("Zeiteintrag wirklich löschen?")) {
                                                    onDeleteEntry(entry);
                                                    const remainingEntries = selectedDay.entries.filter(e => e.id !== entry.id);
                                                    if (remainingEntries.length === 0) {
                                                        setShowDayDetails(false);
                                                    } else {
                                                        setSelectedDay({...selectedDay, entries: remainingEntries});
                                                    }
                                                }
                                            }}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {selectedDay?.entries.length > 0 && (
                        <div className="pt-3 border-t flex justify-between items-center">
                            <span className="font-semibold text-slate-700">Gesamt:</span>
                            <span className="text-xl font-bold text-slate-900">
                                {(selectedDay.entries.reduce((sum, e) => sum + (e.duration_minutes || 0), 0) / 60).toFixed(2)}h
                            </span>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
        </>
    );
}