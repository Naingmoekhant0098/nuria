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

export interface PatientUser {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string | null;
}

export interface NrcState {
    id: number;
    name: string;
}

export interface NrcTownship {
    state_id(state_id: any): unknown;
    id: number;
    nrc_state_id: number;
    name: string;
}

export interface NrcType {
    id: number;
    name: string;
}

export interface PatientNrc {
    id: number;

    nrc_state_id: number;
    nrc_township_id: number;
    nrc_type_id: number;

    state?: NrcState | null;
    township?: NrcTownship | null;
    type?: NrcType | null;
}

export interface Patient {
    id: string;

    first_name: string;
    middle_name?: string | null;
    last_name: string;

    birthdate?: string | null;

    complete_address: string;
    contact_number: string;
    proof_of_identity: string;

    nrc_id?: number | null;
    nrc_number?: string | null;

    nrc?: PatientNrc | null;

    user_name: string;

    user?: PatientUser | null;

    status: string;
}

export interface PatientFormData {
    first_name: string;
    middle_name: string;
    last_name: string;

    birthdate: string;

    complete_address: string;
    contact_number: string;

    nrc_state_id: string;
    nrc_township_id: string;
    nrc_type_id: string;
    nrc_number: string;

    user_name: string;
    email: string;
    password: string;

    status: string;
}

interface PatientFormProps {
    form: ReturnType<
        typeof useForm<PatientFormData>
    >;

    mode: 'create' | 'edit';

    onCancel: () => void;

    onSubmit: (
        e: React.FormEvent
    ) => void;

    nrcStates: NrcState[];
    nrcTownships: NrcTownship[];
    nrcTypes: NrcType[];
}

export default function PatientForm({
    form,
    mode,
    onCancel,
    onSubmit,
    nrcStates,
    nrcTownships,
    nrcTypes,
}: PatientFormProps) {

    const filteredTownships =
        nrcTownships.filter(
            (township) =>
                String(township.state_id) ===
                String(form.data.nrc_state_id)
        );

    return (
        <form
            onSubmit={onSubmit}
            className="space-y-5 pt-2"
        >

            {/* Name */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                <div className="space-y-2">
                    <Label>First Name</Label>

                    <Input
                        value={form.data.first_name}
                        onChange={(e) =>
                            form.setData(
                                'first_name',
                                e.target.value
                            )
                        }
                        placeholder="First name"
                        className="border-neutral-800 bg-neutral-950 text-white"
                    />

                    {form.errors.first_name && (
                        <p className="text-xs text-red-500">
                            {form.errors.first_name}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>Middle Name</Label>

                    <Input
                        value={form.data.middle_name}
                        onChange={(e) =>
                            form.setData(
                                'middle_name',
                                e.target.value
                            )
                        }
                        placeholder="Middle name"
                        className="border-neutral-800 bg-neutral-950 text-white"
                    />

                    {form.errors.middle_name && (
                        <p className="text-xs text-red-500">
                            {form.errors.middle_name}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>Last Name</Label>

                    <Input
                        value={form.data.last_name}
                        onChange={(e) =>
                            form.setData(
                                'last_name',
                                e.target.value
                            )
                        }
                        placeholder="Last name"
                        className="border-neutral-800 bg-neutral-950 text-white"
                    />

                    {form.errors.last_name && (
                        <p className="text-xs text-red-500">
                            {form.errors.last_name}
                        </p>
                    )}
                </div>
            </div>

            {/* Birthdate */}
            <div className="space-y-2">
                <Label>Birthdate</Label>

                <Input
                    type="date"
                    value={form.data.birthdate}
                    onChange={(e) =>
                        form.setData(
                            'birthdate',
                            e.target.value
                        )
                    }
                    className="border-neutral-800 bg-neutral-950 text-white"
                />

                {form.errors.birthdate && (
                    <p className="text-xs text-red-500">
                        {form.errors.birthdate}
                    </p>
                )}
            </div>

            {/* Contact */}
            <div className="space-y-2">
                <Label>Contact Number</Label>

                <Input
                    type="tel"
                    value={form.data.contact_number}
                    onChange={(e) =>
                        form.setData(
                            'contact_number',
                            e.target.value
                        )
                    }
                    placeholder="09xxxxxxxxx"
                    className="border-neutral-800 bg-neutral-950 text-white"
                />

                {form.errors.contact_number && (
                    <p className="text-xs text-red-500">
                        {form.errors.contact_number}
                    </p>
                )}
            </div>

            {/* Address */}
            <div className="space-y-2">
                <Label>Complete Address</Label>

                <textarea
                    value={form.data.complete_address}
                    onChange={(e) =>
                        form.setData(
                            'complete_address',
                            e.target.value
                        )
                    }
                    placeholder="Enter complete address"
                    rows={3}
                    className="flex w-full resize-none rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500"
                />

                {form.errors.complete_address && (
                    <p className="text-xs text-red-500">
                        {form.errors.complete_address}
                    </p>
                )}
            </div>

            {/* NRC */}
            <div className="space-y-4">

                <div>
                    <Label className="text-base">
                        NRC Information
                    </Label>

                    <p className="mt-1 text-xs text-gray-500">
                        Example: 12/MBAND(N)99893
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                    {/* State */}
                    <div className="space-y-2">
                        <Label>NRC State</Label>

                        <Select
                            value={
                                form.data.nrc_state_id
                            }
                            onValueChange={(value) => {
                                form.setData(
                                    'nrc_state_id',
                                    value
                                );

                                // Reset township when state changes
                                form.setData(
                                    'nrc_township_id',
                                    ''
                                );
                            }}
                        >
                            <SelectTrigger className="border-neutral-800 bg-neutral-950 text-white">
                                <SelectValue placeholder="State" />
                            </SelectTrigger>

                            <SelectContent className="border-neutral-800 bg-neutral-900 text-white">
                                {nrcStates.map(
                                    (state) => (
                                        <SelectItem
                                            key={state.id}
                                            value={String(
                                                state.id
                                            )}
                                        >
                                            {state.name}
                                        </SelectItem>
                                    )
                                )}
                            </SelectContent>
                        </Select>

                        {form.errors.nrc_state_id && (
                            <p className="text-xs text-red-500">
                                {
                                    form.errors
                                        .nrc_state_id
                                }
                            </p>
                        )}
                    </div>

                    {/* Township */}
                    <div className="space-y-2">
                        <Label>NRC Township</Label>

                        <Select
                            value={
                                form.data
                                    .nrc_township_id
                            }
                            onValueChange={(value) =>
                                form.setData(
                                    'nrc_township_id',
                                    value
                                )
                            }
                            disabled={
                                !form.data
                                    .nrc_state_id
                            }
                        >
                            <SelectTrigger className="border-neutral-800 bg-neutral-950 text-white">
                                <SelectValue placeholder="Township" />
                            </SelectTrigger>

                            <SelectContent className="border-neutral-800 bg-neutral-900 text-white">
                                {filteredTownships.map(
                                    (township) => (
                                        <SelectItem
                                            key={
                                                township.id
                                            }
                                            value={String(
                                                township.id
                                            )}
                                        >
                                            {
                                                township.name
                                            }
                                        </SelectItem>
                                    )
                                )}
                            </SelectContent>
                        </Select>

                        {form.errors
                            .nrc_township_id && (
                            <p className="text-xs text-red-500">
                                {
                                    form.errors
                                        .nrc_township_id
                                }
                            </p>
                        )}
                    </div>

                    {/* Type */}
                    <div className="space-y-2">
                        <Label>NRC Type</Label>

                        <Select
                            value={
                                form.data.nrc_type_id
                            }
                            onValueChange={(value) =>
                                form.setData(
                                    'nrc_type_id',
                                    value
                                )
                            }
                        >
                            <SelectTrigger className="border-neutral-800 bg-neutral-950 text-white">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>

                            <SelectContent className="border-neutral-800 bg-neutral-900 text-white">
                                {nrcTypes.map(
                                    (type) => (
                                        <SelectItem
                                            key={type.id}
                                            value={String(
                                                type.id
                                            )}
                                        >
                                            {type.name}
                                        </SelectItem>
                                    )
                                )}
                            </SelectContent>
                        </Select>

                        {form.errors.nrc_type_id && (
                            <p className="text-xs text-red-500">
                                {
                                    form.errors
                                        .nrc_type_id
                                }
                            </p>
                        )}
                    </div>
                </div>

                {/* NRC Number */}
                <div className="space-y-2">
                    <Label>NRC Number</Label>

                    <Input
                        value={
                            form.data.nrc_number
                        }
                        onChange={(e) =>
                            form.setData(
                                'nrc_number',
                                e.target.value
                            )
                        }
                        placeholder="99893"
                        maxLength={50}
                        className="border-neutral-800 bg-neutral-950 text-white"
                    />

                    {form.errors.nrc_number && (
                        <p className="text-xs text-red-500">
                            {
                                form.errors
                                    .nrc_number
                            }
                        </p>
                    )}
                </div>

                {/* Preview */}
                {(form.data.nrc_state_id ||
                    form.data.nrc_township_id ||
                    form.data.nrc_type_id ||
                    form.data.nrc_number) && (
                    <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                        <p className="text-xs text-gray-500">
                            NRC Preview
                        </p>

                        <p className="mt-1 font-medium text-white">
                            {
                                nrcStates.find(
                                    (state) =>
                                        String(
                                            state.id
                                        ) ===
                                        String(
                                            form.data
                                                .nrc_state_id
                                        )
                                )?.name ?? ''
                            }
                            /
                            {
                                nrcTownships.find(
                                    (township) =>
                                        String(
                                            township.id
                                        ) ===
                                        String(
                                            form.data
                                                .nrc_township_id
                                        )
                                )?.name ?? ''
                            }
                            (
                            {
                                nrcTypes.find(
                                    (type) =>
                                        String(
                                            type.id
                                        ) ===
                                        String(
                                            form.data
                                                .nrc_type_id
                                        )
                                )?.name ?? ''
                            }
                            )
                            {form.data.nrc_number}
                        </p>
                    </div>
                )}
            </div>

            {/* Account */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* Email */}
                <div className="space-y-2">
                    <Label>Email</Label>

                    <Input
                        type="email"
                        value={form.data.email}
                        onChange={(e) =>
                            form.setData(
                                'email',
                                e.target.value
                            )
                        }
                        placeholder="patient@example.com"
                        autoComplete="email"
                        className="border-neutral-800 bg-neutral-950 text-white"
                    />

                    {form.errors.email && (
                        <p className="text-xs text-red-500">
                            {form.errors.email}
                        </p>
                    )}
                </div>

                {/* Username */}
                <div className="space-y-2">
                    <Label>Username</Label>

                    <Input
                        value={form.data.user_name}
                        onChange={(e) =>
                            form.setData(
                                'user_name',
                                e.target.value
                            )
                        }
                        placeholder="Patient username"
                        autoComplete="username"
                        className="border-neutral-800 bg-neutral-950 text-white"
                    />

                    {form.errors.user_name && (
                        <p className="text-xs text-red-500">
                            {form.errors.user_name}
                        </p>
                    )}
                </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
                <Label>
                    Password

                    {mode === 'edit' && (
                        <span className="ml-1 text-xs text-gray-500">
                            (leave blank to keep current)
                        </span>
                    )}
                </Label>

                <Input
                    type="password"
                    value={form.data.password}
                    onChange={(e) =>
                        form.setData(
                            'password',
                            e.target.value
                        )
                    }
                    placeholder={
                        mode === 'edit'
                            ? 'Leave blank to keep current'
                            : 'Enter password'
                    }
                    autoComplete="new-password"
                    className="border-neutral-800 bg-neutral-950 text-white"
                />

                {form.errors.password && (
                    <p className="text-xs text-red-500">
                        {form.errors.password}
                    </p>
                )}
            </div>

            {/* Status */}
            <div className="space-y-2">
                <Label>Status</Label>

                <Select
                    value={form.data.status}
                    onValueChange={(value) =>
                        form.setData(
                            'status',
                            value
                        )
                    }
                >
                    <SelectTrigger className="w-full border-neutral-800 bg-neutral-950 text-white">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>

                    <SelectContent className="border-neutral-800 bg-neutral-900 text-white">
                        <SelectItem value="active">
                            Active
                        </SelectItem>

                        <SelectItem value="inactive">
                            Inactive
                        </SelectItem>
                    </SelectContent>
                </Select>

                {form.errors.status && (
                    <p className="text-xs text-red-500">
                        {form.errors.status}
                    </p>
                )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">

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
                            ? 'Save Patient'
                            : 'Update Patient'}
                </Button>
            </div>
        </form>
    );
}