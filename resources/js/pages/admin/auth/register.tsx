import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

export default function RegisterAdmin() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        post('/admin/register', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Create the first admin account" />
            <form onSubmit={submit} className="flex flex-col gap-5">
                <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={data.name} onChange={(event) => setData('name', event.target.value)} required autoComplete="name" />
                    <InputError message={errors.name} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={data.email} onChange={(event) => setData('email', event.target.value)} required autoComplete="email" />
                    <InputError message={errors.email} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <PasswordInput id="password" value={data.password} onChange={(event) => setData('password', event.target.value)} required autoComplete="new-password" />
                    <InputError message={errors.password} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password_confirmation">Confirm password</Label>
                    <PasswordInput id="password_confirmation" value={data.password_confirmation} onChange={(event) => setData('password_confirmation', event.target.value)} required autoComplete="new-password" />
                </div>
                <Button type="submit" disabled={processing}>
                    {processing && <Spinner />}
                    Create admin account
                </Button>
                <Link href="/admin/login" className="text-center text-sm text-muted-foreground">
                    Back to admin login
                </Link>
            </form>
        </>
    );
}

RegisterAdmin.layout = {
    title: 'Admin account setup',
    description: 'Create the first administrator account for this project',
};
