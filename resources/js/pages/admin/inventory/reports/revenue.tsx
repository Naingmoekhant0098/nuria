import { Head } from '@inertiajs/react';
import { DateField } from '../reports';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Clinic = { id: number; clinic_name: string };
type Person = { first_name: string; last_name: string };
type FinancialRow = {
    id: number;
    amount?: string;
    total?: string;
    created_at: string;
    appointment_code?: string;
    clinic?: Clinic;
    patient?: Person;
    status?: string;
    reservation?: { appointment_code: string; clinic: Clinic; patient: Person };
    payment_method?: string;
    payment_status?: string;
    clinic_id?: number;
    prescription_id?: number;
};
type Props = {
    reportType: 'reservation_charges' | 'reservation_payments' | 'prescription_sales';
    title: string;
    filters: { clinic_id?: number; start_date?: string; end_date?: string };
    clinics: Clinic[];
    total: number;
    rows: { data: FinancialRow[]; links: Array<{ url: string | null; label: string; active: boolean }> };
};

const money = (value: number | string) => `${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MMK`;

export default function FinancialReport({ reportType, title, filters, clinics, total, rows }: Props) {
    const action = reportType === 'reservation_charges'
        ? '/admin/inventory/reports/reservation-charges'
        : reportType === 'reservation_payments'
            ? '/admin/inventory/reports/reservation-payments'
            : '/admin/inventory/reports/prescription-sales';
    const headers = reportType === 'reservation_charges'
        ? ['Date', 'Clinic', 'Appointment', 'Patient', 'Status', 'Charge']
        : reportType === 'reservation_payments'
            ? ['Date', 'Clinic', 'Appointment', 'Patient', 'Method', 'Payment status', 'Amount']
            : ['Date', 'Clinic ID', 'Prescription', 'Payment status', 'Sale total'];
    const reportRows = rows.data.map((row) => {
        if (reportType === 'reservation_charges') {
            return [new Date(row.created_at).toLocaleDateString(), row.clinic?.clinic_name ?? '—', row.appointment_code ?? '—', personName(row.patient), row.status ?? '—', money(row.amount ?? 0)];
        }
        if (reportType === 'reservation_payments') {
            return [new Date(row.created_at).toLocaleDateString(), row.reservation?.clinic.clinic_name ?? '—', row.reservation?.appointment_code ?? '—', personName(row.reservation?.patient), row.payment_method ?? '—', row.payment_status ?? '—', money(row.amount ?? 0)];
        }
        return [new Date(row.created_at).toLocaleDateString(), row.clinic_id ?? '—', row.prescription_id ?? '—', row.payment_status ?? '—', money(row.total ?? 0)];
    });

    return <><Head title={title} /><main className="flex flex-1 flex-col gap-6 p-6">
        <header><h1 className="text-2xl font-semibold">{title}</h1><p className="text-muted-foreground">Review {title.toLowerCase()} by clinic and date.</p></header>
        <form method="get" action={action} className="flex flex-wrap items-end gap-3 rounded-lg border p-4">
            <label className="grid gap-2 text-sm">Clinic<select name="clinic_id" defaultValue={filters.clinic_id ?? ''} className="h-10 min-w-48 rounded-md border bg-background px-3"><option value="">All clinics</option>{clinics.map((clinic) => <option key={clinic.id} value={clinic.id}>{clinic.clinic_name}</option>)}</select></label>
            <DateField label="From" name="start_date" value={filters.start_date ?? ''} /><DateField label="To" name="end_date" value={filters.end_date ?? ''} /><Button type="submit">Apply filters</Button>
        </form>
        <ReportTable title="Financial total" headers={['Category', 'Total amount']} rows={[[title, money(total)]]} />
        <ReportTable title={`${title} list`} headers={headers} rows={reportRows} />
        <Pagination links={rows.links} />
    </main></>;
}

function personName(person?: Person) { return person ? `${person.first_name} ${person.last_name}` : '—'; }

function ReportTable({ title, headers, rows }: { title: string; headers: string[]; rows: (string | number)[][] }) { return <section className="space-y-3"><h2 className="text-lg font-semibold">{title}</h2><div className="overflow-x-auto rounded-lg border"><Table><TableHeader><TableRow>{headers.map((heading) => <TableHead key={heading}>{heading}</TableHead>)}</TableRow></TableHeader><TableBody>{rows.map((row, i) => <TableRow key={i}>{row.map((cell, j) => <TableCell key={j}>{cell}</TableCell>)}</TableRow>)}{rows.length === 0 && <TableRow><TableCell colSpan={headers.length} className="py-8 text-center text-muted-foreground">No financial records found.</TableCell></TableRow>}</TableBody></Table></div></section>; }

function Pagination({ links }: { links: Props['rows']['links'] }) { return <nav className="flex flex-wrap gap-2">{links.map((link, i) => <a key={`${link.label}-${i}`} href={link.url ?? undefined} aria-disabled={!link.url} className={`rounded-md border px-3 py-2 text-sm ${link.active ? 'bg-primary text-primary-foreground' : ''} ${!link.url ? 'pointer-events-none opacity-50' : ''}`} dangerouslySetInnerHTML={{ __html: link.label }} />)}</nav>; }
