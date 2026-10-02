import { useState, type ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { CheckIcon, EyeIcon, EyeOffIcon, HeartPulseIcon } from 'lucide-react';

/* ============ ROUTES (adjust to your web.php) ============ */
export const authRoutes = {
    home: '/',
    login: '/login',
    register: '/register',
    forgot: '/forgot-password',
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400&display=swap');
.n-serif{font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:400;letter-spacing:-.02em}
`;

const src = (id: string, w = 1100) =>
    id.startsWith('/') || id.startsWith('http')
        ? id
        : `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;

/** Input classes. Text is 16px on phones so iOS Safari does not zoom on focus. */
export const inputCls = (hasError?: boolean) =>
    `w-full rounded-2xl border bg-white px-4 py-3 text-base text-ink outline-none transition placeholder:text-[#94A3B8] focus:ring-2 sm:text-sm ${
        hasError ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15' : 'border-slate-200 focus:border-main focus:ring-main/15'
    }`;

/* ============ FORM PIECES ============ */
export function Field({
    id,
    label,
    error,
    hint,
    action,
    children,
}: {
    id: string;
    label: string;
    error?: string;
    hint?: string;
    action?: ReactNode;
    children: ReactNode;
}) {
    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
                <label htmlFor={id} className="text-sm font-medium">
                    {label}
                </label>
                {action}
            </div>
            {children}
            {error ? (
                <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-red-600">
                    {error}
                </p>
            ) : (
                hint && <p className="mt-1.5 text-xs text-[#64748B]">{hint}</p>
            )}
        </div>
    );
}

export function PasswordInput({
    id,
    value,
    onChange,
    error,
    autoComplete,
    placeholder,
}: {
    id: string;
    value: string;
    onChange: (v: string) => void;
    error?: string;
    autoComplete?: string;
    placeholder?: string;
}) {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <input
                id={id}
                name={id}
                type={show ? 'text' : 'password'}
                autoComplete={autoComplete}
                required
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : undefined}
                className={`${inputCls(Boolean(error))} pr-12`}
            />
            <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? 'Hide password' : 'Show password'}
                aria-pressed={show}
                className="absolute top-1/2 right-2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-[#64748B] transition hover:bg-slate-100 hover:text-ink"
            >
                {show ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
            </button>
        </div>
    );
}

export function SubmitButton({ processing, children }: { processing?: boolean; children: ReactNode }) {
    return (
        <button
            type="submit"
            disabled={processing}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-primary py-3.5 text-sm font-medium text-white transition hover:bg-main focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-primary"
        >
            {children}
        </button>
    );
}

/* ============ LAYOUT ============ */
export default function AuthLayout({
    title,
    subtitle,
    footer,
    panelImage = 'photo-1576091160399-112ba8d25d1d',
    panelTitle,
    panelPoints = [],
    children,
}: {
    title: string;
    subtitle?: string;
    footer?: ReactNode;
    panelImage?: string;
    panelTitle?: string;
    panelPoints?: string[];
    children: ReactNode;
}) {
    return (
        <main className="grid min-h-dvh bg-white text-ink lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
            <style dangerouslySetInnerHTML={{ __html: css }} />

            {/* Form side */}
            <section className="flex flex-col bg-gradient-to-b from-white via-white to-[#EAF3F5] px-5 py-6 sm:px-10 lg:bg-none lg:px-14">
                <Link href={authRoutes.home} className="inline-flex w-fit items-center gap-2 text-base font-semibold">
                    <span className="grid size-8 place-items-center rounded-xl bg-main text-white">
                        <HeartPulseIcon className="size-4" />
                    </span>
                    nuria
                </Link>

                <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
                    <h1 className="text-3xl leading-[1.08] font-medium tracking-[-0.03em] text-balance sm:text-4xl">
                        {title.split(' ').slice(0, -1).join(' ')} <span className="n-serif">{title.split(' ').slice(-1)}</span>
                    </h1>
                    {subtitle && <p className="mt-3 text-[#64748B]">{subtitle}</p>}

                    <div className="mt-8">{children}</div>

                    {footer && <p className="mt-8 text-center text-sm text-[#64748B]">{footer}</p>}
                </div>
            </section>

            {/* Visual side (desktop only) */}
            <aside aria-hidden={!panelTitle} className="relative hidden overflow-hidden bg-primary lg:block">
                <img src={src(panelImage)} alt="" className="absolute inset-0 size-full object-cover object-top opacity-60" onError={(e) => (e.currentTarget.style.display = 'none')} />
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/55 to-primary/10" />
                <div className="relative flex h-full flex-col justify-end p-12 text-white xl:p-16">
                    {panelTitle && (
                        <h2 className="max-w-md text-4xl leading-[1.1] font-medium tracking-[-0.03em] text-balance xl:text-5xl">{panelTitle}</h2>
                    )}
                    {panelPoints.length > 0 && (
                        <ul className="mt-8 space-y-3">
                            {panelPoints.map((p) => (
                                <li key={p} className="flex items-start gap-3 rounded-2xl bg-white/10 px-4 py-3 text-sm backdrop-blur">
                                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-main">
                                        <CheckIcon className="size-3" />
                                    </span>
                                    {p}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </aside>
        </main>
    );
}
