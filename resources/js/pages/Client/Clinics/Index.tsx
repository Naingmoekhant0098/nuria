import { Head, Link } from '@inertiajs/react';

type Clinic = {
    id: number;
    clinic_name: string;
    doctors_count: number;
};

type Props = {
    clinics: {
        data: Clinic[];
        current_page: number;
        last_page: number;
    };
};

export default function Index({ clinics }: Props) {
    return (
        <>
            <Head>
                <title>Clinics | Medical Care</title>

                <meta
                    name="description"
                    content="Browse clinics and find doctors and medical services."
                />
            </Head>

            <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
                <p className="text-sm font-semibold tracking-wider text-teal-700 uppercase">
                    Explore care
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight">
                    Find a clinic
                </h1>
                <p className="mt-2 text-slate-600">
                    Browse clinics and choose a doctor or service that suits
                    your needs.
                </p>

                <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {clinics.data.map((clinic) => (
                        <article
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                            key={clinic.id}
                        >
                            <h2 className="text-lg font-semibold">
                                {clinic.clinic_name}
                            </h2>

                            <p className="mt-2 text-sm text-slate-600">
                                {clinic.doctors_count} doctors
                            </p>

                            <Link
                                className="mt-4 inline-flex font-semibold text-teal-700 hover:underline"
                                href={`/clinics/${clinic.id}`}
                            >
                                View Clinic
                            </Link>
                        </article>
                    ))}
                </div>

                <div className="mt-8 flex items-center gap-4 text-sm font-medium text-teal-700">
                    {clinics.current_page > 1 && (
                        <Link
                            href={`/clinics?page=${clinics.current_page - 1}`}
                        >
                            Previous
                        </Link>
                    )}

                    {clinics.current_page < clinics.last_page && (
                        <Link
                            href={`/clinics?page=${clinics.current_page + 1}`}
                        >
                            Next
                        </Link>
                    )}
                </div>
            </main>
        </>
    );
}
