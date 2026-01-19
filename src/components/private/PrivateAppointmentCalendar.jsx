import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, MapPin, Pencil, Trash2 } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { de } from "date-fns/locale";

export default function PrivateAppointmentCalendar({ appointments, onAdd, onEdit, onDelete }) {
    const [selectedDate, setSelectedDate] = useState(new Date());

    const appointmentsOnSelectedDate = appointments.filter(apt => 
        isSameDay(new Date(apt.start_date), selectedDate)
    );

    const datesWithAppointments = appointments.map(apt => new Date(apt.start_date));

    return (
        <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900">Kalender</h3>
                    <Button size="sm" onClick={onAdd}>
                        <Plus className="w-4 h-4 mr-2" />
                        Termin
                    </Button>
                </div>
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    locale={de}
                    className="rounded-md border"
                    modifiers={{
                        hasAppointment: datesWithAppointments
                    }}
                    modifiersStyles={{
                        hasAppointment: {
                            fontWeight: 'bold',
                            backgroundColor: 'rgb(219 234 254)',
                        }
                    }}
                />
            </Card>

            <Card className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">
                    Termine am {format(selectedDate, "dd. MMMM yyyy", { locale: de })}
                </h3>
                
                {appointmentsOnSelectedDate.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        <Clock className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p>Keine Termine an diesem Tag</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {appointmentsOnSelectedDate.map(apt => (
                            <div key={apt.id} className="group p-4 border rounded-lg hover:shadow-md transition-all">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-slate-900 mb-1">{apt.title}</h4>
                                        {apt.description && (
                                            <p className="text-sm text-slate-600 mb-2">{apt.description}</p>
                                        )}
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <Clock className="w-3 h-3" />
                                            {format(new Date(apt.start_date), "HH:mm", { locale: de })}
                                            {apt.end_date && ` - ${format(new Date(apt.end_date), "HH:mm", { locale: de })}`}
                                        </div>
                                        {apt.location && (
                                            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                                <MapPin className="w-3 h-3" />
                                                {apt.location}
                                            </div>
                                        )}
                                        {apt.reminder && (
                                            <Badge variant="outline" className="mt-2">Erinnerung aktiv</Badge>
                                        )}
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="sm" variant="ghost" onClick={() => onEdit(apt)}>
                                            <Pencil className="w-3 h-3" />
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => onDelete(apt)} className="text-red-600">
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}