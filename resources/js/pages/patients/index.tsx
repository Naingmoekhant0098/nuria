import { Link, router, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

import { toast } from 'sonner';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';


import CreatePatientDrawer from './components/create_patient_dialog';
import EditPatientDialog from './components/edit_patient_dialog';

import type { Patient } from './components/patient_form';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedPatients {
    data: Patient[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
}

interface PageProps {
    patients: PaginatedPatients;

    filters: {
        search?: string;
    };

    flash?: {
        success?: string;
        error?: string;
        message?: string;
    };

    [key: string]: unknown;
}

export default function Index() {
    const { patients, filters, flash } =
        usePage<PageProps>().props;

    const [search, setSearch] = useState(
        filters?.search ?? '',
    );

    
    const [isEditOpen, setIsEditOpen] =
        useState(false);

    const [selectedPatient, setSelectedPatient] =
        useState<Patient | null>(null);

    const [isInitialMount, setIsInitialMount] =
        useState(true);

    useEffect(() => {
        if (isInitialMount) {
            setIsInitialMount(false);

            return;
        }

        const timer = setTimeout(() => {
            router.get(
                '/patients',
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

        if (flash?.message) {
            toast.success(flash.message);
        }
    }, [flash]);

    const handleEdit = (patient: Patient) => {
        setSelectedPatient(patient);
        setIsEditOpen(true);
    };

    const handleEditClose = (open: boolean) => {
        setIsEditOpen(open);

        if (!open) {
            setSelectedPatient(null);
        }
    };

    const getNrcNumber = (patient: Patient): string => {
        const state = patient.nrc?.state?.name ?? '';
        const township = patient.nrc?.township?.name ?? '';
        const type = patient.nrc?.type?.name ?? '';
        const number = patient.nrc_number ?? '';
    
        if (!state && !township && !type && !number) {
            return '-';
        }
    
        return `${state}/${township}(${type})${number}`;
    };

    const handleDelete = (patient: Patient) => {
        const patientName = [
            patient.first_name,
            patient.middle_name,
            patient.last_name,
        ]
            .filter(Boolean)
            .join(' ');

        const confirmed = window.confirm(
            `Are you sure you want to delete ${patientName}?`,
        );

        if (!confirmed) {
            return;
        }

        router.delete(`/patients/${patient.id}`, {
            preserveScroll: true,
        });
    };

    const getPatientName = (
        patient: Patient,
    ): string => {
        return [
            patient.first_name,
            patient.middle_name,
            patient.last_name,
        ]
            .filter(Boolean)
            .join(' ');
    };

    const getStatusClass = (
        status: string,
    ) => {
        switch (status?.toLowerCase()) {
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

    return (
        <div className="min-h-full bg-black p-8 text-gray-100">

            <div className="mx-auto max-w-7xl space-y-6">

                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    <div>
                        <h1 className="text-xl font-extrabold tracking-tight text-white">
                            Patient Management
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage patients and their personal information.
                        </p>
                    </div>

                </div>

                {/* Result count */}
                {patients?.total > 0 && (
                    <div className="hidden">

                        <p className="text-sm text-gray-500">
                            Showing{' '}
                            <span className="font-medium text-gray-300">
                                {patients.from}
                            </span>{' '}
                            to{' '}
                            <span className="font-medium text-gray-300">
                                {patients.to}
                            </span>{' '}
                            of{' '}
                            <span className="font-medium text-gray-300">
                                {patients.total}
                            </span>{' '}
                            patients
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

                {/* Table */}
                <div className="overflow-hidden ">

                    <Table
                        clientPagination={false}
                        searchValue={search}
                        onSearchChange={setSearch}
                        toolbarActions={<CreatePatientDrawer />}
                    >

                        <TableHeader className="bg-neutral-950">

                            <TableRow className="border-neutral-800 hover:bg-transparent">

                                <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Patient
                                </TableHead>

                                <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Birthdate
                                </TableHead>

                                <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    NRC
                                </TableHead>

                                <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Contact
                                </TableHead>

                                <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Email
                                </TableHead>

                                <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Username
                                </TableHead>

                                <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Status
                                </TableHead>

                                {/* <TableHead className="text-right text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Actions
                                </TableHead> */}

                            </TableRow>

                        </TableHeader>

                        <TableBody>

                            {patients?.data?.length > 0 ? (

                                patients.data.map(
                                    (patient) => (

                                        <TableRow
                                            key={patient.id}
                                            className="border-neutral-800 transition-colors hover:bg-neutral-800/50"
                                        >

                                            {/* Patient */}
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium text-white">
                                                        {getPatientName(
                                                            patient,
                                                        )}
                                                    </div>

                                                    <div className="mt-1 text-xs text-gray-500">
                                                        ID: {patient.id}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Birthdate */}
                                            <TableCell>
                                                <span className="text-gray-400">
                                                    {patient.birthdate
                                                        ? new Date(
                                                              patient.birthdate,
                                                          ).toLocaleDateString(
                                                              'en-GB',
                                                              {
                                                                  day: '2-digit',
                                                                  month: 'short',
                                                                  year: 'numeric',
                                                              },
                                                          )
                                                        : '-'}
                                                </span>
                                            </TableCell>

                                            <TableCell>
                                            {getNrcNumber(patient)}
                                            </TableCell>

                                            {/* Contact */}
                                            <TableCell>
                                                <span className="text-gray-400">
                                                    {patient.contact_number ??
                                                        '-'}
                                                </span>
                                            </TableCell>

                                            {/* Email */}
                                            <TableCell>
                                                <span className="text-gray-400">
                                                    {patient.user?.email ??
                                                        '-'}
                                                </span>
                                            </TableCell>

                                            {/* Username */}
                                            <TableCell>
                                                <span className="text-gray-400">
                                                    {patient.user_name ??
                                                        '-'}
                                                </span>
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell>
                                                <span
                                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(
                                                        patient.status,
                                                    )}`}
                                                >
                                                    {patient.status}
                                                </span>
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="text-right">

                                                {/* <div className="flex justify-end gap-2">

                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleEdit(
                                                                patient,
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
                                                                patient,
                                                            )
                                                        }
                                                        className="border border-red-900 bg-red-600/20 text-red-400 hover:bg-red-600/30"
                                                    >
                                                        Delete
                                                    </Button>

                                                </div> */}

                                            </TableCell>

                                        </TableRow>
                                    ),
                                )

                            ) : (

                                <TableRow className="border-neutral-800">

                                    <TableCell
                                        colSpan={8}
                                        className="h-32 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-2">

                                            <p className="text-sm font-medium text-gray-400">
                                                No patients found
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

                {/* Pagination */}
                {patients?.links &&
                    patients.links.length > 3 && (

                        <div className="flex items-center justify-between">

                            <div className="text-sm text-gray-500">
                                Page{' '}
                                <span className="text-gray-300">
                                    {patients.current_page}
                                </span>{' '}
                                of{' '}
                                <span className="text-gray-300">
                                    {patients.last_page}
                                </span>
                            </div>

                            <div className="flex items-center gap-1.5">

                                {patients.links.map(
                                    (link, index) => {

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
                                    },
                                )}

                            </div>
                        </div>
                    )}

                {/* Edit */}
                <EditPatientDialog
                    open={isEditOpen}
                    onOpenChange={handleEditClose}
                    patient={selectedPatient}
                />

            </div>
        </div>
    );
}
