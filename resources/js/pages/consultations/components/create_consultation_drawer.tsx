 
// import { useEffect, useState } from "react";
// import { router } from "@inertiajs/react";
// import {
//     CalendarDays,
//     FileText,
//     Stethoscope,
//     UserRound,
//     X,
// } from "lucide-react";
// import { toast } from "sonner";

// import {
//     Drawer,
//     DrawerContent,
//     DrawerDescription,
//     DrawerHeader,
//     DrawerTitle,
// } from "@/components/ui/drawer";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";

// interface Person {
//     id: string;
//     first_name: string;
//     middle_name?: string | null;
//     last_name: string;
// }

// interface Service {
//     id: number;
//     service_name: string;
// }

// export interface Reservation {
//     id: number;
//     appointment_code: string;
//     patient_id: string;
//     doctor_id: string;
//     appointment_type: string;
//     status: string;
//     remarks?: string | null;
//     amount?: number | string;

//     patient?: Person | null;
//     doctor?: Person | null;
//     service?: Service | null;

//     consultation?: {
//         id: number;
//         appointment_code?: string;
//         date_of_consultation?: string;
//         diagnosis?: string;
//         treatment?: string;
//         upload_prescription?: string | null;
//     } | null;
// }

// interface Props {
//     open: boolean;
//     onOpenChange: (open: boolean) => void;
//     reservation: Reservation | null;
//     onSuccess?: () => void;
// }

// const getFullName = (person?: Person | null) => {
//     if (!person) {
//         return "-";
//     }

//     return [
//         person.first_name,
//         person.middle_name,
//         person.last_name,
//     ]
//         .filter(Boolean)
//         .join(" ");
// };

// const getLocalDateTime = () => {
//     const now = new Date();

//     const offset = now.getTimezoneOffset() * 60000;

//     return new Date(now.getTime() - offset)
//         .toISOString()
//         .slice(0, 16);
// };

// export default function CreateConsultationDrawer({
//     open,
//     onOpenChange,
//     reservation,
//     onSuccess,
// }: Props) {
//     const [dateOfConsultation, setDateOfConsultation] =
//         useState("");

//     const [diagnosis, setDiagnosis] = useState("");
//     const [treatment, setTreatment] = useState("");

//     const [prescription, setPrescription] =
//         useState<File | null>(null);

//     const [processing, setProcessing] = useState(false);

//     useEffect(() => {
//         if (!open || !reservation) {
//             return;
//         }

//         setDateOfConsultation(getLocalDateTime());
//         setDiagnosis("");
//         setTreatment("");
//         setPrescription(null);
//     }, [open, reservation]);

//     const handleClose = () => {
//         if (processing) {
//             return;
//         }

//         onOpenChange(false);
//     };

//     const handleSubmit = (
//         event: React.FormEvent<HTMLFormElement>
//     ) => {
//         event.preventDefault();

//         if (!reservation) {
//             return;
//         }

//         if (reservation.status !== "Checked In") {
//             toast.error(
//                 "Consultation can only be created for Checked In reservations."
//             );
//             return;
//         }

//         if (reservation.consultation) {
//             toast.error(
//                 "This reservation already has a consultation."
//             );
//             return;
//         }

//         if (!dateOfConsultation) {
//             toast.error(
//                 "Consultation date is required."
//             );
//             return;
//         }

//         if (!diagnosis.trim()) {
//             toast.error("Diagnosis is required.");
//             return;
//         }

//         if (!treatment.trim()) {
//             toast.error("Treatment is required.");
//             return;
//         }

//         const formData = new FormData();

//         formData.append(
//             "appointment_code",
//             reservation.appointment_code
//         );

//         formData.append(
//             "date_of_consultation",
//             dateOfConsultation
//         );

//         formData.append(
//             "diagnosis",
//             diagnosis.trim()
//         );

//         formData.append(
//             "treatment",
//             treatment.trim()
//         );

//         if (prescription) {
//             formData.append(
//                 "upload_prescription",
//                 prescription
//             );
//         }

//         setProcessing(true);

//         router.post(
//             "/clinic/consultations",
//             formData,
//             {
//                 forceFormData: true,
//                 preserveScroll: true,

//                 onStart: () => {
//                     toast.loading(
//                         "Creating consultation...",
//                         {
//                             id: "create-consultation",
//                         }
//                     );
//                 },

//                 onSuccess: () => {
//                     toast.success(
//                         "Consultation created successfully.",
//                         {
//                             id: "create-consultation",
//                         }
//                     );

//                     onOpenChange(false);

//                     onSuccess?.();
//                 },

//                 onError: (errors) => {
//                     const firstError =
//                         Object.values(errors)[0];

//                     toast.error(
//                         typeof firstError === "string"
//                             ? firstError
//                             : "Unable to create consultation.",
//                         {
//                             id: "create-consultation",
//                         }
//                     );
//                 },

//                 onFinish: () => {
//                     setProcessing(false);
//                 },
//             }
//         );
//     };

//     return (
//         <Drawer
//             open={open}
//             onOpenChange={onOpenChange}
//         >
//             <DrawerContent className="border-neutral-800 bg-black text-white">
//                 <div className="mx-auto w-full max-w-3xl">
//                     <DrawerHeader className="border-b border-neutral-800 px-5 py-4">
//                         <div className="flex items-start justify-between gap-4">
//                             <div>
//                                 <DrawerTitle className="flex items-center gap-2 text-lg">
//                                     <Stethoscope className="h-5 w-5 text-indigo-400" />

//                                     Create Consultation
//                                 </DrawerTitle>

//                                 <DrawerDescription className="mt-1 text-sm text-neutral-500">
//                                     Create consultation for the
//                                     checked-in reservation.
//                                 </DrawerDescription>
//                             </div>

//                             <Button
//                                 type="button"
//                                 size="icon"
//                                 variant="ghost"
//                                 disabled={processing}
//                                 onClick={handleClose}
//                                 className="h-8 w-8 text-neutral-500 hover:bg-neutral-900 hover:text-white"
//                             >
//                                 <X className="h-4 w-4" />
//                             </Button>
//                         </div>
//                     </DrawerHeader>

//                     {reservation && (
//                         <form
//                             onSubmit={handleSubmit}
//                             className="max-h-[calc(100vh-145px)] overflow-y-auto px-5 py-5"
//                         >
//                             {/* Reservation Information */}
//                             <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
//                                 <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-3">
//                                     <div className="mb-1 flex items-center gap-2 text-xs text-neutral-500">
//                                         <FileText className="h-3.5 w-3.5" />
//                                         Appointment Code
//                                     </div>

//                                     <p className="text-sm font-medium text-white">
//                                         {
//                                             reservation.appointment_code
//                                         }
//                                     </p>
//                                 </div>

//                                 <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-3">
//                                     <div className="mb-1 flex items-center gap-2 text-xs text-neutral-500">
//                                         <UserRound className="h-3.5 w-3.5" />
//                                         Patient
//                                     </div>

//                                     <p className="text-sm font-medium text-white">
//                                         {getFullName(
//                                             reservation.patient
//                                         )}
//                                     </p>
//                                 </div>

//                                 <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-3">
//                                     <div className="mb-1 text-xs text-neutral-500">
//                                         Doctor
//                                     </div>

//                                     <p className="text-sm font-medium text-white">
//                                         {getFullName(
//                                             reservation.doctor
//                                         )}
//                                     </p>
//                                 </div>

//                                 <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-3">
//                                     <div className="mb-1 text-xs text-neutral-500">
//                                         Service
//                                     </div>

//                                     <p className="text-sm font-medium text-white">
//                                         {reservation.service
//                                             ?.service_name ?? "-"}
//                                     </p>
//                                 </div>
//                             </div>

//                             {/* Consultation Date */}
//                             <div className="mb-4 space-y-2">
//                                 <Label
//                                     htmlFor="date_of_consultation"
//                                     className="text-sm text-neutral-300"
//                                 >
//                                     Consultation Date
//                                 </Label>

//                                 <div className="relative">
//                                     <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />

//                                     <Input
//                                         id="date_of_consultation"
//                                         type="datetime-local"
//                                         value={
//                                             dateOfConsultation
//                                         }
//                                         onChange={(event) =>
//                                             setDateOfConsultation(
//                                                 event.target.value
//                                             )
//                                         }
//                                         disabled={processing}
//                                         className="border-neutral-800 bg-neutral-900 pl-10 text-white"
//                                     />
//                                 </div>
//                             </div>

//                             {/* Diagnosis */}
//                             <div className="mb-4 space-y-2">
//                                 <Label
//                                     htmlFor="diagnosis"
//                                     className="text-sm text-neutral-300"
//                                 >
//                                     Diagnosis
//                                 </Label>

//                                 <Textarea
//                                     id="diagnosis"
//                                     value={diagnosis}
//                                     onChange={(event) =>
//                                         setDiagnosis(
//                                             event.target.value
//                                         )
//                                     }
//                                     disabled={processing}
//                                     placeholder="Enter diagnosis..."
//                                     rows={4}
//                                     className="resize-none border-neutral-800 bg-neutral-900 text-white placeholder:text-neutral-600"
//                                 />
//                             </div>

//                             {/* Treatment */}
//                             <div className="mb-4 space-y-2">
//                                 <Label
//                                     htmlFor="treatment"
//                                     className="text-sm text-neutral-300"
//                                 >
//                                     Treatment
//                                 </Label>

//                                 <Textarea
//                                     id="treatment"
//                                     value={treatment}
//                                     onChange={(event) =>
//                                         setTreatment(
//                                             event.target.value
//                                         )
//                                     }
//                                     disabled={processing}
//                                     placeholder="Enter treatment..."
//                                     rows={4}
//                                     className="resize-none border-neutral-800 bg-neutral-900 text-white placeholder:text-neutral-600"
//                                 />
//                             </div>

//                             {/* Prescription */}
//                             <div className="mb-6 space-y-2">
//                                 <Label
//                                     htmlFor="upload_prescription"
//                                     className="text-sm text-neutral-300"
//                                 >
//                                     Prescription
//                                 </Label>

//                                 <Input
//                                     id="upload_prescription"
//                                     type="file"
//                                     accept=".jpg,.jpeg,.png,.pdf"
//                                     disabled={processing}
//                                     onChange={(event) => {
//                                         setPrescription(
//                                             event.target
//                                                 .files?.[0] ??
//                                                 null
//                                         );
//                                     }}
//                                     className="border-neutral-800 bg-neutral-900 text-neutral-400 file:mr-3 file:border-0 file:bg-neutral-800 file:px-3 file:py-1 file:text-sm file:text-white"
//                                 />

//                                 {prescription && (
//                                     <p className="text-xs text-neutral-500">
//                                         Selected:{" "}
//                                         {prescription.name}
//                                     </p>
//                                 )}

//                                 <p className="text-xs text-neutral-600">
//                                     JPG, JPEG, PNG or PDF. Maximum
//                                     size 5 MB.
//                                 </p>
//                             </div>

//                             {/* Footer */}
//                             <div className="flex justify-end gap-2 border-t border-neutral-800 pt-4">
//                                 <Button
//                                     type="button"
//                                     variant="ghost"
//                                     disabled={processing}
//                                     onClick={handleClose}
//                                     className="text-neutral-400 hover:bg-neutral-900 hover:text-white"
//                                 >
//                                     Cancel
//                                 </Button>

//                                 <Button
//                                     type="submit"
//                                     disabled={processing}
//                                     className="bg-indigo-600 text-white hover:bg-indigo-500"
//                                 >
//                                     <Stethoscope className="mr-2 h-4 w-4" />

//                                     {processing
//                                         ? "Creating..."
//                                         : "Create Consultation"}
//                                 </Button>
//                             </div>
//                         </form>
//                     )}
//                 </div>
//             </DrawerContent>
//         </Drawer>
//     );
// }
 
 
import { router } from "@inertiajs/react";
import {
    CalendarDays,
    FileText,
    Settings,
    Stethoscope,
    UserRound,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";


import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Person {
    id: string;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
}

interface Service {
    id: number;
    service_name: string;
}

export interface Reservation {
    id: number;
    appointment_code: string;
    patient_id: string;
    doctor_id: string;
    appointment_type: string;
    status: string;
    remarks?: string | null;
    amount?: number | string;

    patient?: Person | null;
    doctor?: Person | null;
    service?: Service | null;

    consultation?: {
        id: number;
        appointment_code?: string;
        date_of_consultation?: string;
        diagnosis?: string;
        treatment?: string;
        upload_prescription?: string | null;
    } | null;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reservation: Reservation | null;
    onSuccess?: () => void;
    clinicDrugs: { drug_id: number; drug: { name: string; strength?: string; units: { id: number; unit_name: string; sale_price: string }[] } }[];
    clinicMedicalProducts: { medical_product_id: number; sale_price: string; product: { name: string } }[];
    paymentMethods: { id: number; name: string }[];
}

const getFullName = (
    person?: Person | null
) => {
    if (!person) {
        return "-";
    }

    return [
        person.first_name,
        person.middle_name,
        person.last_name,
    ]
        .filter(Boolean)
        .join(" ");
};

const getLocalDateTime = () => {
    const now = new Date();

    const offset =
        now.getTimezoneOffset() * 60000;

    return new Date(
        now.getTime() - offset
    )
        .toISOString()
        .slice(0, 16);
};

export default function CreateConsultationDrawer({
    open,
    onOpenChange,
    reservation,
    onSuccess,
    clinicDrugs,
    clinicMedicalProducts,
    paymentMethods,
}: Props) {
    const [
        dateOfConsultation,
        setDateOfConsultation,
    ] = useState("");

    const [
        diagnosis,
        setDiagnosis,
    ] = useState("");

    const [
        treatment,
        setTreatment,
    ] = useState("");

    const [
        prescription,
        setPrescription,
    ] = useState<File | null>(null);

    const [
        processing,
        setProcessing,
    ] = useState(false);
    const [selectedItems, setSelectedItems] = useState<{ item_type: 'drug' | 'medical_product'; drug_id?: number; drug_unit_id?: number; medical_product_id?: number; quantity: number; label: string }[]>([]);
    const [selectedDrugUnit, setSelectedDrugUnit] = useState('');
    const [selectedMedicalProduct, setSelectedMedicalProduct] = useState('');
    const [itemQuantity, setItemQuantity] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('');

    /*
    |--------------------------------------------------------------------------
    | Reset Form
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (
            !open ||
            !reservation
        ) {
            return;
        }

        setDateOfConsultation(
            getLocalDateTime()
        );

        setDiagnosis("");
        setTreatment("");
        setPrescription(null);
        setSelectedItems([]);
        setPaymentMethod('');
    }, [
        open,
        reservation,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Close
    |--------------------------------------------------------------------------
    */

    const handleClose = () => {
        if (processing) {
            return;
        }

        onOpenChange(false);
    };

    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const handleSubmit = (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!reservation) {
            return;
        }

        if (
            reservation.status !==
            "Checked In"
        ) {
            toast.error(
                "Consultation can only be created for Checked In reservations."
            );

            return;
        }

        if (
            reservation.consultation
        ) {
            toast.error(
                "This reservation already has a consultation."
            );

            return;
        }

        if (!dateOfConsultation) {
            toast.error(
                "Consultation date is required."
            );

            return;
        }

        if (!diagnosis.trim()) {
            toast.error(
                "Diagnosis is required."
            );

            return;
        }

        if (!treatment.trim()) {
            toast.error(
                "Treatment is required."
            );

            return;
        }

        const formData =
            new FormData();

        formData.append(
            "appointment_code",
            reservation.appointment_code
        );

        formData.append(
            "date_of_consultation",
            dateOfConsultation
        );

        formData.append(
            "diagnosis",
            diagnosis.trim()
        );

        formData.append(
            "treatment",
            treatment.trim()
        );

        if (prescription) {
            formData.append(
                "upload_prescription",
                prescription
            );
        }

        selectedItems.forEach((item, index) => {
            formData.append(`items[${index}][item_type]`, item.item_type);
            formData.append(`items[${index}][quantity]`, item.quantity.toString());

            if (item.drug_id) {
formData.append(`items[${index}][drug_id]`, item.drug_id.toString());
}

            if (item.drug_unit_id) {
formData.append(`items[${index}][drug_unit_id]`, item.drug_unit_id.toString());
}

            if (item.medical_product_id) {
formData.append(`items[${index}][medical_product_id]`, item.medical_product_id.toString());
}
        });
        formData.append('payment_method', paymentMethod);

        setProcessing(true);

        router.post(
            "/clinic/consultations",
            formData,
            {
                forceFormData: true,
                preserveScroll: true,

                onStart: () => {
                    toast.loading(
                        "Creating consultation...",
                        {
                            id: "create-consultation",
                        }
                    );
                },

                onSuccess: () => {
                    toast.success(
                        "Consultation created successfully.",
                        {
                            id: "create-consultation",
                        }
                    );

                    onOpenChange(false);

                    onSuccess?.();
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
                            "string"
                            ? firstError
                            : "Unable to create consultation.",
                        {
                            id: "create-consultation",
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
            onOpenChange={
                onOpenChange
            }
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
                bg-black
                text-white
            "
            >
                <div className="flex h-full flex-col">

                    {/* =====================================================
                        Header
                    ===================================================== */}

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

                                <DrawerTitle
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        text-lg
                                        text-white
                                    "
                                >
                                    <Stethoscope
                                        className="
                                            h-5
                                            w-5
                                            text-indigo-400
                                        "
                                    />

                                    Create Consultation
                                </DrawerTitle>

                                <DrawerDescription
                                    className="
                                        mt-1
                                        text-sm
                                        text-neutral-500
                                    "
                                >
                                    Create consultation for the
                                    checked-in reservation.
                                </DrawerDescription>

                            </div>

                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                disabled={
                                    processing
                                }
                                onClick={
                                    handleClose
                                }
                                className="
                                    h-8
                                    w-8
                                    shrink-0
                                    text-neutral-500
                                    hover:bg-neutral-900
                                    hover:text-white
                                "
                            >
                                <X className="h-4 w-4" />
                            </Button>

                        </div>
                    </DrawerHeader>

                    {/* =====================================================
                        Form
                    ===================================================== */}

                    {reservation && (

                        <form
                            onSubmit={
                                handleSubmit
                            }
                            className="
                                flex
                                min-h-0
                                flex-1
                                flex-col
                            "
                        >

                            {/* =================================================
                                Scrollable Content
                            ================================================= */}

                            <div
                                className="
                                    min-h-0
                                    flex-1
                                    overflow-y-auto
                                    px-5
                                    py-5
                                "
                            >

                                 

                                <div
                                    className="
                                        mb-6
                                        grid
                                        grid-cols-2
                                        gap-3
                                    "
                                >

                                 
                                    <div
                                        className="
                                            rounded-xl
                                            border
                                            border-neutral-800
                                            bg-neutral-900/70
                                            p-4
                                        "
                                    >
                                        <div
                                            className="
                                                mb-2
                                                flex
                                                items-center
                                                gap-2
                                                text-xs
                                                text-neutral-500
                                            "
                                        >
                                            <FileText className="h-3.5 w-3.5" />

                                            Appointment Code
                                        </div>

                                        <p
                                            className="
                                                text-sm
                                                font-semibold
                                                text-white
                                            "
                                        >
                                            {
                                                reservation.appointment_code
                                            }
                                        </p>
                                    </div>

                                    {/* Patient */}

                                    <div
                                        className="
                                            rounded-xl
                                            border
                                            border-neutral-800
                                            bg-neutral-900/70
                                            p-4
                                        "
                                    >
                                        <div
                                            className="
                                                mb-2
                                                flex
                                                items-center
                                                gap-2
                                                text-xs
                                                text-neutral-500
                                            "
                                        >
                                            <UserRound className="h-3.5 w-3.5" />

                                            Patient
                                        </div>

                                        <p
                                            className="
                                                text-sm
                                                font-semibold
                                                text-white
                                            "
                                        >
                                            {getFullName(
                                                reservation.patient
                                            )}
                                        </p>
                                    </div>

                                    {/* Doctor */}

                                    <div
                                        className="
                                            rounded-xl
                                            border
                                            border-neutral-800
                                            bg-neutral-900/70
                                            p-4
                                        "
                                    >
                                        <div
                                            className="
                                              mb-2
                                                flex
                                                items-center
                                                gap-2
                                                text-xs
                                                text-neutral-500
                                            "
                                        >
                                             <UserRound className="h-3.5 w-3.5" />
                                            Doctor
                                        </div>

                                        <p
                                            className="
                                                text-sm
                                                font-semibold
                                                text-white
                                            "
                                        >
                                            {getFullName(
                                                reservation.doctor
                                            )}
                                        </p>
                                    </div>

                                    {/* Service */}

                                    <div
                                        className="
                                            rounded-xl
                                            border
                                            border-neutral-800
                                            bg-neutral-900/70
                                            p-4
                                        "
                                    >
                                        <div
                                            className="
                                                mb-2
                                                flex
                                                items-center
                                                gap-2
                                                text-xs
                                                text-neutral-500
                                            "
                                        >
                                             <Settings className="h-3.5 w-3.5" />
                                            Service
                                        </div>

                                        <p
                                            className="
                                                text-sm
                                                font-semibold
                                                text-white
                                            "
                                        >
                                            {
                                                reservation
                                                    .service
                                                    ?.service_name ??
                                                "-"
                                            }
                                        </p>
                                    </div>

                                </div>

                                {/* =============================================
                                    Consultation Date
                                ============================================= */}

                                <div
                                    className="
                                        mb-5
                                        space-y-2
                                    "
                                >

                                    <Label
                                        htmlFor="date_of_consultation"
                                        className="text-sm text-neutral-300"
                                    >
                                        Consultation Date
                                    </Label>

                                    <div className="relative">

                                        <CalendarDays
                                            className="
                                                absolute
                                                left-3
                                                top-1/2
                                                h-4
                                                w-4
                                                -translate-y-1/2
                                                text-neutral-500
                                            "
                                        />

                                        <Input
                                            id="date_of_consultation"
                                            type="datetime-local"
                                            value={
                                                dateOfConsultation
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setDateOfConsultation(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            disabled={
                                                processing
                                            }
                                            className="
                                                h-10
                                                border-neutral-800
                                                bg-neutral-900
                                                pl-10
                                                text-white
                                                [color-scheme:dark]
                                            "
                                        />

                                    </div>

                                </div>

                                {/* =============================================
                                    Diagnosis
                                ============================================= */}

                                <div
                                    className="
                                        mb-5
                                        space-y-2
                                    "
                                >

                                    <Label
                                        htmlFor="diagnosis"
                                        className="text-sm text-neutral-300"
                                    >
                                        Diagnosis
                                    </Label>

                                    <Textarea
                                        id="diagnosis"
                                        value={
                                            diagnosis
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setDiagnosis(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        disabled={
                                            processing
                                        }
                                        placeholder="Enter diagnosis..."
                                        rows={5}
                                        className="
                                            resize-none
                                            border-neutral-800
                                            bg-neutral-900
                                            text-white
                                            placeholder:text-neutral-600
                                            focus-visible:ring-indigo-500
                                        "
                                    />

                                </div>

                                {/* =============================================
                                    Treatment
                                ============================================= */}

                                <div
                                    className="
                                        mb-5
                                        space-y-2
                                    "
                                >

                                    <Label
                                        htmlFor="treatment"
                                        className="text-sm text-neutral-300"
                                    >
                                        Treatment
                                    </Label>

                                    <Textarea
                                        id="treatment"
                                        value={
                                            treatment
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setTreatment(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        disabled={
                                            processing
                                        }
                                        placeholder="Enter treatment..."
                                        rows={5}
                                        className="
                                            resize-none
                                            border-neutral-800
                                            bg-neutral-900
                                            text-white
                                            placeholder:text-neutral-600
                                            focus-visible:ring-indigo-500
                                        "
                                    />

                                </div>

                                <div className="mb-6 space-y-3 rounded-lg border border-neutral-800 p-4">
                                    <Label className="text-sm text-neutral-300">Prescription items</Label>
                                    <p className="text-xs text-neutral-500">These items are added to the reservation total. Stock is deducted later at checkout.</p>
                                    <div className="grid gap-2 sm:grid-cols-3">
                                        <select className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white" value={selectedDrugUnit} onChange={(event) => setSelectedDrugUnit(event.target.value)} disabled={processing}>
                                            <option value="">Choose drug unit</option>
                                            {clinicDrugs.flatMap((clinicDrug) => clinicDrug.drug.units.map((unit) => <option key={unit.id} value={`${clinicDrug.drug_id}:${unit.id}`}>{clinicDrug.drug.name} {clinicDrug.drug.strength} · {unit.unit_name} ({unit.sale_price} MMK)</option>))}
                                        </select>
                                        <Input type="number" min="1" value={itemQuantity} onChange={(event) => setItemQuantity(Number(event.target.value))} disabled={processing} />
                                        <Button type="button" variant="outline" disabled={!selectedDrugUnit || processing} onClick={() => {
 const [drugId, unitId] = selectedDrugUnit.split(':').map(Number); const clinicDrug = clinicDrugs.find((item) => item.drug_id === drugId); const unit = clinicDrug?.drug.units.find((item) => item.id === unitId);

 if (clinicDrug && unit) {
 setSelectedItems([...selectedItems, { item_type: 'drug', drug_id: drugId, drug_unit_id: unitId, quantity: itemQuantity, label: `${clinicDrug.drug.name} · ${unit.unit_name}` }]); setSelectedDrugUnit(''); setItemQuantity(1); 
} 
}}>Add drug</Button>
                                    </div>
                                    <div className="grid gap-2 sm:grid-cols-3">
                                        <select className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white" value={selectedMedicalProduct} onChange={(event) => setSelectedMedicalProduct(event.target.value)} disabled={processing}>
                                            <option value="">Choose medical product</option>
                                            {clinicMedicalProducts.map((product) => <option key={product.medical_product_id} value={product.medical_product_id}>{product.product.name} ({product.sale_price} MMK)</option>)}
                                        </select>
                                        <Input type="number" min="1" value={itemQuantity} onChange={(event) => setItemQuantity(Number(event.target.value))} disabled={processing} />
                                        <Button type="button" variant="outline" disabled={!selectedMedicalProduct || processing} onClick={() => {
 const product = clinicMedicalProducts.find((item) => item.medical_product_id === Number(selectedMedicalProduct));

 if (product) {
 setSelectedItems([...selectedItems, { item_type: 'medical_product', medical_product_id: product.medical_product_id, quantity: itemQuantity, label: product.product.name }]); setSelectedMedicalProduct(''); setItemQuantity(1); 
} 
}}>Add product</Button>
                                    </div>
                                    {selectedItems.map((item, index) => <div className="flex items-center justify-between text-sm text-gray-300" key={`${item.label}-${index}`}><span>{item.label} × {item.quantity}</span><button className="text-red-400 hover:text-red-300" type="button" onClick={() => setSelectedItems(selectedItems.filter((_, itemIndex) => itemIndex !== index))}>Remove</button></div>)}
                                </div>

                                <div className="mb-6 space-y-3 rounded-lg border border-neutral-800 p-4">
                                    <Label className="text-sm text-neutral-300">Payment</Label>
                                    <p className="text-xs text-neutral-500">The selected prescription items are recorded as a paid sale when this consultation is created.</p>
                                    <select className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} disabled={processing}>
                                        <option value="">Choose payment method</option>
                                        {paymentMethods.map((method) => <option key={method.id} value={method.name}>{method.name}</option>)}
                                    </select>
                                </div>

                                {/* =============================================
                                    Prescription
                                ============================================= */}

                                <div
                                    className="
                                        mb-6
                                        space-y-2
                                    "
                                >

                                    <Label
                                        htmlFor="upload_prescription"
                                        className="text-sm text-neutral-300"
                                    >
                                        Prescription
                                    </Label>

                                    <Input
                                        id="upload_prescription"
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        disabled={
                                            processing
                                        }
                                        onChange={(
                                            event
                                        ) => {
                                            setPrescription(
                                                event
                                                    .target
                                                    .files?.[0] ??
                                                    null
                                            );
                                        }}
                                        className="
                                            border-neutral-800
                                            bg-neutral-900
                                            text-neutral-400
                                            file:mr-3
                                            file:border-0
                                            file:bg-neutral-800
                                            file:px-3
                                            file:py-1
                                            file:text-sm
                                            file:text-white
                                        "
                                    />

                                    {prescription && (
                                        <p className="text-xs text-neutral-500">
                                            Selected:{" "}
                                            {
                                                prescription.name
                                            }
                                        </p>
                                    )}

                                    <p className="text-xs text-neutral-600">
                                        JPG, JPEG, PNG or PDF.
                                        Maximum size 5 MB.
                                    </p>

                                </div>

                            </div>

                            {/* =================================================
                                Footer
                            ================================================= */}

                            <div
                                className="
                                    shrink-0
                                    border-t
                                    border-neutral-800
                                    bg-black
                                    px-5
                                    py-4
                                "
                            >

                                <div className="flex justify-end gap-2">

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        disabled={
                                            processing
                                        }
                                        onClick={
                                            handleClose
                                        }
                                        className="
                                            text-neutral-400
                                            hover:bg-neutral-900
                                            hover:text-white
                                        "
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        type="submit"
                                        disabled={
                                            processing
                                        }
                                        className="
                                            bg-indigo-600
                                            text-white
                                            hover:bg-indigo-500
                                        "
                                    >
                                        <Stethoscope className="mr-2 h-4 w-4" />

                                        {processing
                                            ? "Creating..."
                                            : "Create Consultation"}
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
