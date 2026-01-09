import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Building2, Filter, LayoutGrid, List } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import CustomerForm from "@/components/customers/CustomerForm";
import CustomerCard from "@/components/customers/CustomerCard";
import CustomerListItem from "@/components/customers/CustomerListItem";
import CustomerProjectsDialog from "@/components/customers/CustomerProjectsDialog";
import InactiveCustomersSidebar from "@/components/customers/InactiveCustomersSidebar";

export default function Customers() {
    const [showForm, setShowForm] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [viewMode, setViewMode] = useState("grid");
    const [showProjectsDialog, setShowProjectsDialog] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [orderedCustomers, setOrderedCustomers] = useState([]);
    const [inactiveCustomers, setInactiveCustomers] = useState([]);

    const queryClient = useQueryClient();

    const { data: customers = [], isLoading } = useQuery({
        queryKey: ['customers'],
        queryFn: () => base44.entities.Customer.list()
    });

    // Kunden nach Status filtern
    React.useEffect(() => {
        const active = customers.filter(c => c.is_active !== false);
        const inactive = customers.filter(c => c.is_active === false);
        setOrderedCustomers(active);
        setInactiveCustomers(inactive);
    }, [customers]);

    const { data: projects = [] } = useQuery({
        queryKey: ['projects'],
        queryFn: () => base44.entities.Project.list()
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.Customer.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            setShowForm(false);
            toast.success("Kunde erfolgreich angelegt");
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.Customer.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            setShowForm(false);
            setEditingCustomer(null);
            toast.success("Kunde erfolgreich aktualisiert");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.Customer.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            toast.success("Kunde gelöscht");
        }
    });

    const handleSave = (data) => {
        if (editingCustomer) {
            updateMutation.mutate({ id: editingCustomer.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (customer) => {
        setEditingCustomer(customer);
        setShowForm(true);
    };

    const handleCopy = (customer) => {
        const { id, created_date, updated_date, created_by, ...copyData } = customer;
        copyData.company = `${copyData.company} (Kopie)`;
        createMutation.mutate(copyData);
    };

    const handleDelete = (customer) => {
        if (confirm("Möchten Sie diesen Kunden wirklich löschen?")) {
            deleteMutation.mutate(customer.id);
        }
    };

    const getProjectCount = (contactId) => {
        return projects.filter(p => 
            p.customer_id === contactId || 
            (p.supplier_ids && p.supplier_ids.includes(contactId))
        ).length;
    };

    const getCustomerProjects = (contactId) => {
        return projects.filter(p => 
            p.customer_id === contactId || 
            (p.supplier_ids && p.supplier_ids.includes(contactId))
        );
    };

    const handleShowProjects = (customer) => {
        setSelectedCustomer(customer);
        setShowProjectsDialog(true);
    };

    const filteredCustomers = orderedCustomers.filter(c => {
        const matchesSearch = c.company?.toLowerCase().includes(search.toLowerCase()) ||
            c.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
            c.city?.toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === "all" || c.type === typeFilter || (typeFilter === "customer" && c.type === "both") || (typeFilter === "supplier" && c.type === "both");
        return matchesSearch && matchesType;
    });

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const sourceId = result.source.droppableId;
        const destId = result.destination.droppableId;

        // Drag from active to inactive
        if (sourceId === "customers-grid" && destId === "inactive-customers") {
            const customerId = result.draggableId;
            const customer = orderedCustomers.find(c => c.id === customerId);
            if (customer) {
                updateMutation.mutate({ id: customer.id, data: { ...customer, is_active: false } });
            }
        }
        // Drag from inactive to active
        else if (sourceId === "inactive-customers" && destId === "customers-grid") {
            const customerId = result.draggableId.replace('inactive-', '');
            const customer = inactiveCustomers.find(c => c.id === customerId);
            if (customer) {
                updateMutation.mutate({ id: customer.id, data: { ...customer, is_active: true } });
            }
        }
        // Reorder within active
        else if (sourceId === "customers-grid" && destId === "customers-grid") {
            const items = Array.from(filteredCustomers);
            const [reorderedItem] = items.splice(result.source.index, 1);
            items.splice(result.destination.index, 0, reorderedItem);
            setOrderedCustomers(items);
        }
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex gap-6">
                        <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Kunden & Lieferanten</h1>
                        <p className="text-slate-500 mt-1">Verwalten Sie Ihre Kunden- und Lieferantenkontakte</p>
                    </div>
                    <Button onClick={() => { setEditingCustomer(null); setShowForm(true); }} className="bg-slate-800 hover:bg-slate-900">
                        <Plus className="w-4 h-4 mr-2" />
                        Neuer Kontakt
                    </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            placeholder="Suche nach Firma, Ansprechpartner oder Stadt..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    
                    <Tabs value={typeFilter} onValueChange={setTypeFilter}>
                        <TabsList className="bg-slate-100">
                            <TabsTrigger value="all">Alle</TabsTrigger>
                            <TabsTrigger value="customer">Kunden</TabsTrigger>
                            <TabsTrigger value="supplier">Lieferanten</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                        <Button
                            size="sm"
                            variant={viewMode === "grid" ? "secondary" : "ghost"}
                            onClick={() => setViewMode("grid")}
                            className="px-3"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant={viewMode === "list" ? "secondary" : "ghost"}
                            onClick={() => setViewMode("list")}
                            className="px-3"
                        >
                            <List className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {isLoading ? (
                    viewMode === "grid" ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array(6).fill(0).map((_, i) => (
                                <div key={i} className="p-5 border rounded-xl">
                                    <Skeleton className="h-12 w-12 rounded-xl mb-4" />
                                    <Skeleton className="h-6 w-48 mb-2" />
                                    <Skeleton className="h-4 w-32 mb-4" />
                                    <Skeleton className="h-4 w-full mb-2" />
                                    <Skeleton className="h-4 w-3/4" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {Array(8).fill(0).map((_, i) => (
                                <div key={i} className="p-4 border rounded-lg">
                                    <Skeleton className="h-16 w-full" />
                                </div>
                            ))}
                        </div>
                    )
                ) : filteredCustomers.length > 0 ? (
                    viewMode === "grid" ? (
                        <Droppable droppableId="customers-grid">
                            {(provided, snapshot) => (
                                <div 
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 transition-colors ${
                                        snapshot.isDraggingOver ? 'bg-slate-100 p-4 rounded-lg' : ''
                                    }`}
                                >
                                    {filteredCustomers.map((customer, index) => (
                                        <Draggable key={customer.id} draggableId={customer.id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className={`${
                                                        snapshot.isDragging ? 'shadow-2xl rotate-2' : ''
                                                    } transition-all`}
                                                >
                                                    <CustomerCard
                                                        customer={customer}
                                                        onEdit={handleEdit}
                                                        onCopy={handleCopy}
                                                        onDelete={handleDelete}
                                                        projectCount={getProjectCount(customer.id)}
                                                        onShowProjects={handleShowProjects}
                                                    />
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    ) : (
                        <div className="space-y-3">
                            {filteredCustomers.map((customer) => (
                                <CustomerListItem
                                    key={customer.id}
                                    customer={customer}
                                    onEdit={handleEdit}
                                    onCopy={handleCopy}
                                    onDelete={handleDelete}
                                    projectCount={getProjectCount(customer.id)}
                                    onShowProjects={handleShowProjects}
                                />
                            ))}
                        </div>
                    )
                ) : (
                    <div className="text-center py-16">
                        <Building2 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                        <h3 className="text-lg font-medium text-slate-700 mb-2">
                            {search ? "Keine Kunden gefunden" : "Noch keine Kunden angelegt"}
                        </h3>
                        <p className="text-slate-500 mb-6">
                            {search ? "Versuchen Sie eine andere Suche" : "Legen Sie Ihren ersten Kunden an"}
                        </p>
                        {!search && (
                            <Button onClick={() => setShowForm(true)} className="bg-slate-800 hover:bg-slate-900">
                                <Plus className="w-4 h-4 mr-2" />
                                Ersten Kunden anlegen
                            </Button>
                        )}
                    </div>
                )}
                    </div>
                    
                        <InactiveCustomersSidebar inactiveCustomers={inactiveCustomers} />
                    </div>
                </div>
            </div>

            <CustomerForm
                open={showForm}
                onClose={() => { setShowForm(false); setEditingCustomer(null); }}
                onSave={handleSave}
                customer={editingCustomer}
            />

            <CustomerProjectsDialog
                open={showProjectsDialog}
                onClose={() => setShowProjectsDialog(false)}
                customer={selectedCustomer}
                projects={selectedCustomer ? getCustomerProjects(selectedCustomer.id) : []}
            />
        </DragDropContext>
    );
}