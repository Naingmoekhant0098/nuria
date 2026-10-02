import { Link, router, usePage } from '@inertiajs/react';
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

import CreateClinicDialog from './components/create_clinic_dialog';
import EditClinicDialog from './components/edit_clinic_dialog';

export interface Doctor {
    id: string;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    specialization: string;
}

export interface Clinic {
    id: number;
    doctor_id: string;

    clinic_name: string;
    clinic_permit: string;
    complete_address: string;
    photo_url?: string | null;

    latitude?: number | null;
    longitude?: number | null;

    open_time?: string | null;
    close_time?: string | null;

    status: string;

    doctor?: Doctor;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedClinics {
    data: Clinic[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
}

interface PageProps {
    clinics: PaginatedClinics;

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
    const { clinics, filters, flash } = usePage<PageProps>().props;

    const [search, setSearch] = useState(filters?.search ?? '');

    const [isEditOpen, setIsEditOpen] = useState(false);

    const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

    const [isInitialMount, setIsInitialMount] = useState(true);

    /*
    |--------------------------------------------------------------------------
    | Current Time
    |--------------------------------------------------------------------------
    */

    const [currentTime, setCurrentTime] = useState(new Date());

    /*
    |--------------------------------------------------------------------------
    | Update current time every minute
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60 * 1000);

        return () => clearInterval(timer);
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (isInitialMount) {
            setIsInitialMount(false);

            return;
        }

        const timer = setTimeout(() => {
            router.get(
                '/admin/clinics',
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

    /*
    |--------------------------------------------------------------------------
    | Flash Messages
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }

        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    /*
    |--------------------------------------------------------------------------
    | Edit
    |--------------------------------------------------------------------------
    */

    const handleEdit = (clinic: Clinic) => {
        setSelectedClinic(clinic);
        setIsEditOpen(true);
    };

    const handleEditClose = (open: boolean) => {
        setIsEditOpen(open);

        if (!open) {
            setSelectedClinic(null);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Delete
    |--------------------------------------------------------------------------
    */

    const handleDelete = (clinic: Clinic) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${clinic.clinic_name}"?`,
        );

        if (!confirmed) {
            return;
        }

        router.delete(`/admin/clinics/${clinic.id}`, {
            preserveScroll: true,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Doctor Name
    |--------------------------------------------------------------------------
    */

    const getDoctorName = (doctor?: Doctor): string => {
        if (!doctor) {
            return '-';
        }

        return [doctor.first_name, doctor.middle_name, doctor.last_name]
            .filter(Boolean)
            .join(' ');
    };

    /*
    |--------------------------------------------------------------------------
    | Status
    |--------------------------------------------------------------------------
    */

    const getStatusClass = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

            case 'inactive':
                return 'bg-red-500/10 text-red-400 border-red-500/20';

            case 'pending':
                return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';

            default:
                return 'bg-neutral-500/10 text-gray-400 border-neutral-500/20';
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Format Time
    |--------------------------------------------------------------------------
    |
    | 08:00 -> 8:00 AM
    | 13:30 -> 1:30 PM
    |
    */

    const formatTime = (time?: string | null): string => {
        if (!time) {
            return '-';
        }

        const [hours, minutes] = time.substring(0, 5).split(':').map(Number);

        const date = new Date();

        date.setHours(hours, minutes, 0, 0);

        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Check Clinic Open / Closed
    |--------------------------------------------------------------------------
    |
    | Normal:
    | 08:00 -> 18:00
    |
    | Overnight:
    | 20:00 -> 02:00
    |
    */

    const isClinicOpen = (
        openTime?: string | null,
        closeTime?: string | null,
    ): boolean => {
        if (!openTime || !closeTime) {
            return false;
        }

        const [openHour, openMinute] = openTime
            .substring(0, 5)
            .split(':')
            .map(Number);

        const [closeHour, closeMinute] = closeTime
            .substring(0, 5)
            .split(':')
            .map(Number);

        const currentMinutes =
            currentTime.getHours() * 60 + currentTime.getMinutes();

        const openMinutes = openHour * 60 + openMinute;

        const closeMinutes = closeHour * 60 + closeMinute;

        /*
        |--------------------------------------------------------------------------
        | Same-day schedule
        |--------------------------------------------------------------------------
        |
        | Example:
        | 08:00 -> 18:00
        |
        */

        if (openMinutes < closeMinutes) {
            return (
                currentMinutes >= openMinutes && currentMinutes < closeMinutes
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Overnight schedule
        |--------------------------------------------------------------------------
        |
        | Example:
        | 20:00 -> 02:00
        |
        */

        return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
    };

    return (
        <div className="min-h-screen bg-black p-8 text-gray-100">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* =====================================================
                    Header
                ====================================================== */}

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-xl font-extrabold tracking-tight text-white">
                            Clinic Management
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage clinics and their assigned doctors.
                        </p>
                    </div>
                </div>

                {/* =====================================================
                    Result Information
                ====================================================== */}

                {clinics?.total > 0 && (
                    <div className="hidden">
                        <p className="text-sm text-gray-500">
                            Showing{' '}
                            <span className="font-medium text-gray-300">
                                {clinics.from}
                            </span>{' '}
                            to{' '}
                            <span className="font-medium text-gray-300">
                                {clinics.to}
                            </span>{' '}
                            of{' '}
                            <span className="font-medium text-gray-300">
                                {clinics.total}
                            </span>{' '}
                            clinics
                        </p>

                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                className="text-sm text-indigo-400 hover:text-indigo-300"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                )}

                {/* =====================================================
                    Table
                ====================================================== */}

                <div className="overflow-hidden">
                    <Table
                        clientPagination={false}
                        searchValue={search}
                        onSearchChange={setSearch}
                        toolbarActions={<CreateClinicDialog />}
                    >
                        <TableHeader className="bg-neutral-950">
                            <TableRow className="border-neutral-800 hover:bg-transparent">
                                <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Image
                                </TableHead>

                                <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Clinic
                                </TableHead>

                                <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Permit
                                </TableHead>

                                <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Address
                                </TableHead>

                                <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Opening Hours
                                </TableHead>

                                <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Opening Status
                                </TableHead>

                                <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Active/Inactive
                                </TableHead>

                                <TableHead className="text-right text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {clinics?.data?.length > 0 ? (
                                clinics.data.map((clinic) => {
                                    const isOpen = isClinicOpen(
                                        clinic.open_time,
                                        clinic.close_time,
                                    );

                                    return (
                                        <TableRow
                                            key={clinic.id}
                                            className="border-neutral-800 transition-colors hover:bg-neutral-800/50"
                                        >
                                            <TableCell>
                                                {clinic.photo_url ? (
                                                    <img
                                                        src={clinic.photo_url}
                                                        alt={`${clinic.clinic_name} image`}
                                                        className="size-12 rounded-md object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex size-12 items-center justify-center rounded-md bg-neutral-800 text-xs text-gray-500">
                                                        N/A
                                                    </div>
                                                )}
                                            </TableCell>

                                            {/* Clinic */}

                                            <TableCell>
                                                <div>
                                                    <div className="font-medium text-white">
                                                        {clinic.clinic_name}
                                                    </div>

                                                    <div className="mt-1 text-xs text-gray-500">
                                                        ID: {clinic.id}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Permit */}

                                            <TableCell className="text-gray-400">
                                                {clinic.clinic_permit}
                                            </TableCell>

                                            {/* Address */}

                                            <TableCell className="max-w-sm">
                                                <div className="truncate text-gray-400">
                                                    {clinic.complete_address}
                                                </div>
                                            </TableCell>

                                            {/* Opening Hours */}

                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="text-sm text-gray-300">
                                                        {formatTime(
                                                            clinic.open_time,
                                                        )}{' '}
                                                        -{' '}
                                                        {formatTime(
                                                            clinic.close_time,
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <span
                                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                                                        isOpen
                                                            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                                                            : 'border-red-500/20 bg-red-500/10 text-red-400'
                                                    }`}
                                                >
                                                    {isOpen ? 'Open' : 'Closed'}
                                                </span>
                                            </TableCell>

                                            <TableCell>
                                                <span
                                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${getStatusClass(
                                                        clinic.status,
                                                    )}`}
                                                >
                                                    {clinic.status}
                                                </span>
                                            </TableCell>

                                            {/* Actions */}

                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleEdit(clinic)
                                                        }
                                                        className="border-neutral-700 bg-transparent text-gray-300 hover:bg-neutral-800"
                                                    >
                                                        Edit
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() =>
                                                            handleDelete(clinic)
                                                        }
                                                        className="border border-red-900 bg-red-600/20 text-red-400 hover:bg-red-600/30"
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow className="border-neutral-800">
                                    <TableCell
                                        colSpan={6}
                                        className="h-32 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <p className="text-sm font-medium text-gray-400">
                                                No clinics found
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

                {clinics?.links && clinics.links.length > 3 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Page{' '}
                            <span className="text-gray-300">
                                {clinics.current_page}
                            </span>{' '}
                            of{' '}
                            <span className="text-gray-300">
                                {clinics.last_page}
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                            {clinics.links.map((link, index) => {
                                const Component = link.url ? Link : 'span';

                                return (
                                    <Component
                                        key={index}
                                        href={link.url || '#'}
                                        preserveScroll
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                        className={`rounded-lg border px-3.5 py-2 text-xs font-medium transition-all ${
                                            link.active
                                                ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                                : 'border-neutral-800 bg-neutral-900 text-gray-300 hover:border-neutral-700 hover:bg-neutral-800'
                                        } ${
                                            !link.url
                                                ? 'cursor-not-allowed opacity-40'
                                                : ''
                                        }`}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}

                <EditClinicDialog
                    open={isEditOpen}
                    onOpenChange={handleEditClose}
                    clinic={selectedClinic}
                />
            </div>
        </div>
    );
}
