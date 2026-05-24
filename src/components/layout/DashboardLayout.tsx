// This is the shell for every dashboard page.
// It renders a sidebar + topbar + main content area.

import { Outlet } from 'react-router-dom';

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar placeholder */}
      <aside className="w-64 bg-content1 border-r border-divider hidden lg:block">
        <div className="p-4">
          <p className="text-sm font-semibold text-foreground">Sidebar</p>
          <p className="text-xs text-default-400 mt-1">Built in Phase 7</p>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar placeholder */}
        <header
          className="h-16 bg-content1 border-b border-divider flex 
                           items-center px-6"
        >
          <p className="text-sm font-semibold text-foreground">Topbar</p>
        </header>

        {/* Page content — <Outlet /> renders the matched child route */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
