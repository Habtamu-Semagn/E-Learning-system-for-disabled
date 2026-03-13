import { ReactNode } from 'react';
import { AppSidebar } from './app-sidebar';
import { Navbar } from './navbar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';

interface DashboardLayoutProps {
  children: ReactNode;
  role: 'student' | 'teacher' | 'admin';
  userName?: string;
  userRole?: string;
}

export function DashboardLayout({ 
  children, 
  role, 
  userName, 
  userRole 
}: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar role={role} />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1">
            <Navbar userName={userName} userRole={userRole} />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
