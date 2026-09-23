import { useForm, usePage } from '@inertiajs/react';
import { CalendarPlus } from 'lucide-react';
import React, { useState } from 'react';


import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';

import type {
    ReservationFormData,
    Patient,
    Doctor,
    Clinic,
    ClinicService,
    DoctorClinicSchedule,
} from './reservation_form';
import ReservationForm from './reservation_form';

interface PageProps {
    patients?: Patient[];
    doctors?: Doctor[];
    clinics?: Clinic[];
    services?: ClinicService[];
    schedules?: DoctorClinicSchedule[];

    [key: string]: unknown;
}

export default function CreateReservationDrawer() {
    const [open, setOpen] = useState(false);

    const {
        patients = [],
        doctors = [],
        clinics = [],
        services = [],
        schedules = [],
    } = usePage<PageProps>().props;

    const form = useForm<ReservationFormData>({
        patient_id: '',
        doctor_id: '',

        service_id: '',
        schedule_id: '',

        appointment_type: 'In-Person',
        status: 'Pending',
        remarks: '',
        amount: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        form.post('/clinic/reservations', {
            preserveScroll: true,

            onSuccess: () => {
                form.reset();

                form.setData('appointment_type', 'In-Person');

                form.setData('status', 'Pending');

                setOpen(false);
            },
        });
    };

    const handleCancel = () => {
        form.clearErrors();
        form.reset();

        form.setData('appointment_type', 'In-Person');

        form.setData('status', 'Pending');

        setOpen(false);
    };

    return (
        <Drawer open={open} onOpenChange={setOpen} direction="right">
            <DrawerTrigger asChild>
                <Button
                    type="button"
                    className="w-full cursor-pointer justify-center whitespace-nowrap bg-main text-white hover:bg-main/90 sm:w-auto"
                >
                    <CalendarPlus className="h-4 w-4" />
                    Create Reservation
                </Button>
            </DrawerTrigger>

            <DrawerContent className="fixed inset-y-0 right-0 left-auto mt-0 h-full w-full rounded-none border-l border-neutral-800 bg-neutral-900 text-white sm:max-w-2xl">
                <div className="flex h-full flex-col">
                    <DrawerHeader className="border-b border-neutral-800 px-6 py-5">
                        <DrawerTitle className="text-lg font-semibold text-white">
                            Create New Reservation
                        </DrawerTitle>
                    </DrawerHeader>

                    <div className="flex-1 overflow-y-auto px-6 py-5">
                        <ReservationForm
                            form={form}
                            mode="create"
                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                            patients={patients}
                            doctors={doctors}

                            services={services}
                            schedules={schedules}
                        />
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
