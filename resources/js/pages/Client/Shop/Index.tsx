import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowRight, ImageIcon, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

type Product = {
    key: string;
    item_type: 'drug' | 'medical_product';
    item_id: number;
    clinic_id: number;
    drug_unit_id?: number;
    name: string;
    subtitle?: string | null;
    clinic_name: string;
    image_url?: string | null;
    price: number;
};

type Clinic = { id: number; clinic_name: string };

export default function ShopIndex({ products, cartCount, clinics, filters }: { products: Product[]; cartCount: number; clinics: Clinic[]; filters: { search?: string; type?: string; clinic_id?: number } }) {
    const { auth } = usePage<{ auth: { user: { id: string } | null } }>().props;
    const [addingKey, setAddingKey] = useState<string | null>(null);
    const [addError, setAddError] = useState<string | null>(null);

    function applyFilters(values: Record<string, string>) {
        router.get('/shop', values, { preserveState: true, preserveScroll: true, replace: true });
    }

    function add(product: Product) {
        if (product.item_type === 'drug' && !product.drug_unit_id) return;

        if (!auth.user) {
            router.visit('/login');
            return;
        }

        setAddingKey(product.key);
        setAddError(null);
        router.post('/shop/cart/items', {
            clinic_id: product.clinic_id,
            item_type: product.item_type,
            item_id: product.item_id,
            drug_unit_id: product.drug_unit_id,
            quantity: 1,
        }, {
            preserveScroll: true,
            onError: (errors) => {
                setAddError(Object.values(errors)[0] ?? 'Unable to add this item to your cart.');
            },
            onFinish: () => setAddingKey(null),
        });
    }

    return (
        <>
            <Head title="Health shop" />
            <main className="min-h-screen bg-[#F7F9FA] px-4 py-12 text-[#173B43] sm:px-8 lg:px-12">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                        <div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#337983]">Nuria pharmacy</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">Care essentials, from trusted clinics.</h1><p className="mt-3 max-w-xl text-[#647B81]">Order medicines and health products from active clinics and follow every order from your patient dashboard.</p></div>
                        <Link href="/shop/cart" className="inline-flex items-center gap-2 rounded-full bg-[#173B43] px-5 py-3 text-sm font-semibold text-white">Cart{cartCount ? ` · ${cartCount}` : ''}<ArrowRight className="size-4" /></Link>
                    </div>
                    <div className="mb-8 grid gap-3 rounded-3xl bg-white p-4 shadow-sm sm:grid-cols-[1fr_180px_180px_auto]">
                        <input defaultValue={filters.search ?? ''} onKeyDown={(event) => event.key === 'Enter' && applyFilters({ search: event.currentTarget.value, type: filters.type ?? '', clinic_id: filters.clinic_id ? String(filters.clinic_id) : '' })} placeholder="Search medicines and health products" className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#337983]" />
                        <select value={filters.type ?? ''} onChange={(event) => applyFilters({ search: filters.search ?? '', type: event.target.value, clinic_id: filters.clinic_id ? String(filters.clinic_id) : '' })} className="rounded-xl border border-slate-200 px-4 py-3 text-sm"><option value="">All items</option><option value="drug">Medicines</option><option value="medical_product">Health products</option></select>
                        <select value={filters.clinic_id ? String(filters.clinic_id) : ''} onChange={(event) => applyFilters({ search: filters.search ?? '', type: filters.type ?? '', clinic_id: event.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 text-sm"><option value="">All clinics</option>{clinics.map((clinic) => <option key={clinic.id} value={clinic.id}>{clinic.clinic_name}</option>)}</select>
                        <button type="button" onClick={() => applyFilters({})} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-[#337983]">Clear</button>
                    </div>
                    {addError && <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{addError}</div>}
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {products.map((product) => <article key={product.key} className="overflow-hidden rounded-[1.5rem] bg-white shadow-[0_8px_30px_rgba(31,58,67,0.07)]">
                            <div className="aspect-[4/3] bg-[#E3EEF1]">{product.image_url ? <img src={product.image_url} alt={product.name} className="size-full object-cover" /> : <div className="grid size-full place-items-center text-[#337983]/60"><ImageIcon className="size-10" /></div>}</div>
                            <div className="p-5"><p className="text-xs font-medium uppercase tracking-wide text-[#7D969B]">{product.clinic_name}</p><h2 className="mt-2 text-lg font-semibold">{product.name}</h2><p className="mt-1 min-h-5 text-sm text-[#647B81]">{product.subtitle || 'Health product'}</p><div className="mt-5 flex items-center justify-between gap-3"><span className="font-semibold text-[#337983]">{product.price.toLocaleString()} MMK</span><button type="button" disabled={addingKey === product.key} onClick={() => add(product)} className="inline-flex items-center gap-2 rounded-full bg-[#337983] px-4 py-2 text-sm font-semibold text-white hover:bg-[#28656d] disabled:cursor-wait disabled:opacity-60"><ShoppingBag className="size-4" />{addingKey === product.key ? 'Adding…' : auth.user ? 'Add' : 'Log in to add'}</button></div></div>
                        </article>)}
                    </div>
                    {products.length === 0 && <div className="rounded-3xl bg-white p-12 text-center text-[#647B81]">No pharmacy products are available right now.</div>}
                </div>
            </main>
        </>
    );
}
