 
// import React, { useEffect, useState } from 'react';
// import { Link, router, usePage } from '@inertiajs/react';

// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';

// import {
//     Table,
//     TableBody,
//     TableCell,
//     TableHead,
//     TableHeader,
//     TableRow,
// } from '@/components/ui/table';

// import { Eye } from 'lucide-react';

// import { toast } from 'sonner';

// /* =========================================================
//    Patient
// ========================================================= */

// interface Patient {
//     id: string;
//     first_name: string;
//     middle_name?: string | null;
//     last_name: string;
// }

// /* =========================================================
//    Doctor
// ========================================================= */

// interface Doctor {
//     id: string;
//     first_name: string;
//     middle_name?: string | null;
//     last_name: string;
// }

// /* =========================================================
//    Reservation
// ========================================================= */

// interface Reservation {
//     id: number;
//     appointment_code: string;
//     appointment_type: string;
//     patient?: Patient | null;
//     doctor?: Doctor | null;
// }

// /* =========================================================
//    Consultation
// ========================================================= */

// interface Consultation {
//     id: number;
//     appointment_code: string;
//     date_of_consultation: string;
//     diagnosis: string;
//     treatment: string;
//     upload_prescription?: string | null;
//     reservation?: Reservation | null;
// }

// /* =========================================================
//    Pagination
// ========================================================= */

// interface PaginationLink {
//     url: string | null;
//     label: string;
//     active: boolean;
// }

// interface PaginatedConsultations {
//     data: Consultation[];
//     current_page: number;
//     last_page: number;
//     per_page: number;
//     total: number;
//     from: number | null;
//     to: number | null;
//     links: PaginationLink[];
// }

// /* =========================================================
//    Page Props
// ========================================================= */

// interface PageProps {
//     consultations: PaginatedConsultations;

//     filters?: {
//         search?: string;
//     };

//     flash?: {
//         success?: string;
//         error?: string;
//     };

//     [key: string]: unknown;
// }

// /* =========================================================
//    Index
// ========================================================= */

// export default function Index() {
//     const {
//         consultations,
//         filters,
//         flash,
//     } = usePage<PageProps>().props;

//     /* =====================================================
//        Search
//     ====================================================== */

//     const [search, setSearch] = useState(
//         filters?.search ?? ''
//     );

//     const [isInitialMount, setIsInitialMount] =
//         useState(true);

//     /* =====================================================
//        Search Effect
//     ====================================================== */

//     useEffect(() => {
//         if (isInitialMount) {
//             setIsInitialMount(false);
//             return;
//         }

//         const timer = setTimeout(() => {
//             router.get(
//                 '/clinic/consultations',
//                 {
//                     search: search || undefined,
//                 },
//                 {
//                     preserveState: true,
//                     preserveScroll: true,
//                     replace: true,
//                 }
//             );
//         }, 300);

//         return () => clearTimeout(timer);
//     }, [search, isInitialMount]);

//     /* =====================================================
//        Flash Messages
//     ====================================================== */

//     useEffect(() => {
//         if (flash?.success) {
//             toast.success(flash.success);
//         }

//         if (flash?.error) {
//             toast.error(flash.error);
//         }
//     }, [flash]);

//     /* =====================================================
//        Doctor Name
//     ====================================================== */

//     const getDoctorName = (
//         doctor?: Doctor | null
//     ): string => {
//         if (!doctor) {
//             return '-';
//         }

//         return [
//             doctor.first_name,
//             doctor.middle_name,
//             doctor.last_name,
//         ]
//             .filter(Boolean)
//             .join(' ');
//     };

//     /* =====================================================
//        Patient Name
//     ====================================================== */

//     const getPatientName = (
//         patient?: Patient | null
//     ): string => {
//         if (!patient) {
//             return '-';
//         }

//         return [
//             patient.first_name,
//             patient.middle_name,
//             patient.last_name,
//         ]
//             .filter(Boolean)
//             .join(' ');
//     };

//     /* =====================================================
//        Date
//     ====================================================== */

//     const formatDateTime = (
//         value?: string | null
//     ): string => {
//         if (!value) {
//             return '-';
//         }

//         const date = new Date(value);

//         if (Number.isNaN(date.getTime())) {
//             return value;
//         }

//         return date.toLocaleString('en-US', {
//             year: 'numeric',
//             month: 'short',
//             day: '2-digit',
//             hour: 'numeric',
//             minute: '2-digit',
//             hour12: true,
//         });
//     };

//     /* =====================================================
//        Delete
//     ====================================================== */

//     const handleDelete = (
//         consultation: Consultation
//     ) => {
//         const confirmed = window.confirm(
//             `Are you sure you want to delete consultation ${consultation.appointment_code}?`
//         );

//         if (!confirmed) {
//             return;
//         }

//         router.delete(
//             `/clinic/consultations/${consultation.id}`,
//             {
//                 preserveScroll: true,
//             }
//         );
//     };

//     return (
//         <div className="min-h-screen bg-black p-8 text-gray-100">

//             <div className="mx-auto max-w-7xl space-y-6">

//                 {/* =================================================
//                     Header
//                 ================================================== */}

//                 <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

//                     <div>

//                         <h1 className="text-xl font-extrabold tracking-tight text-white">
//                             Consultation Management
//                         </h1>

//                         <p className="mt-1 text-sm text-gray-500">
//                             Manage patient consultations and treatment information.
//                         </p>

//                     </div>

//                     {/* Search */}

//                     <div className="w-full md:w-80">

//                         <Input
//                             type="text"
//                             value={search}
//                             onChange={(e) =>
//                                 setSearch(e.target.value)
//                             }
//                             placeholder="Search consultations..."
//                             className="border-neutral-800 bg-neutral-900 text-gray-100 placeholder:text-gray-500 focus-visible:ring-indigo-500"
//                         />

//                     </div>

//                 </div>

//                 {/* =================================================
//                     Result Information
//                 ================================================== */}

//                 {consultations?.total > 0 && (

//                     <div className="flex items-center justify-between">

//                         <p className="text-sm text-gray-500">

//                             Showing{' '}

//                             <span className="font-medium text-gray-300">
//                                 {consultations.from}
//                             </span>{' '}

//                             to{' '}

//                             <span className="font-medium text-gray-300">
//                                 {consultations.to}
//                             </span>{' '}

//                             of{' '}

//                             <span className="font-medium text-gray-300">
//                                 {consultations.total}
//                             </span>{' '}

//                             consultations

//                         </p>

//                         {search && (

//                             <button
//                                 type="button"
//                                 onClick={() =>
//                                     setSearch('')
//                                 }
//                                 className="text-sm text-indigo-400 hover:text-indigo-300"
//                             >
//                                 Clear search
//                             </button>

//                         )}

//                     </div>

//                 )}

//                 {/* =================================================
//                     Table
//                 ================================================== */}

//                 <div className="overflow-x-auto ">

//                     <Table>

//                         <TableHeader className="bg-neutral-950">

//                             <TableRow className="border-neutral-800 hover:bg-transparent">

//                                 <TableHead className="whitespace-nowrap text-xs font-semibold tracking-wider text-gray-400 uppercase">
//                                     Appointment
//                                 </TableHead>

//                                 <TableHead className="whitespace-nowrap text-xs font-semibold tracking-wider text-gray-400 uppercase">
//                                     Patient
//                                 </TableHead>

//                                 <TableHead className="whitespace-nowrap text-xs font-semibold tracking-wider text-gray-400 uppercase">
//                                     Doctor
//                                 </TableHead>

//                                 <TableHead className="whitespace-nowrap text-xs font-semibold tracking-wider text-gray-400 uppercase">
//                                     Consultation Date
//                                 </TableHead>

//                                 <TableHead className="whitespace-nowrap text-xs font-semibold tracking-wider text-gray-400 uppercase">
//                                     Diagnosis
//                                 </TableHead>

//                                 <TableHead className="whitespace-nowrap text-xs font-semibold tracking-wider text-gray-400 uppercase">
//                                     Treatment
//                                 </TableHead>

//                                 <TableHead className="whitespace-nowrap text-xs font-semibold tracking-wider text-gray-400 uppercase">
//                                     Prescription
//                                 </TableHead>

//                                 <TableHead className="whitespace-nowrap text-right text-xs font-semibold tracking-wider text-gray-400 uppercase">
//                                     Actions
//                                 </TableHead>

//                             </TableRow>

//                         </TableHeader>

//                         <TableBody>

//                             {consultations?.data?.length > 0 ? (

//                                 consultations.data.map(
//                                     (consultation) => (

//                                         <TableRow
//                                             key={consultation.id}
//                                             className="border-neutral-800 transition-colors hover:bg-neutral-800/50"
//                                         >

//                                             {/* =================================================
//                                                 Appointment
//                                             ================================================== */}

//                                             <TableCell>

//                                                 <div>

//                                                     <div className="font-medium text-indigo-400">
//                                                         {
//                                                             consultation.appointment_code
//                                                         }
//                                                     </div>

//                                                     <div className="mt-1 text-xs text-gray-600">
//                                                         {
//                                                             consultation
//                                                                 .reservation
//                                                                 ?.appointment_type ??
//                                                             '-'
//                                                         }
//                                                     </div>

//                                                 </div>

//                                             </TableCell>

//                                             {/* =================================================
//                                                 Patient
//                                             ================================================== */}

//                                             <TableCell>

//                                                 <div>

//                                                     <div className="font-medium text-white">
//                                                         {
//                                                             getPatientName(
//                                                                 consultation
//                                                                     .reservation
//                                                                     ?.patient
//                                                             )
//                                                         }
//                                                     </div>

//                                                     <div className="mt-1 text-xs text-gray-500">
//                                                         {
//                                                             consultation
//                                                                 .reservation
//                                                                 ?.patient
//                                                                 ?.id ??
//                                                             '-'
//                                                         }
//                                                     </div>

//                                                 </div>

//                                             </TableCell>

//                                             {/* =================================================
//                                                 Doctor
//                                             ================================================== */}

//                                             <TableCell>

//                                                 <span className="whitespace-nowrap text-gray-300">

//                                                     {consultation.reservation?.doctor
//                                                         ? `Dr. ${getDoctorName(
//                                                               consultation
//                                                                   .reservation
//                                                                   .doctor
//                                                           )}`
//                                                         : '-'}

//                                                 </span>

//                                             </TableCell>

//                                             {/* =================================================
//                                                 Consultation Date
//                                             ================================================== */}

//                                             <TableCell>

//                                                 <span className="whitespace-nowrap text-gray-400">

//                                                     {formatDateTime(
//                                                         consultation.date_of_consultation
//                                                     )}

//                                                 </span>

//                                             </TableCell>

//                                             {/* =================================================
//                                                 Diagnosis
//                                             ================================================== */}

//                                             <TableCell className="max-w-[250px]">

//                                                 <span className="line-clamp-2 text-gray-400">
//                                                     {
//                                                         consultation.diagnosis
//                                                     }
//                                                 </span>

//                                             </TableCell>

//                                             {/* =================================================
//                                                 Treatment
//                                             ================================================== */}

//                                             <TableCell className="max-w-[250px]">

//                                                 <span className="line-clamp-2 text-gray-400">
//                                                     {
//                                                         consultation.treatment
//                                                     }
//                                                 </span>

//                                             </TableCell>

//                                             {/* =================================================
//                                                 Prescription
//                                             ================================================== */}

//                                             <TableCell>

//                                                 {consultation.upload_prescription ? (

//                                                     <span className="text-sm text-indigo-400">
//                                                         Uploaded
//                                                     </span>

//                                                 ) : (

//                                                     <span className="text-sm text-gray-600">
//                                                         -
//                                                     </span>

//                                                 )}

//                                             </TableCell>

//                                             {/* =================================================
//                                                 Actions
//                                             ================================================== */}

//                                             <TableCell className="text-right">

//                                                 <div className="flex justify-end gap-2">

//                                                     {/* View */}

//                                                     <Link
//                                                         href={`/clinic/consultations/${consultation.id}`}
//                                                     >

//                                                         <Button
//                                                             size="sm"
//                                                             variant="outline"
//                                                             className="border-neutral-700 bg-transparent text-gray-300 hover:bg-neutral-800"
//                                                         >

//                                                             <Eye className="mr-1.5 h-3.5 w-3.5" />

//                                                             View

//                                                         </Button>

//                                                     </Link>

//                                                     {/* Delete */}

//                                                     <Button
//                                                         size="sm"
//                                                         variant="destructive"
//                                                         onClick={() =>
//                                                             handleDelete(
//                                                                 consultation
//                                                             )
//                                                         }
//                                                         className="border border-red-900 bg-red-600/20 text-red-400 hover:bg-red-600/30"
//                                                     >
//                                                         Delete
//                                                     </Button>

//                                                 </div>

//                                             </TableCell>

//                                         </TableRow>

//                                     )
//                                 )

//                             ) : (

//                                 <TableRow className="border-neutral-800">

//                                     <TableCell
//                                         colSpan={8}
//                                         className="h-32 text-center"
//                                     >

//                                         <div className="flex flex-col items-center justify-center gap-2">

//                                             <p className="text-sm font-medium text-gray-400">
//                                                 No consultations found
//                                             </p>

//                                             {search && (

//                                                 <p className="text-xs text-gray-600">
//                                                     Try a different search term.
//                                                 </p>

//                                             )}

//                                         </div>

//                                     </TableCell>

//                                 </TableRow>

//                             )}

//                         </TableBody>

//                     </Table>

//                 </div>

//                 {/* =================================================
//                     Pagination
//                 ================================================== */}

//                 {consultations?.links &&
//                     consultations.links.length > 3 && (

//                     <div className="flex items-center justify-between">

//                         <div className="text-sm text-gray-500">

//                             Page{' '}

//                             <span className="text-gray-300">
//                                 {consultations.current_page}
//                             </span>{' '}

//                             of{' '}

//                             <span className="text-gray-300">
//                                 {consultations.last_page}
//                             </span>

//                         </div>

//                         <div className="flex items-center gap-1.5">

//                             {consultations.links.map(
//                                 (
//                                     link,
//                                     index
//                                 ) => {

//                                     const Component =
//                                         link.url
//                                             ? Link
//                                             : 'span';

//                                     return (

//                                         <Component
//                                             key={index}
//                                             href={
//                                                 link.url ||
//                                                 '#'
//                                             }
//                                             preserveScroll
//                                             dangerouslySetInnerHTML={{
//                                                 __html:
//                                                     link.label,
//                                             }}
//                                             className={`rounded-lg border px-3.5 py-2 text-xs font-medium transition-all ${
//                                                 link.active
//                                                     ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
//                                                     : 'border-neutral-800 bg-neutral-900 text-gray-300 hover:border-neutral-700 hover:bg-neutral-800'
//                                             } ${
//                                                 !link.url
//                                                     ? 'cursor-not-allowed opacity-40'
//                                                     : ''
//                                             }`}
//                                         />

//                                     );

//                                 }
//                             )}

//                         </div>

//                     </div>

//                 )}

//             </div>

//         </div>
//     );
// }
 


import { Link, router, usePage } from '@inertiajs/react';
import {
    Eye,
    FileText,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';



import CreateMedicalRecordDrawer from './components/create_medical_record_drawer';

/* =========================================================
   Patient
========================================================= */

interface Patient {
    id: string;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
}

/* =========================================================
   Doctor
========================================================= */

interface Doctor {
    id: string;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
}

/* =========================================================
   Reservation
========================================================= */

interface Reservation {
    id: number;
    appointment_code: string;
    appointment_type: string;
    patient?: Patient | null;
    doctor?: Doctor | null;
}

/* =========================================================
   Consultation
========================================================= */

export interface Consultation {
    id: number;
    appointment_code: string;
    date_of_consultation: string;
    diagnosis: string;
    treatment: string;
    upload_prescription?: string | null;
    reservation?: Reservation | null;
}

/* =========================================================
   Pagination
========================================================= */

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedConsultations {
    data: Consultation[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
}

/* =========================================================
   Page Props
========================================================= */

interface PageProps {
    consultations: PaginatedConsultations;

    filters?: {
        search?: string;
    };

    flash?: {
        success?: string;
        error?: string;
    };

    [key: string]: unknown;
}

/* =========================================================
   Index
========================================================= */

export default function Index() {
    const {
        consultations,
        filters,
        flash,
    } = usePage<PageProps>().props;

    /* =====================================================
       Search
    ====================================================== */

    const [search, setSearch] = useState(
        filters?.search ?? ''
    );

    const [isInitialMount, setIsInitialMount] =
        useState(true);

    /* =====================================================
       Medical Record Drawer
    ====================================================== */

    const [
        selectedConsultation,
        setSelectedConsultation,
    ] = useState<Consultation | null>(null);

    const [
        isMedicalRecordOpen,
        setIsMedicalRecordOpen,
    ] = useState(false);

    /* =====================================================
       Search Effect
    ====================================================== */

    useEffect(() => {
        if (isInitialMount) {
            setIsInitialMount(false);

            return;
        }

        const timer = setTimeout(() => {
            router.get(
                '/clinic/consultations',
                {
                    search: search || undefined,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                }
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [search, isInitialMount]);

    /* =====================================================
       Flash Messages
    ====================================================== */

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }

        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    /* =====================================================
       Open Medical Record
    ====================================================== */

    const handleCreateMedicalRecord = (
        consultation: Consultation
    ) => {
        setSelectedConsultation(consultation);
        setIsMedicalRecordOpen(true);
    };

    /* =====================================================
       Doctor Name
    ====================================================== */

    const getDoctorName = (
        doctor?: Doctor | null
    ): string => {
        if (!doctor) {
            return '-';
        }

        return [
            doctor.first_name,
            doctor.middle_name,
            doctor.last_name,
        ]
            .filter(Boolean)
            .join(' ');
    };

    /* =====================================================
       Patient Name
    ====================================================== */

    const getPatientName = (
        patient?: Patient | null
    ): string => {
        if (!patient) {
            return '-';
        }

        return [
            patient.first_name,
            patient.middle_name,
            patient.last_name,
        ]
            .filter(Boolean)
            .join(' ');
    };

    /* =====================================================
       Date
    ====================================================== */

    const formatDateTime = (
        value?: string | null
    ): string => {
        if (!value) {
            return '-';
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    /* =====================================================
       Delete
    ====================================================== */

    const handleDelete = (
        consultation: Consultation
    ) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete consultation ${consultation.appointment_code}?`
        );

        if (!confirmed) {
            return;
        }

        router.delete(
            `/clinic/consultations/${consultation.id}`,
            {
                preserveScroll: true,
            }
        );
    };

    return (
        <>
            <div className="min-h-screen bg-black p-8 text-gray-100">

                <div className="mx-auto max-w-7xl space-y-6">

                    {/* =================================================
                        Header
                    ================================================== */}

                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                        <div>

                            <h1 className="text-xl font-extrabold tracking-tight text-white">
                                Consultation Management
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                Manage patient consultations and treatment information.
                            </p>

                        </div>

                        {/* Search */}

                        <div className="w-full md:w-80">

                            <Input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                placeholder="Search consultations..."
                                className="border-neutral-800 bg-neutral-900 text-gray-100 placeholder:text-gray-500 focus-visible:ring-indigo-500"
                            />

                        </div>

                    </div>

                    {/* =================================================
                        Result Information
                    ================================================== */}

                    {consultations?.total > 0 && (

                        <div className="flex items-center justify-between">

                            <p className="text-sm text-gray-500">

                                Showing{' '}

                                <span className="font-medium text-gray-300">
                                    {consultations.from}
                                </span>{' '}

                                to{' '}

                                <span className="font-medium text-gray-300">
                                    {consultations.to}
                                </span>{' '}

                                of{' '}

                                <span className="font-medium text-gray-300">
                                    {consultations.total}
                                </span>{' '}

                                consultations

                            </p>

                            {search && (

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSearch('')
                                    }
                                    className="text-sm text-indigo-400 hover:text-indigo-300"
                                >
                                    Clear search
                                </button>

                            )}

                        </div>

                    )}

                    {/* =================================================
                        Table
                    ================================================== */}

                    <div className="overflow-x-auto ">

                        <Table>

                            <TableHeader className="bg-neutral-950">

                                <TableRow className="border-neutral-800 hover:bg-transparent">

                                    <TableHead className="whitespace-nowrap text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                        Appointment
                                    </TableHead>

                                    <TableHead className="whitespace-nowrap text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                        Patient
                                    </TableHead>

                                    <TableHead className="whitespace-nowrap text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                        Doctor
                                    </TableHead>

                                    <TableHead className="whitespace-nowrap text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                        Consultation Date
                                    </TableHead>

                                    <TableHead className="whitespace-nowrap text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                        Diagnosis
                                    </TableHead>

                                    <TableHead className="whitespace-nowrap text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                        Treatment
                                    </TableHead>

                                    <TableHead className="whitespace-nowrap text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                        Prescription
                                    </TableHead>

                                    {/* <TableHead className="whitespace-nowrap text-right text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                        Actions
                                    </TableHead> */}

                                </TableRow>

                            </TableHeader>

                            <TableBody>

                                {consultations?.data?.length > 0 ? (

                                    consultations.data.map(
                                        (consultation) => (

                                            <TableRow
                                                key={consultation.id}
                                                className="border-neutral-800 transition-colors hover:bg-neutral-800/50"
                                            >

                                                {/* Appointment */}

                                                <TableCell>

                                                    <div>

                                                        <div className="font-medium text-indigo-400">
                                                            {
                                                                consultation.appointment_code
                                                            }
                                                        </div>

                                                        <div className="mt-1 text-xs text-gray-600">
                                                            {
                                                                consultation
                                                                    .reservation
                                                                    ?.appointment_type ??
                                                                '-'
                                                            }
                                                        </div>

                                                    </div>

                                                </TableCell>

                                                {/* Patient */}

                                                <TableCell>

                                                    <div>

                                                        <div className="font-medium text-white">
                                                            {
                                                                getPatientName(
                                                                    consultation
                                                                        .reservation
                                                                        ?.patient
                                                                )
                                                            }
                                                        </div>

                                                        <div className="mt-1 text-xs text-gray-500">
                                                            {
                                                                consultation
                                                                    .reservation
                                                                    ?.patient
                                                                    ?.id ??
                                                                '-'
                                                            }
                                                        </div>

                                                    </div>

                                                </TableCell>

                                                {/* Doctor */}

                                                <TableCell>

                                                    <span className="whitespace-nowrap text-gray-300">

                                                        {consultation.reservation?.doctor
                                                            ? `Dr. ${getDoctorName(
                                                                  consultation
                                                                      .reservation
                                                                      .doctor
                                                              )}`
                                                            : '-'}

                                                    </span>

                                                </TableCell>

                                                {/* Consultation Date */}

                                                <TableCell>

                                                    <span className="whitespace-nowrap text-gray-400">

                                                        {formatDateTime(
                                                            consultation.date_of_consultation
                                                        )}

                                                    </span>

                                                </TableCell>

                                                {/* Diagnosis */}

                                                <TableCell className="max-w-[250px]">

                                                    <span className="line-clamp-2 text-gray-400">
                                                        {
                                                            consultation.diagnosis
                                                        }
                                                    </span>

                                                </TableCell>

                                                {/* Treatment */}

                                                <TableCell className="max-w-[250px]">

                                                    <span className="line-clamp-2 text-gray-400">
                                                        {
                                                            consultation.treatment
                                                        }
                                                    </span>

                                                </TableCell>

                                                {/* Prescription */}

                                                <TableCell>

                                                    {consultation.upload_prescription ? (

                                                        <span className="text-sm text-indigo-400">
                                                            Uploaded
                                                        </span>

                                                    ) : (

                                                        <span className="text-sm text-gray-600">
                                                            -
                                                        </span>

                                                    )}

                                                </TableCell>

                                                {/* Actions */}

                                                <TableCell className="text-right">

                                                    <div className="flex justify-end gap-2">

                                                        {/* View */}

                                                        <Link
                                                            href={`/clinic/consultations/${consultation.id}`}
                                                        >
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="border-neutral-700 bg-transparent text-gray-300 hover:bg-neutral-800"
                                                            >
                                                                <Eye className="mr-1.5 h-3.5 w-3.5" />

                                                                View
                                                            </Button>
                                                        </Link>

                                                        {/* Medical Record */}

                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                handleCreateMedicalRecord(
                                                                    consultation
                                                                )
                                                            }
                                                            className="border-emerald-900 bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20 hover:text-emerald-300"
                                                        >
                                                            <FileText className="mr-1.5 h-3.5 w-3.5" />

                                                            Medical Record
                                                        </Button>

                                                        {/* Delete */}

                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    consultation
                                                                )
                                                            }
                                                            className="border border-red-900 bg-red-600/20 text-red-400 hover:bg-red-600/30"
                                                        >
                                                            Delete
                                                        </Button>

                                                    </div>

                                                </TableCell>

                                            </TableRow>

                                        )
                                    )

                                ) : (

                                    <TableRow className="border-neutral-800">

                                        <TableCell
                                            colSpan={8}
                                            className="h-32 text-center"
                                        >

                                            <div className="flex flex-col items-center justify-center gap-2">

                                                <p className="text-sm font-medium text-gray-400">
                                                    No consultations found
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

                    {/* =================================================
                        Pagination
                    ================================================== */}

                    {consultations?.links &&
                        consultations.links.length > 3 && (

                        <div className="flex items-center justify-between">

                            <div className="text-sm text-gray-500">

                                Page{' '}

                                <span className="text-gray-300">
                                    {consultations.current_page}
                                </span>{' '}

                                of{' '}

                                <span className="text-gray-300">
                                    {consultations.last_page}
                                </span>

                            </div>

                            <div className="flex items-center gap-1.5">

                                {consultations.links.map(
                                    (
                                        link,
                                        index
                                    ) => {

                                        const Component =
                                            link.url
                                                ? Link
                                                : 'span';

                                        return (

                                            <Component
                                                key={index}
                                                href={
                                                    link.url ||
                                                    '#'
                                                }
                                                preserveScroll
                                                dangerouslySetInnerHTML={{
                                                    __html:
                                                        link.label,
                                                }}
                                                className={`rounded-lg border px-3.5 py-2 text-xs font-medium transition-all ${
                                                    link.active
                                                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                                        : 'border-neutral-800 bg-neutral-900 text-gray-300 hover:border-neutral-700 hover:bg-neutral-800'
                                                } ${
                                                    !link.url
                                                        ? 'cursor-not-allowed opacity-40'
                                                        : ''
                                                }`}
                                            />

                                        );
                                    }
                                )}

                            </div>

                        </div>

                    )}

                </div>

            </div>

            {/* =====================================================
                Medical Record Drawer
            ====================================================== */}

            <CreateMedicalRecordDrawer
                open={isMedicalRecordOpen}
                onOpenChange={(open) => {
                    setIsMedicalRecordOpen(open);

                    if (!open) {
                        setSelectedConsultation(null);
                    }
                }}
                consultation={selectedConsultation}
                onSuccess={() => {
                    setIsMedicalRecordOpen(false);
                    setSelectedConsultation(null);

                    router.reload({
                        only: ['consultations'],
                        preserveScroll: true,
                    });
                }}
            />
        </>
    );
}
