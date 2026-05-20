import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../entities/user/model/store';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();

  const navLinks = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/orders', label: 'All Orders' },
    { path: '/admin/couriers', label: 'Couriers' },
    { path: '/admin/applications', label: 'Applications' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Fixed Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="h-16 flex items-center px-6 border-b border-gray-800 shrink-0">
          <h1 className="text-xl font-black italic tracking-tighter text-blue-400 leading-none">
            ADMIN PANEL
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={() => logout()} 
            className="w-full px-4 py-2.5 bg-red-900/20 text-red-400 rounded-xl hover:bg-red-900/40 transition-colors text-sm font-black uppercase tracking-widest"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 px-8 flex justify-between items-center sticky top-0 z-40">
          <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight">{title}</h2>
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-gray-400 uppercase leading-none">Status</p>
              <p className="text-xs font-bold text-green-500">System Online</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 font-black text-[10px]">
              AD
            </div>
          </div>
        </header>

        <main className="p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
