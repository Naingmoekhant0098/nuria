import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Users,
    Settings,
    Building2, // Clinics
    Stethoscope, // Doctors
    User, // Patients
    CalendarDays, // Reservations
    ClipboardList, // Medical Records
    FileText, // Consultations
    CreditCard, // Payments
    Bell, // Notifications
    Briefcase, // Services
    Clock,
    ListFilter, // Schedules
} from 'lucide-react';

import AppLogo from '@/components/app-logo';
import { NavLink } from '@/components/nav-link';
import { NavUser } from '@/components/nav-user';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

import type { NavGroup } from '@/types';

const mainNavGroups: NavGroup[] = [
    {
        title: 'General',
        items: [
            // Use standard path or route() helper depending on your setup
            {
                title: 'Dashboard',
                href: '/clinic/dashboard',
                icon: LayoutDashboard,
            },
        ],
    },
    {
        title: 'Clinic Operations',
        items: [
            {
                title: 'Online orders & report',
                href: '/clinic/orders',
                icon: ClipboardList,
            },
            { title: 'Services', href: '/clinic/services', icon: Briefcase },
            {
                title: 'Schedules',
                href: '/clinic/doctor-schedules',
                icon: Clock,
            },
        ],
    },
    {
        title: 'Staff & Patients',
        items: [
            { title: 'Doctors', href: '/clinic/doctors', icon: Stethoscope },
            { title: 'Patients', href: '/clinic/patients', icon: User },
        ],
    },
    {
        title: 'Consultations',
        items: [
            {
                title: 'Reservations',
                href: '/clinic/reservations',
                icon: CalendarDays,
            },
            {
                title: 'Consultations',
                href: '/clinic/consultations',
                icon: FileText,
            },
            {
                title: 'Medical Records',
                href: '/clinic/medical-records',
                icon: ClipboardList,
            },
        ],
    },
    {
        title: 'Pharmacy',
        items: [
            { title: 'Drugs', href: '/clinic/pharmacy/drugs', icon: Briefcase },
            {
                title: 'Stock',
                href: '/clinic/pharmacy/stock',
                icon: ClipboardList,
            },
            {
                title: 'Sales',
                href: '/clinic/pharmacy/sales',
                icon: CreditCard,
            },
        ],
    },
    // {
    //     title: "Master Data",
    //     items: [
    //         { title: "States", href: "/clinic/states", icon: Map },
    //         { title: "Townships", href: "/clinic/townships", icon: MapPinHouse },
    //         { title: "Types", href: "/clinic/types", icon: ListFilter },
    //     ],
    // },
    {
        title: 'Finance & System',
        items: [
            {
                title: 'Payment Methods',
                href: '/clinic/payment-methods',
                icon: CreditCard,
            },
            {
                title: 'Plans & Billing',
                href: '/clinic/plans',
                icon: CreditCard,
            },
            {
                title: 'Notifications',
                href: '/clinic/notifications',
                icon: Bell,
            },
            { title: 'Users', href: '/clinic/users', icon: Users },
            { title: 'Settings', href: '/clinic/settings', icon: Settings },
        ],
    },
    {
        title: 'Reports',
        items: [
            {
                title: 'Payment Transactions',
                href: '/clinic/payments',
                icon: CreditCard,
            },
            {
                title: 'Stock Report',
                href: '/clinic/reports/stock',
                icon: ClipboardList,
            },
            {
                title: 'Operations Report',
                href: '/clinic/reports/operations',
                icon: LayoutDashboard,
            },
        ],
    },
];

const adminNavGroups: NavGroup[] = [
    {
        title: 'Overview',
        items: [
            {
                title: 'Dashboard',
                href: '/admin/dashboard',
                icon: LayoutDashboard,
            },
        ],
    },
    {
        title: 'Administration',
        items: [
            { title: 'Clinics', href: '/admin/clinics', icon: Building2 },
            { title: 'Plans', href: '/admin/plans', icon: CreditCard },
            {
                title: 'Subscriptions',
                href: '/admin/subscriptions',
                icon: CreditCard,
            },
            { title: 'Admin users', href: '/admin/users', icon: Users },
            { title: 'Roles', href: '/admin/roles', icon: Settings },
            {
                title: 'Permissions',
                href: '/admin/permissions',
                icon: ListFilter,
            },
            {
                title: 'Specializations',
                href: '/admin/specializations',
                icon: Stethoscope,
            },
        ],
    },
    {
        title: 'Doctors',
        items: [{ title: 'Doctor list', href: '/admin/doctors', icon: Users }],
    },
    {
        title: 'Patients',
        items: [
            { title: 'Patient list', href: '/admin/patients', icon: Users },
        ],
    },
    {
        title: 'Reservations',
        items: [
            {
                title: 'Reservation log',
                href: '/admin/reservations',
                icon: ClipboardList,
            },
        ],
    },
    {
        title: 'Online orders',
        items: [
            {
                title: 'Order report',
                href: '/admin/orders',
                icon: ClipboardList,
            },
        ],
    },
    {
        title: 'Drugs',
        items: [
            {
                title: 'Drug catalog',
                href: '/admin/inventory/drugs',
                icon: Briefcase,
            },
        ],
    },
    {
        title: 'Medical products',
        items: [
            {
                title: 'Product catalog',
                href: '/admin/inventory/medical-products',
                icon: Briefcase,
            },
        ],
    },
    {
        title: 'Clinic stock',
        items: [
            {
                title: 'Stock allocation',
                href: '/admin/inventory/stock',
                icon: ClipboardList,
            },
            {
                title: 'Drug batches by clinic',
                href: '/admin/inventory/reports/drugs',
                icon: FileText,
            },
            {
                title: 'Medical product stock by clinic',
                href: '/admin/inventory/reports/medical-products',
                icon: FileText,
            },
        ],
    },
    {
        title: 'Reporting',
        items: [
            {
                title: 'Inventory summary',
                href: '/admin/inventory/reports',
                icon: FileText,
            },
            {
                title: 'Recent inventory movements',
                href: '/admin/inventory/reports/movements',
                icon: FileText,
            },
            {
                title: 'Reservation charges',
                href: '/admin/inventory/reports/reservation-charges',
                icon: FileText,
            },
            {
                title: 'Recorded reservation payments',
                href: '/admin/inventory/reports/reservation-payments',
                icon: FileText,
            },
            {
                title: 'Prescription sales',
                href: '/admin/inventory/reports/prescription-sales',
                icon: FileText,
            },
        ],
    },
];

const adminNavigationPermissions: Record<string, string> = {
    '/admin/dashboard': 'dashboard.view',
    '/admin/clinics': 'clinics.manage',
    '/admin/plans': 'clinics.manage',
    '/admin/subscriptions': 'clinics.manage',
    '/admin/users': 'admins.manage',
    '/admin/roles': 'roles.manage',
    '/admin/permissions': 'permissions.view',
    '/admin/specializations': 'specializations.manage',
    '/admin/doctors': 'doctors.view',
    '/admin/patients': 'patients.view',
    '/admin/reservations': 'reservations.view',
    '/admin/orders': 'orders.manage',
    '/admin/inventory/drugs': 'inventory.manage',
    '/admin/inventory/medical-products': 'inventory.manage',
    '/admin/inventory/stock': 'inventory.manage',
    '/admin/inventory/reports/drugs': 'inventory.manage',
    '/admin/inventory/reports/medical-products': 'inventory.manage',
    '/admin/inventory/reports': 'reports.view',
    '/admin/inventory/reports/movements': 'reports.view',
    '/admin/inventory/reports/reservation-charges': 'finance.view',
    '/admin/inventory/reports/reservation-payments': 'finance.view',
    '/admin/inventory/reports/prescription-sales': 'finance.view',
};

export function AppSidebar() {
    const { url, props } = usePage<{
        auth: {
            permissions?: string[];
            features?: string[];
            subscription?: { plan_name: string } | null;
        };
    }>();
    const isAdmin = url.startsWith('/admin');
    const permissions = props.auth?.permissions ?? [];
    const clinicFeatures = props.auth?.features ?? [];
    const clinicNavigationPermissions: Record<string, string> = {
        '/clinic/doctors': 'doctors',
        '/clinic/doctor-schedules': 'schedules',
        '/clinic/patients': 'patients',
        '/clinic/services': 'services',
        '/clinic/reservations': 'reservations',
        '/clinic/consultations': 'consultations',
        '/clinic/medical-records': 'medical_records',
        '/clinic/prescriptions': 'pharmacy',
        '/clinic/pos': 'pharmacy',
        '/clinic/inventory': 'pharmacy',
        '/clinic/pharmacy/drugs': 'pharmacy',
        '/clinic/pharmacy/stock': 'pharmacy',
        '/clinic/pharmacy/sales': 'pharmacy',
        '/clinic/orders': 'online_orders',
        '/clinic/reports/stock': 'reports',
        '/clinic/reports/operations': 'reports',
        '/clinic/payments': 'finance',
        '/clinic/payment-methods': 'finance',
    };
    const filteredClinicGroups = mainNavGroups
        .map((group) => ({
            ...group,
            items: group.items.filter((item) => {
                const href =
                    typeof item.href === 'string' ? item.href : item.href.url;
                const requiredFeature = clinicNavigationPermissions[href];

                return (
                    !requiredFeature || clinicFeatures.includes(requiredFeature)
                );
            }),
        }))
        .filter((group) => group.items.length > 0);
    const clinicNavGroups = props.auth?.subscription
        ? filteredClinicGroups
        : [
              {
                  title: 'Account',
                  items: [
                      {
                          title: 'Plans & Billing',
                          href: '/clinic/plans',
                          icon: CreditCard,
                      },
                  ],
              },
          ];
    const navGroups = isAdmin
        ? adminNavGroups
              .map((group) => ({
                  ...group,
                  items: group.items.filter((item) => {
                      const href =
                          typeof item.href === 'string'
                              ? item.href
                              : item.href.url;
                      const requiredPermission =
                          adminNavigationPermissions[href];

                      return (
                          !requiredPermission ||
                          permissions.includes(requiredPermission)
                      );
                  }),
              }))
              .filter((group) => group.items.length > 0)
        : clinicNavGroups;
    const dashboardUrl = isAdmin
        ? '/admin/dashboard'
        : props.auth?.subscription
          ? '/clinic/dashboard'
          : '/clinic/plans';

    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r-0">
            <SidebarHeader className="border-b border-sidebar-border/60 px-3 py-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="rounded-xl">
                            <Link
                                href={dashboardUrl}
                                prefetch
                                className="block"
                            >
                                <div className="flex h-10 items-center">
                                    <AppLogo />
                                </div>
                            </Link>
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-2 py-3">
                {navGroups.map((group) => (
                    <SidebarGroup key={group.title} className="px-0 py-2">
                        <SidebarGroupLabel className="mb-1 px-3 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground/70 uppercase group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                            {group.title}
                        </SidebarGroupLabel>

                        <SidebarGroupContent>
                            <SidebarMenu className="gap-1">
                                {group.items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <NavLink item={item} />
                                        <span className="pointer-events-none absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full bg-sidebar-primary opacity-0 transition-opacity group-data-[active=true]:opacity-100" />
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border/60 p-2">
                <div className="rounded-xl bg-sidebar-accent/40 p-1">
                    <NavUser />
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
