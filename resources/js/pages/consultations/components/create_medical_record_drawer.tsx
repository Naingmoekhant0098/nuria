import { router } from '@inertiajs/react';
import { CalendarDays, FileText, UserRound, Stethoscope, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';


import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Person {
    id: string;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
}

interface Reservation {
    id: number;
    appointment_code: string;
    appointment_type: string;
    patient?: Person | null;
    doctor?: Person | null;
}

interface Consultation {
    id: number;
    appointment_code: string;
    date_of_consultation: string;
    diagnosis: string;
    treatment: string;
    upload_prescription?: string | null;
    reservation?: Reservation | null;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    consultation: Consultation | null;
    onSuccess?: () => void;
}

const getFullName = (
    person?: Person | null
): string => {
    if (!person) {
        return '-';
    }

    return [
        person.first_name,
        person.middle_name,
        person.last_name,
    ]
        .filter(Boolean)
        .join(' ');
};

const getLocalDateTime = (): string => {
    const now = new Date();

    const offset =
        now.getTimezoneOffset() * 60000;

    return new Date(
        now.getTime() - offset
    )
        .toISOString()
        .slice(0, 16);
};

export default function CreateMedicalRecordDrawer({
    open,
    onOpenChange,
    consultation,
    onSuccess,
}: Props) {
    const [
        recordTitle,
        setRecordTitle,
    ] = useState('');

    const [
        recordDate,
        setRecordDate,
    ] = useState('');

    const [
        notes,
        setNotes,
    ] = useState('');

    const [
        fileAttachment,
        setFileAttachment,
    ] = useState<File | null>(null);

    const [
        processing,
        setProcessing,
    ] = useState(false);

    useEffect(() => {
        if (!open || !consultation) {
            return;
        }

        setRecordTitle(
            `Medical Record - ${consultation.appointment_code}`
        );

        setRecordDate(
            consultation.date_of_consultation
                ? consultation.date_of_consultation
                    .replace(' ', 'T')
                    .slice(0, 16)
                : getLocalDateTime()
        );

        setNotes(
            `Diagnosis:\n${consultation.diagnosis}\n\nTreatment:\n${consultation.treatment}`
        );

        setFileAttachment(null);
    }, [open, consultation]);

    const handleClose = () => {
        if (processing) {
            return;
        }

        onOpenChange(false);
    };

    const handleSubmit = (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!consultation) {
            return;
        }

        if (!recordTitle.trim()) {
            toast.error(
                'Record title is required.'
            );

            return;
        }

        if (!recordDate) {
            toast.error(
                'Record date is required.'
            );

            return;
        }

        const formData = new FormData();

        formData.append(
            'record_title',
            recordTitle.trim()
        );

        formData.append(
            'record_date',
            recordDate
        );

        formData.append(
            'notes',
            notes.trim()
        );

        if (fileAttachment) {
            formData.append(
                'file_attachment',
                fileAttachment
            );
        }

        setProcessing(true);

        router.post(
            `/clinic/consultations/${consultation.id}/medical-record`,
            formData,
            {
                forceFormData: true,
                preserveScroll: true,

                onStart: () => {
                    toast.loading(
                        'Creating medical record...',
                        {
                            id: 'create-medical-record',
                        }
                    );
                },

                onSuccess: () => {
                    toast.success(
                        'Medical record created successfully.',
                        {
                            id: 'create-medical-record',
                        }
                    );

                    onOpenChange(false);

                    onSuccess?.();
                },

                onError: (errors) => {
                    const firstError =
                        Object.values(errors)[0];

                    toast.error(
                        typeof firstError === 'string'
                            ? firstError
                            : 'Unable to create medical record.',
                        {
                            id: 'create-medical-record',
                        }
                    );
                },

                onFinish: () => {
                    setProcessing(false);
                },
            }
        );
    };

    return (
        <Drawer
            open={open}
            onOpenChange={onOpenChange}
            direction="right"
        >
            <DrawerContent
                className="
                    h-full
                    w-full
                    sm:max-w-2xl
                    border-l
                    border-neutral-800
                    border-t-0
                    rounded-none
                    !bg-black
                    text-white
                "
            >
                <div className="flex h-full flex-col">

                    {/* Header */}

                    <DrawerHeader
                        className="
                            shrink-0
                            border-b
                            border-neutral-800
                            px-5
                            py-4
                        "
                    >
                        <div className="flex items-start justify-between gap-4">

                            <div>

                                <DrawerTitle className="flex items-center gap-2 text-lg text-white">

                                    <FileText className="h-5 w-5 text-indigo-400" />

                                    Create Medical Record

                                </DrawerTitle>

                                <DrawerDescription className="mt-1 text-sm text-neutral-500">
                                    Create a medical record for this consultation.
                                </DrawerDescription>

                            </div>

                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                disabled={processing}
                                onClick={handleClose}
                                className="h-8 w-8 shrink-0 text-neutral-500 hover:bg-neutral-900 hover:text-white"
                            >
                                <X className="h-4 w-4" />
                            </Button>

                        </div>
                    </DrawerHeader>

                    {consultation && (

                        <form
                            onSubmit={handleSubmit}
                            className="flex min-h-0 flex-1 flex-col"
                        >

                            {/* Content */}

                            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">

                                {/* Consultation Information */}

                                <div className="mb-6 grid grid-cols-1 gap-3">

                                    <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4">

                                        <div className="mb-2 flex items-center gap-2 text-xs text-neutral-500">
                                            <FileText className="h-3.5 w-3.5" />
                                            Appointment
                                        </div>

                                        <p className="text-sm font-semibold text-indigo-400">
                                            {consultation.appointment_code}
                                        </p>

                                    </div>

                                    <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4">

                                        <div className="mb-2 flex items-center gap-2 text-xs text-neutral-500">
                                            <UserRound className="h-3.5 w-3.5" />
                                            Patient
                                        </div>

                                        <p className="text-sm font-semibold text-white">
                                            {getFullName(
                                                consultation
                                                    .reservation
                                                    ?.patient
                                            )}
                                        </p>

                                    </div>

                                    <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4">

                                        <div className="mb-2 flex items-center gap-2 text-xs text-neutral-500">
                                            <Stethoscope className="h-3.5 w-3.5" />
                                            Doctor
                                        </div>

                                        <p className="text-sm font-semibold text-white">
                                            {getFullName(
                                                consultation
                                                    .reservation
                                                    ?.doctor
                                            )}
                                        </p>

                                    </div>

                                </div>

                                {/* Record Title */}

                                <div className="mb-5 space-y-2">

                                    <Label
                                        htmlFor="record_title"
                                        className="text-sm text-neutral-300"
                                    >
                                        Record Title
                                    </Label>

                                    <Input
                                        id="record_title"
                                        value={recordTitle}
                                        onChange={(event) =>
                                            setRecordTitle(
                                                event.target.value
                                            )
                                        }
                                        disabled={processing}
                                        placeholder="Enter record title..."
                                        className="h-10 border-neutral-800 bg-neutral-900 text-white placeholder:text-neutral-600 focus-visible:ring-indigo-500"
                                    />

                                </div>

                                {/* Record Date */}

                                <div className="mb-5 space-y-2">

                                    <Label
                                        htmlFor="record_date"
                                        className="text-sm text-neutral-300"
                                    >
                                        Record Date
                                    </Label>

                                    <div className="relative">

                                        <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />

                                        <Input
                                            id="record_date"
                                            type="datetime-local"
                                            value={recordDate}
                                            onChange={(event) =>
                                                setRecordDate(
                                                    event.target.value
                                                )
                                            }
                                            disabled={processing}
                                            className="h-10 border-neutral-800 bg-neutral-900 pl-10 text-white [color-scheme:dark]"
                                        />

                                    </div>

                                </div>

                                {/* Notes */}

                                <div className="mb-5 space-y-2">

                                    <Label
                                        htmlFor="notes"
                                        className="text-sm text-neutral-300"
                                    >
                                        Notes
                                    </Label>

                                    <Textarea
                                        id="notes"
                                        value={notes}
                                        onChange={(event) =>
                                            setNotes(
                                                event.target.value
                                            )
                                        }
                                        disabled={processing}
                                        placeholder="Enter medical record notes..."
                                        rows={8}
                                        className="resize-none border-neutral-800 bg-neutral-900 text-white placeholder:text-neutral-600 focus-visible:ring-indigo-500"
                                    />

                                </div>

                                {/* Attachment */}

                                <div className="mb-6 space-y-2">

                                    <Label
                                        htmlFor="file_attachment"
                                        className="text-sm text-neutral-300"
                                    >
                                        Attachment
                                    </Label>

                                    <Input
                                        id="file_attachment"
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        disabled={processing}
                                        onChange={(event) => {
                                            setFileAttachment(
                                                event.target.files?.[0] ??
                                                null
                                            );
                                        }}
                                        className="border-neutral-800 bg-neutral-900 text-neutral-400 file:mr-3 file:border-0 file:bg-neutral-800 file:px-3 file:py-1 file:text-sm file:text-white"
                                    />

                                    {fileAttachment && (
                                        <p className="text-xs text-neutral-500">
                                            Selected:{' '}
                                            {fileAttachment.name}
                                        </p>
                                    )}

                                    <p className="text-xs text-neutral-600">
                                        JPG, JPEG, PNG or PDF. Maximum size 5 MB.
                                    </p>

                                </div>

                            </div>

                            {/* Footer */}

                            <div className="shrink-0 border-t border-neutral-800 bg-black px-5 py-4">

                                <div className="flex justify-end gap-2">

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        disabled={processing}
                                        onClick={handleClose}
                                        className="text-neutral-400 hover:bg-neutral-900 hover:text-white"
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-indigo-600 text-white hover:bg-indigo-500"
                                    >
                                        <FileText className="mr-2 h-4 w-4" />

                                        {processing
                                            ? 'Creating...'
                                            : 'Create Medical Record'}
                                    </Button>

                                </div>

                            </div>

                        </form>

                    )}

                </div>

            </DrawerContent>
        </Drawer>
    );
}