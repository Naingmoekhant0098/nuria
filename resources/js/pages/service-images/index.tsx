import { Head, router, usePage } from '@inertiajs/react';
import { ImageOff, Pencil, Trash2 } from 'lucide-react';
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
import { destroy } from '@/routes/clinic/service-images';

import ServiceImageDialog from './components/service_image_dialog';

interface Service {
    id: number;
    service_name: string;
    image_url?: string | null;
    serviceName?: { name: string } | null;
}

interface PageProps {
    services: Service[];
    flash?: { success?: string; error?: string };
    [key: string]: unknown;
}

export default function Index() {
    const { services, flash } = usePage<PageProps>().props;
    const [selectedService, setSelectedService] = useState<Service | null>(
        null,
    );

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const removeImage = (service: Service) => {
        if (!window.confirm(`Remove the image for "${service.service_name}"?`))
            return;

        router.delete(destroy.url(service.id), { preserveScroll: true });
    };

    return (
        <>
            <Head title="Service images" />
            <main className="min-h-full bg-black p-8 text-gray-100">
                <div className="mx-auto max-w-7xl space-y-6">
                    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-xl font-extrabold tracking-tight text-white">
                                Service Images
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Manage images separately from service details.
                            </p>
                        </div>
                        <ServiceImageDialog services={services} />
                    </header>

                    <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-neutral-800 hover:bg-transparent">
                                    <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                        Service
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                        Service name
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                        Image
                                    </TableHead>
                                    <TableHead className="text-right text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {services.length > 0 ? (
                                    services.map((service) => (
                                        <TableRow
                                            key={service.id}
                                            className="border-neutral-800 hover:bg-neutral-900"
                                        >
                                            <TableCell className="font-medium text-white">
                                                {service.service_name}
                                            </TableCell>
                                            <TableCell className="text-gray-400">
                                                {service.serviceName?.name ??
                                                    service.service_name}
                                            </TableCell>
                                            <TableCell>
                                                {service.image_url ? (
                                                    <img
                                                        src={service.image_url}
                                                        alt={
                                                            service.service_name
                                                        }
                                                        className="size-14 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <span className="inline-flex items-center gap-2 text-xs text-gray-600">
                                                        <ImageOff className="size-4" />
                                                        No image
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            setSelectedService(
                                                                service,
                                                            )
                                                        }
                                                        className="text-gray-400 hover:bg-neutral-800 hover:text-white"
                                                    >
                                                        <Pencil className="size-4" />
                                                        <span className="sr-only">
                                                            Replace image
                                                        </span>
                                                    </Button>
                                                    {service.image_url && (
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                removeImage(
                                                                    service,
                                                                )
                                                            }
                                                            className="text-red-400 hover:bg-red-950/40 hover:text-red-300"
                                                        >
                                                            <Trash2 className="size-4" />
                                                            <span className="sr-only">
                                                                Remove image
                                                            </span>
                                                        </Button>
                                                    )}
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
                                            No services found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </main>

            <ServiceImageDialog
                services={services}
                service={selectedService}
                open={selectedService !== null}
                onOpenChange={(open) => {
                    if (!open) setSelectedService(null);
                }}
            />
        </>
    );
}
