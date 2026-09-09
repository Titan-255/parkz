import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ParkzLogo } from '../common/ParkzLogo';
import { NotificationsDropdown } from './NotificationsDropdown';
import { Button } from '../ui/Button';
import { 
  User, LogOut, LayoutDashboard, Search, PlusCircle, Shield, 
  Car, Building2, ChevronDown, Menu, X, HelpCircle
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isDriver, isOwner, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <ParkzLogo size="md" to={isAuthenticated ? (isDriver ? '/app' : isOwner ? '/owner' : '/admin') : '/'} />

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/app"
                  className="text-xs font-semibold text-slate-600 hover:text-primary px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Find Parking
                </Link>
                <Link
                  to="/owner"
                  className="text-xs font-semibold text-slate-600 hover:text-primary px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  List Your Space
                </Link>
                <a
                  href="#how-it-works"
                  className="text-xs font-semibold text-slate-600 hover:text-primary px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  How It Works
                </a>
              </>
            ) : (
              <>
                {isDriver && (
                  <>
                    <Link
                      to="/app"
                      className={`text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                        location.pathname === '/app' ? 'bg-primary-50 text-primary' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Explore
                    </Link>
                    <Link
                      to="/app/search"
                      className={`text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                        location.pathname.startsWith('/app/search') ? 'bg-primary-50 text-primary' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Search
                    </Link>
                    <Link
                      to="/app/bookings"
                      className={`text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                        location.pathname.startsWith('/app/bookings') ? 'bg-primary-50 text-primary' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      My Bookings
                    </Link>
                  </>
                )}

                {isOwner && (
                  <>
                    <Link
                      to="/owner"
                      className={`text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                        location.pathname === '/owner' ? 'bg-primary-50 text-primary' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/owner/parking"
                      className={`text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                        location.pathname.startsWith('/owner/parking') ? 'bg-primary-50 text-primary' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      My Spaces
                    </Link>
                    <Link
                      to="/owner/bookings"
                      className={`text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                        location.pathname.startsWith('/owner/bookings') ? 'bg-primary-50 text-primary' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Bookings
                    </Link>
                    <Link
                      to="/owner/earnings"
                      className={`text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                        location.pathname.startsWith('/owner/earnings') ? 'bg-primary-50 text-primary' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Earnings
                    </Link>
                  </>
                )}

                {isAdmin && (
                  <>
                    <Link
                      to="/admin"
                      className={`text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                        location.pathname === '/admin' ? 'bg-primary-50 text-primary' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Overview
                    </Link>
                    <Link
                      to="/admin/users"
                      className={`text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                        location.pathname.startsWith('/admin/users') ? 'bg-primary-50 text-primary' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Users
                    </Link>
                    <Link
                      to="/admin/parking"
                      className={`text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                        location.pathname.startsWith('/admin/parking') ? 'bg-primary-50 text-primary' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Approvals
                    </Link>
                    <Link
                      to="/admin/complaints"
                      className={`text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                        location.pathname.startsWith('/admin/complaints') ? 'bg-primary-50 text-primary' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Complaints
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {isOwner && (
                <Link to="/owner/parking/new" className="hidden sm:block">
                  <Button size="sm" icon={<PlusCircle className="w-4 h-4" />}>
                    List Space
                  </Button>
                </Link>
              )}

              <NotificationsDropdown />

              {/* User Avatar Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="text-xs font-bold text-dark leading-tight">{user?.name}</div>
                    <div className="text-[10px] text-slate-500 font-semibold">{user?.role}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-popover border border-slate-100 p-1.5 z-50 animate-in fade-in">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-dark truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-primary-50 text-primary border border-primary-100">
                        {user?.role}
                      </span>
                    </div>

                    <div className="py-1">
                      {isDriver && (
                        <Link
                          to="/app/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                        >
                          <Car className="w-4 h-4 text-slate-400" />
                          <span>Vehicle & Profile</span>
                        </Link>
                      )}
                      {isOwner && (
                        <Link
                          to="/owner/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                        >
                          <Building2 className="w-4 h-4 text-slate-400" />
                          <span>Host Profile</span>
                        </Link>
                      )}
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                        >
                          <Shield className="w-4 h-4 text-slate-400" />
                          <span>Admin Control Center</span>
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-danger hover:bg-red-50 rounded-lg cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
