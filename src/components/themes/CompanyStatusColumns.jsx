import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, XCircle, User, Phone, Mail } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function CompanyStatusColumns({ open, onClose, companies }) {
    const queryClient = useQueryClient();

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status, oldStatus, customerId, company }) => {
            // Wenn zu "transferred" bewegt wird, Customer erstellen
            if (status === "transferred" && oldStatus !== "transferred") {
                const customerData = {
                    company: company.company_name,
                    contact_name: company.contact_persons?.[0]?.name || "",
                    contact_persons: company.contact_persons || [],
                    type: "customer",
                    street: company.street,
                    postal_code: company.postal_code,
                    city: company.city,
                    country: company.country,
                    phone: company.phone,
                    mobile_phone: company.mobile_phone,
                    email: company.email,
                    website: company.website,
                    notes: company.notes
                };
                
                const customer = await base44.entities.Customer.create(customerData);
                await base44.entities.ThemeCompany.update(id, { 
                    transfer_status: status,
                    customer_id: customer.id
                });
            } 
            // Wenn von "transferred" wegbewegt wird, Customer löschen
            else if (oldStatus === "transferred" && status !== "transferred" && customerId) {
                await base44.entities.Customer.delete(customerId);
                await base44.entities.ThemeCompany.update(id, { 
                    transfer_status: status,
                    customer_id: null
                });
            } 
            // Sonst nur Status aktualisieren
            else {
                await base44.entities.ThemeCompany.update(id, { transfer_status: status });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['themeCompanies'] });
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            toast.success("Status aktualisiert");
        }
    });

    const handleDragEnd = (result) => {
        if (!result.destination) return;
        
        const companyId = result.draggableId;
        const newStatus = result.destination.droppableId;
        const oldStatus = result.source.droppableId;
        
        const company = companies.find(c => c.id === companyId);
        
        updateStatusMutation.mutate({ 
            id: companyId, 
            status: newStatus,
            oldStatus: oldStatus,
            customerId: company?.customer_id,
            company: company
        });
    };
    const statusGroups = {
        transferred: {
            title: "Kunden",
            icon: CheckCircle2,
            color: "text-green-500",
            bgColor: "bg-green-50",
            borderColor: "border-green-200"
        },
        maybe_later: {
            title: "Mögliche Kunden",
            icon: Circle,
            color: "text-blue-500",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200"
        },
        no_interest: {
            title: "Keine Kunden",
            icon: XCircle,
            color: "text-yellow-500",
            bgColor: "bg-yellow-50",
            borderColor: "border-yellow-200"
        },
        not_transferred: {
            title: "Nicht bewertet",
            icon: Circle,
            color: "text-red-500",
            bgColor: "bg-red-50",
            borderColor: "border-red-200"
        }
    };

    const groupedCompanies = {
        transferred: companies.filter(c => c.transfer_status === "transferred"),
        maybe_later: companies.filter(c => c.transfer_status === "maybe_later"),
        no_interest: companies.filter(c => c.transfer_status === "no_interest"),
        not_transferred: companies.filter(c => !c.transfer_status || c.transfer_status === "not_transferred")
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Firmen - Status-Übersicht</DialogTitle>
                </DialogHeader>

                <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    {Object.entries(statusGroups).map(([status, config]) => {
                        const Icon = config.icon;
                        const companiesInGroup = groupedCompanies[status];

                        return (
                            <div key={status} className="flex flex-col">
                                <div className={`${config.bgColor} ${config.borderColor} border-2 rounded-lg p-3 mb-3`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Icon className={`w-5 h-5 ${config.color}`} />
                                        <h3 className="font-semibold text-slate-900">{config.title}</h3>
                                    </div>
                                    <p className="text-sm text-slate-600">
                                        {companiesInGroup.length} {companiesInGroup.length === 1 ? 'Firma' : 'Firmen'}
                                    </p>
                                </div>

                                <Droppable droppableId={status}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`space-y-2 flex-1 min-h-[200px] p-2 rounded-lg transition-colors ${
                                                snapshot.isDraggingOver ? 'bg-slate-100' : ''
                                            }`}
                                        >
                                            {companiesInGroup.length > 0 ? (
                                                companiesInGroup.map((company, index) => (
                                                    <Draggable key={company.id} draggableId={company.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <Card
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={`p-3 hover:shadow-md transition-all cursor-move ${
                                                                    snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                                                                }`}
                                                            >
                                                                <div className="flex items-start gap-2">
                                                                    <Icon className={`w-4 h-4 mt-0.5 ${config.color} shrink-0`} />
                                                                    <div className="flex-1 min-w-0">
                                                                        <h4 className="font-semibold text-slate-900 text-sm truncate">
                                                                            {company.company_name}
                                                                        </h4>
                                                                        
                                                                        {(company.city || company.postal_code) && (
                                                                            <p className="text-xs text-slate-600 mt-0.5">
                                                                                {company.postal_code} {company.city}
                                                                            </p>
                                                                        )}

                                                                        {company.phone && (
                                                                            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                                                                <Phone className="w-3 h-3" />
                                                                                {company.phone}
                                                                            </div>
                                                                        )}

                                                                        {company.email && (
                                                                            <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                                                                                <Mail className="w-3 h-3" />
                                                                                {company.email}
                                                                            </div>
                                                                        )}

                                                                        {company.contact_persons && company.contact_persons.length > 0 && (
                                                                            <div className="flex flex-wrap gap-1 mt-2">
                                                                                {company.contact_persons.slice(0, 2).map((contact, idx) => (
                                                                                    <Badge key={idx} variant="secondary" className="text-xs">
                                                                                        <User className="w-2.5 h-2.5 mr-1" />
                                                                                        {contact.name}
                                                                                    </Badge>
                                                                                ))}
                                                                                {company.contact_persons.length > 2 && (
                                                                                    <Badge variant="secondary" className="text-xs">
                                                                                        +{company.contact_persons.length - 2}
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </Card>
                                                        )}
                                                    </Draggable>
                                                ))
                                            ) : (
                                                <div className="text-center py-8 text-slate-400 text-sm">
                                                    Keine Firmen
                                                </div>
                                            )}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        );
                    })}
                </div>
                </DragDropContext>
            </DialogContent>
        </Dialog>
    );
}