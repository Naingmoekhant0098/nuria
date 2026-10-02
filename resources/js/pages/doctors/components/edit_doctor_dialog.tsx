import { useForm, usePage } from '@inertiajs/react';
import React, { useEffect } from 'react';

import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';

import type {
    Doctor,
    Specialization,
    DoctorFormData,
    NrcState,
    NrcTownship,
    NrcType,
} from './doctor_form';
import DoctorForm from './doctor_form';

interface PageProps {
    nrcStates?: NrcState[];
    nrcTownships?: NrcTownship[];
    nrcTypes?: NrcType[];

    [key: string]: unknown;
}

interface EditDoctorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    doctor: Doctor | null;
    specializations: Specialization[];
}

export default function EditDoctorDialog({
    open,
    onOpenChange,
    doctor,
    specializations,
}: EditDoctorDialogProps) {
    const {
        nrcStates = [],
        nrcTownships = [],
        nrcTypes = [],
    } = usePage<PageProps>().props;

    const form = useForm<DoctorFormData>({
        first_name: '',
        middle_name: '',
        last_name: '',
        birthdate: '',
        gender: '',

        specialization_id: '',
        experience_years: '',

        complete_address: '',
        about: '',
        region: '',
        contact_number: '',
        proof_of_identity: '',
        photo: null,

        nrc_state_id: '',
        nrc_township_id: '',
        nrc_type_id: '',
        nrc_number: '',

        user_name: '',
        email: '',
        password: '',

        status: 'active',
        compensation_type: 'per_appointment',
        compensation_rate: '',
    });

    useEffect(() => {
        if (!doctor) {
            return;
        }

        form.setData({
            first_name: doctor.first_name ?? '',

            middle_name: doctor.middle_name ?? '',

            last_name: doctor.last_name ?? '',

            birthdate: doctor.birthdate?.substring(0, 10) ?? '',
            gender: doctor.gender ?? '',

            specialization_id: doctor.specialization?.id
                ? String(doctor.specialization.id)
                : '',

            experience_years:
                doctor.experience_years != null
                    ? String(doctor.experience_years)
                    : '',

            complete_address: doctor.complete_address ?? '',
            about: doctor.about ?? '',
            region: doctor.region ?? '',

            contact_number: doctor.contact_number ?? '',

            proof_of_identity: doctor.proof_of_identity ?? '',

            photo: null,

            /* ==========================================
               NRC
            ========================================== */

            nrc_state_id:
                doctor.nrc?.nrc_state_id != null
                    ? String(doctor.nrc.nrc_state_id)
                    : '',

            nrc_township_id:
                doctor.nrc?.nrc_township_id != null
                    ? String(doctor.nrc.nrc_township_id)
                    : '',

            nrc_type_id:
                doctor.nrc?.nrc_type_id != null
                    ? String(doctor.nrc.nrc_type_id)
                    : '',

            nrc_number: doctor.nrc_number ?? '',

            /* ==========================================
               Account
            ========================================== */

            user_name: doctor.user_name ?? '',

            email: doctor?.email ?? '',

            password: '',

            status: String(doctor.status ?? 'active').toLowerCase(),

            compensation_type:
                doctor.clinics?.[0]?.pivot.compensation_type ??
                'per_appointment',

            compensation_rate:
                doctor.clinics?.[0]?.pivot.compensation_rate != null
                    ? String(doctor.clinics[0].pivot.compensation_rate)
                    : '',
        });
    }, [doctor]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!doctor) {
            return;
        }

        form.transform((data) => ({ ...data, _method: 'put' }));
        form.post(`/clinic/doctors/${doctor.id}`, {
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
            <DrawerContent className="h-full w-full border-neutral-800 bg-neutral-900 text-white sm:max-w-2xl">
                <DrawerHeader className="border-b border-neutral-800">
                    <DrawerTitle className="text-white">
                        Edit Doctor
                    </DrawerTitle>
                </DrawerHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <DoctorForm
                        form={form}
                        currentPhotoUrl={doctor?.photo_url}
                        specializations={specializations ?? []}
                        mode="edit"
                        onSubmit={handleSubmit}
                        onCancel={() => handleClose(false)}
                        nrcStates={nrcStates}
                        nrcTownships={nrcTownships}
                        nrcTypes={nrcTypes}
                    />
                </div>
            </DrawerContent>
        </Drawer>
    );
}
