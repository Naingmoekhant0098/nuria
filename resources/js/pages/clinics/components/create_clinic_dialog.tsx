import { useForm } from '@inertiajs/react';
import { FilePlus } from 'lucide-react';
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
    ClinicFormData,
} from './clinic_form';
import ClinicForm from './clinic_form';

export default function CreateClinicDialog() {
    const [open, setOpen] = useState(false);

    const form = useForm<ClinicFormData>({
        clinic_name: '',
        clinic_permit: '',
        complete_address: '',
        latitude: '',
        longitude: '',
        open_time: '09:00',
        close_time: '17:00',
        status: 'active',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        form.post('/clinics', {
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
        <Dialog
            open={open}
            onOpenChange={setOpen}
        >
            <DialogTrigger asChild>
                <Button
                    type="button"
                    className="cursor-pointer bg-main text-white hover:bg-main/90"
                >
                    <FilePlus className="h-4 w-4" />
                    Create Clinic
                </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-y-auto border-neutral-800 bg-neutral-900 text-white sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        Create New Clinic
                    </DialogTitle>
                </DialogHeader>

                <ClinicForm
                    form={form}
                    mode="create"
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            </DialogContent>
        </Dialog>
    );
}