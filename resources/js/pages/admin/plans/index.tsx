import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type Plan = {
    id: number;
    name: string;
    description: string | null;
    price: string | number;
    duration_days: number;
    features: string[];
    limits: Record<string, number | null> | null;
    is_active: boolean;
    subscriptions_count: number;
};

type PlanForm = {
    name: string;
    description: string;
    price: string;
    duration_days: string;
    features: string[];
    limits: Record<string, string>;
    is_active: boolean;
};

const emptyPlan: PlanForm = {
    name: '',
    description: '',
    price: '0',
    duration_days: '30',
    features: [],
    limits: {
        doctors: '',
        patients: '',
        monthly_reservations: '',
    },
    is_active: true,
};

export default function PlansIndex({
    plans,
    featureCatalog,
    limitCatalog,
}: {
    plans: Plan[];
    featureCatalog: Record<string, string>;
    limitCatalog: Record<string, string>;
}) {
    const [open, setOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const form = useForm<PlanForm>(emptyPlan);

    const createPlan = () => {
        setEditingPlan(null);
        form.setData(emptyPlan);
        form.clearErrors();
        setOpen(true);
    };

    const editPlan = (plan: Plan) => {
        setEditingPlan(plan);
        form.setData({
            name: plan.name,
            description: plan.description ?? '',
            price: String(plan.price),
            duration_days: String(plan.duration_days),
            features: plan.features ?? [],
            limits: {
                doctors: plan.limits?.doctors?.toString() ?? '',
                patients: plan.limits?.patients?.toString() ?? '',
                monthly_reservations:
                    plan.limits?.monthly_reservations?.toString() ?? '',
            },
            is_active: plan.is_active,
        });
        form.clearErrors();
        setOpen(true);
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        };

        if (editingPlan) {
            form.put('/admin/plans/' + editingPlan.id, options);
        } else {
            form.post('/admin/plans', options);
        }
    };

    return (
        <div className="space-y-6 p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Clinic plans</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Set plan prices, durations, included features, and usage limits.
                    </p>
                </div>
                <Button onClick={createPlan}>Create plan</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {plans.map((plan) => (
                    <section key={plan.id} className="space-y-4 rounded-xl border p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-semibold">{plan.name}</h2>
                                <p className="text-sm text-muted-foreground">
                                    {Number(plan.price) === 0
                                        ? 'Free'
                                        : Number(plan.price).toLocaleString() + ' MMK'}
                                    {' · '}
                                    {plan.duration_days} days
                                </p>
                            </div>
                            <span className="rounded-full border px-2 py-1 text-xs">
                                {plan.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        {plan.description && (
                            <p className="text-sm text-muted-foreground">{plan.description}</p>
                        )}
                        <div>
                            <p className="mb-2 text-sm font-medium">Features</p>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                {plan.features.map((feature) => (
                                    <li key={feature}>{featureCatalog[feature] ?? feature}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {Object.entries(plan.limits ?? {}).map(([key, value]) => (
                                <div key={key}>
                                    {limitCatalog[key] ?? key}: {value}
                                </div>
                            ))}
                            <div className="mt-1">Subscriptions: {plan.subscriptions_count}</div>
                        </div>
                        <Button variant="outline" onClick={() => editPlan(plan)}>
                            Edit plan
                        </Button>
                    </section>
                ))}
                {plans.length === 0 && (
                    <p className="rounded-lg border p-6 text-sm text-muted-foreground">
                        No plans yet. Create the first clinic plan to offer it for purchase.
                    </p>
                )}
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingPlan ? 'Edit plan' : 'Create plan'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="plan-name">Plan name</Label>
                                <Input id="plan-name" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} required />
                                {form.errors.name && <p className="text-sm text-destructive">{form.errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="plan-price">Price (MMK)</Label>
                                <Input id="plan-price" type="number" min="0" step="1" value={form.data.price} onChange={(event) => form.setData('price', event.target.value)} required />
                                {form.errors.price && <p className="text-sm text-destructive">{form.errors.price}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="plan-duration">Duration (days)</Label>
                                <Input id="plan-duration" type="number" min="1" value={form.data.duration_days} onChange={(event) => form.setData('duration_days', event.target.value)} required />
                                {form.errors.duration_days && <p className="text-sm text-destructive">{form.errors.duration_days}</p>}
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="plan-description">Description</Label>
                                <textarea id="plan-description" value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                            </div>
                        </div>

                        <fieldset className="space-y-2">
                            <legend className="mb-2 text-sm font-medium">Included features</legend>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {Object.entries(featureCatalog).map(([key, label]) => (
                                    <label key={key} className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={form.data.features.includes(key)}
                                            onChange={(event) => form.setData(
                                                'features',
                                                event.target.checked
                                                    ? [...form.data.features, key]
                                                    : form.data.features.filter((feature) => feature !== key),
                                            )}
                                        />
                                        {label}
                                    </label>
                                ))}
                            </div>
                            {form.errors.features && <p className="text-sm text-destructive">{form.errors.features}</p>}
                        </fieldset>

                        <fieldset className="space-y-3">
                            <legend className="text-sm font-medium">Usage limits (leave blank for unlimited)</legend>
                            <div className="grid gap-3 sm:grid-cols-3">
                                {Object.entries(limitCatalog).map(([key, label]) => (
                                    <div key={key} className="space-y-2">
                                        <Label htmlFor={'limit-' + key}>{label}</Label>
                                        <Input
                                            id={'limit-' + key}
                                            type="number"
                                            min="1"
                                            value={form.data.limits[key] ?? ''}
                                            onChange={(event) => form.setData('limits', {
                                                ...form.data.limits,
                                                [key]: event.target.value,
                                            })}
                                        />
                                    </div>
                                ))}
                            </div>
                            {form.errors.limits && <p className="text-sm text-destructive">{form.errors.limits}</p>}
                        </fieldset>

                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={form.data.is_active} onChange={(event) => form.setData('is_active', event.target.checked)} />
                            Available for new subscriptions
                        </label>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? 'Saving…' : editingPlan ? 'Save plan' : 'Create plan'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
