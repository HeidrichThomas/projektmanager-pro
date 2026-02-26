import React from "react";
import { Card } from "@/components/ui/card";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Archive, Building2 } from "lucide-react";

export default function InactiveCustomersSidebar({ inactiveCustomers }) {
    return (
        <div className="w-80 bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
                <Archive className="w-5 h-5 text-slate-600" />
                <h2 className="font-semibold text-slate-900">Inaktive Kunden</h2>
                <span className="ml-auto text-xs font-medium bg-slate-200 text-slate-700 px-2 py-1 rounded-full">
                    {inactiveCustomers.length}
                </span>
            </div>

            <Droppable droppableId="inactive-customers">
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 space-y-2 p-2 rounded-lg transition-colors min-h-96 ${
                            snapshot.isDraggingOver 
                                ? 'bg-amber-100 border-2 border-amber-300' 
                                : 'border-2 border-dashed border-slate-300'
                        }`}
                    >
                        {inactiveCustomers.length > 0 ? (
                            inactiveCustomers.map((customer, index) => (
                                <Draggable key={customer.id} draggableId={`inactive-${customer.id}`} index={index}>
                                    {(provided, snapshot) => (
                                        <Card
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className={`p-3 cursor-move transition-all ${
                                                snapshot.isDragging 
                                                    ? 'shadow-xl rotate-1 bg-white' 
                                                    : 'bg-white hover:shadow-md'
                                            }`}
                                        >
                                            <div className="flex items-start gap-2">
                                                <Building2 className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="font-medium text-sm text-slate-900 truncate">
                                                        {customer.company}
                                                    </h4>
                                                    {customer.contact_name && (
                                                        <p className="text-xs text-slate-500 truncate">
                                                            {customer.contact_name}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    )}
                                </Draggable>
                            ))
                        ) : (
                            <div className="h-full flex items-center justify-center text-center text-slate-400">
                                <p className="text-sm">Hierher ziehen zum Deaktivieren</p>
                            </div>
                        )}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
}