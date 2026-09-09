import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { 
  ShieldAlert, Users, CheckCircle, Calendar, 
  CreditCard, AlertOctagon, BarChart3, Lock 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user } = useAuth();

  const adminMenu = [
    { to: '/admin', icon: <BarChart3 className="w-4 h-4" />, label: 'Operations KPI', end: true },
    { to: '/admin/parking', icon: <CheckCircle className="w-4 h-4" />, label: 'Parking Approvals' },
    { to: '/admin/users', icon: <Users className="w-4 h-4" />, label: 'User Directory' },
    { to: '/admin/bookings', icon: <Calendar className="w-4 h-4" />, label: 'Global Bookings' },
    { to: '/admin/payments', icon: <CreditCard className="w-4 h-4" />, label: 'Financial Ledger' },
    { to: '/admin/complaints', icon: <AlertOctagon className="w-4 h-4" />, label: 'Disputes & Fraud' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 mb-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight">ParkZ Master Operations Center</h2>
              <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-500/30">
                ADMIN PRIVILEGES
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Logged in as {user?.email} • Live production oversight</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 p-3 shadow-subtle sticky top-20">
            <nav className="space-y-1">
              {adminMenu.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm'
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

        {/* Content */}
        <div className="lg:col-span-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
