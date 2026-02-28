import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, CheckSquare, GripVertical, Pencil, Save, X } from "lucide-react";
import { toast } from "sonner";

export default function ThemeChecklistManager({ themeId }) {
    const [newItemTitle, setNewItemTitle] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState("");
    const queryClient = useQueryClient();

    const { data: checklistItems = [] } = useQuery({
        queryKey: ['themeChecklistItems', themeId],
        queryFn: () => base44.entities.ThemeChecklistItem.filter({ theme_id: themeId }, 'order'),
        enabled: !!themeId
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.ThemeChecklistItem.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['themeChecklistItems', themeId] });
            setNewItemTitle("");
            toast.success("Checklisteneintrag hinzugefügt");
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.ThemeChecklistItem.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['themeChecklistItems', themeId] });
            setEditingId(null);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.ThemeChecklistItem.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['themeChecklistItems', themeId] });
            toast.success("Checklisteneintrag gelöscht");
        }
    });

    const handleAddItem = (e) => {
        e.preventDefault();
        if (!newItemTitle.trim()) return;

        const order = checklistItems.length > 0
            ? Math.max(...checklistItems.map(item => item.order || 0)) + 1
            : 0;

        createMutation.mutate({
            theme_id: themeId,
            title: newItemTitle.trim(),
            order
        });
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;
        if (result.source.index === result.destination.index) return;

        const reordered = Array.from(checklistItems).sort((a, b) => (a.order || 0) - (b.order || 0));
        const [moved] = reordered.splice(result.source.index, 1);
        reordered.splice(result.destination.index, 0, moved);

        reordered.forEach((item, index) => {
            updateMutation.mutate({ id: item.id, data: { order: index } });
        });
    };

    const startEdit = (item) => {
        setEditingId(item.id);
        setEditingTitle(item.title);
    };

    const saveEdit = (item) => {
        if (!editingTitle.trim()) return;
        updateMutation.mutate({ id: item.id, data: { title: editingTitle.trim() } });
    };

    const sortedItems = [...checklistItems].sort((a, b) => (a.order || 0) - (b.order || 0));
    const completedCount = sortedItems.filter(item => item.completed).length;

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-slate-600" />
                    <h3 className="font-semibold text-slate-900">Checkliste</h3>
                </div>
                {sortedItems.length > 0 && (
                    <span className="text-sm text-slate-500">
                        {completedCount}/{sortedItems.length} erledigt
                    </span>
                )}
            </div>

            <form onSubmit={handleAddItem} className="flex gap-2 mb-4">
                <Input
                    placeholder="Neuer Checklisteneintrag..."
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                    className="flex-1"
                />
                <Button type="submit" disabled={!newItemTitle.trim()}>
                    <Plus className="w-4 h-4" />
                </Button>
            </form>

            {sortedItems.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                    Noch keine Einträge vorhanden
                </p>
            ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="checklist">
                        {(provided) => (
                            <div className="space-y-2" {...provided.droppableProps} ref={provided.innerRef}>
                                {sortedItems.map((item, index) => (
                                    <Draggable key={item.id} draggableId={item.id} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={`flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 group transition-colors ${snapshot.isDragging ? 'shadow-lg bg-white' : ''}`}
                                            >
                                                <div {...provided.dragHandleProps} className="cursor-grab text-slate-300 hover:text-slate-500">
                                                    <GripVertical className="w-4 h-4" />
                                                </div>
                                                <Checkbox
                                                    checked={item.completed}
                                                    onCheckedChange={() => updateMutation.mutate({ id: item.id, data: { completed: !item.completed } })}
                                                />
                                                {editingId === item.id ? (
                                                    <div className="flex flex-1 gap-2 items-center">
                                                        <Input
                                                            value={editingTitle}
                                                            onChange={(e) => setEditingTitle(e.target.value)}
                                                            className="flex-1 h-7 text-sm"
                                                            autoFocus
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') saveEdit(item);
                                                                if (e.key === 'Escape') setEditingId(null);
                                                            }}
                                                        />
                                                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => saveEdit(item)}>
                                                            <Save className="w-3 h-3 text-green-600" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)}>
                                                            <X className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <span className={`flex-1 text-sm ${item.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                                            {item.title}
                                                        </span>
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7"
                                                                onClick={() => startEdit(item)}
                                                            >
                                                                <Pencil className="w-3 h-3" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 text-red-600 hover:text-red-700"
                                                                onClick={() => {
                                                                    if (confirm("Eintrag wirklich löschen?")) {
                                                                        deleteMutation.mutate(item.id);
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