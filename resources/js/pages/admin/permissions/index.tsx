import { Head } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type Permission = {
    id: number;
    name: string;
    guard_name: string;
    roles_count: number;
};
type Props = {
    permissions: Permission[];
    permissionLabels: Record<string, string>;
};

export default function AdminPermissionsIndex({
    permissions,
    permissionLabels,
}: Props) {
    return (
        <>
            <Head title="Permissions" />
            <main className="flex flex-1 flex-col gap-6 p-6">
                <header>
                    <h1 className="text-2xl font-semibold">Permissions</h1>
                    <p className="text-muted-foreground">
                        Permission catalog available for admin roles.
                    </p>
                </header>
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Permission</TableHead>
                                <TableHead>Key</TableHead>
                                <TableHead>Assigned roles</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {permissions.map((permission) => (
                                <TableRow key={permission.id}>
                                    <TableCell className="font-medium">
                                        {permissionLabels[permission.name] ??
                                            permission.name}
                                    </TableCell>
                                    <TableCell>
                                        <code className="text-xs">
                                            {permission.name}
                                        </code>
                                    </TableCell>
                                    <TableCell>
                                        {permission.roles_count}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {permissions.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
                                        className="text-center text-muted-foreground"
                                    >
                                        No permissions are registered.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </main>
        </>
    );
}
