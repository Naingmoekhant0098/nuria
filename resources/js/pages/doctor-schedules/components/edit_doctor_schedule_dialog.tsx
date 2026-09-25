import { useForm } from '@inertiajs/react';
import React, { useEffect } from 'react';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import type {
    Doctor,
    DoctorClinicSchedule,
    DoctorClinicScheduleFormData} from './doctor_schedule_form';
import DoctorScheduleForm, {
    Clinic
} from './doctor_schedule_form';

interface EditDoctorScheduleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    schedule: DoctorClinicSchedule | null;
    doctors: Doctor[];
    
}

export default function EditDoctorScheduleDialog({
    open,
    onOpenChange,
    schedule,
    doctors,
}: EditDoctorScheduleDialogProps) {
    const form = useForm<DoctorClinicScheduleFormData>({
        doctor_id: '',
        day_of_week: '',
        start_time: '',
        end_time: '',
        max_patients_per_slot: 1,
    });

    useEffect(() => {
        if (!schedule) {
            return;
        }

        form.setData({
            doctor_id: String(
                schedule.doctor_id ??
                    schedule.doctor?.id ??
                    '',
            ),

            day_of_week:
                schedule.day_of_week ?? '',

            start_time: schedule.start_time
                ? schedule.start_time.substring(
                      0,
                      5,
                  )
                : '',

            end_time: schedule.end_time
                ? schedule.end_time.substring(
                      0,
                      5,
                  )
                : '',
            max_patients_per_slot: schedule.max_patients_per_slot ?? 1,
        });
    }, [schedule]);

    const handleSubmit = (
        e: React.FormEvent,
    ) => {
        e.preventDefault();

        if (!schedule) {
            return;
        }

        form.put(
            `/clinic/doctor-schedules/${schedule.id}`,
            {
                preserveScroll: true,

                onSuccess: () => {
                    form.reset();
                    onOpenChange(false);
                },
            },
        );
    };

    const handleOpenChange = (
        value: boolean,
    ) => {
        if (!value) {
            form.clearErrors();
        }

        onOpenChange(value);
    };

    const handleCancel = () => {
        form.clearErrors();
        form.reset();
        onOpenChange(false);
    };

    return (
        <Dialog
            open={open}
            onOpenChange={handleOpenChange}
        >
            <DialogContent className="border-neutral-800 bg-neutral-900 text-white sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-white">
                        Edit Doctor Schedule
                    </DialogTitle>
                </DialogHeader>

                <div className="max-h-[75vh] overflow-y-auto px-1 py-3">
                    <DoctorScheduleForm
                        form={form}
                        doctors={doctors}
                        mode="edit"
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
