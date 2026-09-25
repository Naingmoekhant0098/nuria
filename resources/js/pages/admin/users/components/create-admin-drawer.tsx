import { useForm } from '@inertiajs/react';
import { useState } from 'react';
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
    DrawerTrigger,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Permission = { id: number; name: string };
type RoleOption = { label: string; permissions: string[] };

export function CreateAdminDrawer({
    roles,
    permissions,
    permissionLabels,
}: {
    roles: Record<string, RoleOption>;
    permissions: Permission[];
    permissionLabels: Record<string, string>;
}) {
    const [open, setOpen] = useState(false);
    const firstRole = Object.keys(roles)[0] ?? '';
    const form = useForm({
        name: '',
        email: '',
        password: '',
        admin_role: firstRole,
        permissions: [] as string[],
    });

    const close = (nextOpen: boolean) => {
        if (!nextOpen) {
            form.clearErrors();
        }

        setOpen(nextOpen);
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post('/admin/users', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                form.setData('admin_role', firstRole);
                close(false);
            },
        });
    };

    return (
        <Drawer open={open} onOpenChange={close} direction="right">
            <DrawerTrigger asChild>
                <Button type="button">Create admin user</Button>
            </DrawerTrigger>
            <DrawerContent className="fixed inset-y-0 right-0 left-auto mt-0 h-full w-full rounded-none border-l sm:max-w-xl">
                <form onSubmit={submit} className="flex h-full flex-col">
                    <DrawerHeader className="border-b px-6 py-5 text-left">
                        <DrawerTitle>Create admin user</DrawerTitle>
                        <DrawerDescription>
                            Choose a role and any additional direct permissions
                            for this user.
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
                        <div className="grid gap-2">
                            <Label htmlFor="admin-name">Name</Label>
                            <Input
                                id="admin-name"
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                                required
                            />
                            <InputError message={form.errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="admin-email">Email</Label>
                            <Input
                                id="admin-email"
                                type="email"
                                value={form.data.email}
                                onChange={(event) =>
                                    form.setData('email', event.target.value)
                                }
                                required
                            />
                            <InputError message={form.errors.email} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="admin-password">
                                Temporary password
                            </Label>
                            <Input
                                id="admin-password"
                                type="password"
                                value={form.data.password}
                                onChange={(event) =>
                                    form.setData('password', event.target.value)
                                }
                                required
                            />
                            <InputError message={form.errors.password} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="admin-role">Role</Label>
                            <select
                                id="admin-role"
                                className="h-10 rounded-md border bg-background px-3 text-sm"
                                value={form.data.admin_role}
                                onChange={(event) =>
                                    form.setData(
                                        'admin_role',
                                        event.target.value,
                                    )
                                }
                                required
                            >
                                {Object.entries(roles).map(([name, role]) => (
                                    <option key={name} value={name}>
                                        {role.label}
                                    </option>
                                ))}
                            </select>
                            <InputError message={form.errors.admin_role} />
                        </div>

                        <fieldset className="grid gap-3">
                            <legend className="text-sm font-medium">
                                Additional direct permissions
                            </legend>
                            <p className="text-xs text-muted-foreground">
                                These permissions are granted to this user in
                                addition to the selected role.
                            </p>
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
                                        {permissionLabels[permission.name] ??
                                            permission.name}
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
                        <Button
                            type="submit"
                            disabled={
                                form.processing ||
                                Object.keys(roles).length === 0
                            }
                        >
                            Create user
                        </Button>
                    </DrawerFooter>
                </form>
            </DrawerContent>
        </Drawer>
    );
}
