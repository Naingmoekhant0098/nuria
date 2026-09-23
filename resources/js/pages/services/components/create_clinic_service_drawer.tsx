import { useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
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
    Doctor,
    ClinicServiceFormData} from './clinic_service_form';
import ClinicServiceForm, {
    Clinic
} from './clinic_service_form';

interface CreateClinicServiceDrawerProps {
    doctors: Doctor[];
}

export default function CreateClinicServiceDrawer({
    doctors,
}: CreateClinicServiceDrawerProps) {
    const [open, setOpen] = useState(false);

    const form = useForm<ClinicServiceFormData>({
        doctor_id: '',
        service_name: '',
        service_description: '',
        amount: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        form.post('/clinic/services', {
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
                    <Plus className="h-4 w-4" />
                    Create Service
                </Button>
            </DrawerTrigger>

            <DrawerContent className="fixed inset-y-0 right-0 left-auto mt-0 h-full w-full rounded-none border-l border-neutral-800 bg-neutral-900 text-white sm:max-w-xl">
                <div className="flex h-full flex-col">
                    <DrawerHeader className="border-b border-neutral-800 px-6 py-5">
                        <DrawerTitle className="text-lg font-semibold text-white">
                            Create Clinic Service
                        </DrawerTitle>
                    </DrawerHeader>

                    <div className="flex-1 overflow-y-auto px-6 py-5">
                        <ClinicServiceForm
                            form={form}

                            doctors={doctors}
                            mode="create"
                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                        />
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
