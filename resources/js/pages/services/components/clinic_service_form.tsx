import type { useForm } from '@inertiajs/react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export interface Clinic {
    id: number | string;
    clinic_name: string;
}

export interface Doctor {
    id: string;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
}

export interface ServiceName {
    id: number;
    name: string;
}

export interface ClinicService {
    id: number;

    doctor_id: string;
    service_name_id?: number | null;

    service_name: string | ServiceName;
    serviceName?: ServiceName | null;
    service_description?: string | null;
    image_path?: string | null;
    image_url?: string | null;

    amount: number | string;

    doctor?: Doctor | null;
}

export function getClinicServiceName(service: ClinicService): string {
    if (typeof service.service_name === 'string') {
        return service.service_name;
    }

    return service.service_name?.name ?? service.serviceName?.name ?? '-';
}

export interface ClinicServiceFormData {
    doctor_id: string;
    service_name_id: string;
    service_name: string;
    service_description: string;
    amount: string;
}

interface ClinicServiceFormProps {
    form: ReturnType<typeof useForm<ClinicServiceFormData>>;

    doctors: Doctor[];
    serviceNames: ServiceName[];
    mode: 'create' | 'edit';
    onCancel: () => void;
    onSubmit: (e: React.FormEvent) => void;
}

export default function ClinicServiceForm({
    form,

    doctors,
    serviceNames,
    mode,
    onCancel,
    onSubmit,
}: ClinicServiceFormProps) {
    const getDoctorName = (doctor: Doctor) => {
        return [doctor.first_name, doctor.middle_name, doctor.last_name]
            .filter(Boolean)
            .join(' ');
    };

    return (
        <form onSubmit={onSubmit} className="space-y-5">
            {/* Doctor */}
            <div className="space-y-2">
                <Label>Doctor</Label>

                <Select
                    value={form.data.doctor_id}
                    onValueChange={(value) => form.setData('doctor_id', value)}
                >
                    <SelectTrigger className="w-full border-neutral-800 bg-neutral-950 text-white">
                        <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>

                    <SelectContent className="border-neutral-800 bg-neutral-900 text-white">
                        {doctors.length > 0 ? (
                            doctors.map((doctor) => (
                                <SelectItem
                                    key={doctor.id}
                                    value={String(doctor.id)}
                                >
                                    Dr. {getDoctorName(doctor)}
                                </SelectItem>
                            ))
                        ) : (
                            <div className="px-3 py-2 text-sm text-gray-500">
                                No doctors available
                            </div>
                        )}
                    </SelectContent>
                </Select>

                {form.errors.doctor_id && (
                    <p className="text-xs text-red-500">
                        {form.errors.doctor_id}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label>Service</Label>
                <select
                    value={form.data.service_name_id}
                    onChange={(event) => {
                        const serviceNameId = event.target.value;
                        const selected = serviceNames.find(
                            (item) => String(item.id) === serviceNameId,
                        );
                        form.setData({
                            ...form.data,
                            service_name_id: serviceNameId,
                            service_name: selected?.name ?? '',
                        });
                    }}
                    className="flex h-10 w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
                >
                    <option value="">Select service</option>
                    {serviceNames.map((serviceName) => (
                        <option key={serviceName.id} value={serviceName.id}>
                            {serviceName.name}
                        </option>
                    ))}
                </select>
                {form.errors.service_name_id && (
                    <p className="text-xs text-red-500">
                        {form.errors.service_name_id}
                    </p>
                )}
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label>Service Description</Label>

                <textarea
                    value={form.data.service_description}
                    onChange={(e) =>
                        form.setData('service_description', e.target.value)
                    }
                    placeholder="Describe this service..."
                    rows={4}
                    className="flex w-full resize-none rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500"
                />

                {form.errors.service_description && (
                    <p className="text-xs text-red-500">
                        {form.errors.service_description}
                    </p>
                )}
            </div>

            {/* Amount */}
            <div className="space-y-2">
                <Label>Amount</Label>

                <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.data.amount}
                    onChange={(e) => form.setData('amount', e.target.value)}
                    placeholder="0.00"
                    className="border-neutral-800 bg-neutral-950 text-white"
                />

                {form.errors.amount && (
                    <p className="text-xs text-red-500">{form.errors.amount}</p>
                )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 border-t border-neutral-800 pt-5">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="border-neutral-800 bg-transparent text-gray-300 hover:bg-neutral-800"
                >
                    Cancel
                </Button>

                <Button
                    type="submit"
                    disabled={form.processing}
                    className="bg-main text-white hover:bg-main"
                >
                    {form.processing
                        ? mode === 'create'
                            ? 'Saving...'
                            : 'Updating...'
                        : mode === 'create'
                          ? 'Save Service'
                          : 'Update Service'}
                </Button>
            </div>
        </form>
    );
}
