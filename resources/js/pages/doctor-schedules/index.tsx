import { router, usePage } from '@inertiajs/react';
import { Pencil, Trash2, Search, Stethoscope } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { destroy } from '@/routes/doctor-schedules';

import CreateDoctorScheduleDialog from './components/create_doctor_schedule_dialog';
import type {
    Clinic,
    Doctor,
    DoctorClinicSchedule,
} from './components/doctor_schedule_form';
import EditDoctorScheduleDialog from './components/edit_doctor_schedule_dialog';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

interface GroupedDoctorSchedules {
    doctor: Doctor | null;
    schedules: DoctorClinicSchedule[];
}

interface PageProps {
    schedules: GroupedDoctorSchedules[];

    clinic: Clinic | null;

    doctors: Doctor[];

    filters: {
        search?: string;
        doctor_id?: string;
        day_of_week?: string;
        active_at?: string;
    };

    flash?: {
        success?: string;
        error?: string;
    };

    [key: string]: unknown;
}

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function Index() {
    const { schedules, clinic, doctors, filters, flash } =
        usePage<PageProps>().props;

    const [search, setSearch] = useState(filters?.search ?? '');
    const [dayFilter, setDayFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const schedulesPerPage = 6;
    const filteredSchedules = (schedules ?? [])
        .map((group) => ({
            ...group,
            schedules: dayFilter
                ? group.schedules.filter(
                      (schedule) => schedule.day_of_week === dayFilter,
                  )
                : group.schedules,
        }))
        .filter((group) => group.schedules.length > 0);
    const pageCount = Math.max(
        1,
        Math.ceil(filteredSchedules.length / schedulesPerPage),
    );
    const visibleSchedules = filteredSchedules.slice(
        (currentPage - 1) * schedulesPerPage,
        currentPage * schedulesPerPage,
    );

    const [isEditOpen, setIsEditOpen] = useState(false);

    const [selectedSchedule, setSelectedSchedule] =
        useState<DoctorClinicSchedule | null>(null);

    const [isInitialMount, setIsInitialMount] = useState(true);

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
                '/clinic/doctor-schedules',
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
    }, [search, isInitialMount]);

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
    | Helpers
    |--------------------------------------------------------------------------
    */

    const getDoctorName = (doctor?: Doctor | null): string => {
        if (!doctor) {
            return '-';
        }

        return [doctor.first_name, doctor.middle_name, doctor.last_name]
            .filter(Boolean)
            .join(' ');
    };

    const formatTime = (time?: string | null): string => {
        if (!time) {
            return '-';
        }

        const [hours, minutes] = time.split(':');

        if (!hours || !minutes) {
            return time;
        }

        const hour = Number(hours);

        if (Number.isNaN(hour)) {
            return time;
        }

        const period = hour >= 12 ? 'PM' : 'AM';

        const displayHour = hour % 12 || 12;

        return `${displayHour}:${minutes} ${period}`;
    };

    const getScheduleTime = (schedule: DoctorClinicSchedule): string => {
        return `${formatTime(schedule.start_time)} - ${formatTime(
            schedule.end_time,
        )}`;
    };

    /*
    |--------------------------------------------------------------------------
    | Edit
    |--------------------------------------------------------------------------
    */

    const handleEdit = (schedule: DoctorClinicSchedule) => {
        setSelectedSchedule(schedule);
        setIsEditOpen(true);
    };

    const handleEditClose = (open: boolean) => {
        setIsEditOpen(open);

        if (!open) {
            setSelectedSchedule(null);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Delete
    |--------------------------------------------------------------------------
    */

    const handleDelete = (schedule: DoctorClinicSchedule) => {
        const doctorName = getDoctorName(schedule.doctor);

        const clinicName = clinic?.clinic_name ?? 'this clinic';

        const confirmed = window.confirm(
            `Are you sure you want to delete the ${schedule.day_of_week} schedule for Dr. ${doctorName} at ${clinicName}?`,
        );

        if (!confirmed) {
            return;
        }

        router.delete(destroy.url(schedule.id), {
            preserveScroll: true,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Statistics
    |--------------------------------------------------------------------------
    */

    const totalSchedules =
        schedules?.reduce(
            (total, doctorGroup) =>
                total + (doctorGroup.schedules?.length ?? 0),
            0,
        ) ?? 0;

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <div className="min-h-full bg-black p-8 text-gray-100">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}

                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-xl font-extrabold tracking-tight text-white">
                            Doctor Schedules
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage doctor schedules and working hours
                            {clinic?.clinic_name
                                ? ` at ${clinic.clinic_name}.`
                                : '.'}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <select
                            aria-label="Filter schedules by day"
                            value={dayFilter}
                            onChange={(event) => {
                                setCurrentPage(1);
                                setDayFilter(event.target.value);
                            }}
                            className="h-9 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 text-sm text-gray-200 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:w-44"
                        >
                            <option value="">All days</option>
                            {[
                                'Monday',
                                'Tuesday',
                                'Wednesday',
                                'Thursday',
                                'Friday',
                                'Saturday',
                                'Sunday',
                            ].map((day) => (
                                <option key={day} value={day}>
                                    {day}
                                </option>
                            ))}
                        </select>

                        {/* Search */}

                        <div className="relative w-full sm:w-80">
                            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />

                            <Input
                                type="text"
                                value={search}
                                onChange={(e) => {
                                    setCurrentPage(1);
                                    setSearch(e.target.value);
                                }}
                                placeholder="Search doctor..."
                                className="border-neutral-800 bg-neutral-900 pl-9 text-gray-100 placeholder:text-gray-500 focus-visible:ring-indigo-500"
                            />
                        </div>

                        {/* Create */}

                        <CreateDoctorScheduleDialog doctors={doctors ?? []} />
                    </div>
                </div>

                {/* Statistics */}

                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        <span className="font-medium text-gray-300">
                            {schedules?.length ?? 0}
                        </span>{' '}
                        doctors ·{' '}
                        <span className="font-medium text-gray-300">
                            {totalSchedules}
                        </span>{' '}
                        schedules
                    </div>

                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch('')}
                            className="text-sm text-indigo-400 transition-colors hover:text-indigo-300"
                        >
                            Clear search
                        </button>
                    )}
                </div>

                {/* Empty State */}

                {!schedules?.length && (
                    <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900 text-center">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800">
                            <Search className="h-5 w-5 text-gray-500" />
                        </div>

                        <h3 className="text-sm font-semibold text-gray-300">
                            No doctor schedules found
                        </h3>

                        <p className="mt-1 text-xs text-gray-600">
                            {search
                                ? 'Try a different search term.'
                                : 'Create a schedule to get started.'}
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-2">
                    {visibleSchedules.map((doctorGroup, doctorIndex) => {
                        const doctor = doctorGroup.doctor;

                        const doctorSchedules = doctorGroup.schedules ?? [];

                        return (
                            <div
                                key={doctor?.id ?? `doctor-${doctorIndex}`}
                                className="self-start overflow-hidden text-[12px]"
                            >
                                <div className="flex flex-col gap-4 border-b border-neutral-800 bg-neutral-950 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
                                            <Stethoscope className="h-5 w-5" />
                                        </div>

                                        <div>
                                            <h2 className="font-semibold text-white">
                                                {doctor
                                                    ? `Dr. ${getDoctorName(
                                                          doctor,
                                                      )}`
                                                    : 'Unknown Doctor'}
                                            </h2>

                                            {doctor?.id && (
                                                <p className="mt-0.5 text-xs text-gray-500">
                                                    Doctor ID: {doctor.id}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="inline-flex w-fit items-center rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-gray-400">
                                        {doctorSchedules.length} schedules
                                    </div>
                                </div>

                                {/* Schedule Table */}

                                <div className="p-6">
                                    <div className="overflow-hidden rounded-xl border border-neutral-800">
                                        <table
                                            className="w-full"
                                            data-card-grid="true"
                                        >
                                            <thead className="bg-neutral-950">
                                                <tr className="border-b border-neutral-800">
                                                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                                        Day
                                                    </th>

                                                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                                        Working Hours
                                                    </th>

                                                    <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {doctorSchedules.map(
                                                    (schedule) => (
                                                        <tr
                                                            key={schedule.id}
                                                            className="border-b border-neutral-800 transition-colors last:border-0 hover:bg-neutral-800/40"
                                                            data-card-icon="calendar"
                                                        >
                                                            {/* Day */}

                                                            <td
                                                                className="px-4 py-4"
                                                                data-label="Day"
                                                            >
                                                                <div
                                                                    data-slot="table-cell-content"
                                                                    className="min-w-0"
                                                                >
                                                                    <span className="inline-flex rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 font-medium text-indigo-400">
                                                                        {
                                                                            schedule.day_of_week
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </td>

                                                            {/* Time */}

                                                            <td
                                                                className="px-4 py-4"
                                                                data-label="Working Hours"
                                                            >
                                                                <div
                                                                    data-slot="table-cell-content"
                                                                    className="min-w-0"
                                                                >
                                                                    <div className="font-medium text-gray-300">
                                                                        {getScheduleTime(
                                                                            schedule,
                                                                        )}
                                                                    </div>

                                                                    <div className="mt-1 text-xs text-gray-600">
                                                                        {
                                                                            schedule.start_time
                                                                        }{' '}
                                                                        —{' '}
                                                                        {
                                                                            schedule.end_time
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            {/* Actions */}

                                                            <td
                                                                className="px-4 py-4"
                                                                data-label="Actions"
                                                            >
                                                                <div
                                                                    data-slot="table-cell-content"
                                                                    className="flex min-w-0 justify-end gap-2"
                                                                >
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() =>
                                                                            handleEdit(
                                                                                schedule,
                                                                            )
                                                                        }
                                                                        className="border-neutral-700 bg-transparent text-gray-300 hover:bg-neutral-800"
                                                                    >
                                                                        <Pencil className="h-3.5 w-3.5" />
                                                                    </Button>

                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        onClick={() =>
                                                                            handleDelete(
                                                                                schedule,
                                                                            )
                                                                        }
                                                                        className="border border-red-900 bg-red-600/20 text-red-400 hover:bg-red-600/30"
                                                                    >
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex flex-col gap-3 border-t border-border pt-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-muted-foreground" aria-live="polite">
                        Showing{' '}
                        {filteredSchedules.length === 0
                            ? 0
                            : (currentPage - 1) * schedulesPerPage + 1}{' '}
                        to{' '}
                        {Math.min(
                            currentPage * schedulesPerPage,
                            filteredSchedules.length,
                        )}{' '}
                        of {filteredSchedules.length}
                    </p>
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={currentPage <= 1}
                            onClick={() =>
                                setCurrentPage((page) => Math.max(1, page - 1))
                            }
                        >
                            Previous
                        </Button>
                        <span className="min-w-16 text-center text-muted-foreground">
                            {currentPage} / {pageCount}
                        </span>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={currentPage >= pageCount}
                            onClick={() =>
                                setCurrentPage((page) =>
                                    Math.min(pageCount, page + 1),
                                )
                            }
                        >
                            Next
                        </Button>
                    </div>
                </div>

                {/* Edit Dialog */}

                <EditDoctorScheduleDialog
                    open={isEditOpen}
                    onOpenChange={handleEditClose}
                    schedule={selectedSchedule}
                    doctors={doctors ?? []}
                />
            </div>
        </div>
    );
}
