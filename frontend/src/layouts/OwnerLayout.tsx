import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, Building2, PlusCircle, Calendar, 
  Wallet, User, ArrowLeft, ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const OwnerLayout: React.FC = () => {
  const { user } = useAuth();

  const menuItems = [
    { to: '/owner', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard', end: true },
    { to: '/owner/parking', icon: <Building2 className="w-4 h-4" />, label: 'My Spaces' },
    { to: '/owner/parking/new', icon: <PlusCircle className="w-4 h-4" />, label: 'Add Parking' },
    { to: '/owner/bookings', icon: <Calendar className="w-4 h-4" />, label: 'Bookings' },
    { to: '/owner/earnings', icon: <Wallet className="w-4 h-4" />, label: 'Earnings & Payouts' },
    { to: '/owner/profile', icon: <User className="w-4 h-4" />, label: 'Host Profile' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-subtle sticky top-20">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-4 border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                {user?.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-dark truncate">{user?.name}</div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified Host</span>
                </div>
              </div>
            </div>

            <nav className="space-y-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-dark'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="lg:col-span-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
