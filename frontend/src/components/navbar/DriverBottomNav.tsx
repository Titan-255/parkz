import React from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, Search, Calendar, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const DriverBottomNav: React.FC = () => {
  const { isDriver } = useAuth();
  if (!isDriver) return null;

  const navItems = [
    { to: '/app', icon: <Compass className="w-5 h-5" />, label: 'Explore', end: true },
    { to: '/app/search', icon: <Search className="w-5 h-5" />, label: 'Search' },
    { to: '/app/bookings', icon: <Calendar className="w-5 h-5" />, label: 'Bookings' },
    { to: '/app/profile', icon: <UserIcon className="w-5 h-5" />, label: 'Profile' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-card py-1.5 px-4">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-primary font-bold scale-105'
                  : 'text-slate-500 font-medium hover:text-slate-800'
              }`
            }
          >
            {item.icon}
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
