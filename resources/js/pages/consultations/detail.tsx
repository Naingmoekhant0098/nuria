import { Link, usePage } from '@inertiajs/react';

import {
    ArrowLeft,
    CalendarDays,
    UserRound,
    Stethoscope,
    Building2,
    FileText,
    ClipboardList,
} from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';

interface Patient {
    id: string;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
}

interface Doctor {
    id: string;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
}

interface Clinic {
    id: number;
    name: string;
}

interface Service {
    id: number;
    service_name: string;
    amount: number | string;
}

interface Schedule {
    id: number;
    day_of_week: string;
    start_time: string;
    end_time: string;
}

interface Reservation {
    id: number;
    appointment_code: string;
    appointment_type: string;
    status: string;
    remarks?: string | null;

    patient?: Patient | null;
    doctor?: Doctor | null;
    clinic?: Clinic | null;
    service?: Service | null;
    schedule?: Schedule | null;
}

interface Consultation {
    id: number;
    appointment_code: string;
    date_of_consultation: string;
    diagnosis: string;
    treatment: string;
    upload_prescription?: string | null;

    reservation?: Reservation | null;
}

interface PageProps {
    consultation: Consultation;

    [key: string]: unknown;
}

export default function Show() {
    const { consultation } = usePage<PageProps>().props;

    const reservation = consultation.reservation;
    const patient = reservation?.patient;
    const doctor = reservation?.doctor;

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

                {/* Header */}

                <div className="flex items-center gap-4">

                    <Link href="/clinic/consultations">

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
                            Consultation Details
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            {consultation.appointment_code}
                        </p>

                    </div>

                </div>

                {/* Patient / Doctor */}

                <div className="grid gap-5 md:grid-cols-2">

                    {/* Patient */}

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
                                    {getFullName(patient)}
                                </p>

                            </div>

                            <div>

                                <p className="text-xs text-gray-600">
                                    Patient ID
                                </p>

                                <p className="mt-1.5 text-sm text-gray-400">
                                    {patient?.id ?? '-'}
                                </p>

                            </div>

                        </div>

                    </div>

                    {/* Doctor */}

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
                                    {doctor
                                        ? `Dr. ${getFullName(doctor)}`
                                        : '-'}
                                </p>

                            </div>

                            <div>

                                <p className="text-xs text-gray-600">
                                    Doctor ID
                                </p>

                                <p className="mt-1.5 text-sm text-gray-400">
                                    {doctor?.id ?? '-'}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

                {/* Other Information */}

                <div className="rounded-xl border border-neutral-800 bg-neutral-900">

                    <div className="flex items-center gap-3 border-b border-neutral-800 px-5 py-4">

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                            <ClipboardList className="h-4 w-4" />
                        </div>

                        <div>

                            <h2 className="text-sm font-semibold text-white">
                                Other Information
                            </h2>

                            <p className="text-xs text-gray-600">
                                Consultation and appointment details
                            </p>

                        </div>

                    </div>

                    {/* Appointment / Consultation Info */}

                    <div className="grid gap-5 border-b border-neutral-800 p-5 md:grid-cols-3">

                        <div>

                            <p className="text-xs text-gray-600">
                                Appointment Code
                            </p>

                            <p className="mt-1.5 text-sm font-medium text-indigo-400">
                                {consultation.appointment_code}
                            </p>

                        </div>

                        <div>

                            <p className="text-xs text-gray-600">
                                Appointment Type
                            </p>

                            <p className="mt-1.5 text-sm text-gray-300">
                                {reservation?.appointment_type ?? '-'}
                            </p>

                        </div>

                        <div>

                            <p className="text-xs text-gray-600">
                                Status
                            </p>

                            <p className="mt-1.5 text-sm text-gray-300">
                                {reservation?.status ?? '-'}
                            </p>

                        </div>

                        <div>

                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                <CalendarDays className="h-3.5 w-3.5" />
                                Consultation Date
                            </div>

                            <p className="mt-1.5 text-sm text-gray-400">
                                {formatDateTime(
                                    consultation.date_of_consultation
                                )}
                            </p>

                        </div>

                        <div>

                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                <ClipboardList className="h-3.5 w-3.5" />
                                Service
                            </div>

                            <p className="mt-1.5 text-sm text-gray-400">
                                {reservation?.service?.service_name ?? '-'}
                            </p>

                        </div>

                        <div>

                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                <Building2 className="h-3.5 w-3.5" />
                                Clinic
                            </div>

                            <p className="mt-1.5 text-sm text-gray-400">
                                {reservation?.clinic?.name ?? '-'}
                            </p>

                        </div>

                    </div>

                    {/* Diagnosis */}

                    <div className="border-b border-neutral-800 p-5">

                        <p className="text-xs text-gray-600">
                            Diagnosis
                        </p>

                        {consultation.diagnosis ? (

                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-400">
                                {consultation.diagnosis}
                            </p>

                        ) : (

                            <p className="mt-2 text-sm text-gray-600">
                                No diagnosis available.
                            </p>

                        )}

                    </div>

                    {/* Treatment */}

                    <div className="border-b border-neutral-800 p-5">

                        <p className="text-xs text-gray-600">
                            Treatment
                        </p>

                        {consultation.treatment ? (

                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-400">
                                {consultation.treatment}
                            </p>

                        ) : (

                            <p className="mt-2 text-sm text-gray-600">
                                No treatment available.
                            </p>

                        )}

                    </div>

                    {/* Remarks */}

                    {reservation?.remarks && (

                        <div className="border-b border-neutral-800 p-5">

                            <p className="text-xs text-gray-600">
                                Appointment Remarks
                            </p>

                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-400">
                                {reservation.remarks}
                            </p>

                        </div>

                    )}

                    {/* Prescription */}

                    <div className="p-5">

                        <p className="text-xs text-gray-600">
                            Prescription
                        </p>

                        {consultation.upload_prescription ? (

                            <a
                                href={`/storage/${consultation.upload_prescription}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-sm text-indigo-400 transition-colors hover:border-neutral-700 hover:bg-neutral-800"
                            >

                                <FileText className="h-4 w-4" />

                                <span className="max-w-[300px] truncate">
                                    {getFileName(
                                        consultation.upload_prescription
                                    )}
                                </span>

                            </a>

                        ) : (

                            <p className="mt-2 text-sm text-gray-600">
                                No prescription uploaded.
                            </p>

                        )}

                    </div>

                </div>

            </div>

        </div>
    );
}
