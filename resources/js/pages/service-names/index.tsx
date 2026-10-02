import { Head, router, usePage } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
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
import { destroy } from '@/routes/clinic/service-names';

import ServiceNameDialog from './components/service_name_dialog';

interface ServiceName {
    id: number;
    name: string;
    image_url?: string | null;
    clinic_services_count: number;
}

interface PageProps {
    serviceNames: ServiceName[];
    flash?: { success?: string; error?: string };
    [key: string]: unknown;
}

export default function Index() {
    const { serviceNames, flash } = usePage<PageProps>().props;
    const [selectedServiceName, setSelectedServiceName] =
        useState<ServiceName | null>(null);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handleDelete = (serviceName: ServiceName) => {
        if (serviceName.clinic_services_count > 0) {
            toast.error('This service name is already in use.');
            return;
        }

        if (!window.confirm(`Delete "${serviceName.name}"?`)) return;

        router.delete(destroy.url(serviceName.id), { preserveScroll: true });
    };

    return (
        <>
            <Head title="Service list" />
            <main className="min-h-full bg-black p-8 text-gray-100">
                <div className="mx-auto max-w-7xl space-y-6">
                    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-xl font-extrabold tracking-tight text-white">
                                Service List
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Manage the services available for assignment.
                            </p>
                        </div>
                        <ServiceNameDialog />
                    </header>

                    <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-neutral-800 hover:bg-transparent">
                                    <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                        Service
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                        Image
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                        Services using name
                                    </TableHead>
                                    <TableHead className="text-right text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {serviceNames.length > 0 ? (
                                    serviceNames.map((serviceName) => (
                                        <TableRow
                                            key={serviceName.id}
                                            className="border-neutral-800 hover:bg-neutral-900"
                                        >
                                            <TableCell className="font-medium text-white">
                                                {serviceName.name}
                                            </TableCell>
                                            <TableCell>
                                                {serviceName.image_url ? (
                                                    <img
                                                        src={
                                                            serviceName.image_url
                                                        }
                                                        alt={serviceName.name}
                                                        className="size-12 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-xs text-gray-600">
                                                        No image
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-gray-400">
                                                {
                                                    serviceName.clinic_services_count
                                                }
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            setSelectedServiceName(
                                                                serviceName,
                                                            )
                                                        }
                                                        className="text-gray-400 hover:bg-neutral-800 hover:text-white"
                                                    >
                                                        <Pencil className="size-4" />
                                                        <span className="sr-only">
                                                            Edit
                                                        </span>
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            handleDelete(
                                                                serviceName,
                                                            )
                                                        }
                                                        className="text-red-400 hover:bg-red-950/40 hover:text-red-300"
                                                    >
                                                        <Trash2 className="size-4" />
                                                        <span className="sr-only">
                                                            Delete
                                                        </span>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="h-32 text-center text-sm text-gray-500"
                                        >
                                            No service names found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </main>

            <ServiceNameDialog
                open={selectedServiceName !== null}
                onOpenChange={(open) => {
                    if (!open) setSelectedServiceName(null);
                }}
                serviceName={selectedServiceName}
            />
        </>
    );
}
