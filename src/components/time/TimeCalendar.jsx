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
                        
                        return (
                            <div
                                key={day.toISOString()}
                                className={`
                                    p-1 rounded text-center text-[10px] transition-all
                                    ${hasHours 
                                        ? 'bg-blue-50 border border-blue-200 font-semibold' 
                                        : 'bg-slate-50 border border-slate-200'
                                    }
                                `}
                            >
                                <div className="text-slate-600">{format(day, 'd')}</div>
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
    );
}