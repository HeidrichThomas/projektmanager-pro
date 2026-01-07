import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import { de } from "date-fns/locale";

export default function TimeCalendar({ timeEntries, selectedMonth, onMonthChange }) {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const getHoursForDay = (day) => {
        const dayEntries = timeEntries.filter(entry => 
            isSameDay(parseISO(entry.date), day)
        );
        const totalMinutes = dayEntries.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0);
        return (totalMinutes / 60).toFixed(1);
    };
    
    const getTotalHours = () => {
        const totalMinutes = timeEntries.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0);
        return (totalMinutes / 60).toFixed(1);
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-slate-600" />
                        Zeitübersicht
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onMonthChange(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
                            className="px-3 py-1 text-sm hover:bg-slate-100 rounded"
                        >
                            ←
                        </button>
                        <span className="text-sm font-normal">
                            {format(selectedMonth, "MMMM yyyy", { locale: de })}
                        </span>
                        <button
                            onClick={() => onMonthChange(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
                            className="px-3 py-1 text-sm hover:bg-slate-100 rounded"
                        >
                            →
                        </button>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-4">
                    {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
                        <div key={day} className="text-center text-xs font-semibold text-slate-500 py-2">
                            {day}
                        </div>
                    ))}
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                    {Array((monthStart.getDay() + 6) % 7).fill(null).map((_, i) => (
                        <div key={`empty-${i}`} />
                    ))}
                    
                    {daysInMonth.map(day => {
                        const hours = parseFloat(getHoursForDay(day));
                        const hasHours = hours > 0;
                        
                        return (
                            <div
                                key={day.toISOString()}
                                className={`
                                    p-2 rounded-lg text-center text-sm transition-all
                                    ${hasHours 
                                        ? 'bg-blue-50 border-2 border-blue-200 font-semibold' 
                                        : 'bg-slate-50 border border-slate-200'
                                    }
                                `}
                            >
                                <div className="text-xs text-slate-600">{format(day, 'd')}</div>
                                {hasHours && (
                                    <div className="text-xs text-blue-700 font-bold mt-1">
                                        {hours}h
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                
                <div className="mt-6 pt-4 border-t flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Gesamt diesen Monat:</span>
                    <span className="text-2xl font-bold text-slate-900">{getTotalHours()}h</span>
                </div>
            </CardContent>
        </Card>
    );
}