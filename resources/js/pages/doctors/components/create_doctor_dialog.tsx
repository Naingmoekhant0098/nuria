import { useForm, usePage } from '@inertiajs/react';
import { UserPlus } from 'lucide-react';
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
    DoctorFormData,
    Specialization,
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

interface CreateDoctorDrawerProps {
    specializations: Specialization[];
}

export default function CreateDoctorDrawer({
    specializations,
}: CreateDoctorDrawerProps) {
    const [open, setOpen] = useState(false);

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        form.post('/clinic/doctors', {
            preserveScroll: true,

            onSuccess: () => {
                form.reset();
                setOpen(false);
            },
        });
    };

    const handleCancel = () => {
        form.clearErrors();
        form.reset();
        setOpen(false);
    };

    return (
        <Drawer open={open} onOpenChange={setOpen} direction="right">
            <DrawerTrigger asChild>
                <Button
                    type="button"
                    className="cursor-pointer bg-main text-white hover:bg-main/90"
                >
                    <UserPlus className="h-4 w-4" />
                    Create Doctor
                </Button>
            </DrawerTrigger>

            <DrawerContent className="fixed inset-y-0 right-0 left-auto mt-0 h-full w-full rounded-none border-l border-neutral-800 bg-neutral-900 text-white sm:max-w-2xl">
                <div className="flex h-full flex-col">
                    <DrawerHeader className="border-b border-neutral-800 px-6 py-5">
                        <DrawerTitle className="text-lg font-semibold text-white">
                            Create New Doctor
                        </DrawerTitle>
                    </DrawerHeader>

                    <div className="flex-1 overflow-y-auto px-6 py-5">
                        <DoctorForm
                            form={form}
                            specializations={specializations ?? []}
                            mode="create"
                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                            nrcStates={nrcStates}
                            nrcTownships={nrcTownships}
                            nrcTypes={nrcTypes}
                        />
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
