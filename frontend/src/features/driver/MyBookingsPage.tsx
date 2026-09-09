import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, QrCode, MapPin, Clock, ArrowRight, 
  CheckCircle2, AlertCircle, RefreshCw, Star, XCircle 
} from 'lucide-react';
import { api } from '../../api/client';
import { Booking } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';

export const MyBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const data = await api.getBookings();
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'UPCOMING') return b.status === 'CONFIRMED';
    if (activeTab === 'ACTIVE') return b.status === 'CHECKED_IN';
    if (activeTab === 'COMPLETED') return b.status === 'COMPLETED';
    if (activeTab === 'CANCELLED') return b.status === 'CANCELLED' || b.status === 'REFUNDED';
    return true;
  });

  const tabs = [
    { id: 'ALL', label: 'All Bookings', count: bookings.length },
    { id: 'UPCOMING', label: 'Upcoming', count: bookings.filter((b) => b.status === 'CONFIRMED').length },
    { id: 'ACTIVE', label: 'Active (Checked In)', count: bookings.filter((b) => b.status === 'CHECKED_IN').length },
    { id: 'COMPLETED', label: 'Completed', count: bookings.filter((b) => b.status === 'COMPLETED').length },
    { id: 'CANCELLED', label: 'Cancelled', count: bookings.filter((b) => b.status === 'CANCELLED' || b.status === 'REFUNDED').length },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-dark tracking-tight">My Bookings</h1>
          <p className="text-xs text-slate-500">Track and manage your upcoming, active, and past parking passes.</p>
        </div>

        <Button variant="ghost" size="sm" icon={<RefreshCw className="w-4 h-4" />} onClick={fetchBookings}>
          Refresh
        </Button>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-7 h-7 text-slate-400" />}
          title="No bookings found"
          description="You don't have any parking reservations in this category."
          actionText="Find & Book Parking"
          onAction={() => window.location.assign('/app')}
        />
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const photo = b.parking?.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a';

            return (
              <Card key={b.id} hoverable className="p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex gap-4 min-w-0">
                    <img
                      src={photo}
                      alt={b.parking?.name || 'Parking'}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 bg-slate-100"
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-primary">#{b.booking_id}</span>
                        <Badge
                          variant={
                            b.status === 'CONFIRMED' || b.status === 'CHECKED_IN' || b.status === 'COMPLETED'
                              ? 'success'
                              : 'danger'
                          }
                          size="sm"
                        >
                          {b.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <h3 className="text-sm font-bold text-dark truncate">
                        {b.parking?.name || 'Parking Space'}
                      </h3>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{b.parking?.address}</p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-600 mt-2 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(b.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })},{' '}
                          {new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span>• License: {b.vehicle_number}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 gap-2 shrink-0">
                    <div className="text-left sm:text-right">
                      <div className="text-base font-black text-dark">₹{b.amount.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-400">Total Charged</div>
                    </div>

                    <Link to={`/app/bookings/${b.booking_id}`}>
                      <Button size="sm" className="text-xs font-bold px-3.5 h-8">
                        View Pass
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
