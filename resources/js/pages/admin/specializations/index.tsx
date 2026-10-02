import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type Specialization = {
    id: number;
    name: string;
    description: string | null;
    doctors_count: number;
    created_at: string;
};

type PageProps = {
    specializations: Specialization[];
    filters?: { search?: string };
    flash?: { success?: string };
    errors?: Record<string, string>;
};

function SpecializationDrawer({
    open,
    onOpenChange,
    specialization,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    specialization: Specialization | null;
}) {
    const form = useForm({
        name: specialization?.name ?? '',
        description: specialization?.description ?? '',
    });
    const setFormData = form.setData;

    useEffect(() => {
        if (open) {
            setFormData({
                name: specialization?.name ?? '',
                description: specialization?.description ?? '',
            });
        }
    }, [open, specialization, setFormData]);

    const close = (nextOpen: boolean) => {
        if (!nextOpen) {
            form.clearErrors();
        }

        onOpenChange(nextOpen);
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                close(false);
            },
            onError: () => toast.error('Could not save the specialization.'),
        };

        if (specialization) {
            form.put(`/admin/specializations/${specialization.id}`, options);
        } else {
            form.post('/admin/specializations', options);
        }
    };

    return (
        <Drawer open={open} onOpenChange={close} direction="right">
            <DrawerContent className="fixed inset-y-0 right-0 left-auto mt-0 h-full w-full rounded-none border-l sm:max-w-xl">
                <form onSubmit={submit} className="flex h-full flex-col">
                    <DrawerHeader className="border-b px-6 py-5 text-left">
                        <DrawerTitle>
                            {specialization
                                ? 'Edit specialization'
                                : 'Create specialization'}
                        </DrawerTitle>
                        <DrawerDescription>
                            {specialization
                                ? 'Update the specialization name and description.'
                                : 'Add a new doctor specialization.'}
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
                        <div className="grid gap-2">
                            <Label htmlFor="specialization-name">Name</Label>
                            <Input
                                id="specialization-name"
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                                placeholder="e.g. Cardiology"
                                required
                            />
                            <InputError message={form.errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="specialization-description">
                                Description
                            </Label>
                            <textarea
                                id="specialization-description"
                                value={form.data.description ?? ''}
                                onChange={(event) =>
                                    form.setData(
                                        'description',
                                        event.target.value,
                                    )
                                }
                                className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm"
                                placeholder="Brief description of this specialization"
                            />
                            <InputError message={form.errors.description} />
                        </div>
                    </div>
                    <DrawerFooter className="border-t px-6 py-4 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => close(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing
                                ? 'Saving…'
                                : specialization
                                  ? 'Save changes'
                                  : 'Create specialization'}
                        </Button>
                    </DrawerFooter>
                </form>
            </DrawerContent>
        </Drawer>
    );
}

export default function AdminSpecializationsIndex() {
    const { specializations, filters, flash, errors } =
        usePage<PageProps>().props;
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingSpecialization, setEditingSpecialization] =
        useState<Specialization | null>(null);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash]);

    const createSpecialization = () => {
        setEditingSpecialization(null);
        setDrawerOpen(true);
    };

    const editSpecialization = (specialization: Specialization) => {
        setEditingSpecialization(specialization);
        setDrawerOpen(true);
    };

    const deleteSpecialization = (specialization: Specialization) => {
        if (
            !window.confirm(
                `Delete the "${specialization.name}" specialization?`,
            )
        ) {
            return;
        }

        router.delete(`/admin/specializations/${specialization.id}`, {
            preserveScroll: true,
            onError: () => toast.error('Could not delete this specialization.'),
        });
    };

    return (
        <>
            <Head title="Specializations" />
            <main className="flex flex-1 flex-col gap-6 p-6">
                <header className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Specializations
                        </h1>
                        <p className="text-muted-foreground">
                            Manage doctor specializations used across the
                            clinic.
                        </p>
                    </div>
                    <Button type="button" onClick={createSpecialization}>
                        <Plus className="mr-2 size-4" />
                        Create specialization
                    </Button>
                </header>

                {errors?.specialization && (
                    <p role="alert" className="text-sm text-destructive">
                        {errors.specialization}
                    </p>
                )}

                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Doctors</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {specializations.map((specialization) => (
                                <TableRow key={specialization.id}>
                                    <TableCell className="font-medium">
                                        {specialization.name}
                                    </TableCell>
                                    <TableCell className="max-w-md text-sm text-muted-foreground">
                                        {specialization.description ?? '—'}
                                    </TableCell>
                                    <TableCell>
                                        {specialization.doctors_count}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    editSpecialization(
                                                        specialization,
                                                    )
                                                }
                                            >
                                                <Pencil className="mr-2 size-4" />
                                                Edit
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                disabled={
                                                    specialization.doctors_count >
                                                    0
                                                }
                                                title={
                                                    specialization.doctors_count >
                                                    0
                                                        ? 'Reassign doctors before deleting this specialization.'
                                                        : undefined
                                                }
                                                onClick={() =>
                                                    deleteSpecialization(
                                                        specialization,
                                                    )
                                                }
                                            >
                                                <Trash2 className="size-4" />
                                                <span className="sr-only">
                                                    Delete {specialization.name}
                                                </span>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {specializations.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="text-center text-muted-foreground"
                                    >
                                        No specializations have been created
                                        yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </main>
            <SpecializationDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                specialization={editingSpecialization}
            />
        </>
    );
}
