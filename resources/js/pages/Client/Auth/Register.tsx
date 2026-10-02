import type { FormEvent } from 'react';
import { Link, useForm } from '@inertiajs/react';
import AuthLayout, { Field, PasswordInput, SubmitButton, authRoutes, inputCls } from '../../../layouts/auth/auth-layout';

export default function SignUp() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        terms: false,
    });

    const mismatch = data.password_confirmation.length > 0 && data.password !== data.password_confirmation;
    const confirmError = errors.password_confirmation || (mismatch ? 'Passwords do not match.' : undefined);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (mismatch) return;
        post(authRoutes.register, { onFinish: () => reset('password', 'password_confirmation') });
    };

    return (
        <AuthLayout
            title="Create your account"
            subtitle="Book doctors and get your token number in minutes."
            footer={
                <>
                    Already have an account?{' '}
                    <Link href={authRoutes.login} className="font-medium text-main hover:underline">
                        Sign in
                    </Link>
                </>
            }
            panelImage="photo-1559839734-2b71ea197ec2"
            panelTitle="Skip the queue. See the right doctor."
            panelPoints={['Compare doctors by clinic, fee and language', 'Pick a session and get a token number', 'Keep every booking and receipt in one account']}
        >
            <form onSubmit={submit} noValidate className="space-y-5">
                <Field id="name" label="Full name" error={errors.name}>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        autoFocus
                        required
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Your full name"
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                        className={inputCls(Boolean(errors.name))}
                    />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                    <Field id="email" label="Email" error={errors.email}>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            required
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="you@example.com"
                            aria-invalid={Boolean(errors.email)}
                            aria-describedby={errors.email ? 'email-error' : undefined}
                            className={inputCls(Boolean(errors.email))}
                        />
                    </Field>
                    <Field id="phone" label="Phone" error={errors.phone}>
                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            placeholder="+95 9 123 456 789"
                            aria-invalid={Boolean(errors.phone)}
                            aria-describedby={errors.phone ? 'phone-error' : undefined}
                            className={inputCls(Boolean(errors.phone))}
                        />
                    </Field>
                </div>

                <Field id="password" label="Password" error={errors.password} hint="At least 8 characters.">
                    <PasswordInput
                        id="password"
                        value={data.password}
                        onChange={(v) => setData('password', v)}
                        error={errors.password}
                        autoComplete="new-password"
                        placeholder="Create a password"
                    />
                </Field>

                <Field id="password_confirmation" label="Confirm password" error={confirmError}>
                    <PasswordInput
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(v) => setData('password_confirmation', v)}
                        error={confirmError}
                        autoComplete="new-password"
                        placeholder="Re-enter your password"
                    />
                </Field>

                <div>
                    <label className="flex cursor-pointer items-start gap-2.5 py-1 text-sm">
                        <input
                            type="checkbox"
                            checked={data.terms}
                            onChange={(e) => setData('terms', e.target.checked)}
                            aria-invalid={Boolean(errors.terms)}
                            className="mt-0.5 size-4 shrink-0 rounded accent-main"
                        />
                        <span className="text-[#3B3F4A]">
                            I agree to the{' '}
                            <Link href="/terms" className="font-medium text-main hover:underline">
                                terms
                            </Link>{' '}
                            and{' '}
                            <Link href="/privacy" className="font-medium text-main hover:underline">
                                privacy policy
                            </Link>
                            .
                        </span>
                    </label>
                    {errors.terms && (
                        <p role="alert" className="mt-1 text-sm text-red-600">
                            {errors.terms}
                        </p>
                    )}
                </div>

                <SubmitButton processing={processing || !data.terms}>
                    {processing ? 'Creating account…' : 'Create account'}
                </SubmitButton>
            </form>
        </AuthLayout>
    );
}
