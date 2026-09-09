import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Booking } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { Calendar, Clock, Car, User, CheckCircle2 } from 'lucide-react';

export const OwnerBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await api.getOwnerBookings();
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
        <h1 className="text-2xl font-black text-dark tracking-tight">Host Booking Ledger</h1>
        <p className="text-xs text-slate-500">Live feed of all driver reservations placed across your parking spaces.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-8 h-8 text-slate-400" />}
          title="No bookings received yet"
          description="When drivers book your approved spaces, their reservation records will appear here."
        />
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Card key={b.id} className="p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-primary">#{b.booking_id}</span>
                    <Badge variant={b.status === 'CONFIRMED' || b.status === 'CHECKED_IN' ? 'success' : 'neutral'} size="sm">
                      {b.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <h3 className="text-sm font-bold text-dark">{b.parking?.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1">
                    <span>Driver: <strong>{b.driver?.name || 'Driver'}</strong></span>
                    <span>• License: <strong>{b.vehicle_number}</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {new Date(b.start_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })} -{' '}
                      {new Date(b.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="text-right sm:self-auto self-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 w-full sm:w-auto">
                  <div className="text-base font-black text-emerald-600">+₹{b.owner_amount.toFixed(2)}</div>
                  <div className="text-[10px] text-slate-400">Net Earned (80%)</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
