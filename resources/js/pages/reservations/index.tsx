 
import { Link, router, usePage } from '@inertiajs/react';
import {
    Eye,
    Pencil,
    Trash2,
    Stethoscope,
    LogIn,
    LogOut,
    Check,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';


import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';



import CreateConsultationDrawer from '@/pages/consultations/components/create_consultation_drawer';
import CreateReservationDrawer from './components/create_reservation_drawer';
import EditReservationDialog from './components/edit_reservation_dialog';

import type {
    Reservation,
} from './components/reservation_form';


interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedReservations {
    data: Reservation[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
}

interface PageProps {
    reservations: PaginatedReservations;

    filters: {
        search?: string;
        status?: string;
    };

    flash?: {
        success?: string;
        error?: string;
        message?: string;
    };
    clinicDrugs: { drug_id: number; drug: { name: string; strength?: string; units: { id: number; unit_name: string; sale_price: string }[] } }[];
    clinicMedicalProducts: { medical_product_id: number; sale_price: string; product: { name: string } }[];
    paymentMethods: { id: number; name: string }[];

    [key: string]: unknown;
}

export default function Index() {
    const {
        reservations,
        filters,
        flash,
        clinicDrugs,
        clinicMedicalProducts,
        paymentMethods,
    } = usePage<PageProps>().props;

    /*
    |--------------------------------------------------------------------------
    | State
    |--------------------------------------------------------------------------
    */

    const [search, setSearch] = useState(
        filters?.search ?? ''
    );

    const [isEditOpen, setIsEditOpen] =
        useState(false);

    const [
        selectedReservation,
        setSelectedReservation,
    ] = useState<Reservation | null>(null);

    /*
    |--------------------------------------------------------------------------
    | Consultation Drawer State
    |--------------------------------------------------------------------------
    */

    const [
        isConsultationOpen,
        setIsConsultationOpen,
    ] = useState(false);

    const [
        selectedConsultationReservation,
        setSelectedConsultationReservation,
    ] = useState<Reservation | null>(null);

    const [
        isInitialMount,
        setIsInitialMount,
    ] = useState(true);

    /*
    |--------------------------------------------------------------------------
    | Keep Search In Sync With Backend
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        setSearch(filters?.search ?? '');
    }, [filters?.search]);

    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (isInitialMount) {
            setIsInitialMount(false);

            return;
        }

        const timer = setTimeout(() => {
            router.get(
                '/clinic/reservations',
                {
                    search:
                        search || undefined,

                    status:
                        filters?.status ||
                        undefined,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                }
            );
        }, 300);

        return () => {
            clearTimeout(timer);
        };
    }, [
        search,
        filters?.status,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Flash Messages
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (flash?.success) {
            toast.success(
                flash.success
            );
        }

        if (flash?.error) {
            toast.error(
                flash.error
            );
        }

        if (flash?.message) {
            toast.success(
                flash.message
            );
        }
    }, [flash]);

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    const getPatientName = (
        reservation: Reservation
    ): string => {
        if (!reservation.patient) {
            return '-';
        }

        return [
            reservation.patient.first_name,
            reservation.patient.middle_name,
            reservation.patient.last_name,
        ]
            .filter(Boolean)
            .join(' ');
    };

    const getDoctorName = (
        reservation: Reservation
    ): string => {
        if (!reservation.doctor) {
            return '-';
        }

        return [
            reservation.doctor.first_name,
            reservation.doctor.middle_name,
            reservation.doctor.last_name,
        ]
            .filter(Boolean)
            .join(' ');
    };

    /*
    |--------------------------------------------------------------------------
    | Status Badge
    |--------------------------------------------------------------------------
    */

    const getStatusClass = (
        status: string
    ): string => {
        switch (
            status?.toLowerCase()
        ) {
            case 'reserved':
                return 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400';

            case 'confirmed':
                return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400';

            case 'checked in':
                return 'border-blue-500/20 bg-blue-500/10 text-blue-400';

            case 'checked out':
                return 'border-indigo-500/20 bg-indigo-500/10 text-indigo-400';

            case 'cancelled':
                return 'border-red-500/20 bg-red-500/10 text-red-400';

            case 'no show':
                return 'border-orange-500/20 bg-orange-500/10 text-orange-400';

            default:
                return 'border-neutral-500/20 bg-neutral-500/10 text-gray-400';
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Edit
    |--------------------------------------------------------------------------
    */

    const handleEdit = (
        reservation: Reservation
    ) => {
        if (
            reservation.status ===
            'Checked Out'
        ) {
            toast.error(
                'Checked Out reservations cannot be edited.'
            );

            return;
        }

        setSelectedReservation(
            reservation
        );

        setIsEditOpen(true);
    };

    const handleEditClose = (
        open: boolean
    ) => {
        setIsEditOpen(open);

        if (!open) {
            setSelectedReservation(
                null
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Create Consultation
    |--------------------------------------------------------------------------
    */

    const handleCreateConsultation = (
        reservation: Reservation
    ) => {
        if (
            reservation.status !==
            'Checked In'
        ) {
            toast.error(
                'Consultation can only be created for Checked In reservations.'
            );

            return;
        }

        if (
            reservation.consultation
        ) {
            toast.error(
                'This reservation already has a consultation.'
            );

            return;
        }

        setSelectedConsultationReservation(
            reservation
        );

        setIsConsultationOpen(
            true
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Consultation Drawer Close
    |--------------------------------------------------------------------------
    */

    const handleConsultationClose = (
        open: boolean
    ) => {
        setIsConsultationOpen(
            open
        );

        if (!open) {
            setSelectedConsultationReservation(
                null
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Consultation Success
    |--------------------------------------------------------------------------
    */

    const handleConsultationSuccess = () => {
        setIsConsultationOpen(
            false
        );

        setSelectedConsultationReservation(
            null
        );

        /*
        |--------------------------------------------------------------------------
        | Refresh Only Reservation Data
        |--------------------------------------------------------------------------
        */

        router.reload({
            only: [
                'reservations',
            ],
            preserveScroll: true,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Status Update
    |--------------------------------------------------------------------------
    */

    const handleStatusChange = (
        reservation: Reservation,
        newStatus: string
    ) => {
        /*
        |--------------------------------------------------------------------------
        | Prevent Changes After Checkout
        |--------------------------------------------------------------------------
        */

        if (
            reservation.status ===
            'Checked Out'
        ) {
            toast.error(
                'Checked Out reservations cannot be changed.'
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Allowed Transitions
        |--------------------------------------------------------------------------
        */

        const allowedTransitions: Record<
            string,
            string[]
        > = {
            Reserved: [
                'Reserved',
                'Confirmed',
                'Cancelled',
                'No Show',
            ],

            Confirmed: [
                'Confirmed',
                'Checked In',
                'Cancelled',
                'No Show',
            ],

            'Checked In': [
                'Checked In',
                'Checked Out',
            ],

            'Checked Out': [
                'Checked Out',
            ],

            Cancelled: [
                'Cancelled',
            ],

            'No Show': [
                'No Show',
            ],
        };

        const allowed =
            allowedTransitions[
                reservation.status
            ] ?? [];

        if (
            !allowed.includes(
                newStatus
            )
        ) {
            toast.error(
                `Cannot change reservation from "${reservation.status}" to "${newStatus}".`
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Check Out Requires Consultation
        |--------------------------------------------------------------------------
        */

        if (
            newStatus ===
                'Checked Out' &&
            !reservation.consultation
        ) {
            toast.error(
                'Please complete the consultation before checking out.'
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Confirmation
        |--------------------------------------------------------------------------
        */

        const confirmed =
            window.confirm(
                `Change reservation ${reservation.appointment_code} from "${reservation.status}" to "${newStatus}"?`
            );

        if (!confirmed) {
            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Update
        |--------------------------------------------------------------------------
        */

        router.patch(
            `/clinic/reservations/${reservation.id}`,
            {
                patient_id:
                    reservation.patient_id,

                doctor_id:
                    reservation.doctor_id,

                service_id:
                    reservation.service_id,

                schedule_id:
                    reservation.schedule_id,

                appointment_type:
                    reservation.appointment_type,

                status:
                    newStatus,

                remarks:
                    reservation.remarks ??
                    '',

                amount:
                    reservation.amount,
            },
            {
                preserveScroll: true,

                onStart: () => {
                    toast.loading(
                        'Updating reservation...',
                        {
                            id: `reservation-${reservation.id}`,
                        }
                    );
                },

                onSuccess: () => {
                    toast.success(
                        `Reservation ${newStatus.toLowerCase()} successfully.`,
                        {
                            id: `reservation-${reservation.id}`,
                        }
                    );
                },

                onError: (
                    errors
                ) => {
                    const firstError =
                        Object.values(
                            errors
                        )[0];

                    toast.error(
                        typeof firstError ===
                            'string'
                            ? firstError
                            : 'Unable to update reservation.',
                        {
                            id: `reservation-${reservation.id}`,
                        }
                    );
                },
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Delete
    |--------------------------------------------------------------------------
    */

    const handleDelete = (
        reservation: Reservation
    ) => {
        if (
            reservation.status ===
            'Checked Out'
        ) {
            toast.error(
                'Checked Out reservations cannot be deleted.'
            );

            return;
        }

        const confirmed =
            window.confirm(
                `Are you sure you want to delete reservation ${reservation.appointment_code}?`
            );

        if (!confirmed) {
            return;
        }

        router.delete(
            `/clinic/reservations/${reservation.id}`,
            {
                preserveScroll: true,

                onStart: () => {
                    toast.loading(
                        'Deleting reservation...',
                        {
                            id: `delete-${reservation.id}`,
                        }
                    );
                },

                onSuccess: () => {
                    toast.success(
                        'Reservation deleted successfully.',
                        {
                            id: `delete-${reservation.id}`,
                        }
                    );
                },

                onError: (
                    errors
                ) => {
                    const firstError =
                        Object.values(
                            errors
                        )[0];

                    toast.error(
                        typeof firstError ===
                            'string'
                            ? firstError
                            : 'Unable to delete reservation.',
                        {
                            id: `delete-${reservation.id}`,
                        }
                    );
                },
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Actions
    |--------------------------------------------------------------------------
    */

    const renderActions = (
        reservation: Reservation
    ) => {
        const status =
            reservation.status;

        return (
            <div className="flex justify-end gap-1">

                {/* ---------------------------------------------------------
                    View
                --------------------------------------------------------- */}

                <Link
                    href={`/clinic/reservations/${reservation.id}`}
                >
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        title="View"
                        className="h-8 w-8 text-gray-400 hover:bg-neutral-800 hover:text-white"
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                </Link>

                {/* ---------------------------------------------------------
                    Reserved → Confirm
                --------------------------------------------------------- */}

                {status ===
                    'Reserved' && (
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                            handleStatusChange(
                                reservation,
                                'Confirmed'
                            )
                        }
                        title="Confirm"
                        className="h-8 w-8 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                    >
                        <Check className="h-4 w-4" />
                    </Button>
                )}

                {/* ---------------------------------------------------------
                    Confirmed → Check In
                --------------------------------------------------------- */}

                {status ===
                    'Confirmed' && (
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                            handleStatusChange(
                                reservation,
                                'Checked In'
                            )
                        }
                        title="Check In"
                        className="h-8 w-8 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
                    >
                        <LogIn className="h-4 w-4" />
                    </Button>
                )}

                {/* ---------------------------------------------------------
                    Checked In → Create Consultation
                --------------------------------------------------------- */}

                {status ===
                    'Checked In' &&
                    !reservation.consultation && (
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                            handleCreateConsultation(
                                reservation
                            )
                        }
                        title="Create Consultation"
                        className="h-8 w-8 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300"
                    >
                        <Stethoscope className="h-4 w-4" />
                    </Button>
                )}

                {/* ---------------------------------------------------------
                    Checked In + Consultation → Check Out
                --------------------------------------------------------- */}

                {status ===
                    'Checked In' &&
                    !!reservation.consultation && (
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                            handleStatusChange(
                                reservation,
                                'Checked Out'
                            )
                        }
                        title="Check Out"
                        className="h-8 w-8 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300"
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                )}

                {/* ---------------------------------------------------------
                    Edit
                --------------------------------------------------------- */}

                {status !==
                    'Checked Out' && (
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                            handleEdit(
                                reservation
                            )
                        }
                        title="Edit"
                        className="h-8 w-8 text-gray-400 hover:bg-neutral-800 hover:text-white"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                )}

                {/* ---------------------------------------------------------
                    Delete
                --------------------------------------------------------- */}

                {status !==
                    'Checked Out' && (
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                            handleDelete(
                                reservation
                            )
                        }
                        title="Delete"
                        className="h-8 w-8 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}

            </div>
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <div className="min-h-full w-full min-w-0 bg-black p-6 text-gray-100 md:p-8">

            <div className="mx-auto w-full min-w-0 max-w-7xl space-y-6">

                {/* ---------------------------------------------------------
                    Header
                --------------------------------------------------------- */}

                <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                    <div>

                        <h1 className="text-xl font-extrabold tracking-tight text-white">
                            Reservation Management
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage patient appointments and reservations.
                        </p>

                    </div>

                </div>

                {/* ---------------------------------------------------------
                    Result Count
                --------------------------------------------------------- */}

                {reservations?.total >
                    0 && (

                    <div className="hidden">

                        <p className="text-sm text-gray-500">

                            Showing{' '}

                            <span className="font-medium text-gray-300">
                                {
                                    reservations.from
                                }
                            </span>{' '}

                            to{' '}

                            <span className="font-medium text-gray-300">
                                {
                                    reservations.to
                                }
                            </span>{' '}

                            of{' '}

                            <span className="font-medium text-gray-300">
                                {
                                    reservations.total
                                }
                            </span>{' '}

                            reservations

                        </p>

                        {search && (
                            <button
                                type="button"
                                onClick={() =>
                                    setSearch(
                                        ''
                                    )
                                }
                                className="text-sm text-indigo-400 hover:text-indigo-300"
                            >
                                Clear search
                            </button>
                        )}

                    </div>
                )}

                {/* ---------------------------------------------------------
                    Table
                --------------------------------------------------------- */}

                <div className="overflow-hidden ">

                        <Table
                            clientPagination={false}
                            searchValue={search}
                            onSearchChange={setSearch}
                            toolbarActions={<CreateReservationDrawer />}
                        >

                            <TableHeader className="bg-neutral-950">

                                <TableRow className="border-neutral-800 hover:bg-transparent">

                                    <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                        Appointment
                                    </TableHead>

                                    <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                        Patient
                                    </TableHead>

                                    <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                        Doctor
                                    </TableHead>

                                    <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                        Clinic
                                    </TableHead>

                                    <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                        Service
                                    </TableHead>

                                    <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                        Schedule
                                    </TableHead>

                                    <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                        Amount
                                    </TableHead>

                                    <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                        Status
                                    </TableHead>

                                    {/* <TableHead className="text-right text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                        Actions
                                    </TableHead> */}

                                </TableRow>

                            </TableHeader>

                            <TableBody>

                                {reservations?.data?.length >
                                0 ? (

                                    reservations.data.map(
                                        (
                                            reservation
                                        ) => (

                                            <TableRow
                                                key={
                                                    reservation.id
                                                }
                                                className="border-neutral-800 transition-colors hover:bg-neutral-800/50"
                                            >

                                                {/* Appointment */}

                                                <TableCell>

                                                    <div>

                                                        <div className="font-medium text-white">
                                                            {
                                                                reservation.appointment_code
                                                            }
                                                        </div>

                                                        <div className="mt-1 text-xs text-gray-500">
                                                            {
                                                                reservation.appointment_type
                                                            }
                                                        </div>

                                                    </div>

                                                </TableCell>

                                                {/* Patient */}

                                                <TableCell>

                                                    <div>

                                                        <div className="font-medium text-white">
                                                            {getPatientName(
                                                                reservation
                                                            )}
                                                        </div>

                                                        <div className="mt-1 text-xs text-gray-500">
                                                            ID:{' '}
                                                            {
                                                                reservation.patient_id
                                                            }
                                                        </div>

                                                    </div>

                                                </TableCell>

                                                {/* Doctor */}

                                                <TableCell>

                                                    <div>

                                                        <div className="font-medium text-white">
                                                            {getDoctorName(
                                                                reservation
                                                            )}
                                                        </div>

                                                        <div className="mt-1 text-xs text-gray-500">
                                                            ID:{' '}
                                                            {
                                                                reservation.doctor_id
                                                            }
                                                        </div>

                                                    </div>

                                                </TableCell>

                                                {/* Clinic */}

                                                <TableCell>

                                                    <span className="text-gray-400">
                                                        {
                                                            reservation
                                                                .clinic
                                                                ?.clinic_name ??
                                                            reservation
                                                                .clinic
                                                                ?.name ??
                                                            '-'
                                                        }
                                                    </span>

                                                </TableCell>

                                                {/* Service */}

                                                <TableCell>

                                                    <span className="text-gray-400">
                                                        {
                                                            reservation
                                                                .service
                                                                ?.service_name ??
                                                            '-'
                                                        }
                                                    </span>

                                                </TableCell>

                                                {/* Schedule */}

                                                <TableCell>

                                                    {reservation.schedule ? (

                                                        <div>

                                                            <div className="font-medium text-gray-300">
                                                                {
                                                                    reservation
                                                                        .schedule
                                                                        .day_of_week
                                                                }
                                                            </div>

                                                            <div className="mt-1 text-xs text-gray-500">

                                                                {
                                                                    reservation
                                                                        .schedule
                                                                        .start_time
                                                                        ?.substring(
                                                                            0,
                                                                            5
                                                                        )
                                                                }

                                                                {' - '}

                                                                {
                                                                    reservation
                                                                        .schedule
                                                                        .end_time
                                                                        ?.substring(
                                                                            0,
                                                                            5
                                                                        )
                                                                }

                                                            </div>

                                                        </div>

                                                    ) : (

                                                        <span className="text-gray-600">
                                                            -
                                                        </span>

                                                    )}

                                                </TableCell>

                                                {/* Amount */}

                                                <TableCell>

                                                    <span className="font-medium text-gray-300">

                                                        {Number(
                                                            reservation.amount
                                                        ).toLocaleString(
                                                            'en-US'
                                                        )}

                                                        {' MMK'}

                                                    </span>

                                                </TableCell>

                                                {/* Status */}

                                                <TableCell>

                                                    <span
                                                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(
                                                            reservation.status
                                                        )}`}
                                                    >
                                                        {
                                                            reservation.status
                                                        }
                                                    </span>

                                                </TableCell>

                                                {/* Actions */}

                                                <TableCell className="text-right">

                                                    {renderActions(
                                                        reservation
                                                    )}

                                                </TableCell>

                                            </TableRow>

                                        )
                                    )

                                ) : (

                                    <TableRow className="border-neutral-800">

                                        <TableCell
                                            colSpan={
                                                9
                                            }
                                            className="h-32 text-center"
                                        >

                                            <div className="flex flex-col items-center justify-center gap-2">

                                                <p className="text-sm font-medium text-gray-400">
                                                    No reservations found
                                                </p>

                                                {search && (

                                                    <p className="text-xs text-gray-600">
                                                        Try a different search term.
                                                    </p>

                                                )}

                                            </div>

                                        </TableCell>

                                    </TableRow>

                                )}

                            </TableBody>

                        </Table>

                </div>

                {/* ---------------------------------------------------------
                    Pagination
                --------------------------------------------------------- */}

                {reservations?.links &&
                    reservations.links.length >
                        3 && (

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                            <div className="text-sm text-gray-500">

                                Page{' '}

                                <span className="text-gray-300">
                                    {
                                        reservations.current_page
                                    }
                                </span>{' '}

                                of{' '}

                                <span className="text-gray-300">
                                    {
                                        reservations.last_page
                                    }
                                </span>

                            </div>

                            <div className="flex items-center gap-1.5 overflow-x-auto">

                                {reservations.links.map(
                                    (
                                        link,
                                        index
                                    ) => {

                                        if (
                                            !link.url
                                        ) {
                                            return (
                                                <span
                                                    key={
                                                        index
                                                    }
                                                    className="cursor-not-allowed rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs font-medium text-gray-600 opacity-50"
                                                    dangerouslySetInnerHTML={{
                                                        __html: link.label,
                                                    }}
                                                />
                                            );
                                        }

                                        return (
                                            <Link
                                                key={
                                                    index
                                                }
                                                href={
                                                    link.url
                                                }
                                                preserveScroll
                                                className={`rounded-lg border px-3.5 py-2 text-xs font-medium transition-all ${
                                                    link.active
                                                        ? 'border-indigo-600 bg-indigo-600 text-white'
                                                        : 'border-neutral-800 bg-neutral-900 text-gray-300 hover:border-neutral-700 hover:bg-neutral-800'
                                                }`}
                                            >
                                                <span
                                                    dangerouslySetInnerHTML={{
                                                        __html: link.label,
                                                    }}
                                                />
                                            </Link>
                                        );
                                    }
                                )}

                            </div>

                        </div>
                    )}

                {/* ---------------------------------------------------------
                    Edit Reservation
                --------------------------------------------------------- */}

                <EditReservationDialog
                    open={isEditOpen}
                    onOpenChange={
                        handleEditClose
                    }
                    reservation={
                        selectedReservation
                    }
                />

                {/* ---------------------------------------------------------
                    Create Consultation Drawer
                --------------------------------------------------------- */}

                <CreateConsultationDrawer
                    open={
                        isConsultationOpen
                    }
                    onOpenChange={
                        handleConsultationClose
                    }
                    reservation={
                        selectedConsultationReservation
                    }
                    onSuccess={
                        handleConsultationSuccess
                    }
                    clinicDrugs={clinicDrugs}
                    clinicMedicalProducts={clinicMedicalProducts}
                    paymentMethods={paymentMethods}
                />

            </div>

        </div>
    );
}
 
