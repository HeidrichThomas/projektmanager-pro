import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";

export default function PrivateTaskList({ themeId, tasks }) {
    const [newTaskTitle, setNewTaskTitle] = useState("");
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
        }
    });

    const deleteTaskMutation = useMutation({
        mutationFn: (id) => base44.entities.PrivateTask.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['privateTasks', themeId] });
        }
    });

    const handleAddTask = () => {
        if (newTaskTitle.trim()) {
            createTaskMutation.mutate({
                theme_id: themeId,
                title: newTaskTitle,
                status: "offen"
            });
        }
    };

    const handleToggleTask = (task) => {
        const newStatus = task.status === "erledigt" ? "offen" : "erledigt";
        updateTaskMutation.mutate({
            id: task.id,
            data: { ...task, status: newStatus }
        });
    };

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

            {tasks.length === 0 ? (
                <p className="text-center text-slate-500 py-8">Noch keine Aufgaben vorhanden</p>
            ) : (
                <div className="space-y-2">
                    {tasks.map(task => (
                        <div key={task.id} className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow">
                            <Checkbox
                                checked={task.status === "erledigt"}
                                onCheckedChange={() => handleToggleTask(task)}
                            />
                            <span className={`flex-1 ${task.status === "erledigt" ? "line-through text-slate-400" : "text-slate-900"}`}>
                                {task.title}
                            </span>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteTaskMutation.mutate(task.id)}
                                className="text-red-600 hover:text-red-700"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}