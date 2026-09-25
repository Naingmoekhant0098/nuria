import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Clinic = { id: number; clinic_name: string };
type Drug = { id: number; name: string; strength: string | null };
type MedicalProduct = { id: number; name: string };
type StockProps = {
    clinics: Clinic[];
    drugs: Drug[];
    medicalProducts: MedicalProduct[];
    flash?: { success?: string };
    [key: string]: unknown;
};

export default function ClinicStock() {
    const { clinics, drugs, medicalProducts, flash } = usePage<StockProps>().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        clinic_id: '',
        stock_type: 'drug',
        item_id: '',
        quantity: 1,
        batch_number: '',
        expiry_date: '',
        purchase_price: 0,
        sale_price: 0,
        reference: '',
    });
    const [drawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash]);

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post('/admin/inventory/stock', {
            onSuccess: () => {
                reset();
                setDrawerOpen(false);
            },
        });
    };

    const products = data.stock_type === 'drug' ? drugs : medicalProducts;

    return (
        <>
            <Head title="Assign clinic stock" />
            <main className="flex flex-1 flex-col gap-8 p-6">
                <header className="flex flex-wrap items-center justify-between gap-3">
                    <div><h1 className="text-2xl font-semibold">Clinic stock</h1><p className="text-muted-foreground">Assign stock to clinics and open separate stock lists.</p></div>
                    <Button type="button" onClick={() => setDrawerOpen(true)}><Plus className="mr-2 size-4" />Assign stock</Button>
                </header>

                <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} direction="right">
                    <DrawerContent className="fixed inset-y-0 right-0 left-auto mt-0 h-full w-full rounded-none border-l sm:max-w-xl">
                    <DrawerHeader className="border-b px-6 py-5"><DrawerTitle>Assign stock to a clinic</DrawerTitle></DrawerHeader>
                    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
                        <div className="grid gap-2">
                            <Label htmlFor="clinic">Clinic</Label>
                            <select id="clinic" className="h-10 rounded-md border bg-background px-3 text-sm" value={data.clinic_id} onChange={(event) => setData('clinic_id', event.target.value)} required>
                                <option value="">Select clinic</option>
                                {clinics.map((clinic) => <option key={clinic.id} value={clinic.id}>{clinic.clinic_name}</option>)}
                            </select>
                            <InputError message={errors.clinic_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="stock-type">Item type</Label>
                            <select id="stock-type" className="h-10 rounded-md border bg-background px-3 text-sm" value={data.stock_type} onChange={(event) => { setData('stock_type', event.target.value); setData('item_id', ''); }}>
                                <option value="drug">Drug</option>
                                <option value="medical_product">Medical product</option>
                            </select>
                            <InputError message={errors.stock_type} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="item">{data.stock_type === 'drug' ? 'Drug' : 'Medical product'}</Label>
                            <select id="item" className="h-10 rounded-md border bg-background px-3 text-sm" value={data.item_id} onChange={(event) => setData('item_id', event.target.value)} required>
                                <option value="">Select item</option>
                                {products.map((item) => <option key={item.id} value={item.id}>{item.name}{'strength' in item && item.strength ? ` · ${item.strength}` : ''}</option>)}
                            </select>
                            <InputError message={errors.item_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="quantity">Quantity to add</Label>
                            <Input id="quantity" type="number" min={1} value={data.quantity} onChange={(event) => setData('quantity', Number(event.target.value))} required />
                            <InputError message={errors.quantity} />
                        </div>
                        {data.stock_type === 'drug' ? (
                            <>
                                <Field label="Batch number" id="batch-number" value={data.batch_number} onChange={(value) => setData('batch_number', value)} error={errors.batch_number} required />
                                <Field label="Expiry date" id="expiry-date" type="date" value={data.expiry_date} onChange={(value) => setData('expiry_date', value)} error={errors.expiry_date} required />
                                <Field label="Purchase price per base unit" id="purchase-price" type="number" value={String(data.purchase_price)} onChange={(value) => setData('purchase_price', Number(value))} error={errors.purchase_price} required />
                            </>
                        ) : (
                            <Field label="Sale price per unit" id="sale-price" type="number" value={String(data.sale_price)} onChange={(value) => setData('sale_price', Number(value))} error={errors.sale_price} required />
                        )}
                        <Field label="Reference (optional)" id="reference" value={data.reference} onChange={(value) => setData('reference', value)} error={errors.reference} />
                        <div className="flex justify-end">
                            <Button type="submit" disabled={processing}>{processing ? 'Assigning…' : 'Assign stock'}</Button>
                        </div>
                    </form>
                    </DrawerContent>
                </Drawer>

                <section className="space-y-3"><h2 className="text-lg font-semibold">Clinic stock lists</h2><div className="overflow-x-auto rounded-lg border"><Table><TableHeader><TableRow><TableHead>List</TableHead><TableHead>Description</TableHead><TableHead /></TableRow></TableHeader><TableBody>
                    <TableRow><TableCell className="font-medium">Drug batches by clinic</TableCell><TableCell>View batches, expiry dates, and quantities by clinic.</TableCell><TableCell className="text-right"><Button asChild variant="outline" size="sm"><Link href="/admin/inventory/reports/drugs">Open list</Link></Button></TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Medical product stock by clinic</TableCell><TableCell>View medical product quantities and update dates by clinic.</TableCell><TableCell className="text-right"><Button asChild variant="outline" size="sm"><Link href="/admin/inventory/reports/medical-products">Open list</Link></Button></TableCell></TableRow>
                </TableBody></Table></div></section>
            </main>
        </>
    );
}

function Field({ label, id, value, onChange, error, type = 'text', required = false }: {
    label: string;
    id: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    type?: string;
    required?: boolean;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} min={type === 'number' ? 0 : undefined} />
            <InputError message={error} />
        </div>
    );
}
