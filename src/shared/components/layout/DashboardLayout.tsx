'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

// Icons
import { 
  Menu, 
  X, 
  ChevronLeft, 
  Bell,
  Search,
  Settings,
  User
} from 'lucide-react';

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: string | number;
  isActive?: boolean;
  children?: SidebarItem[];
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarItems: SidebarItem[];
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  notifications?: number;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  className?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  sidebarItems,
  user,
  notifications = 0,
  onNotificationClick,
  onProfileClick,
  className = '',
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className={cn('min-h-screen bg-spoon-background', className)}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full bg-white border-r border-spoon-border shadow-lg',
          'lg:relative lg:translate-x-0 lg:shadow-none transition-all duration-300',
          sidebarCollapsed ? 'w-16' : 'w-64',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-spoon-border">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-spoon-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-semibold text-spoon-neutral-800">
                Spoon
              </span>
            </div>
          )}
          
          {/* Desktop Collapse Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-spoon-neutral-100 transition-colors"
          >
            <ChevronLeft 
              className={cn(
                'w-4 h-4 transition-transform duration-200',
                sidebarCollapsed && 'rotate-180'
              )}
            />
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-spoon-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              collapsed={sidebarCollapsed}
            />
          ))}
        </nav>

        {/* User Section */}
        {user && (
          <div className="border-t border-spoon-border p-4">
            <div className={cn(
              'flex items-center space-x-3',
              sidebarCollapsed && 'justify-center'
            )}>
              <div className="w-8 h-8 bg-spoon-primary rounded-full flex items-center justify-center">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-spoon-neutral-800 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-spoon-neutral-500 truncate">
                    {user.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className={cn(
        'flex flex-col min-h-screen transition-all duration-300',
        !sidebarCollapsed && 'lg:ml-64',
        sidebarCollapsed && 'lg:ml-16'
      )}>
        {/* Header */}
        <header className="bg-white border-b border-spoon-border px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-spoon-neutral-100 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Search Bar */}
              <div className="hidden md:flex items-center space-x-2 bg-spoon-neutral-50 rounded-lg px-3 py-2 min-w-80">
                <Search className="w-4 h-4 text-spoon-neutral-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="bg-transparent border-none outline-none text-sm text-spoon-neutral-600 placeholder-spoon-neutral-400 flex-1"
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-2">
              {/* Notifications */}
              <button
                onClick={onNotificationClick}
                className="relative flex items-center justify-center w-8 h-8 rounded-lg hover:bg-spoon-neutral-100 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-spoon-error text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {notifications > 9 ? '9+' : notifications}
                  </span>
                )}
              </button>

              {/* Settings */}
              <button className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-spoon-neutral-100 transition-colors">
                <Settings className="w-5 h-5" />
              </button>

              {/* Profile */}
              <button
                onClick={onProfileClick}
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-spoon-neutral-100 transition-colors"
              >
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

// Componente individual de sidebar
const SidebarItem: React.FC<{
  item: SidebarItem;
  collapsed: boolean;
}> = ({ item, collapsed }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div>
      <a
        href={item.href}
        className={cn(
          'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
          'hover:bg-spoon-neutral-50 hover:text-spoon-primary-dark',
          item.isActive && 'bg-spoon-primary/10 text-spoon-primary-dark border-r-2 border-spoon-primary',
          collapsed && 'justify-center px-2'
        )}
        onClick={(e) => {
          if (hasChildren) {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <span className="flex-shrink-0">{item.icon}</span>
        
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge && (
              <span className="bg-spoon-primary text-white text-xs px-2 py-1 rounded-full">
                {item.badge}
              </span>
            )}
          </>
        )}
      </a>

      {/* Children Items */}
      {hasChildren && !collapsed && isExpanded && (
        <div className="ml-4 mt-1 space-y-1">
          {item.children?.map((child) => (
            <a
              key={child.id}
              href={child.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors',
                'hover:bg-spoon-neutral-50 text-spoon-neutral-600',
                child.isActive && 'bg-spoon-neutral-100 text-spoon-primary-dark'
              )}
            >
              <span className="flex-shrink-0">{child.icon}</span>
              <span className="truncate">{child.label}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;


























