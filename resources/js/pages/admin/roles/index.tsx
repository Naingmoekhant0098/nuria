import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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

type Permission = { id: number; name: string };
type Role = {
    id: number;
    name: string;
    label: string;
    permissions: string[];
    users_count: number;
};
type PageProps = {
    roles: Role[];
    permissions: Permission[];
    permissionLabels: Record<string, string>;
    flash?: { success?: string };
    errors?: Record<string, string>;
};

function labelFor(permission: string, labels: Record<string, string>): string {
    return (
        labels[permission] ??
        permission.replaceAll('.', ' ').replaceAll('_', ' ')
    );
}

function RoleDrawer({
    open,
    onOpenChange,
    role,
    permissions,
    permissionLabels,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    role: Role | null;
    permissions: Permission[];
    permissionLabels: Record<string, string>;
}) {
    const form = useForm({
        name: role?.name ?? '',
        permissions: role?.permissions ?? ([] as string[]),
    });
    const setFormData = form.setData;

    useEffect(() => {
        if (open) {
            setFormData({
                name: role?.name ?? '',
                permissions: role?.permissions ?? [],
            });
        }
    }, [open, role, setFormData]);

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
            onError: () =>
                toast.error('Could not save the role and permissions.'),
        };

        if (role) {
            form.put(`/admin/roles/${role.id}`, options);
        } else {
            form.post('/admin/roles', options);
        }
    };

    return (
        <Drawer open={open} onOpenChange={close} direction="right">
            <DrawerContent className="fixed inset-y-0 right-0 left-auto mt-0 h-full w-full rounded-none border-l sm:max-w-xl">
                <form onSubmit={submit} className="flex h-full flex-col">
                    <DrawerHeader className="border-b px-6 py-5 text-left">
                        <DrawerTitle>
                            {role ? 'Edit role' : 'Create role'}
                        </DrawerTitle>
                        <DrawerDescription>
                            Select the permissions granted to users assigned
                            this role.
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
                        <div className="grid gap-2">
                            <Label htmlFor="role-name">Role name</Label>
                            <Input
                                id="role-name"
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                                placeholder="clinic_manager"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Use letters, numbers, dashes, or underscores.
                            </p>
                            <InputError message={form.errors.name} />
                        </div>
                        <fieldset className="grid gap-3">
                            <legend className="text-sm font-medium">
                                Permissions
                            </legend>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {permissions.map((permission) => (
                                    <label
                                        key={permission.id}
                                        className="flex items-center gap-2 text-sm"
                                    >
                                        <Checkbox
                                            checked={form.data.permissions.includes(
                                                permission.name,
                                            )}
                                            onCheckedChange={(checked) =>
                                                form.setData(
                                                    'permissions',
                                                    checked === true
                                                        ? [
                                                              ...form.data
                                                                  .permissions,
                                                              permission.name,
                                                          ]
                                                        : form.data.permissions.filter(
                                                              (name) =>
                                                                  name !==
                                                                  permission.name,
                                                          ),
                                                )
                                            }
                                        />
                                        {labelFor(
                                            permission.name,
                                            permissionLabels,
                                        )}
                                    </label>
                                ))}
                            </div>
                            <InputError message={form.errors.permissions} />
                        </fieldset>
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
                            {role ? 'Save changes' : 'Create role'}
                        </Button>
                    </DrawerFooter>
                </form>
            </DrawerContent>
        </Drawer>
    );
}

export default function AdminRolesIndex() {
    const { roles, permissions, permissionLabels, flash, errors } =
        usePage<PageProps>().props;
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash]);

    const createRole = () => {
        setEditingRole(null);
        setDrawerOpen(true);
    };

    const editRole = (role: Role) => {
        setEditingRole(role);
        setDrawerOpen(true);
    };

    const deleteRole = (role: Role) => {
        if (role.users_count > 0) {
            toast.error('Reassign users before deleting this role.');

            return;
        }

        if (window.confirm(`Delete the ${role.label} role?`)) {
            router.delete(`/admin/roles/${role.id}`, {
                preserveScroll: true,
                onError: () => toast.error('Could not delete this role.'),
            });
        }
    };

    return (
        <>
            <Head title="Roles" />
            <main className="flex flex-1 flex-col gap-6 p-6">
                <header className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">Roles</h1>
                        <p className="text-muted-foreground">
                            Manage roles and the permissions they grant.
                        </p>
                    </div>
                    <Button type="button" onClick={createRole}>
                        <Plus className="mr-2 size-4" />
                        Create role
                    </Button>
                </header>

                {errors?.role && (
                    <p role="alert" className="text-sm text-destructive">
                        {errors.role}
                    </p>
                )}

                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Role</TableHead>
                                <TableHead>Permissions</TableHead>
                                <TableHead>Assigned users</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roles.map((role) => (
                                <TableRow key={role.id}>
                                    <TableCell className="font-medium">
                                        {role.label}
                                    </TableCell>
                                    <TableCell className="max-w-xl text-sm text-muted-foreground">

                                        {
                                            role.permissions.length 
                                        } Permissions
                                        {/* {role.permissions
                                            .map((permission) =>
                                                labelFor(
                                                    permission,
                                                    permissionLabels,
                                                ),
                                            )
                                            .join(' · ') ||
                                            'No permissions assigned'} */}
                                    </TableCell>
                                    <TableCell>{role.users_count}</TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => editRole(role)}
                                            >
                                                <Pencil className="mr-2 size-4" />
                                                Edit permissions
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                disabled={role.users_count > 0}
                                                title={
                                                    role.users_count > 0
                                                        ? 'Reassign users before deleting this role.'
                                                        : undefined
                                                }
                                                onClick={() => deleteRole(role)}
                                            >
                                                <Trash2 className="size-4" />
                                                <span className="sr-only">
                                                    Delete {role.label}
                                                </span>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {roles.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="text-center text-muted-foreground"
                                    >
                                        No roles have been created yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </main>
            <RoleDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                role={editingRole}
                permissions={permissions}
                permissionLabels={permissionLabels}
            />
        </>
    );
}
