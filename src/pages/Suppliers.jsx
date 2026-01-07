import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Package } from "lucide-react";
import { toast } from "sonner";

import CustomerForm from "@/components/customers/CustomerForm";
import CustomerCard from "@/components/customers/CustomerCard";

export default function Suppliers() {
    const [showForm, setShowForm] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [search, setSearch] = useState("");

    const queryClient = useQueryClient();

    const { data: allCustomers = [], isLoading } = useQuery({
        queryKey: ['customers'],
        queryFn: () => base44.entities.Customer.list()
    });

    const { data: projects = [] } = useQuery({
        queryKey: ['projects'],
        queryFn: () => base44.entities.Project.list()
    });

    // Filter nur Lieferanten
    const suppliers = allCustomers.filter(c => c.type === 'supplier' || c.type === 'both');

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.Customer.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            setShowForm(false);
            toast.success("Lieferant erfolgreich angelegt");
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.Customer.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            setShowForm(false);
            setEditingSupplier(null);
            toast.success("Lieferant erfolgreich aktualisiert");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.Customer.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            toast.success("Lieferant gelöscht");
        }
    });

    const handleSave = (data) => {
        if (editingSupplier) {
            updateMutation.mutate({ id: editingSupplier.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (supplier) => {
        setEditingSupplier(supplier);
        setShowForm(true);
    };

    const handleCopy = (supplier) => {
        const { id, created_date, updated_date, created_by, ...copyData } = supplier;
        copyData.company = `${copyData.company} (Kopie)`;
        createMutation.mutate(copyData);
    };

    const handleDelete = (supplier) => {
        if (confirm("Möchten Sie diesen Lieferanten wirklich löschen?")) {
            deleteMutation.mutate(supplier.id);
        }
    };

    const getProjectCount = (supplierId) => {
        return projects.filter(p => p.supplier_ids?.includes(supplierId)).length;
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.company?.toLowerCase().includes(search.toLowerCase()) ||
        s.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.city?.toLowerCase().includes(search.toLowerCase()) ||
        s.products_services?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Lieferanten</h1>
                        <p className="text-slate-500 mt-1">Verwalten Sie Ihre Lieferanten und deren Leistungen</p>
                    </div>
                    <Button onClick={() => { 
                        setEditingSupplier({ type: 'supplier' }); 
                        setShowForm(true); 
                    }} className="bg-slate-800 hover:bg-slate-900">
                        <Plus className="w-4 h-4 mr-2" />
                        Neuer Lieferant
                    </Button>
                </div>

                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                        placeholder="Suche nach Firma, Ansprechpartner, Stadt oder Leistungen..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 max-w-md"
                    />
                </div>

                {isLoading ? (
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
                ) : filteredSuppliers.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSuppliers.map((supplier) => (
                            <CustomerCard
                                key={supplier.id}
                                customer={supplier}
                                onEdit={handleEdit}
                                onCopy={handleCopy}
                                onDelete={handleDelete}
                                projectCount={getProjectCount(supplier.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                        <h3 className="text-lg font-medium text-slate-700 mb-2">
                            {search ? "Keine Lieferanten gefunden" : "Noch keine Lieferanten angelegt"}
                        </h3>
                        <p className="text-slate-500 mb-6">
                            {search ? "Versuchen Sie eine andere Suche" : "Legen Sie Ihren ersten Lieferanten an"}
                        </p>
                        {!search && (
                            <Button onClick={() => { 
                                setEditingSupplier({ type: 'supplier' }); 
                                setShowForm(true); 
                            }} className="bg-slate-800 hover:bg-slate-900">
                                <Plus className="w-4 h-4 mr-2" />
                                Ersten Lieferanten anlegen
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <CustomerForm
                open={showForm}
                onClose={() => { setShowForm(false); setEditingSupplier(null); }}
                onSave={handleSave}
                customer={editingSupplier}
            />
        </div>
    );
}