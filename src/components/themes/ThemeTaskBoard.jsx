import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Calendar, AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "sonner";
import ThemeTaskForm from "./ThemeTaskForm";

const columns = [
    { id: "todo", label: "Zu erledigen", color: "bg-blue-50 border-blue-200" },
    { id: "in_progress", label: "In Bearbeitung", color: "bg-amber-50 border-amber-200" },
    { id: "review", label: "Überprüfung", color: "bg-purple-50 border-purple-200" },
    { id: "done", label: "Erledigt", color: "bg-emerald-50 border-emerald-200" }
];

const priorityConfig = {
    low: { label: "Niedrig", color: "bg-slate-100 text-slate-700" },
    medium: { label: "Mittel", color: "bg-blue-100 text-blue-700" },
    high: { label: "Hoch", color: "bg-red-100 text-red-700" }
};

export default function ThemeTaskBoard({ themeId }) {
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const queryClient = useQueryClient();

    const { data: tasks = [] } = useQuery({
        queryKey: ['themeTasks', themeId],
        queryFn: () => base44.entities.ThemeTask.filter({ theme_id: themeId }, 'order'),
        enabled: !!themeId
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.ThemeTask.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['themeTasks', themeId] });
            setShowForm(false);
            toast.success("Kachel erstellt");
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.ThemeTask.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['themeTasks', themeId] });
            setShowForm(false);
            setEditingTask(null);
            toast.success("Kachel aktualisiert");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.ThemeTask.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['themeTasks', themeId] });
            toast.success("Kachel gelöscht");
        }
    });

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const taskId = result.draggableId;
        const newColumn = result.destination.droppableId;
        const newOrder = result.destination.index;

        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        updateMutation.mutate({
            id: taskId,
            data: { ...task, column: newColumn, order: newOrder }
        });
    };

    const handleSave = (data) => {
        if (editingTask) {
            updateMutation.mutate({ id: editingTask.id, data });
        } else {
            createMutation.mutate({ ...data, theme_id: themeId });
        }
    };

    const tasksByColumn = columns.reduce((acc, col) => {
        acc[col.id] = tasks
            .filter(t => t.column === col.id)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
        return acc;
    }, {});

    return (
        <>
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {columns.map(column => (
                        <div key={column.id} className="flex flex-col">
                            <div className={`${column.color} border-2 rounded-lg p-3 mb-3`}>
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-semibold text-slate-900">{column.label}</h3>
                                    <Badge variant="secondary" className="text-xs">
                                        {tasksByColumn[column.id].length}
                                    </Badge>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="w-full mt-2 text-xs"
                                    onClick={() => {
                                        setEditingTask({ column: column.id });
                                        setShowForm(true);
                                    }}
                                >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Neue Kachel
                                </Button>
                            </div>

                            <Droppable droppableId={column.id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`space-y-3 flex-1 p-2 rounded-lg transition-colors min-h-[200px] ${
                                            snapshot.isDraggingOver ? "bg-slate-100" : ""
                                        }`}
                                    >
                                        {tasksByColumn[column.id].map((task, index) => (
                                            <Draggable key={task.id} draggableId={task.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`${
                                                            snapshot.isDragging ? "shadow-2xl rotate-1" : ""
                                                        } transition-all`}
                                                    >
                                                        <Card className="group hover:shadow-lg transition-all">
                                                            <CardContent className="p-3">
                                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                                    <h4 className="font-medium text-sm text-slate-900 flex-1">
                                                                        {task.title}
                                                                    </h4>
                                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            className="h-6 w-6 p-0"
                                                                            onClick={() => {
                                                                                setEditingTask(task);
                                                                                setShowForm(true);
                                                                            }}
                                                                        >
                                                                            <Pencil className="w-3 h-3" />
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            className="h-6 w-6 p-0 text-red-600"
                                                                            onClick={() => {
                                                                                if (confirm(`"${task.title}" wirklich löschen?`)) {
                                                                                    deleteMutation.mutate(task.id);
                                                                                }
                                                                            }}
                                                                        >
                                                                            <Trash2 className="w-3 h-3" />
                                                                        </Button>
                                                                    </div>
                                                                </div>

                                                                {task.description && (
                                                                    <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                                                                        {task.description}
                                                                    </p>
                                                                )}

                                                                <div className="flex flex-wrap gap-1">
                                                                    <Badge className={`text-xs ${priorityConfig[task.priority]?.color}`}>
                                                                        {priorityConfig[task.priority]?.label}
                                                                    </Badge>
                                                                    {task.due_date && (
                                                                        <Badge variant="outline" className="text-xs">
                                                                            <Calendar className="w-3 h-3 mr-1" />
                                                                            {format(new Date(task.due_date), 'dd.MM.', { locale: de })}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                        {tasksByColumn[column.id].length === 0 && (
                                            <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
                                                Keine Kacheln
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>

            <ThemeTaskForm
                open={showForm}
                onClose={() => {
                    setShowForm(false);
                    setEditingTask(null);
                }}
                onSave={handleSave}
                task={editingTask}
            />
        </>
    );
}