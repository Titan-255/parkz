import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, DollarSign, Calendar, TrendingUp, 
  PlusCircle, QrCode, ArrowRight, ShieldCheck, CheckCircle2, Clock 
} from 'lucide-react';
import { api } from '../../api/client';
import { OwnerDashboardStats } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';

export const OwnerDashboard: React.FC = () => {
  const [stats, setStats] = useState<OwnerDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getOwnerDashboard();
        setStats(data);
      } catch (err) {
        console.error('Failed to load owner stats:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
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

  const maxRev = Math.max(...(stats.revenue_chart.map((d) => d.revenue) || [100]), 100);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-dark tracking-tight">Host Management Center</h1>
          <p className="text-xs text-slate-500">Monitor space occupancy, incoming reservations, and daily payouts.</p>
        </div>

        <Link to="/owner/parking/new">
          <Button size="md" icon={<PlusCircle className="w-4 h-4" />}>
            List New Space
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Today's Earnings</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-dark mt-2">₹{stats.todays_earnings.toFixed(2)}</div>
          <div className="text-[11px] text-slate-400 mt-1">{stats.todays_bookings_count} bookings today</div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Net Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-primary mt-2">₹{stats.total_earnings.toFixed(2)}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Paid directly to host</div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Active Spaces</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-dark mt-2">{stats.active_spaces} / {stats.total_spaces}</div>
          <div className="text-[11px] text-slate-400 mt-1">Total slots listed</div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Real-time Utilization</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-dark mt-2">{stats.utilization_rate}%</div>
          <div className="text-[11px] text-slate-400 mt-1">Active bays occupied</div>
        </Card>
      </div>

      {/* 7-Day Revenue Visual Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-dark">7-Day Revenue & Booking Volume</h3>
            <p className="text-xs text-slate-500">Daily net earnings after 20% platform commission</p>
          </div>
        </div>

        <div className="h-44 flex items-end justify-between gap-2 pt-4 border-b border-slate-100">
          {stats.revenue_chart.map((day, idx) => {
            const heightPercent = Math.max(12, Math.round((day.revenue / maxRev) * 100));
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  ₹{day.revenue}
                </div>
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full max-w-[36px] bg-gradient-to-t from-primary to-blue-400 rounded-t-lg transition-all group-hover:bg-primary-700"
                />
                <span className="text-[10px] font-semibold text-slate-500">{day.date}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent Bookings List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-dark">Recent Driver Reservations</h3>
          <Link to="/owner/bookings" className="text-xs font-semibold text-primary hover:underline">
            View All
          </Link>
        </div>

        {stats.recent_bookings.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No reservations yet.</p>
        ) : (
          <div className="divide-y divide-slate-100 space-y-3">
            {stats.recent_bookings.map((b) => (
              <div key={b.id} className="pt-3 first:pt-0 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-primary">#{b.booking_id}</span>
                    <Badge variant={b.status === 'CONFIRMED' || b.status === 'CHECKED_IN' ? 'success' : 'neutral'} size="sm">
                      {b.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="text-xs font-bold text-dark truncate mt-0.5">{b.driver?.name || 'Driver'} • {b.vehicle_number}</div>
                  <div className="text-[11px] text-slate-500">{b.parking?.name}</div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-black text-emerald-600">+₹{b.owner_amount.toFixed(2)}</div>
                  <div className="text-[10px] text-slate-400 font-medium">{new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
