import { useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import React, { useState } from 'react';


import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

import type {
    Doctor,
    DoctorClinicScheduleFormData,
} from './doctor_schedule_form';
import DoctorScheduleForm from './doctor_schedule_form';

interface CreateDoctorScheduleDialogProps {
    doctors: Doctor[];
}

export default function CreateDoctorScheduleDialog({
    doctors,
}: CreateDoctorScheduleDialogProps) {
    const [open, setOpen] = useState(false);

    const form = useForm<DoctorClinicScheduleFormData>({
        doctor_id: '',
        day_of_week: '',
        start_time: '',
        end_time: '',
        max_patients_per_slot: 1,
    });

    const handleSubmit = (
        e: React.FormEvent,
    ) => {
        e.preventDefault();

        form.post('/clinic/doctor-schedules', {
            preserveScroll: true,

            onSuccess: () => {
                form.reset();
                setOpen(false);
            },
        });
    };

    const handleOpenChange = (
        value: boolean,
    ) => {
        if (!value) {
            form.clearErrors();
        }

        setOpen(value);
    };

    const handleCancel = () => {
        form.clearErrors();
        form.reset();
        setOpen(false);
    };

    return (
        <Dialog
            open={open}
            onOpenChange={handleOpenChange}
        >
            <DialogTrigger asChild>
                <Button
                    type="button"
                    className="cursor-pointer bg-main text-white hover:bg-main/90"
                >
                    <Plus className="h-4 w-4" />
                    Create Schedule
                </Button>
            </DialogTrigger>

            <DialogContent className="border-neutral-800 bg-neutral-900 text-white sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-white">
                        Create Doctor Schedule
                    </DialogTitle>
                </DialogHeader>

                <div className="max-h-[75vh] overflow-y-auto px-1 py-3">
                    <DoctorScheduleForm
                        form={form}
                        doctors={doctors}
                        mode="create"
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
