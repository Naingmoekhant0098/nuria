import { Link, usePage } from '@inertiajs/react';
import { StethoscopeIcon, MenuIcon, UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Nav from '@/pages/Client/components/nav';
import Footer from '@/pages/Client/components/footer';

type PublicLayoutProps = {
    children: React.ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
    const { component } = usePage();
    const isPatientAuthPage = component.startsWith('Client/Auth/');

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-[#f8f8f8] text-slate-900">
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
            >
                {/* Blue Glow */}
                <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-blue-900/10 blur-[150px]" />

                {/* Purple Glow */}
                <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-purple-950/10 blur-[150px]" />

                {/* Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#374151_1px,transparent_1px),linear-gradient(to_bottom,#374151_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_20%,transparent_100%)] bg-[size:3rem_3rem] opacity-[0.04]" />
            </div>

            {/* =========================================================
                Main Application
            ========================================================= */}

            <main className="">
                {!isPatientAuthPage && <Nav />}
                {children}
                {!isPatientAuthPage && <Footer />}
            </main>
        </div>
    );
}
