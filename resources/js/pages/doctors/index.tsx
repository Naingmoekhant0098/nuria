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


import CreateDoctorDialog from './components/create_doctor_dialog';
import type {
    Doctor,
    NrcState,
    NrcTownship,
    NrcType,
} from './components/doctor_form';
import EditDoctorDialog from './components/edit_doctor_dialog';


/* =========================================================
   Specialization
========================================================= */

export interface Specialization {
    id: number;
    name: string;
    description?: string | null;
}

/* =========================================================
   Pagination
========================================================= */

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedDoctors {
    data: Doctor[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
}

/* =========================================================
   Page Props
========================================================= */

interface PageProps {
    doctors: PaginatedDoctors;

    specializations: Specialization[];

    nrcStates: NrcState[];
    nrcTownships: NrcTownship[];
    nrcTypes: NrcType[];

    filters?: {
        search?: string;
    };

    flash?: {
        success?: string;
        error?: string;
    };

    [key: string]: unknown;
}

/* =========================================================
   Index
========================================================= */

export default function Index() {
    const {
        doctors,
        filters,
        flash,
        specializations = [],
        nrcStates = [],
        nrcTownships = [],
        nrcTypes = [],
    } = usePage<PageProps>().props;

    /* =====================================================
       Search
    ====================================================== */

    const [search, setSearch] = useState(
        filters?.search ?? ''
    );

    /* =====================================================
       Edit
    ====================================================== */

    const [isEditOpen, setIsEditOpen] =
        useState(false);

    const [selectedDoctor, setSelectedDoctor] =
        useState<Doctor | null>(null);

    const [isInitialMount, setIsInitialMount] =
        useState(true);

    /* =====================================================
       Search Effect
    ====================================================== */

    useEffect(() => {
        if (isInitialMount) {
            setIsInitialMount(false);

            return;
        }

        const timer = setTimeout(() => {
            router.get(
                '/clinic/doctors',
                {
                    search: search || undefined,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                }
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [search, isInitialMount]);

    /* =====================================================
       Flash Messages
    ====================================================== */

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }

        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    /* =====================================================
       Edit
    ====================================================== */

    const handleEdit = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setIsEditOpen(true);
    };

    const handleEditClose = (open: boolean) => {
        setIsEditOpen(open);

        if (!open) {
            setSelectedDoctor(null);
        }
    };

    /* =====================================================
       Delete
    ====================================================== */

    const handleDelete = (doctor: Doctor) => {
        const doctorName = [
            doctor.first_name,
            doctor.middle_name,
            doctor.last_name,
        ]
            .filter(Boolean)
            .join(' ');

        const confirmed = window.confirm(
            `Are you sure you want to delete Dr. ${doctorName}?`
        );

        if (!confirmed) {
            return;
        }

        router.delete(
            `/doctors/${doctor.id}`,
            {
                preserveScroll: true,
            }
        );
    };

    /* =====================================================
       Doctor Name
    ====================================================== */

    const getDoctorName = (
        doctor: Doctor
    ): string => {
        return [
            doctor.first_name,
            doctor.middle_name,
            doctor.last_name,
        ]
            .filter(Boolean)
            .join(' ');
    };

    /* =====================================================
       Status Class
    ====================================================== */

    const getStatusClass = (
        status?: string | null
    ): string => {
        switch ((status ?? '').toLowerCase()) {
            case 'active':
                return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400';

            case 'inactive':
                return 'border-red-500/20 bg-red-500/10 text-red-400';

            case 'pending':
                return 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400';

            default:
                return 'border-neutral-500/20 bg-neutral-500/10 text-gray-400';
        }
    };

    const getCompensationLabel = (doctor: Doctor): string => {
        const compensation = doctor.clinics?.[0]?.pivot;

        if (compensation?.compensation_type == null || compensation.compensation_rate == null) {
            return 'Not set';
        }

        const labels: Record<string, string> = {
            monthly_salary: 'Monthly salary',
            hourly_rate: 'Hourly rate',
            per_appointment: 'Per appointment',
            commission_percentage: 'Commission',
        };
        const rate = Number(compensation.compensation_rate);
        const formattedRate = compensation.compensation_type === 'commission_percentage'
            ? rate + '%'
            : rate.toLocaleString() + ' MMK';

        return (labels[compensation.compensation_type] ?? compensation.compensation_type) + ': ' + formattedRate;
    };

    /* =====================================================
       NRC Display
    ====================================================== */

    const getNrcDisplay = (
        doctor: Doctor
    ): string => {
        const state =
            doctor.nrc?.state?.name ?? '';

        const township =
            doctor.nrc?.township?.name ?? '';

        const type =
            doctor.nrc?.type?.name ?? '';

        const number =
            doctor.nrc_number ?? '';

        if (
            !state &&
            !township &&
            !type &&
            !number
        ) {
            return '-';
        }

        const prefix = [
            state,
            township,
        ]
            .filter(Boolean)
            .join('/');

        const typePart = type
            ? `(${type})`
            : '';

        return `${prefix}${typePart}${number}`;
    };

    return (
        <div className="min-h-screen bg-black p-8 text-gray-100">

            <div className="mx-auto max-w-7xl space-y-6">

                {/* =================================================
                    Header
                ================================================== */}

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    <div>
                        <h1 className="text-xl font-extrabold tracking-tight text-white">
                            Doctor Management
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage doctors and their professional information.
                        </p>
                    </div>

                </div>

                {/* =================================================
                    Result Information
                ================================================== */}

                {doctors?.total > 0 && (

                    <div className="hidden">

                        <p className="text-sm text-gray-500">

                            Showing{' '}

                            <span className="font-medium text-gray-300">
                                {doctors.from}
                            </span>{' '}

                            to{' '}

                            <span className="font-medium text-gray-300">
                                {doctors.to}
                            </span>{' '}

                            of{' '}

                            <span className="font-medium text-gray-300">
                                {doctors.total}
                            </span>{' '}

                            doctors

                        </p>

                        {search && (
                            <button
                                type="button"
                                onClick={() =>
                                    setSearch('')
                                }
                                className="text-sm text-indigo-400 hover:text-indigo-300"
                            >
                                Clear search
                            </button>
                        )}

                    </div>

                )}

                {/* =================================================
                    Table
                ================================================== */}

                <div className="overflow-x-auto ">

                    <Table
                        clientPagination={false}
                        searchValue={search}
                        onSearchChange={setSearch}
                        toolbarActions={
                            <CreateDoctorDialog
                                specializations={specializations}
                            />
                        }
                    >

                        {/* =================================================
                            Header
                        ================================================== */}

                        <TableHeader className="bg-neutral-950">

                            <TableRow className="border-neutral-800 hover:bg-transparent">

                                <TableHead className="whitespace-nowrap text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Doctor
                                </TableHead>

                                <TableHead className="whitespace-nowrap text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Specialization
                                </TableHead>

                                <TableHead className="whitespace-nowrap text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    NRC
                                </TableHead>

                                <TableHead className="whitespace-nowrap text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Contact
                                </TableHead>

                                <TableHead className="whitespace-nowrap text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Proof of Identity
                                </TableHead>

                                <TableHead className="whitespace-nowrap text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Email
                                </TableHead>

                                <TableHead className="whitespace-nowrap text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Username
                                </TableHead>

                                <TableHead className="whitespace-nowrap text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Status
                                </TableHead>

                                <TableHead className="whitespace-nowrap text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Compensation
                                </TableHead>

                                {/* <TableHead className="whitespace-nowrap text-right text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Actions
                                </TableHead> */}

                            </TableRow>

                        </TableHeader>

                        {/* =================================================
                            Body
                        ================================================== */}

                        <TableBody>

                            {doctors?.data?.length > 0 ? (

                                doctors.data.map(
                                    (doctor) => (

                                        <TableRow
                                            key={doctor.id}
                                            className="border-neutral-800 transition-colors hover:bg-neutral-800/50"
                                        >

                                            {/* =================================================
                                                Doctor
                                            ================================================== */}

                                            <TableCell>

                                                <div>

                                                    <div className="font-medium text-white">
                                                        Dr.{' '}
                                                        {getDoctorName(
                                                            doctor
                                                        )}
                                                    </div>

                                                    <div className="mt-1 text-xs text-gray-500">
                                                        ID:{' '}
                                                        {doctor.id}
                                                    </div>

                                                </div>

                                            </TableCell>

                                            {/* =================================================
                                                Specialization
                                            ================================================== */}

                                            <TableCell>

                                                <span className="text-gray-300">
                                                    {
                                                        doctor
                                                            .specialization
                                                            ?.name ??
                                                        '-'
                                                    }
                                                </span>

                                            </TableCell>

                                            {/* =================================================
                                                NRC
                                            ================================================== */}

                                            <TableCell>

                                                <span className="whitespace-nowrap text-gray-400">
                                                    {getNrcDisplay(
                                                        doctor
                                                    )}
                                                </span>

                                            </TableCell>

                                            {/* =================================================
                                                Contact
                                            ================================================== */}

                                            <TableCell>

                                                <span className="whitespace-nowrap text-gray-400">
                                                    {
                                                        doctor
                                                            .contact_number ??
                                                        '-'
                                                    }
                                                </span>

                                            </TableCell>

                                            {/* =================================================
                                                Proof of Identity
                                            ================================================== */}

                                            <TableCell>

                                                <span className="whitespace-nowrap text-gray-400">
                                                    {
                                                        doctor
                                                            .proof_of_identity ??
                                                        '-'
                                                    }
                                                </span>

                                            </TableCell>

                                            {/* =================================================
                                                Email
                                            ================================================== */}

                                            <TableCell>

                                                <span className="text-gray-400">
                                                    {
                                                        doctor
                                                            .email ??
                                                        '-'
                                                    }
                                                </span>

                                            </TableCell>

                                            {/* =================================================
                                                Username
                                            ================================================== */}

                                            <TableCell>

                                                <span className="text-gray-400">
                                                    {
                                                        doctor
                                                            .user_name ??
                                                        '-'
                                                    }
                                                </span>

                                            </TableCell>

                                            {/* =================================================
                                                Status
                                            ================================================== */}

                                            <TableCell>

                                                <span
                                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(
                                                        doctor.status
                                                    )}`}
                                                >
                                                    {
                                                        doctor
                                                            .status ??
                                                        '-'
                                                    }
                                                </span>

                                            </TableCell>

                                            <TableCell className="whitespace-nowrap text-gray-300">
                                                {getCompensationLabel(doctor)}
                                            </TableCell>

                                            {/* =================================================
                                                Actions
                                            ================================================== */}

                                            <TableCell className="text-right">

                                                <div className="flex justify-end gap-2">

                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleEdit(
                                                                doctor
                                                            )
                                                        }
                                                        className="border-neutral-700 bg-transparent text-gray-300 hover:bg-neutral-800"
                                                    >
                                                        Edit
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() =>
                                                            handleDelete(
                                                                doctor
                                                            )
                                                        }
                                                        className="border border-red-900 bg-red-600/20 text-red-400 hover:bg-red-600/30"
                                                    >
                                                        Delete
                                                    </Button>

                                                </div>

                                            </TableCell>

                                        </TableRow>

                                    )
                                )

                            ) : (

                                /* =================================================
                                   Empty State
                                ================================================== */

                                <TableRow className="border-neutral-800">

                                    <TableCell
                                        colSpan={10}
                                        className="h-32 text-center"
                                    >

                                        <div className="flex flex-col items-center justify-center gap-2">

                                            <p className="text-sm font-medium text-gray-400">
                                                No doctors found
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

                {/* =================================================
                    Pagination
                ================================================== */}

                {doctors?.links &&
                    doctors.links.length > 3 && (

                    <div className="flex items-center justify-between">

                        <div className="text-sm text-gray-500">

                            Page{' '}

                            <span className="text-gray-300">
                                {doctors.current_page}
                            </span>{' '}

                            of{' '}

                            <span className="text-gray-300">
                                {doctors.last_page}
                            </span>

                        </div>

                        <div className="flex items-center gap-1.5">

                            {doctors.links.map(
                                (
                                    link,
                                    index
                                ) => {

                                    const Component =
                                        link.url
                                            ? Link
                                            : 'span';

                                    return (
                                        <Component
                                            key={index}
                                            href={
                                                link.url ||
                                                '#'
                                            }
                                            preserveScroll
                                            dangerouslySetInnerHTML={{
                                                __html:
                                                    link.label,
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
                                }
                            )}

                        </div>

                    </div>

                )}

                {/* =================================================
                    Edit Doctor
                ================================================== */}

                <EditDoctorDialog
                    open={isEditOpen}
                    onOpenChange={
                        handleEditClose
                    }
                    doctor={selectedDoctor}
                    specializations={
                        specializations
                    }
                    
                />

            </div>

        </div>
    );
}
