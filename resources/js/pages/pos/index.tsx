import { router, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Unit = { id: number; unit_name: string; conversion_quantity: number; sale_price: string };
type Drug = { drug_id: number; drug: { id: number; name: string; strength?: string; units: Unit[] }; sale_price_override?: string; available_base_quantity: number };
type Product = { medical_product_id: number; quantity: number; sale_price: string; product: { name: string } };
type CartItem = { key: string; item_type: 'drug' | 'medical_product' | 'service'; drug_id?: number; drug_unit_id?: number; medical_product_id?: number; description: string; quantity: number; base_quantity?: number; unit_price: number };
type CheckoutContext = { consultation_id: number; reservation_id: number; patient_id: string; prescription_id?: number | null; items: CartItem[] } | null;

export default function PosIndex() {
    const { drugs, medicalProducts, reservations, patients, checkoutContext } = usePage<{
        drugs: Drug[];
        medicalProducts: Product[];
        reservations: { id: number; patient: { first_name: string; last_name: string } }[];
        patients: { id: string; first_name: string; last_name: string }[];
        checkoutContext?: CheckoutContext;
    }>().props;
    const [cart, setCart] = useState<CartItem[]>(checkoutContext?.items ?? []);
    const [saleType, setSaleType] = useState<'external' | 'reservation'>(checkoutContext ? 'reservation' : 'external');
    const [reservationId, setReservationId] = useState(checkoutContext?.reservation_id?.toString() ?? '');
    const [patientId, setPatientId] = useState(checkoutContext?.patient_id ?? '');
    const [discount, setDiscount] = useState(0);
    const [tax, setTax] = useState(0);
    const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.quantity * item.unit_price, 0), [cart]);
    const add = (item: CartItem) => setCart((items) => [...items.filter((cartItem) => cartItem.key !== item.key), item]);
    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.post('/clinic/pos', {
            sale_type: saleType,
            reservation_id: saleType === 'reservation' ? reservationId : null,
            patient_id: patientId || null,
            prescription_id: checkoutContext?.prescription_id ?? null,
            payment_method: 'Cash',
            discount,
            tax,
            items: cart,
        });
    };

    return <main className="min-h-screen bg-black p-6 text-white">
        <h1 className="mb-2 text-2xl font-bold">Pharmacy POS</h1>
        {checkoutContext && <p className="mb-6 text-sm text-emerald-400">Checkout for consultation #{checkoutContext.consultation_id}{checkoutContext.prescription_id ? ' — prescription items added to cart.' : ''}</p>}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(360px,1fr)]">
            <section className="space-y-6">
                <ItemTable title="Drugs" headers={['Drug', 'Available base units', 'Sale unit', 'Price', 'Quantity', '']}>
                    {drugs.map((drug) => <DrugRow key={drug.drug_id} drug={drug} onAdd={add} />)}
                </ItemTable>
                <ItemTable title="Medical products" headers={['Product', 'Available', 'Price', 'Quantity', '']}>
                    {medicalProducts.map((product) => <MedicalProductRow key={product.medical_product_id} product={product} onAdd={add} />)}
                </ItemTable>
            </section>

            <form className="h-fit space-y-4 rounded border border-neutral-800 p-4" onSubmit={submit}>
                {!checkoutContext && <div className="flex gap-2"><Button type="button" variant={saleType === 'external' ? 'default' : 'outline'} onClick={() => setSaleType('external')}>External</Button><Button type="button" variant={saleType === 'reservation' ? 'default' : 'outline'} onClick={() => setSaleType('reservation')}>Reservation</Button></div>}
                {saleType === 'reservation' ? <select className="h-10 w-full rounded border border-neutral-700 bg-neutral-900 px-3" value={reservationId} onChange={(event) => setReservationId(event.target.value)} required disabled={Boolean(checkoutContext)}><option value="">Select checked-in reservation</option>{reservations.map((reservation) => <option key={reservation.id} value={reservation.id}>{reservation.patient.first_name} {reservation.patient.last_name}</option>)}</select> : <select className="h-10 w-full rounded border border-neutral-700 bg-neutral-900 px-3" value={patientId} onChange={(event) => setPatientId(event.target.value)}><option value="">Walk-in / no patient</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.first_name} {patient.last_name}</option>)}</select>}
                <h2 className="text-lg font-semibold">Cart</h2>
                <div className="overflow-x-auto rounded border border-neutral-800"><Table><TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Qty</TableHead><TableHead>Unit price</TableHead><TableHead>Total</TableHead><TableHead /></TableRow></TableHeader><TableBody>
                    {cart.map((item) => <TableRow key={item.key}><TableCell>{item.description}</TableCell><TableCell><Input className="h-8 w-20" type="number" min="1" value={item.quantity} onChange={(event) => setCart(cart.map((cartItem) => cartItem.key === item.key ? { ...cartItem, quantity: Number(event.target.value) } : cartItem))} /></TableCell><TableCell>{item.unit_price.toLocaleString()} MMK</TableCell><TableCell>{(item.quantity * item.unit_price).toLocaleString()} MMK</TableCell><TableCell><Button type="button" variant="ghost" size="sm" onClick={() => setCart(cart.filter((cartItem) => cartItem.key !== item.key))}>Remove</Button></TableCell></TableRow>)}
                    {cart.length === 0 && <TableRow><TableCell colSpan={5} className="py-6 text-center text-neutral-400">Cart is empty.</TableCell></TableRow>}
                </TableBody></Table></div>
                <Input className="border-neutral-700 bg-neutral-900" type="number" min="0" value={discount} onChange={(event) => setDiscount(Number(event.target.value))} placeholder="Discount (MMK)" />
                <Input className="border-neutral-700 bg-neutral-900" type="number" min="0" value={tax} onChange={(event) => setTax(Number(event.target.value))} placeholder="Tax (MMK)" />
                <p className="text-xl font-bold">Total: {(subtotal - discount + tax).toLocaleString()} MMK</p>
                <Button type="submit" disabled={!cart.length}>Complete sale</Button>
            </form>
        </div>
    </main>;
}

function DrugRow({ drug, onAdd }: { drug: Drug; onAdd: (item: CartItem) => void }) {
    const [unitId, setUnitId] = useState(drug.drug.units[0]?.id ?? 0);
    const [quantity, setQuantity] = useState(1);
    const unit = drug.drug.units.find((candidate) => candidate.id === unitId);
    const price = Number(drug.sale_price_override ?? unit?.sale_price ?? 0);
    const available = unit ? Math.floor(drug.available_base_quantity / unit.conversion_quantity) : 0;

    return <TableRow><TableCell className="font-medium">{drug.drug.name}{drug.drug.strength ? ` · ${drug.drug.strength}` : ''}</TableCell><TableCell>{drug.available_base_quantity.toLocaleString()}</TableCell><TableCell><select className="h-9 rounded border border-neutral-700 bg-neutral-900 px-2" value={unitId} onChange={(event) => setUnitId(Number(event.target.value))}>{drug.drug.units.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.unit_name}</option>)}</select></TableCell><TableCell>{price.toLocaleString()} MMK</TableCell><TableCell><Input className="h-9 w-20 border-neutral-700 bg-neutral-900" type="number" min="1" max={available} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} /></TableCell><TableCell><Button type="button" size="sm" disabled={!unit || quantity > available} onClick={() => unit && onAdd({ key: `d-${drug.drug_id}-${unit.id}`, item_type: 'drug', drug_id: drug.drug_id, drug_unit_id: unit.id, description: `${drug.drug.name} (${unit.unit_name})`, quantity, unit_price: price })}>Add</Button></TableCell></TableRow>;
}

function MedicalProductRow({ product, onAdd }: { product: Product; onAdd: (item: CartItem) => void }) {
    const [quantity, setQuantity] = useState(1);
    return <TableRow><TableCell className="font-medium">{product.product.name}</TableCell><TableCell>{product.quantity.toLocaleString()}</TableCell><TableCell>{product.sale_price} MMK</TableCell><TableCell><Input className="h-9 w-20 border-neutral-700 bg-neutral-900" type="number" min="1" max={product.quantity} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} /></TableCell><TableCell><Button type="button" size="sm" disabled={!product.quantity || quantity > product.quantity} onClick={() => onAdd({ key: `m-${product.medical_product_id}`, item_type: 'medical_product', medical_product_id: product.medical_product_id, description: product.product.name, quantity, unit_price: Number(product.sale_price) })}>Add</Button></TableCell></TableRow>;
}

function ItemTable({ title, headers, children }: { title: string; headers: string[]; children: React.ReactNode }) {
    return <section className="space-y-3"><h2 className="text-lg font-semibold">{title}</h2><div className="overflow-x-auto rounded border border-neutral-800"><Table><TableHeader><TableRow>{headers.map((header) => <TableHead key={header}>{header}</TableHead>)}</TableRow></TableHeader><TableBody>{children}</TableBody></Table></div></section>;
}
