import { createInertiaApp, Link } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null;
            case name.startsWith('auth/') || name.startsWith('admin/auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            case name.startsWith('Client/'):
                return ({ children }: { children: React.ReactNode }) => (
                    <div className="min-h-screen bg-slate-50 text-slate-900">
                        <header className="border-b bg-white">
                            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                                <Link
                                    href="/"
                                    className="text-lg font-semibold text-teal-800"
                                >
                                    Nuria Care
                                </Link>
                                <nav className="flex items-center gap-5 text-sm font-medium">
                                    <Link
                                        href="/clinics"
                                        className="hover:text-teal-700"
                                    >
                                        Find a clinic
                                    </Link>
                                    <Link
                                        href="/reservations"
                                        className="hover:text-teal-700"
                                    >
                                        My reservations
                                    </Link>
                                    <Link
                                        href="/login"
                                        className="rounded-lg bg-teal-700 px-4 py-2 text-white hover:bg-teal-800"
                                    >
                                        Sign in
                                    </Link>
                                </nav>
                            </div>
                        </header>
                        {children}
                        <footer className="mt-16 border-t bg-white px-4 py-8 text-center text-sm text-slate-500">
                            Care that starts with finding the right clinic.
                        </footer>
                    </div>
                );
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
