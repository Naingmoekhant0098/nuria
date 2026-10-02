import { Head, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useEffect } from 'react';
import { toast } from 'sonner';

type Feature = {
    key: string;
    label: string;
    globally_enabled: boolean;
    subscription_enabled: boolean;
};

export default function FeatureSettings({ features }: { features: Feature[] }) {
    const { flash } = usePage<{ flash?: { success?: string } }>().props;
    const form = useForm({
        subscription_enabled: Object.fromEntries(
            features.map((feature) => [feature.key, feature.subscription_enabled]),
        ) as Record<string, boolean>,
    });

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash]);

    function submit(event: FormEvent) {
        event.preventDefault();
        form.put('/admin/settings/features', { preserveScroll: true });
    }

    return (
        <>
            <Head title="Feature access" />
            <main className="min-h-full bg-muted/30 px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl space-y-6">
                    <header>
                        <p className="text-sm font-medium text-primary">Administration</p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Feature access</h1>
                        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                            Select Subscription when a feature should be controlled by clinic plans. Leave it
                            unchecked to make the feature free for every clinic.
                        </p>
                    </header>

                    <form onSubmit={submit} className="space-y-3">
                        {features.map((feature) => {
                            const subscriptionEnabled = form.data.subscription_enabled[feature.key] ?? true;
                            return (
                                <div
                                    key={feature.key}
                                    className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border bg-background p-5 shadow-sm transition hover:border-primary/40"
                                >
                                    <span className="flex items-center gap-3">
                                        <span>
                                            <span className="block font-medium">{feature.label}</span>
                                            <span className="text-sm text-muted-foreground">
                                                {subscriptionEnabled ? 'Controlled by clinic subscription plans' : 'Free for all clinics'}
                                            </span>
                                        </span>
                                    </span>
                                    <label className="flex shrink-0 items-center gap-2 text-sm font-medium">
                                        <input
                                            type="checkbox"
                                            aria-label={`${feature.label} subscription access`}
                                            checked={subscriptionEnabled}
                                            onChange={(event) => form.setData('subscription_enabled', {
                                                ...form.data.subscription_enabled,
                                                [feature.key]: event.target.checked,
                                            })}
                                            className="size-4 accent-primary"
                                        />
                                    </label>
                                </div>
                            );
                        })}

                        <div className="flex justify-end pt-3">
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
                            >
                                Save feature access
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}
