import { Link } from '@inertiajs/react';
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
    MapPin, // Branches
    Briefcase, // Services
    Clock,
    Map,
    MapPinHouse,
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

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r-0">
            <SidebarHeader className="border-b border-sidebar-border/60 px-3 py-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="rounded-xl">
                            <Link
                                href="/clinic/dashboard"
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
                {mainNavGroups.map((group) => (
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
