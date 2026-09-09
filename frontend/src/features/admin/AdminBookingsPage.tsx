import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Booking } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';

export const AdminBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await api.getAdminBookings();
        setBookings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-dark tracking-tight">System-Wide Bookings Log</h1>
        <p className="text-xs text-slate-500">Real-time record of all parking transactions and check-in statuses.</p>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Booking Code</th>
                <th className="py-3.5 px-4">Driver & Vehicle</th>
                <th className="py-3.5 px-4">Parking Facility</th>
                <th className="py-3.5 px-4">Time Interval</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Booking Status</th>
                <th className="py-3.5 px-4">Check-in</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">Loading bookings records...</td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">No bookings recorded yet.</td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-primary">#{b.booking_id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-dark">{b.driver?.name || 'Driver'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{b.vehicle_number}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{b.parking?.name}</td>
                    <td className="py-3.5 px-4 text-slate-500">
                      <div>{new Date(b.start_time).toLocaleDateString()}</div>
                      <div className="text-[10px]">
                        {new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                        {new Date(b.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-dark">₹{b.amount.toFixed(2)}</td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          b.status === 'CONFIRMED' || b.status === 'CHECKED_IN' || b.status === 'COMPLETED'
                            ? 'success'
                            : 'danger'
                        }
                        size="sm"
                      >
                        {b.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={b.check_in_status === 'CHECKED_IN' ? 'primary' : 'neutral'} size="sm">
                        {b.check_in_status}
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
