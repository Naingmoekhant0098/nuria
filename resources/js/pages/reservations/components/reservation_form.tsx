import type { useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

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

import { Textarea } from '@/components/ui/textarea';

export interface Patient {
    id: string;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
}

export interface Doctor {
    id: string;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
}

export interface Clinic {
    id: number;
    clinic_name: string;
}

export interface ClinicService {
    id: number;
    clinic_id: number;
    doctor_id?: string | null;
    service_name: string;
    service_description?: string | null;
    amount: number | string;
}

export interface DoctorClinicSchedule {
    id: number;
    clinic_id: number;
    doctor_id: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    max_patients_per_slot: number;
}

export interface Reservation {
    id: number;
    appointment_code: string;

    patient_id: string;
    doctor_id: string;
    clinic_id: number;
    service_id: number;
    schedule_id: number;
    appointment_at?: string | null;

    appointment_type: string;
    status: string;
    remarks?: string | null;
    amount: number | string;

    patient?: Patient | null;
    doctor?: Doctor | null;
    clinic?: Clinic | null;
    service?: ClinicService | null;
    schedule?: DoctorClinicSchedule | null;
}

export interface ReservationFormData {
    patient_id: string;
    doctor_id: string;
    service_id: string;
    schedule_id: string;
    appointment_at: string;

    appointment_type: string;
    status: string;
    remarks: string;
    amount: string;
    payment_method: string;
    transaction_code: string;
    payment_image: File | null;
}

interface ReservationFormProps {
    form: ReturnType<typeof useForm<ReservationFormData>>;

    mode: 'create' | 'edit';

    onCancel: () => void;

    onSubmit: (e: React.FormEvent) => void;

    patients: Patient[];
    doctors: Doctor[];
    services: ClinicService[];
    schedules: DoctorClinicSchedule[];
    paymentMethods?: { id: number; name: string }[];
}

export default function ReservationForm({
    form,
    mode,
    onCancel,
    onSubmit,
    patients,
    doctors,
    services,
    schedules,
    paymentMethods = [],
}: ReservationFormProps) {
    const [paymentImagePreview, setPaymentImagePreview] = useState<
        string | null
    >(null);

    useEffect(() => {
        if (!form.data.payment_image) {
            return;
        }

        const reader = new FileReader();
        reader.onload = () => setPaymentImagePreview(String(reader.result));
        reader.readAsDataURL(form.data.payment_image);
    }, [form.data.payment_image]);
    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    const getPatientName = (patient: Patient) => {
        return [patient.first_name, patient.middle_name, patient.last_name]
            .filter(Boolean)
            .join(' ');
    };

    const getDoctorName = (doctor: Doctor) => {
        return [doctor.first_name, doctor.middle_name, doctor.last_name]
            .filter(Boolean)
            .join(' ');
    };

    /*
    |--------------------------------------------------------------------------
    | Filter Services
    |--------------------------------------------------------------------------
    |
    | Clinic is already controlled by authenticated user.
    | Backend should only send services belonging to that clinic.
    |
    | Here we only filter by selected doctor.
    |
    */

    const filteredServices = services.filter((service) => {
        if (!form.data.doctor_id) {
            return true;
        }

        // Service without doctor = available for all doctors
        if (!service.doctor_id) {
            return true;
        }

        return String(service.doctor_id) === String(form.data.doctor_id);
    });

    const filteredSchedules = schedules.filter((schedule) => {
        if (!form.data.doctor_id) {
            return false;
        }

        return String(schedule.doctor_id) === String(form.data.doctor_id);
    });

    const selectedService = services.find(
        (service) => String(service.id) === String(form.data.service_id),
    );

    const handleDoctorChange = (value: string) => {
        form.setData('doctor_id', value);

        // Clear dependent fields
        form.setData('service_id', '');
        form.setData('schedule_id', '');
        form.setData('amount', '');
    };

    const handleServiceChange = (value: string) => {
        form.setData('service_id', value);

        const service = services.find(
            (item) => String(item.id) === String(value),
        );

        if (service) {
            form.setData('amount', String(service.amount));
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        onSubmit(e);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
            <div className="space-y-4">
                <div>
                    <h3 className="text-base font-semibold text-white">
                        Patient
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                        Select the patient for this appointment.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label>Patient</Label>

                    <Select
                        value={form.data.patient_id}
                        onValueChange={(value) =>
                            form.setData('patient_id', value)
                        }
                    >
                        <SelectTrigger className="w-full border-neutral-800 bg-neutral-950 text-white">
                            <SelectValue placeholder="Select patient" />
                        </SelectTrigger>

                        <SelectContent className="border-neutral-800 bg-neutral-900 text-white">
                            {patients.map((patient) => (
                                <SelectItem
                                    key={patient.id}
                                    value={String(patient.id)}
                                >
                                    {getPatientName(patient)} ({patient.id})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {form.errors.patient_id && (
                        <p className="text-xs text-red-500">
                            {form.errors.patient_id}
                        </p>
                    )}
                </div>
            </div>

            {/* =========================================================
                Doctor
            ========================================================= */}

            <div className="space-y-4">
                <div>
                    <h3 className="text-base font-semibold text-white">
                        Doctor
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                        Select the doctor for this appointment.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label>Doctor</Label>

                    <Select
                        value={form.data.doctor_id}
                        onValueChange={handleDoctorChange}
                    >
                        <SelectTrigger className="w-full border-neutral-800 bg-neutral-950 text-white">
                            <SelectValue placeholder="Select doctor" />
                        </SelectTrigger>

                        <SelectContent className="border-neutral-800 bg-neutral-900 text-white">
                            {doctors.map((doctor) => (
                                <SelectItem
                                    key={doctor.id}
                                    value={String(doctor.id)}
                                >
                                    {getDoctorName(doctor)} ({doctor.id})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {form.errors.doctor_id && (
                        <p className="text-xs text-red-500">
                            {form.errors.doctor_id}
                        </p>
                    )}
                </div>
            </div>

            {/* =========================================================
                Service & Schedule
            ========================================================= */}

            <div className="space-y-4">
                <div>
                    <h3 className="text-base font-semibold text-white">
                        Service & Schedule
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                        Available services and schedules are based on the
                        selected doctor.
                    </p>
                </div>

                {/* Service */}

                <div className="space-y-2">
                    <Label>Service</Label>

                    <Select
                        value={form.data.service_id}
                        onValueChange={handleServiceChange}
                        disabled={!form.data.doctor_id}
                    >
                        <SelectTrigger className="w-full border-neutral-800 bg-neutral-950 text-white">
                            <SelectValue placeholder="Select service" />
                        </SelectTrigger>

                        <SelectContent className="border-neutral-800 bg-neutral-900 text-white">
                            {filteredServices.length > 0 ? (
                                filteredServices.map((service) => (
                                    <SelectItem
                                        key={service.id}
                                        value={String(service.id)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span>{service.service_name}</span>

                                            <span className="text-gray-500">
                                                -
                                                {Number(
                                                    service.amount,
                                                ).toLocaleString()}{' '}
                                                MMK
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))
                            ) : (
                                <div className="px-2 py-6 text-center text-sm text-gray-500">
                                    No services available
                                </div>
                            )}
                        </SelectContent>
                    </Select>

                    {form.errors.service_id && (
                        <p className="text-xs text-red-500">
                            {form.errors.service_id}
                        </p>
                    )}

                    {selectedService && (
                        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                            <p className="text-xs text-gray-500">
                                Service Amount
                            </p>

                            <p className="mt-1 text-sm font-semibold text-white">
                                {Number(
                                    selectedService.amount,
                                ).toLocaleString()}{' '}
                                MMK
                            </p>
                        </div>
                    )}
                </div>

                {/* Schedule */}

                <div className="space-y-2">
                    <Label>Schedule</Label>

                    <Select
                        value={form.data.schedule_id}
                        onValueChange={(value) =>
                            form.setData('schedule_id', value)
                        }
                        disabled={!form.data.doctor_id}
                    >
                        <SelectTrigger className="w-full border-neutral-800 bg-neutral-950 text-white">
                            <SelectValue placeholder="Select schedule" />
                        </SelectTrigger>

                        <SelectContent className="border-neutral-800 bg-neutral-900 text-white">
                            {filteredSchedules.length > 0 ? (
                                filteredSchedules.map((schedule) => (
                                    <SelectItem
                                        key={schedule.id}
                                        value={String(schedule.id)}
                                    >
                                        {schedule.day_of_week}
                                        {' — '}
                                        {schedule.start_time?.substring(0, 5)}
                                        {' - '}
                                        {schedule.end_time?.substring(0, 5)}
                                        {' · '}
                                        {schedule.max_patients_per_slot} patients per time slot
                                    </SelectItem>
                                ))
                            ) : (
                                <div className="px-2 py-6 text-center text-sm text-gray-500">
                                    No schedules available
                                </div>
                            )}
                        </SelectContent>
                    </Select>

                    {form.errors.schedule_id && (
                        <p className="text-xs text-red-500">
                            {form.errors.schedule_id}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="reservation-appointment-at">
                        Appointment date and time
                    </Label>
                    <Input
                        id="reservation-appointment-at"
                        type="datetime-local"
                        value={form.data.appointment_at}
                        onChange={(event) =>
                            form.setData('appointment_at', event.target.value)
                        }
                        className="border-neutral-800 bg-neutral-950 text-white"
                    />
                    {form.errors.appointment_at && (
                        <p className="text-xs text-red-500">
                            {form.errors.appointment_at}
                        </p>
                    )}
                </div>
            </div>

            {/* =========================================================
                Appointment Type / Status
            ========================================================= */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Appointment Type */}

                <div className="space-y-2">
                    <Label>Appointment Type</Label>

                    <Select
                        value={form.data.appointment_type}
                        onValueChange={(value) =>
                            form.setData('appointment_type', value)
                        }
                    >
                        <SelectTrigger className="w-full border-neutral-800 bg-neutral-950 text-white">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>

                        <SelectContent className="border-neutral-800 bg-neutral-900 text-white">
                            <SelectItem value="In-Person">In-Person</SelectItem>

                            <SelectItem value="Online">Online</SelectItem>
                        </SelectContent>
                    </Select>

                    {form.errors.appointment_type && (
                        <p className="text-xs text-red-500">
                            {form.errors.appointment_type}
                        </p>
                    )}
                </div>

                {/* Status */}

                <div className="space-y-2">
                    <Label>Status</Label>

                    <Select
                        value={form.data.status}
                        onValueChange={(value) => form.setData('status', value)}
                    >
                        <SelectTrigger className="w-full border-neutral-800 bg-neutral-950 text-white">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>

                        <SelectContent className="border-neutral-800 bg-neutral-900 text-white">
                            <SelectItem value="Pending">Pending</SelectItem>

                            <SelectItem value="Confirmed">Confirmed</SelectItem>

                            <SelectItem value="Completed">Completed</SelectItem>

                            <SelectItem value="Cancelled">Cancelled</SelectItem>

                            <SelectItem value="No Show">No Show</SelectItem>
                        </SelectContent>
                    </Select>

                    {form.errors.status && (
                        <p className="text-xs text-red-500">
                            {form.errors.status}
                        </p>
                    )}
                </div>
            </div>

            {/* =========================================================
                Amount
            ========================================================= */}

            <div className="space-y-2">
                <Label>Amount</Label>

                <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.data.amount}
                    onChange={(e) => form.setData('amount', e.target.value)}
                    placeholder="15000"
                    className="border-neutral-800 bg-neutral-950 text-white"
                />

                {form.errors.amount && (
                    <p className="text-xs text-red-500">{form.errors.amount}</p>
                )}
            </div>

            {mode === 'create' && (
                <div className="space-y-2">
                    <Label htmlFor="reservation-payment-method">
                        Payment method
                    </Label>
                    <select
                        id="reservation-payment-method"
                        value={form.data.payment_method}
                        onChange={(event) => {
                            form.setData('payment_method', event.target.value);

                            if (
                                ['Cash', 'Cash on Delivery'].includes(
                                    event.target.value,
                                )
                            ) {
                                setPaymentImagePreview(null);
                                form.setData('transaction_code', '');
                                form.setData('payment_image', null);
                            }
                        }}
                        className="h-10 w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 text-sm text-white"
                        required
                    >
                        <option value="">Select payment method</option>
                        {paymentMethods.map((method) => (
                            <option key={method.id} value={method.name}>
                                {method.name}
                            </option>
                        ))}
                    </select>
                    {form.errors.payment_method && (
                        <p className="text-xs text-red-500">
                            {form.errors.payment_method}
                        </p>
                    )}
                    {!['Cash', 'Cash on Delivery'].includes(
                        form.data.payment_method,
                    ) && (
                        <>
                            <Label htmlFor="reservation-transaction-code">
                                Transaction number
                            </Label>
                            <Input
                                id="reservation-transaction-code"
                                value={form.data.transaction_code}
                                onChange={(event) =>
                                    form.setData(
                                        'transaction_code',
                                        event.target.value,
                                    )
                                }
                                placeholder="Mobile payment reference"
                                required
                                className="border-neutral-800 bg-neutral-950 text-white"
                            />
                            {form.errors.transaction_code && (
                                <p className="text-xs text-red-500">
                                    {form.errors.transaction_code}
                                </p>
                            )}
                            <Label htmlFor="reservation-payment-image">
                                Payment image
                            </Label>
                            <Input
                                id="reservation-payment-image"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                required={!form.data.payment_image}
                                onChange={(event) => {
                                    const image =
                                        event.target.files?.[0] ?? null;
                                    form.setData('payment_image', image);

                                    if (!image) {
                                        setPaymentImagePreview(null);
                                    }
                                }}
                                className="border-neutral-800 bg-neutral-950 text-white"
                            />
                            {paymentImagePreview && (
                                <img
                                    src={paymentImagePreview}
                                    alt="Payment proof preview"
                                    className="max-h-48 rounded-md border border-neutral-700 object-contain"
                                />
                            )}
                            {form.errors.payment_image && (
                                <p className="text-xs text-red-500">
                                    {form.errors.payment_image}
                                </p>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* =========================================================
                Remarks
            ========================================================= */}

            <div className="space-y-2">
                <Label>Remarks</Label>

                <Textarea
                    value={form.data.remarks}
                    onChange={(e) => form.setData('remarks', e.target.value)}
                    placeholder="Enter appointment remarks..."
                    rows={4}
                    className="resize-none border-neutral-800 bg-neutral-950 text-white"
                />

                {form.errors.remarks && (
                    <p className="text-xs text-red-500">
                        {form.errors.remarks}
                    </p>
                )}
            </div>

            {/* =========================================================
                Buttons
            ========================================================= */}

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
                          ? 'Save Reservation'
                          : 'Update Reservation'}
                </Button>
            </div>
        </form>
    );
}
