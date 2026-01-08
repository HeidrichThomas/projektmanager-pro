import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, XCircle, User, Phone, Mail } from "lucide-react";

export default function CompanyStatusColumns({ open, onClose, companies }) {
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
            title: "Noch nicht bewertet",
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
                    <DialogTitle>Nur Firmen - Status-Übersicht</DialogTitle>
                </DialogHeader>

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

                                <div className="space-y-2 flex-1">
                                    {companiesInGroup.length > 0 ? (
                                        companiesInGroup.map((company) => (
                                            <Card key={company.id} className="p-3 hover:shadow-md transition-all">
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
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-slate-400 text-sm">
                                            Keine Firmen
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
}