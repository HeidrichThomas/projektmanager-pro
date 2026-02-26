import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Briefcase, Phone, Mail, MapPin } from "lucide-react";

export default function CompaniesAndSectorsOverview({ open, onClose, companies, sectors }) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-purple-600" />
                        Firmen & Sparten Übersicht
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="companies" className="mt-4">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="companies">
                            <Building2 className="w-4 h-4 mr-2" />
                            Firmen ({companies.length})
                        </TabsTrigger>
                        <TabsTrigger value="sectors">
                            <Briefcase className="w-4 h-4 mr-2" />
                            Sparten ({sectors.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="companies" className="mt-4">
                        {companies.length > 0 ? (
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="font-semibold">Firmenname</TableHead>
                                            <TableHead className="font-semibold">Adresse</TableHead>
                                            <TableHead className="font-semibold">Kontakt</TableHead>
                                            <TableHead className="font-semibold">Ansprechpartner</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {companies.map((company) => (
                                            <TableRow key={company.id}>
                                                <TableCell className="font-medium">{company.company_name}</TableCell>
                                                <TableCell>
                                                    {(company.street || company.city) ? (
                                                        <div className="text-sm text-slate-600">
                                                            {company.street && <div>{company.street}</div>}
                                                            {(company.postal_code || company.city) && (
                                                                <div>{company.postal_code} {company.city}</div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 text-sm">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm space-y-1">
                                                        {company.phone && (
                                                            <div className="flex items-center gap-1 text-slate-600">
                                                                <Phone className="w-3 h-3" />
                                                                {company.phone}
                                                            </div>
                                                        )}
                                                        {company.email && (
                                                            <div className="flex items-center gap-1 text-slate-600">
                                                                <Mail className="w-3 h-3" />
                                                                {company.email}
                                                            </div>
                                                        )}
                                                        {!company.phone && !company.email && (
                                                            <span className="text-slate-400">-</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {company.contact_persons && company.contact_persons.length > 0 ? (
                                                        <div className="text-sm space-y-1">
                                                            {company.contact_persons.slice(0, 2).map((contact, idx) => (
                                                                <div key={idx} className="text-slate-600">
                                                                    {contact.name}
                                                                    {contact.position && (
                                                                        <span className="text-slate-400 text-xs ml-1">
                                                                            ({contact.position})
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                            {company.contact_persons.length > 2 && (
                                                                <div className="text-xs text-slate-400">
                                                                    +{company.contact_persons.length - 2} weitere
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 text-sm">-</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <p className="text-center py-8 text-slate-500">Noch keine Firmen angelegt</p>
                        )}
                    </TabsContent>

                    <TabsContent value="sectors" className="mt-4">
                        {sectors.length > 0 ? (
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="font-semibold">Spartenname</TableHead>
                                            <TableHead className="font-semibold">Beschreibung</TableHead>
                                            <TableHead className="font-semibold">Farbe</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sectors.map((sector) => (
                                            <TableRow key={sector.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Briefcase className="w-4 h-4 text-slate-500" />
                                                        {sector.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {sector.description ? (
                                                        <span className="text-sm text-slate-600">{sector.description}</span>
                                                    ) : (
                                                        <span className="text-slate-400 text-sm">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge 
                                                        variant="secondary" 
                                                        className={`bg-${sector.color}-100 text-${sector.color}-700`}
                                                    >
                                                        {sector.color}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <p className="text-center py-8 text-slate-500">Noch keine Sparten angelegt</p>
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}