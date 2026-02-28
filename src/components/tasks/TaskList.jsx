import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckSquare, Calendar, Bell, Clock, Pencil, Trash2, Plus, Flag, GripVertical } from "lucide-react";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import { de } from "date-fns/locale";

const statusConfig = {
    offen: { label: "Offen", color: "bg-slate-100 text-slate-700" },
    in_arbeit: { label: "In Arbeit", color: "bg-amber-100 text-amber-700" },
    erledigt: { label: "Erledigt", color: "bg-emerald-100 text-emerald-700" }
};

const priorityConfig = {
    niedrig: { label: "Niedrig", color: "text-blue-500" },
    mittel: { label: "Mittel", color: "text-amber-500" },
    hoch: { label: "Hoch", color: "text-red-500" }
};

export default function TaskList({ tasks, onEdit, onDelete, onStatusChange, onLogWork, onReorder }) {
    const [workLogOpen, setWorkLogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [workEntry, setWorkEntry] = useState({ hours: "", note: "" });

    const handleDragEnd = (result) => {
        if (!result.destination) return;
        if (result.source.index === result.destination.index) return;
        const reordered = Array.from(tasks);
        const [moved] = reordered.splice(result.source.index, 1);
        reordered.splice(result.destination.index, 0, moved);
        onReorder && onReorder(reordered);
    };

    const openWorkLog = (task) => {
        setSelectedTask(task);
        setWorkEntry({ hours: "", note: "" });
        setWorkLogOpen(true);
    };

    const submitWorkLog = () => {
        if (selectedTask && workEntry.hours) {
            const newLog = {
                date: new Date().toISOString(),
                hours: parseFloat(workEntry.hours),
                note: workEntry.note
            };
            const updatedWorkLog = [...(selectedTask.work_log || []), newLog];
            const totalHours = updatedWorkLog.reduce((sum, entry) => sum + entry.hours, 0);
            onLogWork(selectedTask, { work_log: updatedWorkLog, worked_hours: totalHours });
            setWorkLogOpen(false);
        }
    };

    const getDueDateLabel = (date) => {
        if (!date) return null;
        const d = new Date(date);
        if (isToday(d)) return { text: "Heute fällig", urgent: true };
        if (isTomorrow(d)) return { text: "Morgen fällig", urgent: false };
        if (isPast(d)) return { text: "Überfällig", urgent: true };
        return { text: format(d, "dd.MM.yyyy", { locale: de }), urgent: false };
    };

    if (!tasks || tasks.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500">
                <CheckSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>Noch keine Aufgaben vorhanden</p>
            </div>
        );
    }

    return (
        <>
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="task-list">
                    {(provided) => (
                        <div className="space-y-3" {...provided.droppableProps} ref={provided.innerRef}>
                            {tasks.map((task, index) => {
                                const status = statusConfig[task.status] || statusConfig.offen;
                                const priority = priorityConfig[task.priority] || priorityConfig.mittel;
                                const dueLabel = getDueDateLabel(task.due_date);
                                
                                return (
                                    <Draggable key={task.id} draggableId={task.id} index={index}>
                                        {(provided, snapshot) => (
                                            <Card
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={`p-4 transition-all group ${task.status === 'erledigt' ? 'opacity-60' : ''} ${snapshot.isDragging ? 'shadow-lg ring-2 ring-slate-300' : ''}`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div {...provided.dragHandleProps} className="mt-1 cursor-grab text-slate-300 hover:text-slate-500 shrink-0">
                                                        <GripVertical className="w-4 h-4" />
                                                    </div>
                                                    <Checkbox
                                                        checked={task.status === 'erledigt'}
                                                        onCheckedChange={(checked) => onStatusChange(task, checked ? 'erledigt' : 'offen')}
                                                        className="mt-1"
                                                    />
                                                    
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div>
                                                                <h4 className={`font-medium ${task.status === 'erledigt' ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                                                                    {task.title}
                                                                </h4>
                                                                {task.description && (
                                                                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                                                                        {task.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-1 shrink-0">
                                                                <Flag className={`w-4 h-4 ${priority.color}`} />
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex flex-wrap items-center gap-2 mt-3">
                                                            <Badge variant="secondary" className={status.color}>
                                                                {status.label}
                                                            </Badge>
                                                            
                                                            {dueLabel && (
                                                                <Badge variant="outline" className={dueLabel.urgent ? 'border-red-300 text-red-600' : ''}>
                                                                    <Calendar className="w-3 h-3 mr-1" />
                                                                    {dueLabel.text}
                                                                </Badge>
                                                            )}
                                                            
                                                            {task.reminder_date && (
                                                                <Badge variant="outline" className="border-amber-300 text-amber-600">
                                                                    <Bell className="w-3 h-3 mr-1" />
                                                                    Erinnerung
                                                                </Badge>
                                                            )}
                                                            
                                                            {task.worked_hours > 0 && (
                                                                <Badge variant="outline">
                                                                    <Clock className="w-3 h-3 mr-1" />
                                                                    {task.worked_hours}h
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button size="sm" variant="ghost" onClick={() => openWorkLog(task)} title="Arbeitszeit erfassen">
                                                            <Clock className="w-3 h-3" />
                                                        </Button>
                                                        <Button size="sm" variant="ghost" onClick={() => onEdit(task)}>
                                                            <Pencil className="w-3 h-3" />
                                                        </Button>
                                                        <Button size="sm" variant="ghost" onClick={() => onDelete(task)} className="text-red-500 hover:text-red-700">
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                
                                                {task.work_log?.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-slate-100 ml-8">
                                                        <p className="text-xs text-slate-500 mb-2">Arbeitsprotokoll:</p>
                                                        <div className="space-y-1">
                                                            {task.work_log.slice(-3).map((entry, i) => (
                                                                <div key={i} className="text-xs text-slate-600 flex gap-2">
                                                                    <span className="text-slate-400">
                                                                        {format(new Date(entry.date), "dd.MM.yy", { locale: de })}
                                                                    </span>
                                                                    <span className="font-medium">{entry.hours}h</span>
                                                                    {entry.note && <span>- {entry.note}</span>}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </Card>
                                        )}
                                    </Draggable>
                                );
                            })}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
            
            <Dialog open={workLogOpen} onOpenChange={setWorkLogOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-slate-600" />
                            Arbeitszeit erfassen
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 mt-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700">Stunden</label>
                            <Input
                                type="number"
                                step="0.5"
                                min="0"
                                value={workEntry.hours}
                                onChange={(e) => setWorkEntry({...workEntry, hours: e.target.value})}
                                placeholder="z.B. 2.5"
                                className="mt-1"
                            />
                        </div>
                        
                        <div>
                            <label className="text-sm font-medium text-slate-700">Notiz (optional)</label>
                            <Input
                                value={workEntry.note}
                                onChange={(e) => setWorkEntry({...workEntry, note: e.target.value})}
                                placeholder="Was wurde gemacht?"
                                className="mt-1"
                            />
                        </div>
                        
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setWorkLogOpen(false)}>
                                Abbrechen
                            </Button>
                            <Button onClick={submitWorkLog} className="bg-slate-800 hover:bg-slate-900">
                                <Plus className="w-4 h-4 mr-1" />
                                Erfassen
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}