import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { CreditCard, DollarSign } from 'lucide-react';

export const AdminPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await api.getAdminPayments();
        setPayments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayments();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-dark tracking-tight">Platform Financial Ledger</h1>
        <p className="text-xs text-slate-500">Audited transaction records, 20% platform commission fee cuts, and host net disbursements.</p>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-4">Booking</th>
                <th className="py-3.5 px-4">Driver</th>
                <th className="py-3.5 px-4">Gross Charge</th>
                <th className="py-3.5 px-4">Platform Fee (20%)</th>
                <th className="py-3.5 px-4">Host Payout (80%)</th>
                <th className="py-3.5 px-4">Provider</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">Loading ledger records...</td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">No payment records found.</td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{p.transaction_id}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-primary">{p.booking_id}</td>
                    <td className="py-3.5 px-4 font-medium text-dark">{p.driver_name}</td>
                    <td className="py-3.5 px-4 font-bold text-dark">₹{p.amount.toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">₹{p.platform_fee.toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">₹{p.owner_amount.toFixed(2)}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200 uppercase">
                        {p.provider}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={p.status === 'PAID' ? 'success' : 'danger'} size="sm">
                        {p.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
