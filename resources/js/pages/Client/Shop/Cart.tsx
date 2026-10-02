import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';

type Item = { id: number; clinic_id: number; name: string; unit?: string | null; quantity: number; unit_price: number; line_total: number };

export default function ShopCart({ items, subtotal, paymentMethods }: { items: Item[]; subtotal: number; paymentMethods: string[] }) {
    const clinicId = items[0]?.clinic_id;
    const form = useForm({ clinic_id: clinicId ?? '', delivery_address: '', delivery_contact: '', order_note: '', payment_method: paymentMethods[0] ?? '', transaction_code: '', payment_image: null as File | null });
    const errors = form.errors as Record<string, string | undefined>;

    function checkout(event: FormEvent) {
        event.preventDefault();
        form.post('/shop/checkout', { forceFormData: true });
    }

    return (
        <>
            <Head title="Your cart" />
            <main className="min-h-screen bg-[#F7F9FA] px-4 py-12 text-[#173B43] sm:px-8">
                <div className="mx-auto max-w-6xl">
                    <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-semibold text-[#337983]"><ArrowLeft className="size-4" />Continue shopping</Link>
                    <h1 className="mt-6 text-4xl font-semibold">Your pharmacy cart</h1>
                    <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
                        <section className="space-y-3">
                            {items.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm"><div><h2 className="font-semibold">{item.name}</h2><p className="text-sm text-[#647B81]">{item.unit || 'Health product'} · {item.unit_price.toLocaleString()} MMK</p></div><div className="flex items-center gap-3"><button type="button" onClick={() => item.quantity > 1 && router.patch(`/shop/cart/items/${item.id}`, { quantity: item.quantity - 1 }, { preserveScroll: true })} className="rounded-full border p-1"><Minus className="size-4" /></button><span className="w-5 text-center">{item.quantity}</span><button type="button" onClick={() => router.patch(`/shop/cart/items/${item.id}`, { quantity: item.quantity + 1 }, { preserveScroll: true })} className="rounded-full border p-1"><Plus className="size-4" /></button><button type="button" onClick={() => router.delete(`/shop/cart/items/${item.id}`, { preserveScroll: true })} className="ml-2 rounded-full p-2 text-red-500 hover:bg-red-50"><Trash2 className="size-4" /></button></div></div>)}
                            {items.length === 0 && <div className="rounded-3xl bg-white p-12 text-center text-[#647B81]">Your cart is empty.</div>}
                        </section>
                        {items.length > 0 && <form onSubmit={checkout} className="space-y-4 rounded-3xl bg-white p-6 shadow-sm"><div className="flex items-center justify-between border-b pb-4"><span className="text-[#647B81]">Subtotal</span><strong className="text-xl">{subtotal.toLocaleString()} MMK</strong></div><input required value={form.data.delivery_address} onChange={(event) => form.setData('delivery_address', event.target.value)} placeholder="Delivery address" className="w-full rounded-xl border px-4 py-3" /><input required value={form.data.delivery_contact} onChange={(event) => form.setData('delivery_contact', event.target.value)} placeholder="Contact number" className="w-full rounded-xl border px-4 py-3" /><select required value={form.data.payment_method} onChange={(event) => form.setData('payment_method', event.target.value)} className="w-full rounded-xl border px-4 py-3">{paymentMethods.map((method) => <option key={method}>{method}</option>)}</select><input value={form.data.transaction_code} onChange={(event) => form.setData('transaction_code', event.target.value)} placeholder="Transaction code (if applicable)" className="w-full rounded-xl border px-4 py-3" /><input type="file" accept="image/*" onChange={(event) => form.setData('payment_image', event.target.files?.[0] ?? null)} className="w-full rounded-xl border px-4 py-3 text-sm" /><textarea value={form.data.order_note} onChange={(event) => form.setData('order_note', event.target.value)} placeholder="Order note (optional)" className="min-h-24 w-full rounded-xl border px-4 py-3" /><button disabled={form.processing} className="w-full rounded-xl bg-[#173B43] px-5 py-3 font-semibold text-white disabled:opacity-50">Place order</button>{errors.cart && <p className="text-sm text-red-600">{errors.cart}</p>}</form>}
                    </div>
                </div>
            </main>
        </>
    );
}
