 
import { Link, usePage } from '@inertiajs/react';

import {
    ArrowLeft,
    CalendarDays,
    FileText,
    Paperclip,
    Stethoscope,
    UserRound,
} from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';

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
   Page Props
========================================================= */

interface PageProps {
    medicalRecord: MedicalRecord;

    [key: string]: unknown;
}

/* =========================================================
   Show
========================================================= */

export default function Show() {
    const { medicalRecord } =
        usePage<PageProps>().props;

    /* =====================================================
       Helpers
    ====================================================== */

    const getFullName = (
        person?: Patient | Doctor | null
    ): string => {
        if (!person) {
            return '-';
        }

        return [
            person.first_name,
            person.middle_name,
            person.last_name,
        ]
            .filter(Boolean)
            .join(' ');
    };

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

    const getFileName = (
        path?: string | null
    ): string => {
        if (!path) {
            return '-';
        }

        return path.split('/').pop() ?? path;
    };

    return (
        <div className="min-h-screen bg-black p-6 text-gray-100 md:p-8">

            <div className="mx-auto max-w-7xl space-y-6">

                {/* =================================================
                    Header
                ================================================== */}

                <div className="flex items-center gap-4">

                    <Link href="/clinic/medical-records">

                        <Button
                            size="sm"
                            variant="outline"
                            className="border-neutral-800 bg-neutral-900 text-gray-300 hover:bg-neutral-800"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>

                    </Link>

                    <div>

                        <h1 className="text-xl font-extrabold tracking-tight text-white">
                            Medical Record Details
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Record #{medicalRecord.id}
                        </p>

                    </div>

                </div>

                {/* =================================================
                    Patient + Doctor
                ================================================== */}

                <div className="grid gap-5 md:grid-cols-2">

                    {/* =================================================
                        Patient Information
                    ================================================== */}

                    <div className="rounded-xl border border-neutral-800 bg-neutral-900">

                        <div className="flex items-center gap-3 border-b border-neutral-800 px-5 py-4">

                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">

                                <UserRound className="h-4 w-4" />

                            </div>

                            <div>

                                <h2 className="text-sm font-semibold text-white">
                                    Patient Information
                                </h2>

                                <p className="text-xs text-gray-600">
                                    Patient details
                                </p>

                            </div>

                        </div>

                        <div className="grid gap-5 p-5 sm:grid-cols-2">

                            <div>

                                <p className="text-xs text-gray-600">
                                    Patient Name
                                </p>

                                <p className="mt-1.5 text-sm font-medium text-gray-200">
                                    {getFullName(
                                        medicalRecord.patient
                                    )}
                                </p>

                            </div>

                            <div>

                                <p className="text-xs text-gray-600">
                                    Patient ID
                                </p>

                                <p className="mt-1.5 text-sm text-gray-400">
                                    {medicalRecord.patient_id}
                                </p>

                            </div>

                        </div>

                    </div>

                    {/* =================================================
                        Doctor Information
                    ================================================== */}

                    <div className="rounded-xl border border-neutral-800 bg-neutral-900">

                        <div className="flex items-center gap-3 border-b border-neutral-800 px-5 py-4">

                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">

                                <Stethoscope className="h-4 w-4" />

                            </div>

                            <div>

                                <h2 className="text-sm font-semibold text-white">
                                    Doctor Information
                                </h2>

                                <p className="text-xs text-gray-600">
                                    Attending doctor
                                </p>

                            </div>

                        </div>

                        <div className="grid gap-5 p-5 sm:grid-cols-2">

                            <div>

                                <p className="text-xs text-gray-600">
                                    Doctor Name
                                </p>

                                <p className="mt-1.5 text-sm font-medium text-gray-200">

                                    {medicalRecord.doctor
                                        ? `Dr. ${getFullName(
                                              medicalRecord.doctor
                                          )}`
                                        : '-'}

                                </p>

                            </div>

                            <div>

                                <p className="text-xs text-gray-600">
                                    Doctor ID
                                </p>

                                <p className="mt-1.5 text-sm text-gray-400">
                                    {medicalRecord.doctor_id}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

                {/* =================================================
                    Other Information
                ================================================== */}

                <div className="rounded-xl border border-neutral-800 bg-neutral-900">

                    {/* Header */}

                    <div className="flex items-center gap-3 border-b border-neutral-800 px-5 py-4">

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">

                            <FileText className="h-4 w-4" />

                        </div>

                        <div>

                            <h2 className="text-sm font-semibold text-white">
                                Other Information
                            </h2>

                            <p className="text-xs text-gray-600">
                                Medical record details
                            </p>

                        </div>

                    </div>

                    {/* Record Information */}

                    <div className="grid gap-5 border-b border-neutral-800 p-5 md:grid-cols-2">

                        {/* Record Title */}

                        <div>

                            <p className="text-xs text-gray-600">
                                Record Title
                            </p>

                            <p className="mt-1.5 text-sm font-medium text-gray-200">
                                {medicalRecord.record_title}
                            </p>

                        </div>

                        {/* Record Date */}

                        <div>

                            <div className="flex items-center gap-1.5 text-xs text-gray-600">

                                <CalendarDays className="h-3.5 w-3.5" />

                                Record Date

                            </div>

                            <p className="mt-1.5 text-sm text-gray-400">
                                {formatDateTime(
                                    medicalRecord.record_date
                                )}
                            </p>

                        </div>

                    </div>

                    {/* =================================================
                        Notes
                    ================================================== */}

                    <div className="border-b border-neutral-800 p-5">

                        <p className="text-xs text-gray-600">
                            Notes
                        </p>

                        {medicalRecord.notes ? (

                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-400">
                                {medicalRecord.notes}
                            </p>

                        ) : (

                            <p className="mt-2 text-sm text-gray-600">
                                No notes available.
                            </p>

                        )}

                    </div>

                    {/* =================================================
                        Attachment
                    ================================================== */}

                    <div className="p-5">

                        <p className="text-xs text-gray-600">
                            Attachment
                        </p>

                        {medicalRecord.file_attachment ? (

                            <a
                                href={`/storage/${medicalRecord.file_attachment}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-sm text-indigo-400 transition-colors hover:border-neutral-700 hover:bg-neutral-800"
                            >

                                <Paperclip className="h-4 w-4" />

                                <span className="max-w-[300px] truncate">
                                    {getFileName(
                                        medicalRecord.file_attachment
                                    )}
                                </span>

                            </a>

                        ) : (

                            <p className="mt-2 text-sm text-gray-600">
                                No attachment uploaded.
                            </p>

                        )}

                    </div>

                </div>

            </div>

        </div>
    );
}
 
