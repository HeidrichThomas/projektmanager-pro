import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, GripVertical, Pencil, Save, X } from "lucide-react";
import { toast } from "sonner";

export default function PrivateTaskList({ themeId, tasks }) {
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState("");
    const queryClient = useQueryClient();

    const createTaskMutation = useMutation({
        mutationFn: (data) => base44.entities.PrivateTask.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['privateTasks', themeId] });
            setNewTaskTitle("");
        }
    });

    const updateTaskMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.PrivateTask.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['privateTasks', themeId] });
            setEditingId(null);
        }
    });

    const deleteTaskMutation = useMutation({
        mutationFn: (id) => base44.entities.PrivateTask.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['privateTasks', themeId] });
            toast.success("Aufgabe gelöscht");
        }
    });

    const handleAddTask = () => {
        if (!newTaskTitle.trim()) return;
        const maxOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.order || 0)) + 1 : 0;
        createTaskMutation.mutate({
            theme_id: themeId,
            title: newTaskTitle.trim(),
            status: "offen",
            order: maxOrder
        });
    };

    const handleToggleTask = (task) => {
        const newStatus = task.status === "erledigt" ? "offen" : "erledigt";
        updateTaskMutation.mutate({ id: task.id, data: { status: newStatus } });
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;
        if (result.source.index === result.destination.index) return;

        const sorted = [...tasks].sort((a, b) => (a.order || 0) - (b.order || 0));
        const [moved] = sorted.splice(result.source.index, 1);
        sorted.splice(result.destination.index, 0, moved);

        sorted.forEach((task, index) => {
            base44.entities.PrivateTask.update(task.id, { order: index });
        });
        queryClient.invalidateQueries({ queryKey: ['privateTasks', themeId] });
    };

    const startEdit = (task) => {
        setEditingId(task.id);
        setEditingTitle(task.title);
    };

    const saveEdit = (task) => {
        if (!editingTitle.trim()) return;
        updateTaskMutation.mutate({ id: task.id, data: { title: editingTitle.trim() } });
    };

    const sortedTasks = [...tasks].sort((a, b) => (a.order || 0) - (b.order || 0));

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <Input
                    placeholder="Neue Aufgabe hinzufügen..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                />
                <Button onClick={handleAddTask}>
                    <Plus className="w-4 h-4" />
                </Button>
            </div>

            {sortedTasks.length === 0 ? (
                <p className="text-center text-slate-500 py-8">Noch keine Aufgaben vorhanden</p>
            ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="private-tasks">
                        {(provided) => (
                            <div className="space-y-2" {...provided.droppableProps} ref={provided.innerRef}>
                                {sortedTasks.map((task, index) => (
                                    <Draggable key={task.id} draggableId={task.id} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={`flex items-center gap-3 p-3 bg-white border rounded-lg group transition-all ${snapshot.isDragging ? 'shadow-lg' : 'hover:shadow-sm'}`}
                                            >
                                                <div {...provided.dragHandleProps} className="cursor-grab text-slate-300 hover:text-slate-500 touch-none">
                                                    <GripVertical className="w-4 h-4" />
                                                </div>
                                                <Checkbox
                                                    checked={task.status === "erledigt"}
                                                    onCheckedChange={() => handleToggleTask(task)}
                                                />
                                                {editingId === task.id ? (
                                                    <div className="flex flex-1 gap-2 items-center">
                                                        <Input
                                                            value={editingTitle}
                                                            onChange={(e) => setEditingTitle(e.target.value)}
                                                            className="flex-1 h-7 text-sm"
                                                            autoFocus
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') saveEdit(task);
                                                                if (e.key === 'Escape') setEditingId(null);
                                                            }}
                                                        />
                                                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => saveEdit(task)}>
                                                            <Save className="w-3 h-3 text-green-600" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)}>
                                                            <X className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <span className={`flex-1 text-sm ${task.status === "erledigt" ? "line-through text-slate-400" : "text-slate-900"}`}>
                                                            {task.title}
                                                        </span>
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-7 w-7"
                                                                onClick={() => startEdit(task)}
                                                            >
                                                                <Pencil className="w-3 h-3" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-7 w-7 text-red-600 hover:text-red-700"
                                                                onClick={() => {
                                                                    if (confirm("Aufgabe wirklich löschen?")) {
                                                                        deleteTaskMutation.mutate(task.id);
                                                                    }
                                                                }}
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            )}
        </div>
    );
}