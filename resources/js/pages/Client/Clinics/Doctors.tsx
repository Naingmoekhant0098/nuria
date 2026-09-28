import { Head, Link } from '@inertiajs/react';

type Doctor = {
    id: string;
    first_name: string;
    last_name: string;
    photo_url?: string | null;
    specialization?: { name: string } | null;
};
type Props = {
    clinic: { id: number; clinic_name: string };
    doctors: { data: Doctor[]; current_page: number; last_page: number };
};

export default function Doctors({ clinic, doctors }: Props) {
    return (
        <>
            <Head title={`Doctors | ${clinic.clinic_name}`} />
            <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
                <Link
                    className="text-sm font-medium text-teal-700 hover:underline"
                    href={`/clinics/${clinic.id}`}
                >
                    ← {clinic.clinic_name}
                </Link>
                <h1 className="mt-3 text-3xl font-bold tracking-tight">
                    Doctors at {clinic.clinic_name}
                </h1>
                <p className="mt-2 text-slate-600">
                    Choose a doctor to see their services and appointment
                    availability.
                </p>
                <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {doctors.data.map((doctor) => (
                        <article
                            className="rounded-2xl border bg-white p-5 shadow-sm"
                            key={doctor.id}
                        >
                            {doctor.photo_url ? (
                                <img
                                    src={doctor.photo_url}
                                    alt={`Dr. ${doctor.first_name} ${doctor.last_name}`}
                                    className="mb-4 aspect-[4/3] w-full rounded-xl object-cover"
                                />
                            ) : (
                                <div className="mb-4 flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-teal-50 text-4xl font-semibold text-teal-800">
                                    {doctor.first_name[0]}
                                    {doctor.last_name[0]}
                                </div>
                            )}
                            <h2 className="text-lg font-semibold">
                                Dr. {doctor.first_name} {doctor.last_name}
                            </h2>
                            <p className="mt-1 text-sm text-slate-600">
                                {doctor.specialization?.name ??
                                    'General practice'}
                            </p>
                            <Link
                                className="mt-5 inline-flex font-semibold text-teal-700 hover:underline"
                                href={`/clinics/${clinic.id}/doctors/${doctor.id}`}
                            >
                                View doctor
                            </Link>
                        </article>
                    ))}
                    {doctors.data.length === 0 && (
                        <p className="text-slate-600">
                            No doctors are listed for this clinic yet.
                        </p>
                    )}
                </div>
            </main>
        </>
    );
}
