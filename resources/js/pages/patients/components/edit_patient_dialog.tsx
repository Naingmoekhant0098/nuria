import { useForm, usePage } from '@inertiajs/react';
import React, { useEffect } from 'react';

import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';

import type {
    Patient,
    PatientFormData,
    NrcState,
    NrcTownship,
    NrcType,
} from './patient_form';
import PatientForm from './patient_form';

interface PageProps {
    nrcStates: NrcState[];
    nrcTownships: NrcTownship[];
    nrcTypes: NrcType[];

    [key: string]: unknown;
}

interface EditPatientDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patient: Patient | null;
}

export default function EditPatientDialog({
    open,
    onOpenChange,
    patient,
}: EditPatientDialogProps) {

    const {
        nrcStates = [],
        nrcTownships = [],
        nrcTypes = [],
    } = usePage<PageProps>().props;

    const form = useForm<PatientFormData>({
        first_name: '',
        middle_name: '',
        last_name: '',

        birthdate: '',

        complete_address: '',
        contact_number: '',

        nrc_state_id: '',
        nrc_township_id: '',
        nrc_type_id: '',
        nrc_number: '',

        user_name: '',
        email: '',
        password: '',

        status: 'active',
    });

    useEffect(() => {
        if (!patient) {
            return;
        }

        /*
         * IMPORTANT:
         *
         * nrc_state_id, nrc_township_id and nrc_type_id
         * are inside patient.nrc.
         */

        form.setData({
            first_name:
                patient.first_name ?? '',

            middle_name:
                patient.middle_name ?? '',

            last_name:
                patient.last_name ?? '',

            birthdate:
                patient.birthdate
                    ? patient.birthdate.substring(
                          0,
                          10
                      )
                    : '',

            complete_address:
                patient.complete_address ?? '',

            contact_number:
                patient.contact_number ?? '',

            nrc_state_id:
                patient.nrc?.nrc_state_id != null
                    ? String(
                          patient.nrc.nrc_state_id
                      )
                    : '',

            nrc_township_id:
                patient.nrc?.nrc_township_id != null
                    ? String(
                          patient.nrc
                              .nrc_township_id
                      )
                    : '',

            nrc_type_id:
                patient.nrc?.nrc_type_id != null
                    ? String(
                          patient.nrc.nrc_type_id
                      )
                    : '',

            nrc_number:
                patient.nrc_number ?? '',

            user_name:
                patient.user_name ?? '',

            email:
                patient.user?.email ?? '',

            password: '',

            status:
                patient.status ?? 'active',
        });
    }, [patient]);

    const handleSubmit = (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        if (!patient) {
            return;
        }

        form.put(
            `/patients/${patient.id}`,
            {
                preserveScroll: true,

                onSuccess: () => {
                    form.reset();

                    onOpenChange(false);
                },
            }
        );
    };

    const handleClose = (
        value: boolean
    ) => {
        if (!value) {
            form.clearErrors();
        }

        onOpenChange(value);
    };

    return (
        <Drawer
            open={open}
            onOpenChange={handleClose}
            direction="right"
        >
            <DrawerContent
                className="
                    h-full
                    w-full
                    border-neutral-800
                    bg-neutral-900
                    text-white
                    sm:max-w-2xl
                "
            >
                <DrawerHeader className="border-b border-neutral-800">
                    <DrawerTitle className="text-white">
                        Edit Patient
                    </DrawerTitle>
                </DrawerHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <PatientForm
                        form={form}
                        mode="edit"
                        onSubmit={handleSubmit}
                        onCancel={() =>
                            handleClose(false)
                        }
                        nrcStates={nrcStates}
                        nrcTownships={
                            nrcTownships
                        }
                        nrcTypes={nrcTypes}
                    />
                </div>
            </DrawerContent>
        </Drawer>
    );
}