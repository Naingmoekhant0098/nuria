import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { CreateAdminDrawer } from './components/create-admin-drawer';

type AdminUser = {
    id: number;
    name: string;
    email: string;
    admin_role: string;
    permissions: string[];
};

type RoleOption = { label: string; permissions: string[] };

type PageProps = {
    users: {
        data: AdminUser[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    roles: Record<string, RoleOption>;
    permissions: { id: number; name: string }[];
    permissionLabels: Record<string, string>;
    flash?: { success?: string };
    filters?: { search?: string };
    [key: string]: unknown;
};

export default function AdminUsersIndex() {
    const { users, roles, permissions, permissionLabels, flash, filters } =
        usePage<PageProps>().props;
    const [search, setSearch] = useState(filters?.search ?? '');

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash]);

    const deleteAdmin = (user: AdminUser) => {
        if (window.confirm(`Remove admin access for ${user.email}?`)) {
            router.delete(`/admin/users/${user.id}`);
        }
    };

    const updateAdminRole = (user: AdminUser, adminRole: string) => {
        router.put(
            `/admin/users/${user.id}`,
            { admin_role: adminRole },
            {
                preserveScroll: true,
                onError: (roleErrors) =>
                    toast.error(
                        roleErrors.admin_role ??
                            roleErrors.admin ??
                            'Unable to update admin role.',
                    ),
            },
        );
    };

    return (
        <>
            <Head title="Admin users" />
            <main className="flex flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Admin users</h1>
                    <p className="text-muted-foreground">
                        {users.total} accounts can access the admin portal.
                        Assign each account a role to control its permissions.
                    </p>
                </div>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        router.get(
                            '/admin/users',
                            { search: search || undefined },
                            { preserveState: true, replace: true },
                        );
                    }}
                    className="flex max-w-xl gap-2"
                >
                    <Input
                        aria-label="Search admin users"
                        placeholder="Search by name or email"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    <Button type="submit" variant="secondary">
                        Search
                    </Button>
                </form>

                <div className="flex justify-end">
                    <CreateAdminDrawer
                        roles={roles}
                        permissions={permissions}
                        permissionLabels={permissionLabels}
                    />
                </div>

                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role and permissions</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <div className="grid max-w-md gap-1">
                                            <select
                                                aria-label={`Role for ${user.email}`}
                                                className="h-9 rounded-md border bg-background px-3 text-sm"
                                                value={user.admin_role}
                                                onChange={(event) =>
                                                    updateAdminRole(
                                                        user,
                                                        event.target.value,
                                                    )
                                                }
                                            >
                                                {Object.entries(roles).map(
                                                    ([role, details]) => (
                                                        <option
                                                            key={role}
                                                            value={role}
                                                        >
                                                            {details.label}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                            <span className="text-xs text-muted-foreground">
                                                {(
                                                    roles[user.admin_role]
                                                        ?.permissions ?? []
                                                )
                                                    .map(
                                                        (permission) =>
                                                            permissionLabels[
                                                                permission
                                                            ],
                                                    )
                                                    .join(' · ')}
                                            </span>
                                            {user.permissions.length > 0 && (
                                                <span className="text-xs text-muted-foreground">
                                                    Direct:{' '}
                                                    {user.permissions
                                                        .map(
                                                            (permission) =>
                                                                permissionLabels[
                                                                    permission
                                                                ] ?? permission,
                                                        )
                                                        .join(' · ')}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => deleteAdmin(user)}
                                        >
                                            Remove access
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {users.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="text-center text-muted-foreground"
                                    >
                                        No admin accounts found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                {users.links.length > 3 && (
                    <nav
                        aria-label="Admin user pages"
                        className="flex flex-wrap gap-2"
                    >
                        {users.links.map((link, index) => (
                            <Link
                                key={`${link.label}-${index}`}
                                href={link.url ?? '#'}
                                preserveScroll
                                className={`rounded-md border px-3 py-1.5 text-sm ${link.active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'} ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                            >
                                {link.label
                                    .replace('&laquo;', '‹')
                                    .replace('&raquo;', '›')}
                            </Link>
                        ))}
                    </nav>
                )}
            </main>
        </>
    );
}
