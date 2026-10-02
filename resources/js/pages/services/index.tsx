import { router, usePage } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { destroy } from '@/routes/clinic/services';

import type {
    Doctor,
    ClinicService,
    ServiceName,
} from './components/clinic_service_form';
import { getClinicServiceName } from './components/clinic_service_form';
import CreateClinicServiceDrawer from './components/create_clinic_service_drawer';
import EditClinicServiceDrawer from './components/edit_clinic_service_drawer';

interface PageProps {
    services: ClinicService[];

    doctors: Doctor[];
    serviceNames: ServiceName[];

    filters: {
        search?: string;
    };

    flash?: {
        success?: string;
        error?: string;
    };

    [key: string]: unknown;
}

export default function Index() {
    const {
        services = [],
        doctors = [],
        serviceNames = [],
        filters = {},
        flash,
    } = usePage<PageProps>().props;

    const [search, setSearch] = useState(filters?.search ?? '');

    const [isEditOpen, setIsEditOpen] = useState(false);

    const [selectedService, setSelectedService] =
        useState<ClinicService | null>(null);

    const [isInitialMount, setIsInitialMount] = useState(true);

    useEffect(() => {
        if (isInitialMount) {
            setIsInitialMount(false);

            return;
        }

        const timer = setTimeout(() => {
            router.get(
                '/clinic/services',
                {
                    search: search || undefined,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }

        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleEdit = (service: ClinicService) => {
        setSelectedService(service);
        setIsEditOpen(true);
    };

    const handleEditClose = (open: boolean) => {
        setIsEditOpen(open);

        if (!open) {
            setSelectedService(null);
        }
    };

    const handleDelete = (service: ClinicService) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${getClinicServiceName(service)}"?`,
        );

        if (!confirmed) {
            return;
        }

        router.delete(destroy.url(service.id), {
            preserveScroll: true,
        });
    };

    const getDoctorName = (doctor?: Doctor | null) => {
        if (!doctor) {
            return '-';
        }

        return [doctor.first_name, doctor.middle_name, doctor.last_name]
            .filter(Boolean)
            .join(' ');
    };

    return (
        <div className="bg-black p-8 text-gray-100">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-xl font-extrabold tracking-tight text-white">
                            Assigned Services
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Assign services to doctors with pricing and images.
                        </p>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden">
                    <Table
                        clientPagination={false}

                        searchValue={search}
                        onSearchChange={setSearch}
                        toolbarActions={
                            <CreateClinicServiceDrawer
                                doctors={doctors ?? []}
                                serviceNames={serviceNames ?? []}
                            />
                        }
                    >
                        <TableHeader className="bg-neutral-950">
                            <TableRow className="border-neutral-800 hover:bg-transparent">
                                <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Doctor
                                </TableHead>

                                <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Service
                                </TableHead>

                                <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Service name
                                </TableHead>

                                <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Amount
                                </TableHead>

                                <TableHead className="text-right text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {services?.length > 0 ? (
                                services.map((service) => (
                                    <TableRow
                                        key={service.id}
                                        className="border-neutral-800 transition-colors hover:bg-neutral-800/50"
                                    >
                                        {/* Doctor */}
                                        <TableCell>
                                            <div>
                                                <div className="font-medium text-gray-300">
                                                    {service.doctor
                                                        ? `Dr. ${getDoctorName(service.doctor)}`
                                                        : '-'}
                                                </div>

                                                {service.doctor?.id && (
                                                    <div className="mt-1 text-xs text-gray-500">
                                                        ID: {service.doctor.id}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Service */}
                                        <TableCell>
                                            <span className="font-medium text-white">
                                                {getClinicServiceName(service)}
                                            </span>
                                        </TableCell>

                                        <TableCell>
                                            <span className="text-gray-300">
                                                {service.serviceName?.name ??
                                                    getClinicServiceName(service)}
                                            </span>
                                        </TableCell>

                                        {/* Amount */}
                                        <TableCell className="text-left">
                                            <span className="font-semibold text-emerald-400">
                                                {Number(
                                                    service.amount,
                                                ).toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}{' '}
                                                MMK
                                            </span>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        handleEdit(service)
                                                    }
                                                    className="border-neutral-700 bg-transparent text-gray-300 hover:bg-neutral-800"
                                                >
                                                    <Pencil className="mr-1 h-3.5 w-3.5" />
                                                    Edit
                                                </Button>

                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        handleDelete(service)
                                                    }
                                                    className="border border-red-900 bg-red-600/20 text-red-400 hover:bg-red-600/30"
                                                >
                                                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow className="border-neutral-800">
                                    <TableCell
                                        colSpan={5}
                                        className="h-32 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <p className="text-sm font-medium text-gray-400">
                                                No clinic services found
                                            </p>

                                            {search && (
                                                <p className="text-xs text-gray-600">
                                                    Try a different search term.
                                                </p>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Edit Drawer */}
                <EditClinicServiceDrawer
                    open={isEditOpen}
                    onOpenChange={handleEditClose}
                    service={selectedService}
                    doctors={doctors ?? []}
                    serviceNames={serviceNames ?? []}
                />
            </div>
        </div>
    );
}
