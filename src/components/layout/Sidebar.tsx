import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Settings,
  Store,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { ViewType } from '@/src/types';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  isOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
  user: any;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onViewChange, 
  isOpen, 
  onToggle,
  onLogout,
  user
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'Kasir (POS)', icon: ShoppingCart },
    { id: 'products', label: 'Produk', icon: Package },
    { id: 'reports', label: 'Laporan', icon: BarChart3 },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" 
          onClick={onToggle}
        />
      )}

      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transition-transform duration-300 transform",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                <Store size={24} />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                Kasir<span className="text-indigo-600">Ku</span>
              </span>
            </div>
            <button onClick={onToggle} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id as ViewType);
                    if (window.innerWidth < 1024) onToggle();
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                    isActive 
                      ? "bg-indigo-50 text-indigo-700" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                  )}
                >
                  <Icon 
                    size={20} 
                    className={cn(
                      "transition-colors",
                      isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-600"
                    )} 
                  />
                  {item.label}
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-4 mt-auto space-y-4">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{user?.storeName || 'Toko Saya'}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button 
                onClick={onLogout}
                className="w-full py-2.5 px-4 bg-white hover:bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-slate-200 hover:border-red-100 transition-all flex items-center justify-center gap-2"
              >
                <LogOut size={14} />
                Keluar Aplikasi
              </button>
            </div>

            <div className="bg-indigo-600 rounded-2xl p-4 text-white">
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-80">Pelanggan Aktif</p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold">Paket Basic</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-bold">
                  PRO
                </span>
              </div>
              <button className="w-full py-2 bg-white text-indigo-600 text-[10px] font-black uppercase rounded-lg transition-transform active:scale-95">
                Ganti Paket
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
