import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Building2, Calendar, CreditCard, 
  AlertTriangle, ShieldCheck, CheckCircle2, TrendingUp, DollarSign 
} from 'lucide-react';
import { api } from '../../api/client';
import { AdminDashboardStats } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const data = await api.getAdminDashboard();
        setStats(data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const maxRevenue = Math.max(...(stats.revenue_chart.map((d) => d.gmv) || [100]), 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-dark tracking-tight">Platform Operations Dashboard</h1>
        <p className="text-xs text-slate-500">Live platform metrics, marketplace GMV, approvals, and dispute counters.</p>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Marketplace GMV</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-dark mt-2">₹{stats.total_gmv.toFixed(2)}</div>
          <div className="text-[11px] text-slate-400 mt-1">{stats.todays_bookings_count} bookings placed today</div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800">Platform Revenue (20%)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">₹{stats.total_platform_revenue.toFixed(2)}</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">Net platform commission</div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Pending Approvals</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-dark mt-2">{stats.pending_parking_spaces}</div>
          <Link to="/admin/parking" className="text-[11px] text-primary font-bold hover:underline mt-1 inline-block">
            Review listings queue →
          </Link>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Open Disputes & Fraud</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-danger flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-danger mt-2">{stats.open_complaints_count}</div>
          <Link to="/admin/complaints" className="text-[11px] text-danger font-bold hover:underline mt-1 inline-block">
            Investigate reports →
          </Link>
        </Card>
      </div>

      {/* 7-Day GMV Visual Chart */}
      <Card className="p-6">
        <h3 className="text-sm font-bold text-dark mb-1">7-Day Gross Marketplace Volume (GMV)</h3>
        <p className="text-xs text-slate-500 mb-6">Total transaction value across all Chennai parking locations</p>

        <div className="h-44 flex items-end justify-between gap-2 pt-4 border-b border-slate-100">
          {stats.revenue_chart.map((day, idx) => {
            const heightPercent = Math.max(12, Math.round((day.gmv / maxRevenue) * 100));
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  ₹{day.gmv}
                </div>
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full max-w-[36px] bg-gradient-to-t from-slate-900 to-slate-700 rounded-t-lg transition-all group-hover:bg-primary"
                />
                <span className="text-[10px] font-semibold text-slate-500">{day.date}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* User & Space Quick Counter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
        <Card className="p-4 flex items-center justify-between">
          <span className="text-slate-600">Registered Drivers:</span>
          <span className="font-bold text-dark text-sm">{stats.total_drivers}</span>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <span className="text-slate-600">Verified Parking Hosts:</span>
          <span className="font-bold text-dark text-sm">{stats.total_owners}</span>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <span className="text-slate-600">Active Live Spaces:</span>
          <span className="font-bold text-emerald-600 text-sm">{stats.active_parking_spaces} / {stats.total_parking_spaces}</span>
        </Card>
      </div>
    </div>
  );
};
