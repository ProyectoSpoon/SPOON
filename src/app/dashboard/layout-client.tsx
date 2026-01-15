'use client';

import BarraLateral from './components/BarraLateral';
import { NotificationProvider } from '@/shared/Context/notification-context';
import { PageTitleProvider, usePageTitle } from '@/shared/Context/page-title-context';
import { NotificationCenter } from '@/shared/components/ui/NotificationCenter';

// Componente header que usa el contexto (Client Component)
function DynamicHeader() {
    const { title, subtitle } = usePageTitle();

    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
                <p className="text-sm text-gray-600">{subtitle}</p>
            </div>
            <div className="flex items-center gap-4">
                <NotificationCenter />
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">U</span>
                    </div>
                    <span className="text-sm text-gray-700">Usuario</span>
                </div>
            </div>
        </header>
    );
}

export default function DashboardClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <NotificationProvider>
            <PageTitleProvider>
                <div className="h-screen flex overflow-hidden bg-gray-50">
                    <BarraLateral />
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <DynamicHeader />
                        <main className="flex-1 overflow-y-auto p-6">
                            {children}
                        </main>
                    </div>
                </div>
            </PageTitleProvider>
        </NotificationProvider>
    );
}
