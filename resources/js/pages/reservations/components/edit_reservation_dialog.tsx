import { useForm, usePage } from '@inertiajs/react';
import React, { useEffect } from 'react';

import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';

import type {
    Reservation,
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

interface EditReservationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reservation: Reservation | null;
}

export default function EditReservationDialog({
    open,
    onOpenChange,
    reservation,
}: EditReservationDialogProps) {
    const {
        patients = [],
        doctors = [],
        services = [],
        schedules = [],
    } = usePage<PageProps>().props;

    const form = useForm<ReservationFormData>({
        patient_id: '',
        doctor_id: '',

        service_id: '',
        schedule_id: '',
        appointment_at: '',

        appointment_type: 'In-Person',
        status: 'Pending',
        remarks: '',
        amount: '',
        payment_method: '',
        transaction_code: '',
        payment_image: null,
    });

    useEffect(() => {
        if (!reservation) {
            return;
        }

        form.setData({
            patient_id:
                reservation.patient_id != null
                    ? String(reservation.patient_id)
                    : '',

            doctor_id:
                reservation.doctor_id != null
                    ? String(reservation.doctor_id)
                    : '',

            service_id:
                reservation.service_id != null
                    ? String(reservation.service_id)
                    : '',

            schedule_id:
                reservation.schedule_id != null
                    ? String(reservation.schedule_id)
                    : '',

            appointment_at: reservation.appointment_at
                ? reservation.appointment_at.substring(0, 16)
                : '',

            appointment_type: reservation.appointment_type ?? 'In-Person',

            status: reservation.status ?? 'Pending',

            remarks: reservation.remarks ?? '',

            amount:
                reservation.amount != null ? String(reservation.amount) : '',
            payment_method: '',
            transaction_code: '',
            payment_image: null,
        });
    }, [reservation]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!reservation) {
            return;
        }

        form.put(`/clinic/reservations/${reservation.id}`, {
            preserveScroll: true,

            onSuccess: () => {
                form.reset();

                onOpenChange(false);
            },
        });
    };

    const handleClose = (value: boolean) => {
        if (!value) {
            form.clearErrors();
        }

        onOpenChange(value);
    };

    return (
        <Drawer open={open} onOpenChange={handleClose} direction="right">
            <DrawerContent className="fixed inset-y-0 right-0 left-auto mt-0 h-full w-full rounded-none border-l border-neutral-800 bg-neutral-900 text-white sm:max-w-2xl">
                <div className="flex h-full flex-col">
                    <DrawerHeader className="border-b border-neutral-800 px-6 py-5">
                        <DrawerTitle className="text-lg font-semibold text-white">
                            Edit Reservation
                        </DrawerTitle>
                    </DrawerHeader>

                    <div className="flex-1 overflow-y-auto px-6 py-5">
                        <ReservationForm
                            form={form}
                            mode="edit"
                            onSubmit={handleSubmit}
                            onCancel={() => handleClose(false)}
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
