import { Link, usePage } from "@inertiajs/react";
import type { LucideIcon } from "lucide-react";
import { SidebarMenuButton } from "@/components/ui/sidebar";

interface NavItem {
    title: string;
    href: string;
    icon: LucideIcon;
}

export function NavLink({ item }: { item: NavItem }) {
    const { url } = usePage();
    
     
    const isActive = item.href === "/" ? url === "/" : url.startsWith(item.href);

    return (
        <SidebarMenuButton
            asChild
            isActive={isActive}
            className={`transition-colors ${
                isActive 
                    ? "bg-main text-sidebar-accent-foreground font-medium" 
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            }`}
        >
            <Link href={item.href} prefetch>
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
            </Link>
        </SidebarMenuButton>
    );
}