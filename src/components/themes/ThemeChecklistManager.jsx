import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, CheckSquare } from "lucide-react";
import { toast } from "sonner";

export default function ThemeChecklistManager({ themeId }) {
    const [newItemTitle, setNewItemTitle] = useState("");
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

    const toggleMutation = useMutation({
        mutationFn: ({ id, completed }) => base44.entities.ThemeChecklistItem.update(id, { completed }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['themeChecklistItems', themeId] });
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

    const completedCount = checklistItems.filter(item => item.completed).length;

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-slate-600" />
                    <h3 className="font-semibold text-slate-900">Checkliste</h3>
                </div>
                {checklistItems.length > 0 && (
                    <span className="text-sm text-slate-500">
                        {completedCount}/{checklistItems.length} erledigt
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

            {checklistItems.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                    Noch keine Einträge vorhanden
                </p>
            ) : (
                <div className="space-y-2">
                    {checklistItems.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 group transition-colors"
                        >
                            <Checkbox
                                checked={item.completed}
                                onCheckedChange={() => toggleMutation.mutate({ id: item.id, completed: !item.completed })}
                            />
                            <span
                                className={`flex-1 ${item.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}
                            >
                                {item.title}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700"
                                onClick={() => {
                                    if (confirm("Eintrag wirklich löschen?")) {
                                        deleteMutation.mutate(item.id);
                                    }
                                }}
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