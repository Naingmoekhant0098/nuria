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
    id: number;

    clinic_name: string;
    clinic_permit: string;
    complete_address: string;
    photo_url?: string | null;

    latitude?: number | null;
    longitude?: number | null;

    open_time?: string | null;
    close_time?: string | null;

    status: string;
}

export interface ClinicFormData {
    clinic_name: string;
    clinic_permit: string;
    complete_address: string;
    photo: File | null;
    latitude: string;
    longitude: string;
    open_time: string;
    close_time: string;
    status: string;
}

interface ClinicFormProps {
    form: ReturnType<typeof useForm<ClinicFormData>>;

    mode: 'create' | 'edit';

    onCancel: () => void;

    onSubmit: (e: React.FormEvent) => void;

    currentPhotoUrl?: string | null;
}

export default function ClinicForm({
    form,
    mode,
    onCancel,
    onSubmit,
    currentPhotoUrl,
}: ClinicFormProps) {
    return (
        <form onSubmit={onSubmit} className="space-y-5 pt-2">
            <div className="space-y-2">
                <Label htmlFor="clinic-photo">Clinic image</Label>
                {currentPhotoUrl && !form.data.photo && (
                    <img
                        src={currentPhotoUrl}
                        alt="Current clinic"
                        className="h-32 w-full rounded-lg object-cover"
                    />
                )}
                <Input
                    id="clinic-photo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) =>
                        form.setData('photo', event.target.files?.[0] ?? null)
                    }
                />
                {form.errors.photo && (
                    <p className="text-xs text-red-500">{form.errors.photo}</p>
                )}
            </div>
            {/* =========================
                Clinic Name
            ========================== */}
            <div className="space-y-2">
                <Label>Clinic Name</Label>

                <Input
                    value={form.data.clinic_name}
                    onChange={(e) =>
                        form.setData('clinic_name', e.target.value)
                    }
                    placeholder="Enter clinic name"
                    className="mt-1! border-neutral-800 bg-neutral-950 text-white"
                />

                {form.errors.clinic_name && (
                    <p className="text-xs text-red-500">
                        {form.errors.clinic_name}
                    </p>
                )}
            </div>

            {/* =========================
                Clinic Permit
            ========================== */}
            <div className="space-y-2">
                <Label>Clinic Permit</Label>

                <Input
                    value={form.data.clinic_permit}
                    onChange={(e) =>
                        form.setData('clinic_permit', e.target.value)
                    }
                    placeholder="Enter clinic permit"
                    className="mt-1! border-neutral-800 bg-neutral-950 text-white"
                />

                {form.errors.clinic_permit && (
                    <p className="text-xs text-red-500">
                        {form.errors.clinic_permit}
                    </p>
                )}
            </div>

            {/* =========================
                Complete Address
            ========================== */}
            <div className="space-y-2">
                <Label>Complete Address</Label>

                <textarea
                    value={form.data.complete_address}
                    onChange={(e) =>
                        form.setData('complete_address', e.target.value)
                    }
                    placeholder="Enter complete address"
                    rows={3}
                    className="mt-1! flex w-full resize-none rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500"
                />

                {form.errors.complete_address && (
                    <p className="text-xs text-red-500">
                        {form.errors.complete_address}
                    </p>
                )}
            </div>

            {/* =========================
                Coordinates
            ========================== */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Latitude */}
                <div className="space-y-2">
                    <Label>Latitude</Label>

                    <Input
                        type="number"
                        step="any"
                        value={form.data.latitude}
                        onChange={(e) =>
                            form.setData('latitude', e.target.value)
                        }
                        placeholder="16.8409"
                        className="mt-1! border-neutral-800 bg-neutral-950 text-white"
                    />

                    {form.errors.latitude && (
                        <p className="text-xs text-red-500">
                            {form.errors.latitude}
                        </p>
                    )}
                </div>

                {/* Longitude */}
                <div className="space-y-2">
                    <Label>Longitude</Label>

                    <Input
                        type="number"
                        step="any"
                        value={form.data.longitude}
                        onChange={(e) =>
                            form.setData('longitude', e.target.value)
                        }
                        placeholder="96.1735"
                        className="mt-1! border-neutral-800 bg-neutral-950 text-white"
                    />

                    {form.errors.longitude && (
                        <p className="text-xs text-red-500">
                            {form.errors.longitude}
                        </p>
                    )}
                </div>
            </div>

            {/* =========================
                Operating Hours
            ========================== */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Open Time */}
                <div className="space-y-2">
                    <Label>Opening Time</Label>

                    <Input
                        type="time"
                        value={form.data.open_time}
                        onChange={(e) =>
                            form.setData('open_time', e.target.value)
                        }
                        className="mt-1! border-neutral-800 bg-neutral-950 text-white"
                    />

                    {form.errors.open_time && (
                        <p className="text-xs text-red-500">
                            {form.errors.open_time}
                        </p>
                    )}
                </div>

                {/* Close Time */}
                <div className="space-y-2">
                    <Label>Closing Time</Label>

                    <Input
                        type="time"
                        value={form.data.close_time}
                        onChange={(e) =>
                            form.setData('close_time', e.target.value)
                        }
                        className="mt-1! border-neutral-800 bg-neutral-950 text-white"
                    />

                    {form.errors.close_time && (
                        <p className="text-xs text-red-500">
                            {form.errors.close_time}
                        </p>
                    )}
                </div>
            </div>

            {/* =========================
                Status
            ========================== */}
            <div className="space-y-2">
                <Label>Status</Label>

                <Select
                    value={form.data.status}
                    onValueChange={(value) => form.setData('status', value)}
                >
                    <SelectTrigger className="mt-1! w-full border-neutral-800 bg-neutral-950 text-white">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>

                    <SelectContent className="border-neutral-800 bg-neutral-900 text-white">
                        <SelectItem value="active">Active</SelectItem>

                        <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>

                {form.errors.status && (
                    <p className="text-xs text-red-500">{form.errors.status}</p>
                )}
            </div>

            {/* =========================
                Actions
            ========================== */}
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
                          ? 'Save Clinic'
                          : 'Update Clinic'}
                </Button>
            </div>
        </form>
    );
}
