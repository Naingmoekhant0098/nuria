import { Head } from '@inertiajs/react';
import { DateField } from '../reports';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Clinic = { id: number; clinic_name: string };
type Transaction = { id: number; clinic: Clinic; drug: { name: string } | null; medical_product: { name: string } | null; transaction_type: string; quantity: number; reference: string | null; created_at: string };
type Props = { clinics: Clinic[]; filters: { clinic_id?: number; start_date?: string; end_date?: string; item_type?: string }; transactions: { data: Transaction[]; links: Array<{ url: string | null; label: string; active: boolean }> } };

export default function InventoryMovementsReport({ clinics, filters, transactions }: Props) {
    return <><Head title="Recent inventory movements" /><main className="flex flex-1 flex-col gap-6 p-6">
        <header><h1 className="text-2xl font-semibold">Recent inventory movements</h1><p className="text-muted-foreground">Filter stock additions and adjustments by date, clinic, and item type.</p></header>
        <form method="get" action="/admin/inventory/reports/movements" className="flex flex-wrap items-end gap-3 rounded-lg border p-4">
            <label className="grid gap-2 text-sm">Clinic<select name="clinic_id" defaultValue={filters.clinic_id ?? ''} className="h-10 min-w-48 rounded-md border bg-background px-3"><option value="">All clinics</option>{clinics.map((clinic) => <option key={clinic.id} value={clinic.id}>{clinic.clinic_name}</option>)}</select></label>
            <label className="grid gap-2 text-sm">Item type<select name="item_type" defaultValue={filters.item_type ?? ''} className="h-10 rounded-md border bg-background px-3"><option value="">All items</option><option value="drug">Drug</option><option value="medical_product">Medical product</option></select></label>
            <DateField label="From" name="start_date" value={filters.start_date ?? ''} /><DateField label="To" name="end_date" value={filters.end_date ?? ''} /><Button type="submit">Apply filters</Button>
        </form>
        <div className="overflow-x-auto rounded-lg border"><Table><TableHeader><TableRow>{['Date', 'Clinic', 'Item', 'Movement type', 'Quantity', 'Reference'].map((heading) => <TableHead key={heading}>{heading}</TableHead>)}</TableRow></TableHeader><TableBody>
            {transactions.data.map((transaction) => <TableRow key={transaction.id}><TableCell>{new Date(transaction.created_at).toLocaleString()}</TableCell><TableCell>{transaction.clinic.clinic_name}</TableCell><TableCell>{transaction.drug?.name ?? transaction.medical_product?.name ?? 'Deleted catalog item'}</TableCell><TableCell>{transaction.transaction_type}</TableCell><TableCell>{transaction.quantity.toLocaleString()}</TableCell><TableCell>{transaction.reference ?? '—'}</TableCell></TableRow>)}
            {transactions.data.length === 0 && <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No inventory movements found.</TableCell></TableRow>}
        </TableBody></Table></div><Pagination links={transactions.links} />
    </main></>;
}

function Pagination({ links }: { links: Props['transactions']['links'] }) { return <nav className="flex flex-wrap gap-2">{links.map((link, index) => <a key={`${link.label}-${index}`} href={link.url ?? undefined} aria-disabled={!link.url} className={`rounded-md border px-3 py-2 text-sm ${link.active ? 'bg-primary text-primary-foreground' : ''} ${!link.url ? 'pointer-events-none opacity-50' : ''}`} dangerouslySetInnerHTML={{ __html: link.label }} />)}</nav>; }
