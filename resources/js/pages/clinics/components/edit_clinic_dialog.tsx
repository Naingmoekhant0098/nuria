import { useForm } from '@inertiajs/react';
import React, { useEffect } from 'react';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import type { Clinic, ClinicFormData } from './clinic_form';
import ClinicForm from './clinic_form';

interface EditClinicDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clinic: Clinic | null;
}

export default function EditClinicDialog({
    open,
    onOpenChange,
    clinic,
}: EditClinicDialogProps) {
    const form = useForm<ClinicFormData>({
        clinic_name: '',
        clinic_permit: '',
        complete_address: '',
        photo: null,
        latitude: '',
        longitude: '',
        open_time: '',
        close_time: '',
        status: 'active',
    });

    useEffect(() => {
        if (!clinic) {
            return;
        }

        form.setData({
            clinic_name: clinic.clinic_name ?? '',
            clinic_permit: clinic.clinic_permit ?? '',
            complete_address: clinic.complete_address ?? '',
            photo: null,
            latitude: clinic.latitude?.toString() ?? '',
            longitude: clinic.longitude?.toString() ?? '',

            // Expected format: HH:mm:ss or HH:mm
            open_time: clinic.open_time ? clinic.open_time.substring(0, 5) : '',

            close_time: clinic.close_time
                ? clinic.close_time.substring(0, 5)
                : '',

            status: clinic.status ?? 'active',
        });
    }, [clinic]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!clinic) {
            return;
        }

        form.transform((data) => ({ ...data, _method: 'put' }));
        form.post(`/admin/clinics/${clinic.id}`, {
            forceFormData: true,
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
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto border-neutral-800 bg-neutral-900 text-white sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit Clinic</DialogTitle>
                </DialogHeader>

                <ClinicForm
                    form={form}
                    mode="edit"
                    onSubmit={handleSubmit}
                    onCancel={() => handleClose(false)}
                    currentPhotoUrl={clinic?.photo_url}
                />
            </DialogContent>
        </Dialog>
    );
}
