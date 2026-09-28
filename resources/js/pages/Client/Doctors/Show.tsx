import { Head, Link } from '@inertiajs/react';

type Doctor = {
    id: string;
    first_name: string;
    last_name: string;
    name?: string;
    specialization?: { name: string } | string | null;
    bio?: string;
    photo_url?: string | null;
};

type Clinic = {
    id: number;
    name: string;
};

type Props = {
    clinic: Clinic;
    doctor: Doctor;
};

export default function Show({ clinic, doctor }: Props) {
    const doctorName =
        doctor.name || `Dr. ${doctor.first_name} ${doctor.last_name}`;

    return (
        <>
            <Head>
                <title>
                    {doctorName} | {clinic.name}
                </title>

                <meta
                    name="description"
                    content={
                        doctor.bio ||
                        `${doctorName} at ${clinic.name}. View services and availability.`
                    }
                />
            </Head>

            <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
                <Link
                    className="text-sm font-medium text-teal-700 hover:underline"
                    href={`/clinics/${clinic.id}/doctors`}
                >
                    ← Doctors at {clinic.name}
                </Link>
                <section className="mt-5 rounded-3xl border bg-white p-7 shadow-sm sm:p-10">
                    {doctor.photo_url && (
                        <img
                            src={doctor.photo_url}
                            alt={doctorName}
                            className="mb-5 size-28 rounded-2xl object-cover"
                        />
                    )}
                    <p className="mt-3 text-sm font-semibold tracking-wider text-teal-700 uppercase">
                        {clinic.name}
                    </p>

                    <h1 className="mt-2 text-3xl font-bold tracking-tight">
                        {doctorName}
                    </h1>

                    {doctor.specialization && (
                        <h2>
                            {typeof doctor.specialization === 'string'
                                ? doctor.specialization
                                : doctor.specialization.name}
                        </h2>
                    )}

                    {doctor.bio && <p>{doctor.bio}</p>}

                    <div className="mt-7 flex flex-wrap gap-3">
                        <Link
                            className="rounded-lg border px-5 py-3 font-semibold hover:bg-slate-50"
                            href={`/clinics/${clinic.id}/doctors/${doctor.id}/services`}
                        >
                            Services
                        </Link>

                        <Link
                            className="rounded-lg border px-5 py-3 font-semibold hover:bg-slate-50"
                            href={`/clinics/${clinic.id}/doctors/${doctor.id}/availability`}
                        >
                            Availability
                        </Link>

                        <Link
                            className="rounded-lg bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800"
                            href={`/reservations/create?clinic=${clinic.id}&doctor=${doctor.id}`}
                        >
                            Book Appointment
                        </Link>
                    </div>
                </section>
            </main>
        </>
    );
}
