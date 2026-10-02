import type { FormEvent } from 'react';
import { Link, useForm } from '@inertiajs/react';
import AuthLayout, { Field, PasswordInput, SubmitButton, authRoutes, inputCls } from '../../../layouts/auth/auth-layout';

export default function SignIn() {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(authRoutes.login, { onFinish: () => reset('password') });
    };

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Sign in to manage your appointments and tokens."
            footer={
                <>
                    New here?{' '}
                    <Link href={authRoutes.register} className="font-medium text-main hover:underline">
                        Create an account
                    </Link>
                </>
            }
            panelTitle="Your appointments, all in one place."
            panelPoints={['See upcoming visits and your token number', 'Rebook with your doctor in a few taps', 'Download receipts any time']}
        >
            <form onSubmit={submit} noValidate className="space-y-5">
                <Field id="email" label="Email" error={errors.email}>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        autoFocus
                        required
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="you@example.com"
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                        className={inputCls(Boolean(errors.email))}
                    />
                </Field>

                <Field
                    id="password"
                    label="Password"
                    error={errors.password}
                    action={
                        <Link href={authRoutes.forgot} className="text-sm font-medium text-main hover:underline">
                            Forgot password?
                        </Link>
                    }
                >
                    <PasswordInput
                        id="password"
                        value={data.password}
                        onChange={(v) => setData('password', v)}
                        error={errors.password}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                    />
                </Field>

                <label className="flex min-h-10 cursor-pointer items-center gap-2.5 text-sm">
                    <input
                        type="checkbox"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                        className="size-4 rounded accent-main"
                    />
                    Keep me signed in
                </label>

                <SubmitButton processing={processing}>{processing ? 'Signing in…' : 'Sign in'}</SubmitButton>
            </form>
        </AuthLayout>
    );
}
