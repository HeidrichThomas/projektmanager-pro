import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import ChecklistItemForm from "./ChecklistItemForm";

const columns = [
    { id: "geplant", label: "Geplant", bgColor: "bg-slate-50" },
    { id: "in_arbeit", label: "In Arbeit", bgColor: "bg-blue-50" },
    { id: "pausiert", label: "Pausiert", bgColor: "bg-amber-50" },
    { id: "erledigt", label: "Erledigt", bgColor: "bg-emerald-50" }
];

const priorityColors = {
    niedrig: "bg-blue-100 text-blue-700 border-blue-200",
    mittel: "bg-amber-100 text-amber-700 border-amber-200",
    hoch: "bg-red-100 text-red-700 border-red-200"
};

export default function ChecklistBoard({ items, onCreate, onUpdate, onDelete }) {
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const itemsByColumn = columns.reduce((acc, col) => {
        acc[col.id] = items.filter(item => item.status === col.id)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
        return acc;
    }, {});

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const { source, destination, draggableId } = result;
        const item = items.find(i => i.id === draggableId);
        
        if (!item) return;

        // Spalte oder Position geändert
        if (source.droppableId !== destination.droppableId || source.index !== destination.index) {
            const destinationItems = itemsByColumn[destination.droppableId];
            const newOrder = destinationItems.length > 0 
                ? (destination.index < destinationItems.length 
                    ? destinationItems[destination.index].order 
                    : destinationItems[destinationItems.length - 1].order + 1)
                : 0;

            onUpdate(item.id, {
                ...item,
                status: destination.droppableId,
                order: newOrder
            });
        }
    };

    return (
        <>
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {columns.map(column => (
                        <div key={column.id} className={`${column.bgColor} rounded-lg p-3`}>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-sm text-slate-700">
                                    {column.label}
                                    <span className="ml-2 text-xs text-slate-500">
                                        ({itemsByColumn[column.id].length})
                                    </span>
                                </h3>
                                {column.id === "geplant" && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0"
                                        onClick={() => {
                                            setEditingItem(null);
                                            setShowForm(true);
                                        }}
                                    >
                                        <Plus className="w-3 h-3" />
                                    </Button>
                                )}
                            </div>

                            <Droppable droppableId={column.id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`space-y-2 min-h-[200px] ${
                                            snapshot.isDraggingOver ? 'bg-slate-100/50 rounded-lg' : ''
                                        }`}
                                    >
                                        {itemsByColumn[column.id].map((item, index) => (
                                            <Draggable
                                                key={item.id}
                                                draggableId={item.id}
                                                index={index}
                                            >
                                                {(provided, snapshot) => (
                                                    <Card
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className={`group cursor-move ${
                                                            snapshot.isDragging ? 'shadow-lg' : ''
                                                        }`}
                                                    >
                                                        <CardContent className="p-3">
                                                            <div className="flex items-start gap-2">
                                                                <div
                                                                    {...provided.dragHandleProps}
                                                                    className="mt-1 text-slate-400"
                                                                >
                                                                    <GripVertical className="w-3 h-3" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="font-medium text-sm text-slate-900 mb-1 break-words">
                                                                        {item.title}
                                                                    </div>
                                                                    {item.description && (
                                                                        <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                                                                            {item.description}
                                                                        </p>
                                                                    )}
                                                                    {item.priority && (
                                                                        <Badge
                                                                            variant="secondary"
                                                                            className={`${priorityColors[item.priority]} text-xs border`}
                                                                        >
                                                                            {item.priority === "niedrig" ? "Niedrig" : 
                                                                             item.priority === "mittel" ? "Mittel" : "Hoch"}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="h-6 w-6 p-0"
                                                                        onClick={() => {
                                                                            setEditingItem(item);
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
                                                                            if (confirm(`"${item.title}" wirklich löschen?`)) {
                                                                                onDelete(item.id);
                                                                            }
                                                                        }}
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>

            <ChecklistItemForm
                open={showForm}
                onClose={() => {
                    setShowForm(false);
                    setEditingItem(null);
                }}
                onSave={(data) => {
                    if (editingItem) {
                        onUpdate(editingItem.id, data);
                    } else {
                        onCreate(data);
                    }
                    setShowForm(false);
                    setEditingItem(null);
                }}
                item={editingItem}
            />
        </>
    );
}