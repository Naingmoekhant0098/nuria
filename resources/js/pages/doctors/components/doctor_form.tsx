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

/* =========================================================
   Specialization
========================================================= */

export interface Specialization {
    id: number | string;
    name: string;
    description?: string | null;
}

/* =========================================================
   NRC State
========================================================= */

export interface NrcState {
    id: number;
    name: string;
}

/* =========================================================
   NRC Township
========================================================= */

export interface NrcTownship {
    state_id(state_id: any): unknown;
    id: number;
    nrc_state_id: number;
    name: string;
}

/* =========================================================
   NRC Type
========================================================= */

export interface NrcType {
    id: number;
    name: string;
}

/* =========================================================
   Doctor NRC
========================================================= */

export interface DoctorNrc {
    id: number;

    nrc_state_id: number;
    nrc_township_id: number;
    nrc_type_id: number;

    state?: NrcState | null;
    township?: NrcTownship | null;
    type?: NrcType | null;
}

/* =========================================================
   Doctor
========================================================= */

export interface Doctor {
    id: string;

    first_name: string;
    middle_name?: string | null;
    last_name: string;

    specialization_id?: number | string | null;
    specialization?: Specialization | null;

    complete_address?: string | null;
    contact_number?: string | null;

    /* Doctor identity */
    proof_of_identity?: string | null;

    /* NRC */
    nrc_id?: number | null;
    nrc_number?: string | null;
    nrc?: DoctorNrc | null;

    /* Doctor account */
    user_name?: string | null;
    email?: string | null;

    status: string;
    clinics?: {
        pivot: {
            compensation_type: string | null;
            compensation_rate: number | string | null;
        };
    }[];
}

/* =========================================================
   Form Data
========================================================= */

export interface DoctorFormData {
    first_name: string;
    middle_name: string;
    last_name: string;

    specialization_id: string;

    complete_address: string;
    contact_number: string;

    /* Proof of identity */
    proof_of_identity: string;

    /* NRC */
    nrc_state_id: string;
    nrc_township_id: string;
    nrc_type_id: string;
    nrc_number: string;

    /* Account */
    user_name: string;
    email: string;
    password: string;

    status: string;
    compensation_type: string;
    compensation_rate: string;
}

/* =========================================================
   Props
========================================================= */

interface DoctorFormProps {
    form: ReturnType<typeof useForm<DoctorFormData>>;

    specializations: Specialization[];

    nrcStates: NrcState[];
    nrcTownships: NrcTownship[];
    nrcTypes: NrcType[];

    mode: 'create' | 'edit';

    onCancel: () => void;

    onSubmit: (e: React.FormEvent) => void;
}

/* =========================================================
   Component
========================================================= */

export default function DoctorForm({
    form,
    specializations = [],
    nrcStates = [],
    nrcTownships = [],
    nrcTypes = [],
    mode,
    onCancel,
    onSubmit,
}: DoctorFormProps) {

    /* =====================================================
       Filter Townships By State
    ====================================================== */

    const filteredTownships = nrcTownships.filter(
        (township) =>
            String(township.state_id) ===
            String(form.data.nrc_state_id)
    );

    /* =====================================================
       Helpers
    ====================================================== */

    const getError = (field: keyof DoctorFormData) => {
        return form.errors[field];
    };

    return (
        <form
            onSubmit={onSubmit}
            className="space-y-6 pt-2"
        >

            {/* =================================================
                Personal Information
            ================================================== */}

            <div className="space-y-4">

                <div>
                    <h3 className="text-sm font-semibold text-white">
                        Personal Information
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                        Enter the doctor's basic information.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                    {/* First Name */}

                    <div className="space-y-2">

                        <Label>
                            First Name
                        </Label>

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

                        {getError('first_name') && (
                            <p className="text-xs text-red-500">
                                {getError('first_name')}
                            </p>
                        )}

                    </div>

                    {/* Middle Name */}

                    <div className="space-y-2">

                        <Label>
                            Middle Name
                        </Label>

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

                        {getError('middle_name') && (
                            <p className="text-xs text-red-500">
                                {getError('middle_name')}
                            </p>
                        )}

                    </div>

                    {/* Last Name */}

                    <div className="space-y-2">

                        <Label>
                            Last Name
                        </Label>

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

                        {getError('last_name') && (
                            <p className="text-xs text-red-500">
                                {getError('last_name')}
                            </p>
                        )}

                    </div>

                </div>

            </div>

            {/* =================================================
                Professional Information
            ================================================== */}

            <div className="space-y-4">

                <div>
                    <h3 className="text-sm font-semibold text-white">
                        Professional Information
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                        Enter the doctor's professional details.
                    </p>
                </div>

                {/* Specialization */}

                <div className="space-y-2">

                    <Label>
                        Specialization
                    </Label>

                    <Select
                        value={form.data.specialization_id}
                        onValueChange={(value) =>
                            form.setData(
                                'specialization_id',
                                value
                            )
                        }
                    >

                        <SelectTrigger className="w-full border-neutral-800 bg-neutral-950 text-white">
                            <SelectValue placeholder="Select specialization" />
                        </SelectTrigger>

                        <SelectContent className="border-neutral-800 bg-neutral-900 text-white">

                            {specializations.map(
                                (specialization) => (

                                    <SelectItem
                                        key={specialization.id}
                                        value={String(
                                            specialization.id
                                        )}
                                    >
                                        {specialization.name}
                                    </SelectItem>

                                )
                            )}

                        </SelectContent>

                    </Select>

                    {getError('specialization_id') && (
                        <p className="text-xs text-red-500">
                            {getError('specialization_id')}
                        </p>
                    )}

                </div>

                {/* Contact */}

                <div className="space-y-2">

                    <Label>
                        Contact Number
                    </Label>

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

                    {getError('contact_number') && (
                        <p className="text-xs text-red-500">
                            {getError('contact_number')}
                        </p>
                    )}

                </div>

                {/* Proof of Identity */}

                <div className="space-y-2">

                    <Label>
                        Proof of Identity
                    </Label>

                    <Input
                        value={form.data.proof_of_identity}
                        onChange={(e) =>
                            form.setData(
                                'proof_of_identity',
                                e.target.value
                            )
                        }
                        placeholder="Enter proof of identity"
                        className="border-neutral-800 bg-neutral-950 text-white"
                    />

                    {getError('proof_of_identity') && (
                        <p className="text-xs text-red-500">
                            {getError('proof_of_identity')}
                        </p>
                    )}

                </div>

                {/* Address */}

                <div className="space-y-2">

                    <Label>
                        Complete Address
                    </Label>

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

                    {getError('complete_address') && (
                        <p className="text-xs text-red-500">
                            {getError('complete_address')}
                        </p>
                    )}

                </div>

            </div>

            {/* =================================================
                NRC Information
            ================================================== */}

            <div className="space-y-4">

                <div>
                    <h3 className="text-sm font-semibold text-white">
                        NRC Information
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                        Example: 12/MBAND(N)99893
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                    {/* NRC State */}

                    <div className="space-y-2">

                        <Label>
                            NRC State
                        </Label>

                        <Select
                            value={form.data.nrc_state_id}
                            onValueChange={(value) => {

                                form.setData(
                                    'nrc_state_id',
                                    value
                                );

                                form.setData(
                                    'nrc_township_id',
                                    ''
                                );

                            }}
                        >

                            <SelectTrigger className="w-full border-neutral-800 bg-neutral-950 text-white">
                                <SelectValue placeholder="Select state" />
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

                        {getError('nrc_state_id') && (
                            <p className="text-xs text-red-500">
                                {getError('nrc_state_id')}
                            </p>
                        )}

                    </div>

                    {/* NRC Township */}

                    <div className="space-y-2">

                        <Label>
                            NRC Township
                        </Label>

                        <Select
                            value={form.data.nrc_township_id}
                            onValueChange={(value) =>
                                form.setData(
                                    'nrc_township_id',
                                    value
                                )
                            }
                            disabled={
                                !form.data.nrc_state_id
                            }
                        >

                            <SelectTrigger className="w-full border-neutral-800 bg-neutral-950 text-white">
                                <SelectValue placeholder="Select township" />
                            </SelectTrigger>

                            <SelectContent className="border-neutral-800 bg-neutral-900 text-white">

                                {filteredTownships.map(
                                    (township) => (

                                        <SelectItem
                                            key={township.id}
                                            value={String(
                                                township.id
                                            )}
                                        >
                                            {township.name}
                                        </SelectItem>

                                    )
                                )}

                            </SelectContent>

                        </Select>

                        {getError('nrc_township_id') && (
                            <p className="text-xs text-red-500">
                                {getError('nrc_township_id')}
                            </p>
                        )}

                    </div>

                    {/* NRC Type */}

                    <div className="space-y-2">

                        <Label>
                            NRC Type
                        </Label>

                        <Select
                            value={form.data.nrc_type_id}
                            onValueChange={(value) =>
                                form.setData(
                                    'nrc_type_id',
                                    value
                                )
                            }
                        >

                            <SelectTrigger className="w-full border-neutral-800 bg-neutral-950 text-white">
                                <SelectValue placeholder="Select type" />
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

                        {getError('nrc_type_id') && (
                            <p className="text-xs text-red-500">
                                {getError('nrc_type_id')}
                            </p>
                        )}

                    </div>

                </div>

                {/* NRC Number */}

                <div className="space-y-2">

                    <Label>
                        NRC Number
                    </Label>

                    <Input
                        value={form.data.nrc_number}
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

                    {getError('nrc_number') && (
                        <p className="text-xs text-red-500">
                            {getError('nrc_number')}
                        </p>
                    )}

                </div>

                {/* NRC Preview */}

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
                                        String(state.id) ===
                                        String(
                                            form.data.nrc_state_id
                                        )
                                )?.name ?? ''
                            }

                            {form.data.nrc_state_id && '/ '}

                            {
                                nrcTownships.find(
                                    (township) =>
                                        String(township.id) ===
                                        String(
                                            form.data.nrc_township_id
                                        )
                                )?.name ?? ''
                            }

                            {form.data.nrc_type_id && '('}

                            {
                                nrcTypes.find(
                                    (type) =>
                                        String(type.id) ===
                                        String(
                                            form.data.nrc_type_id
                                        )
                                )?.name ?? ''
                            }

                            {form.data.nrc_type_id && ')'}

                            {form.data.nrc_number}

                        </p>

                    </div>

                )}

            </div>

            {/* =================================================
                Account Information
            ================================================== */}

            <div className="space-y-4">

                <div>
                    <h3 className="text-sm font-semibold text-white">
                        Account Information
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                        Doctor login account information.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    {/* Email */}

                    <div className="space-y-2">

                        <Label>
                            Email
                        </Label>

                        <Input
                            type="email"
                            value={form.data.email}
                            onChange={(e) =>
                                form.setData(
                                    'email',
                                    e.target.value
                                )
                            }
                            placeholder="doctor@example.com"
                            autoComplete="email"
                            className="border-neutral-800 bg-neutral-950 text-white"
                        />

                        {getError('email') && (
                            <p className="text-xs text-red-500">
                                {getError('email')}
                            </p>
                        )}

                    </div>

                    {/* Username */}

                    <div className="space-y-2">

                        <Label>
                            Username
                        </Label>

                        <Input
                            value={form.data.user_name}
                            onChange={(e) =>
                                form.setData(
                                    'user_name',
                                    e.target.value
                                )
                            }
                            placeholder="Doctor username"
                            autoComplete="username"
                            className="border-neutral-800 bg-neutral-950 text-white"
                        />

                        {getError('user_name') && (
                            <p className="text-xs text-red-500">
                                {getError('user_name')}
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

                    {getError('password') && (
                        <p className="text-xs text-red-500">
                            {getError('password')}
                        </p>
                    )}

                </div>

            </div>

            {/* =================================================
                Clinic Compensation
            ================================================== */}

            <div className="space-y-4">
                <div>
                    <h3 className="text-sm font-semibold text-white">
                        Clinic Compensation
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                        Compensation applies to this clinic only.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Compensation type</Label>
                        <Select
                            value={form.data.compensation_type}
                            onValueChange={(value) =>
                                form.setData('compensation_type', value)
                            }
                        >
                            <SelectTrigger className="w-full border-neutral-800 bg-neutral-950 text-white">
                                <SelectValue placeholder="Select compensation type" />
                            </SelectTrigger>
                            <SelectContent className="border-neutral-800 bg-neutral-900 text-white">
                                <SelectItem value="monthly_salary">Monthly salary</SelectItem>
                                <SelectItem value="hourly_rate">Hourly rate</SelectItem>
                                <SelectItem value="per_appointment">Per appointment</SelectItem>
                                <SelectItem value="commission_percentage">Commission percentage</SelectItem>
                            </SelectContent>
                        </Select>
                        {getError('compensation_type') && (
                            <p className="text-xs text-red-500">
                                {getError('compensation_type')}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>
                            {form.data.compensation_type === 'commission_percentage'
                                ? 'Commission rate (%)'
                                : form.data.compensation_type === 'hourly_rate'
                                  ? 'Rate per hour (MMK)'
                                  : form.data.compensation_type === 'per_appointment'
                                    ? 'Rate per appointment (MMK)'
                                    : 'Monthly salary (MMK)'}
                        </Label>
                        <Input
                            type="number"
                            min="0"
                            max={form.data.compensation_type === 'commission_percentage' ? 100 : undefined}
                            step={form.data.compensation_type === 'commission_percentage' ? '0.01' : '1'}
                            value={form.data.compensation_rate}
                            onChange={(event) =>
                                form.setData('compensation_rate', event.target.value)
                            }
                            className="border-neutral-800 bg-neutral-950 text-white"
                        />
                        {getError('compensation_rate') && (
                            <p className="text-xs text-red-500">
                                {getError('compensation_rate')}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* =================================================
                Status
            ================================================== */}

            <div className="space-y-2">

                <Label>
                    Status
                </Label>

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

                {getError('status') && (
                    <p className="text-xs text-red-500">
                        {getError('status')}
                    </p>
                )}

            </div>

            {/* =================================================
                Actions
            ================================================== */}

            <div className="flex justify-end gap-2 border-t border-neutral-800 pt-4">

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
                            ? 'Save Doctor'
                            : 'Update Doctor'}
                </Button>

            </div>

        </form>
    );
}
