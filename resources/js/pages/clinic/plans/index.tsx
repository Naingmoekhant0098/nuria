import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Plan = {
    id: number;
    name: string;
    description: string | null;
    price: string | number;
    duration_days: number;
    features: string[];
    limits: Record<string, number | null> | null;
};

type Subscription = {
    id: number;
    status: string;
    starts_at: string | null;
    ends_at: string | null;
    price: string | number;
    admin_note: string | null;
    plan: { name: string };
};

export default function ClinicPlansIndex({
    plans,
    currentSubscription,
    subscriptions,
    featureCatalog,
    limitCatalog,
    flash,
}: {
    plans: Plan[];
    currentSubscription: Subscription | null;
    subscriptions: Subscription[];
    featureCatalog: Record<string, string>;
    limitCatalog: Record<string, string>;
    flash: { success?: string; error?: string };
}) {
    return (
        <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-8">
            <header>
                <h1 className="text-2xl font-semibold">Plans and billing</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Choose a clinic plan to unlock the features and capacity your clinic needs.
                </p>
            </header>

            {flash?.success && (
                <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                    {flash.success}
                </p>
            )}
            {flash?.error && (
                <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {flash.error}
                </p>
            )}

            {currentSubscription && (
                <section className="rounded-xl border border-primary/30 bg-primary/5 p-5">
                    <h2 className="font-semibold">Current plan: {currentSubscription.plan.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Active until {currentSubscription.ends_at ? new Date(currentSubscription.ends_at).toLocaleDateString() : '—'}
                    </p>
                </section>
            )}

            <section className="space-y-4">
                <div>
                    <h2 className="text-lg font-semibold">Available plans</h2>
                </div>
                <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {plans.map((plan) => (
                        <PlanDetailCard
                            key={plan.id}
                            plan={plan}
                            featureCatalog={featureCatalog}
                            limitCatalog={limitCatalog}
                            canPurchase={!currentSubscription}
                            hasPendingRequest={subscriptions.some((subscription) => subscription.status === 'pending')}
                        />
                    ))}
                    {plans.length === 0 && (
                        <p className="col-span-full rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                            No plans are currently available. Contact the administrator.
                        </p>
                    )}
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-lg font-semibold">Request history</h2>
                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-muted/40">
                            <tr>
                                <th className="px-4 py-3">Plan</th>
                                <th className="px-4 py-3">Price</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Ends</th>
                                <th className="px-4 py-3">Admin note</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptions.map((subscription) => (
                                <tr key={subscription.id} className="border-b last:border-0">
                                    <td className="px-4 py-3">{subscription.plan.name}</td>
                                    <td className="px-4 py-3">{Number(subscription.price).toLocaleString()} MMK</td>
                                    <td className="px-4 py-3 capitalize">{subscription.status}</td>
                                    <td className="px-4 py-3">
                                        {subscription.ends_at ? new Date(subscription.ends_at).toLocaleDateString() : '—'}
                                    </td>
                                    <td className="px-4 py-3">{subscription.admin_note ?? '—'}</td>
                                </tr>
                            ))}
                            {subscriptions.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                        No plan requests yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

function PlanDetailCard({
    plan,
    featureCatalog,
    limitCatalog,
    canPurchase,
    hasPendingRequest,
}: {
    plan: Plan;
    featureCatalog: Record<string, string>;
    limitCatalog: Record<string, string>;
    canPurchase: boolean;
    hasPendingRequest: boolean;
}) {
    const isFree = Number(plan.price) === 0;
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const form = useForm<{ payment_reference: string; payment_proof: File | null }>({
        payment_reference: '',
        payment_proof: null,
    });

    const buyPlan = () => {
        if (isFree) {
            form.post('/clinic/plans/' + plan.id + '/subscribe', { preserveScroll: true });

            return;
        }

        setIsCheckoutOpen(true);
    };

    const submitPurchase = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post('/clinic/plans/' + plan.id + '/subscribe', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <Card className="flex h-full flex-col">
            <CardHeader>
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <CardTitle>{plan.name}</CardTitle>
                        {plan.description && <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>}
                    </div>
                    <p className="shrink-0 text-right text-lg font-semibold">
                        {isFree ? 'Free' : Number(plan.price).toLocaleString() + ' MMK'}
                        <span className="block text-xs font-normal text-muted-foreground">/{plan.duration_days} days</span>
                    </p>
                </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-5">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Features</h3>
                        <ul className="space-y-1.5 text-sm">
                            {plan.features.map((feature) => (
                                <li key={feature} className="text-muted-foreground">✓ {featureCatalog[feature] ?? feature}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Limits</h3>
                        <div className="space-y-1.5 text-sm text-muted-foreground">
                            {Object.entries(plan.limits ?? {}).length > 0 ? Object.entries(plan.limits ?? {}).map(([key, value]) => (
                                <div key={key}>{limitCatalog[key] ?? key}: {value ?? 'Unlimited'}</div>
                            )) : 'No limits'}
                        </div>
                    </div>
                </div>
                {canPurchase && (
                    <div className="mt-auto border-t pt-4">
                        {hasPendingRequest ? (
                            <p className="text-sm text-muted-foreground">A plan request is pending review.</p>
                        ) : !isCheckoutOpen ? (
                            <Button type="button" className="w-full" onClick={buyPlan} disabled={form.processing}>
                                {isFree ? 'Activate free plan' : 'Buy plan'}
                            </Button>
                        ) : (
                            <form onSubmit={submitPurchase} className="space-y-3">
                                <div className="space-y-1">
                                    <Label htmlFor={'reference-' + plan.id}>Payment reference</Label>
                                    <Input
                                        id={'reference-' + plan.id}
                                        value={form.data.payment_reference}
                                        onChange={(event) => form.setData('payment_reference', event.target.value)}
                                        placeholder="Transfer reference or transaction ID"
                                    />
                                    {form.errors.payment_reference && <p className="text-xs text-destructive">{form.errors.payment_reference}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor={'proof-' + plan.id}>Payment proof</Label>
                                    <Input
                                        id={'proof-' + plan.id}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={(event) => form.setData('payment_proof', event.target.files?.[0] ?? null)}
                                        required
                                    />
                                    {form.errors.payment_proof && <p className="text-xs text-destructive">{form.errors.payment_proof}</p>}
                                </div>
                                {form.errors.plan && <p className="text-sm text-destructive">{form.errors.plan}</p>}
                                <Button type="submit" className="w-full" disabled={form.processing}>
                                    {form.processing ? 'Sending request…' : 'Submit plan request'}
                                </Button>
                            </form>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
