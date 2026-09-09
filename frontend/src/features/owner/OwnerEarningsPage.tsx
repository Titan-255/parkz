import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Wallet, DollarSign, TrendingUp, ArrowDownToLine, CheckCircle2 } from 'lucide-react';

export const OwnerEarningsPage: React.FC = () => {
  const [earningsData, setEarningsData] = useState<{
    gross_earnings: number;
    platform_commission: number;
    net_earnings: number;
    payouts_history: any[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const data = await api.getOwnerEarnings();
        setEarningsData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  if (isLoading || !earningsData) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-dark tracking-tight">Host Earnings & Payouts</h1>
        <p className="text-xs text-slate-500">Transparent financial breakdown and payout transactions.</p>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <span className="text-xs font-bold text-slate-500">Gross Driver Spend</span>
          <div className="text-2xl font-black text-dark mt-2">₹{earningsData.gross_earnings.toFixed(2)}</div>
          <div className="text-[11px] text-slate-400 mt-1">Total customer volume</div>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-bold text-slate-500">Platform Commission (20%)</span>
          <div className="text-2xl font-black text-red-500 mt-2">-₹{earningsData.platform_commission.toFixed(2)}</div>
          <div className="text-[11px] text-slate-400 mt-1">Marketplace operations fee</div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
          <span className="text-xs font-bold text-emerald-800">Your Net Earnings (80%)</span>
          <div className="text-2xl font-black text-emerald-600 mt-2">₹{earningsData.net_earnings.toFixed(2)}</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">Recorded to host wallet</div>
        </Card>
      </div>

      {/* Payout History Ledger */}
      <Card className="p-6">
        <h3 className="text-sm font-bold text-dark mb-4">Payout Transaction History</h3>

        {earningsData.payouts_history.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No payout transactions recorded yet.</p>
        ) : (
          <div className="divide-y divide-slate-100 space-y-3">
            {earningsData.payouts_history.map((p) => (
              <div key={p.id} className="pt-3 first:pt-0 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-700">{p.booking_id}</span>
                    <Badge variant={p.status === 'COMPLETED' ? 'success' : 'neutral'} size="sm">
                      {p.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">{p.parking_name}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{new Date(p.created_at).toLocaleString()}</div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-emerald-600">+₹{p.net_amount.toFixed(2)}</div>
                  <div className="text-[10px] text-slate-400">Commission: ₹{p.commission.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
