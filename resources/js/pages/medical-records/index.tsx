 
import { Link, router, usePage } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';



/* =========================================================
   Patient
========================================================= */

interface Patient {
    id: string;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
}

/* =========================================================
   Doctor
========================================================= */

interface Doctor {
    id: string;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
}

/* =========================================================
   Medical Record
========================================================= */

interface MedicalRecord {
    id: number;
    patient_id: string;
    doctor_id: string;
    record_title: string;
    file_attachment?: string | null;
    notes?: string | null;
    record_date: string;

    patient?: Patient | null;
    doctor?: Doctor | null;
}

/* =========================================================
   Pagination
========================================================= */

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedMedicalRecords {
    data: MedicalRecord[];
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
    medicalRecords: PaginatedMedicalRecords;

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
        medicalRecords,
        filters,
        flash,
    } = usePage<PageProps>().props;

    /* =====================================================
       Search
    ====================================================== */

    const [search, setSearch] = useState(
        filters?.search ?? ''
    );

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
                '/clinic/medical-records',
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
       Patient Name
    ====================================================== */

    const getPatientName = (
        patient?: Patient | null
    ): string => {
        if (!patient) {
            return '-';
        }

        return [
            patient.first_name,
            patient.middle_name,
            patient.last_name,
        ]
            .filter(Boolean)
            .join(' ');
    };

    /* =====================================================
       Doctor Name
    ====================================================== */

    const getDoctorName = (
        doctor?: Doctor | null
    ): string => {
        if (!doctor) {
            return '-';
        }

        return [
            doctor.first_name,
            doctor.middle_name,
            doctor.last_name,
        ]
            .filter(Boolean)
            .join(' ');
    };

    /* =====================================================
       Date
    ====================================================== */

    const formatDateTime = (
        value?: string | null
    ): string => {
        if (!value) {
            return '-';
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    /* =====================================================
       File Name
    ====================================================== */

    const getFileName = (
        path?: string | null
    ): string => {
        if (!path) {
            return '-';
        }

        return path.split('/').pop() ?? path;
    };

    /* =====================================================
       Delete
    ====================================================== */

    const handleDelete = (
        record: MedicalRecord
    ) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${record.record_title}"?`
        );

        if (!confirmed) {
            return;
        }

        router.delete(
            `/clinic/medical-records/${record.id}`,
            {
                preserveScroll: true,
            }
        );
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
                            Medical Record Management
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage patient medical records and attachments.
                        </p>

                    </div>

                    <div className="w-full md:w-80">

                        <Input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search medical records..."
                            className="border-neutral-800 bg-neutral-900 text-gray-100 placeholder:text-gray-500 focus-visible:ring-indigo-500"
                        />

                    </div>

                </div>

                {/* =================================================
                    Result Information
                ================================================== */}

                {medicalRecords?.total > 0 && (

                    <div className="flex items-center justify-between">

                        <p className="text-sm text-gray-500">

                            Showing{' '}

                            <span className="font-medium text-gray-300">
                                {medicalRecords.from}
                            </span>{' '}

                            to{' '}

                            <span className="font-medium text-gray-300">
                                {medicalRecords.to}
                            </span>{' '}

                            of{' '}

                            <span className="font-medium text-gray-300">
                                {medicalRecords.total}
                            </span>{' '}

                            medical records

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

                    <Table>

                        <TableHeader className="bg-neutral-950">

                            <TableRow className="border-neutral-800 hover:bg-transparent">

                                <TableHead className="whitespace-nowrap text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Patient
                                </TableHead>

                                <TableHead className="whitespace-nowrap text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Doctor
                                </TableHead>

                                <TableHead className="whitespace-nowrap text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Record
                                </TableHead>

                                <TableHead className="whitespace-nowrap text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Record Date
                                </TableHead>

                                <TableHead className="whitespace-nowrap text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Attachment
                                </TableHead>

                                <TableHead className="whitespace-nowrap text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Notes
                                </TableHead>

                                {/* <TableHead className="whitespace-nowrap text-right text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Actions
                                </TableHead> */}

                            </TableRow>

                        </TableHeader>

                        <TableBody>

                            {medicalRecords?.data?.length > 0 ? (

                                medicalRecords.data.map(
                                    (record) => (

                                        <TableRow
                                            key={record.id}
                                            className="border-neutral-800 transition-colors hover:bg-neutral-800/50"
                                        >

                                            {/* Patient */}

                                            <TableCell>

                                                <div>

                                                    <div className="font-medium text-white">
                                                        {getPatientName(
                                                            record.patient
                                                        )}
                                                    </div>

                                                    <div className="mt-1 text-xs text-gray-500">
                                                        {record.patient_id}
                                                    </div>

                                                </div>

                                            </TableCell>

                                            {/* Doctor */}

                                            <TableCell>

                                                <span className="whitespace-nowrap text-gray-300">

                                                    {record.doctor
                                                        ? `Dr. ${getDoctorName(
                                                              record.doctor
                                                          )}`
                                                        : '-'}

                                                </span>

                                            </TableCell>

                                            {/* Record */}

                                            <TableCell className="max-w-[250px]">

                                                <span className="font-medium text-gray-300">
                                                    {record.record_title}
                                                </span>

                                            </TableCell>

                                            {/* Date */}

                                            <TableCell>

                                                <span className="whitespace-nowrap text-gray-400">
                                                    {formatDateTime(
                                                        record.record_date
                                                    )}
                                                </span>

                                            </TableCell>

                                            {/* Attachment */}

                                            <TableCell>

                                                {record.file_attachment ? (

                                                    <span className="block max-w-[180px] truncate text-sm text-indigo-400">
                                                        {getFileName(
                                                            record.file_attachment
                                                        )}
                                                    </span>

                                                ) : (

                                                    <span className="text-sm text-gray-600">
                                                        -
                                                    </span>

                                                )}

                                            </TableCell>

                                            {/* Notes */}

                                            <TableCell className="max-w-[250px]">

                                                <span className="line-clamp-2 text-gray-400">
                                                    {record.notes ?? '-'}
                                                </span>

                                            </TableCell>

                                            {/* Actions */}

                                            <TableCell className="text-right">

                                                <div className="flex justify-end gap-2">

                                                    <Link
                                                        href={`/clinic/medical-records/${record.id}`}
                                                    >
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-neutral-700 bg-transparent text-gray-300 hover:bg-neutral-800"
                                                        >
                                                            <Eye className="mr-1.5 h-3.5 w-3.5" />
                                                            View
                                                        </Button>
                                                    </Link>

                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() =>
                                                            handleDelete(
                                                                record
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

                                <TableRow className="border-neutral-800">

                                    <TableCell
                                        colSpan={7}
                                        className="h-32 text-center"
                                    >

                                        <div className="flex flex-col items-center justify-center gap-2">

                                            <p className="text-sm font-medium text-gray-400">
                                                No medical records found
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

                {medicalRecords?.links &&
                    medicalRecords.links.length > 3 && (

                    <div className="flex items-center justify-between">

                        <div className="text-sm text-gray-500">

                            Page{' '}

                            <span className="text-gray-300">
                                {medicalRecords.current_page}
                            </span>{' '}

                            of{' '}

                            <span className="text-gray-300">
                                {medicalRecords.last_page}
                            </span>

                        </div>

                        <div className="flex items-center gap-1.5">

                            {medicalRecords.links.map(
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

            </div>

        </div>
    );
}
 
