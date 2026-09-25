import type { useForm } from '@inertiajs/react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export interface Clinic {
    id: number | string;
    clinic_name: string;
}

export interface Doctor {
    id: number | string;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
}

export interface DoctorClinicSchedule {
    id: number;

    clinic_id?: number | string | null;
    doctor_id:  string;

    day_of_week: string;
    start_time: string;
    end_time: string;
    max_patients_per_slot: number;

    clinic?: Clinic | null;
    doctor?: Doctor | null;
}

export interface DoctorClinicScheduleFormData {
    doctor_id: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    max_patients_per_slot: number;
}

interface DoctorScheduleFormProps {
    form: ReturnType<
        typeof useForm<DoctorClinicScheduleFormData>
    >;

    doctors: Doctor[];

    mode: 'create' | 'edit';

    onCancel: () => void;

    onSubmit: (
        e: React.FormEvent,
    ) => void;
}

const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
];

export default function DoctorScheduleForm({
    form,
    doctors,
    mode,
    onCancel,
    onSubmit,
}: DoctorScheduleFormProps) {
    const getDoctorName = (doctor: Doctor) => {
        return [
            doctor.first_name,
            doctor.middle_name,
            doctor.last_name,
        ]
            .filter(Boolean)
            .join(' ');
    };

    return (
        <form
            onSubmit={onSubmit}
            className="space-y-5"
        >
            {/* Doctor */}
            <div className="space-y-2">
                <Label>Doctor</Label>

                <Select
                    value={form.data.doctor_id}
                    onValueChange={(value) =>
                        form.setData(
                            'doctor_id',
                            value,
                        )
                    }
                >
                    <SelectTrigger className="w-full border-neutral-800 bg-neutral-950 text-white">
                        <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>

                    <SelectContent className="border-neutral-800 bg-neutral-900 text-white">
                        {doctors?.length > 0 ? (
                            doctors.map((doctor) => (
                                <SelectItem
                                    key={doctor.id}
                                    value={String(
                                        doctor.id,
                                    )}
                                >
                                    Dr.{' '}
                                    {getDoctorName(
                                        doctor,
                                    )}
                                </SelectItem>
                            ))
                        ) : (
                            <div className="px-3 py-2 text-sm text-gray-500">
                                No doctors available
                            </div>
                        )}
                    </SelectContent>
                </Select>

                {form.errors.doctor_id && (
                    <p className="text-xs text-red-500">
                        {form.errors.doctor_id}
                    </p>
                )}
            </div>

            {/* Day */}
            <div className="space-y-2">
                <Label>Day of Week</Label>

                <Select
                    value={form.data.day_of_week}
                    onValueChange={(value) =>
                        form.setData(
                            'day_of_week',
                            value,
                        )
                    }
                >
                    <SelectTrigger className="w-full border-neutral-800 bg-neutral-950 text-white">
                        <SelectValue placeholder="Select day" />
                    </SelectTrigger>

                    <SelectContent className="border-neutral-800 bg-neutral-900 text-white">
                        {daysOfWeek.map((day) => (
                            <SelectItem
                                key={day}
                                value={day}
                            >
                                {day}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {form.errors.day_of_week && (
                    <p className="text-xs text-red-500">
                        {form.errors.day_of_week}
                    </p>
                )}
            </div>

            {/* Time */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Start Time */}
                <div className="space-y-2">
                    <Label>Start Time</Label>

                    <Input
                        type="time"
                        value={form.data.start_time}
                        onChange={(e) =>
                            form.setData(
                                'start_time',
                                e.target.value,
                            )
                        }
                        className="border-neutral-800 bg-neutral-950 text-white"
                    />

                    {form.errors.start_time && (
                        <p className="text-xs text-red-500">
                            {form.errors.start_time}
                        </p>
                    )}
                </div>

                {/* End Time */}
                <div className="space-y-2">
                    <Label>End Time</Label>

                    <Input
                        type="time"
                        value={form.data.end_time}
                        onChange={(e) =>
                            form.setData(
                                'end_time',
                                e.target.value,
                            )
                        }
                        className="border-neutral-800 bg-neutral-950 text-white"
                    />

                    {form.errors.end_time && (
                        <p className="text-xs text-red-500">
                            {form.errors.end_time}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="max-patients-per-slot">
                    Maximum patients per time slot
                </Label>
                <Input
                    id="max-patients-per-slot"
                    type="number"
                    min={1}
                    max={1000}
                    value={form.data.max_patients_per_slot}
                    onChange={(event) =>
                        form.setData(
                            'max_patients_per_slot',
                            Number(event.target.value),
                        )
                    }
                    className="border-neutral-800 bg-neutral-950 text-white"
                />
                {form.errors.max_patients_per_slot && (
                    <p className="text-xs text-red-500">
                        {form.errors.max_patients_per_slot}
                    </p>
                )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 border-t border-neutral-800 pt-5">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="border-neutral-800 bg-transparent text-gray-300 hover:bg-neutral-800"
                >
                    Cancel
                </Button>

                <Button
                    type="submit"
                    disabled={form.processing}
                    className="bg-main text-white hover:bg-main/90"
                >
                    {form.processing
                        ? mode === 'create'
                            ? 'Saving...'
                            : 'Updating...'
                        : mode === 'create'
                          ? 'Save Schedule'
                          : 'Update Schedule'}
                </Button>
            </div>
        </form>
    );
}
