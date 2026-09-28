import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

type Subscription = {
    id: number;
    status: string;
    price: string | number;
    payment_reference: string | null;
    payment_proof_path: string | null;
    admin_note: string | null;
    starts_at: string | null;
    ends_at: string | null;
    created_at: string;
    clinic: { clinic_name: string; user_name: string };
    plan: { name: string; price: string | number; duration_days: number };
};

type PaginationLink = { url: string | null; label: string; active: boolean };

export default function SubscriptionRequests({
    subscriptions,
}: {
    subscriptions: { data: Subscription[]; links?: PaginationLink[] };
}) {
    const pendingCount = subscriptions.data.filter((item) => item.status === 'pending').length;

    return (
        <div className="mx-auto max-w-7xl space-y-6 p-6 md:p-8">
            <header>
                <h1 className="text-2xl font-semibold">Clinic subscriptions</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Review payment proofs and activate clinic plans.
                </p>
            </header>

            <div className="rounded-lg border p-4 text-sm">
                Pending requests on this page: <strong>{pendingCount}</strong>
            </div>

            <div className="overflow-x-auto rounded-lg border">
                <table className="w-full min-w-[1100px] text-left text-sm">
                    <thead className="border-b bg-muted/40">
                        <tr>
                            <th className="px-4 py-3">Clinic</th>
                            <th className="px-4 py-3">Plan</th>
                            <th className="px-4 py-3">Price</th>
                            <th className="px-4 py-3">Payment</th>
                            <th className="px-4 py-3">Period</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Admin note / review</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subscriptions.data.map((subscription) => (
                            <SubscriptionRow key={subscription.id} subscription={subscription} />
                        ))}
                        {subscriptions.data.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                                    No subscription requests found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {subscriptions.links && subscriptions.links.length > 3 && (
                <nav className="flex flex-wrap justify-end gap-2" aria-label="Subscription pages">
                    {subscriptions.links.map((link, index) => (
                        <Button
                            key={index}
                            type="button"
                            variant={link.active ? 'default' : 'outline'}
                            size="sm"
                            disabled={!link.url}
                            onClick={() => link.url && router.get(link.url)}
                        >
                            {link.label.replace(/<[^>]*>/g, '').replace(/&laquo;/g, '«').replace(/&raquo;/g, '»').replace(/&nbsp;/g, ' ')}
                        </Button>
                    ))}
                </nav>
            )}
        </div>
    );
}

function SubscriptionRow({ subscription }: { subscription: Subscription }) {
    const form = useForm({ decision: '', admin_note: subscription.admin_note ?? '' });
    const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
    const isPending = subscription.status === 'pending';

    const review = (decision: 'approve' | 'reject') => {
        form.transform((data) => ({ ...data, decision }));
        form.patch('/admin/subscriptions/' + subscription.id + '/review', {
            preserveScroll: true,
            onSuccess: () => setApprovalDialogOpen(false),
        });
    };

    return (
        <tr className="border-b align-top last:border-0">
            <td className="px-4 py-4">
                <p className="font-medium">{subscription.clinic.clinic_name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{subscription.clinic.user_name}</p>
                <p className="mt-1 text-xs text-muted-foreground">Requested {new Date(subscription.created_at).toLocaleDateString()}</p>
            </td>
            <td className="px-4 py-4">
                <p className="font-medium">{subscription.plan.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{subscription.plan.duration_days} days</p>
            </td>
            <td className="whitespace-nowrap px-4 py-4">{Number(subscription.price).toLocaleString()} MMK</td>
            <td className="px-4 py-4">
                {subscription.payment_reference && <p>Ref: {subscription.payment_reference}</p>}
                {subscription.payment_proof_path && (
                    <a
                        href={'/storage/' + subscription.payment_proof_path}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-block text-primary underline"
                    >
                        View proof
                    </a>
                )}
                {!subscription.payment_reference && !subscription.payment_proof_path && '—'}
            </td>
            <td className="whitespace-nowrap px-4 py-4">
                {subscription.starts_at ? new Date(subscription.starts_at).toLocaleDateString() : '—'}
                {' – '}
                {subscription.ends_at ? new Date(subscription.ends_at).toLocaleDateString() : '—'}
            </td>
            <td className="px-4 py-4">
                <span className="rounded-full border px-2 py-1 text-xs capitalize">{subscription.status}</span>
            </td>
            <td className="min-w-64 px-4 py-4">
                {isPending ? (
                    <div className="space-y-2">
                        {form.errors.decision && <p className="text-xs text-destructive">{form.errors.decision}</p>}
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => review('reject')} disabled={form.processing}>
                                Reject
                            </Button>
                            <Button type="button" size="sm" onClick={() => setApprovalDialogOpen(true)} disabled={form.processing}>
                                Approve
                            </Button>
                        </div>
                        <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Approve {subscription.clinic.clinic_name}?</DialogTitle>
                                    <DialogDescription>
                                        This will activate the {subscription.plan.name} plan. Add an optional note for the clinic.
                                    </DialogDescription>
                                </DialogHeader>
                                <Textarea
                                    value={form.data.admin_note}
                                    onChange={(event) => form.setData('admin_note', event.target.value)}
                                    placeholder="Optional note for the clinic"
                                    rows={4}
                                />
                                {form.errors.decision && <p className="text-sm text-destructive">{form.errors.decision}</p>}
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setApprovalDialogOpen(false)} disabled={form.processing}>
                                        Cancel
                                    </Button>
                                    <Button type="button" onClick={() => review('approve')} disabled={form.processing}>
                                        Confirm approval
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                ) : (
                    subscription.admin_note ?? '—'
                )}
            </td>
        </tr>
    );
}
