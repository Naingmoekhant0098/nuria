import { Head } from '@inertiajs/react';
import { DateField } from '../reports';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Clinic = { id: number; clinic_name: string };
type Person = { id: string; first_name: string; last_name: string };
type Props = { clinics: Clinic[]; doctors: Person[]; filters: { clinic_id?: number; doctor_id?: string; status?: string; search?: string; start_date?: string; end_date?: string }; reservations: { data: Array<{ id: number; appointment_code: string; clinic: Clinic; doctor: Person; patient: Person; service: { service_name: string }; status: string; appointment_type: string; amount: string; created_at: string }>; links: Array<{ url: string | null; label: string; active: boolean }> } };

export default function ReservationReport({ clinics, doctors, filters, reservations }: Props) {
    return <><Head title="Reservation log" /><main className="flex flex-1 flex-col gap-6 p-6"><header><h1 className="text-2xl font-semibold">Reservation log</h1><p className="text-muted-foreground">Read-only reservation list with clinic, doctor, status, search, and date filters.</p></header>
        <form method="get" action="/admin/reservations" className="flex flex-wrap items-end gap-3 rounded-lg border p-4">
            <Input name="search" placeholder="Search code, patient, doctor" defaultValue={filters.search ?? ''} className="w-56" />
            <SelectField label="Clinic" name="clinic_id" value={filters.clinic_id ?? ''} options={clinics.map((c) => [c.id, c.clinic_name])} />
            <SelectField label="Doctor" name="doctor_id" value={filters.doctor_id ?? ''} options={doctors.map((d) => [d.id, `${d.first_name} ${d.last_name}`])} />
            <Input name="status" placeholder="Status" defaultValue={filters.status ?? ''} className="w-36" />
            <DateField label="Created from" name="start_date" value={filters.start_date ?? ''} /><DateField label="Created to" name="end_date" value={filters.end_date ?? ''} /><Button type="submit">Apply filters</Button>
        </form>
        <div className="overflow-x-auto rounded-lg border"><Table><TableHeader><TableRow>{['Created', 'Code', 'Clinic', 'Patient', 'Doctor', 'Service', 'Type', 'Status', 'Amount'].map((h) => <TableHead key={h}>{h}</TableHead>)}</TableRow></TableHeader><TableBody>
            {reservations.data.map((row) => <TableRow key={row.id}><TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell><TableCell>{row.appointment_code}</TableCell><TableCell>{row.clinic.clinic_name}</TableCell><TableCell>{row.patient.first_name} {row.patient.last_name}</TableCell><TableCell>{row.doctor.first_name} {row.doctor.last_name}</TableCell><TableCell>{row.service.service_name}</TableCell><TableCell>{row.appointment_type}</TableCell><TableCell>{row.status}</TableCell><TableCell>{row.amount}</TableCell></TableRow>)}
            {reservations.data.length === 0 && <TableRow><TableCell colSpan={9} className="py-8 text-center text-muted-foreground">No reservations found.</TableCell></TableRow>}
        </TableBody></Table></div><Pagination links={reservations.links} />
    </main></>;
}

function SelectField({ label, name, value, options }: { label: string; name: string; value: string | number; options: Array<[string | number, string]> }) { return <label className="grid gap-2 text-sm">{label}<select name={name} defaultValue={value} className="h-10 min-w-40 rounded-md border bg-background px-3"><option value="">All</option>{options.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>; }
function Pagination({ links }: { links: Props['reservations']['links'] }) { return <nav className="flex flex-wrap gap-2">{links.map((link, i) => <a key={`${link.label}-${i}`} href={link.url ?? undefined} aria-disabled={!link.url} className={`rounded-md border px-3 py-2 text-sm ${link.active ? 'bg-primary text-primary-foreground' : ''} ${!link.url ? 'pointer-events-none opacity-50' : ''}`} dangerouslySetInnerHTML={{ __html: link.label }} />)}</nav>; }
