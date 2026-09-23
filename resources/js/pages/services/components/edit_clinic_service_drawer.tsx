import { useForm } from '@inertiajs/react';
import React, { useEffect } from 'react';

import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';

import { update } from '@/routes/clinic/services';
import type {
    Doctor,
    ClinicService,
    ClinicServiceFormData} from './clinic_service_form';
import ClinicServiceForm, {
    Clinic
} from './clinic_service_form';

interface EditClinicServiceDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    service: ClinicService | null;
   
    doctors: Doctor[];
}

export default function EditClinicServiceDrawer({
    open,
    onOpenChange,
    service,
   
    doctors,
}: EditClinicServiceDrawerProps) {
    const form = useForm<ClinicServiceFormData>({
       
        doctor_id: '',
        service_name: '',
        service_description: '',
        amount: '',
    });

    useEffect(() => {
        if (!service) {
            return;
        }

        form.setData({
          

            doctor_id: String(
                service.doctor_id ??
                service.doctor?.id ??
                '',
            ),

            service_name: service.service_name ?? '',

            service_description:
                service.service_description ?? '',

            amount: String(service.amount ?? ''),
        });
    }, [service]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!service) {
            return;
        }

        form.put(update.url(service.id), {
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
        <Drawer
            open={open}
            onOpenChange={handleClose}
            direction="right"
        >
            <DrawerContent
                className="
                    fixed
                    inset-y-0
                    right-0
                    left-auto
                    mt-0
                    h-full
                    w-full
                    rounded-none
                    border-l
                    border-neutral-800
                    bg-neutral-900
                    text-white
                    sm:max-w-xl
                "
            >
                <div className="flex h-full flex-col">
                    <DrawerHeader className="border-b border-neutral-800 px-6 py-5">
                        <DrawerTitle className="text-lg font-semibold text-white">
                            Edit Clinic Service
                        </DrawerTitle>
                    </DrawerHeader>

                    <div className="flex-1 overflow-y-auto px-6 py-5">
                        <ClinicServiceForm
                            form={form}
                          
                            doctors={doctors}
                            mode="edit"
                            onSubmit={handleSubmit}
                            onCancel={() => handleClose(false)}
                        />
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
