import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, MapPin, Navigation, Star, Car, Filter, 
  ArrowRight, ShieldCheck, QrCode, AlertCircle, Sparkles 
} from 'lucide-react';
import { api } from '../../api/client';
import { ParkingSpace, Booking } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton, ParkingCardSkeleton } from '../../components/ui/Skeleton';
import { InteractiveMap } from '../../components/map/InteractiveMap';
import { useAuth } from '../../context/AuthContext';

export const DriverDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [parkings, setParkings] = useState<ParkingSpace[]>([]);
  const [selectedParking, setSelectedParking] = useState<ParkingSpace | null>(null);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  const userCoords = { latitude: 13.0827, longitude: 80.2707 }; // Chennai

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [parkingList, bookingsList] = await Promise.all([
          api.getParkings({ latitude: userCoords.latitude, longitude: userCoords.longitude }),
          api.getBookings().catch(() => []),
        ]);

        setParkings(parkingList);
        if (parkingList.length > 0) {
          setSelectedParking(parkingList[0]);
        }

        // Find current active / upcoming confirmed booking
        const current = bookingsList.find(
          (b) => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN'
        );
        if (current) setActiveBooking(current);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredParkings = parkings.filter((p) => {
    if (selectedFilter === 'CAR' && p.vehicle_type === 'TWO_WHEELER') return false;
    if (selectedFilter === 'TWO_WHEELER' && p.vehicle_type === 'CAR') return false;
    if (selectedFilter === 'BUDGET' && p.price_per_hour > 30) return false;
    if (selectedFilter === 'TOP_RATED' && p.average_rating < 4.8) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner: Active Booking Pass if exists */}
      {activeBooking && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-4 sm:p-5 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white shrink-0">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  {activeBooking.status.replace('_', ' ')}
                </span>
                <span className="text-xs text-blue-100">Pass: {activeBooking.booking_id}</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                {activeBooking.parking?.name || 'Your Reserved Space'}
              </h3>
              <p className="text-xs text-blue-100">
                {new Date(activeBooking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                {new Date(activeBooking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          <Link to={`/app/bookings/${activeBooking.booking_id}`}>
            <Button variant="secondary" size="sm" className="bg-white text-dark hover:bg-blue-50 border-0 text-xs font-bold whitespace-nowrap">
              Open Pass & Check In
            </Button>
          </Link>
        </div>
      )}

      {/* Main Search & Destination Input */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-dark tracking-tight">
            Where are you parking today, {user?.name.split(' ')[0] || 'Driver'}?
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a verified parking space or search your exact destination.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search area (e.g. T. Nagar, Marina...)"
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-subtle"
            />
          </div>
          <Link to="/app/search">
            <Button variant="outline" size="md" icon={<Filter className="w-4 h-4" />}>
              Filters
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'ALL', label: 'All Spaces' },
          { id: 'CAR', label: 'Cars Only' },
          { id: 'TWO_WHEELER', label: '2 Wheelers' },
          { id: 'BUDGET', label: 'Under ₹30/hr' },
          { id: 'TOP_RATED', label: 'Top Rated (4.8★+)' },
        ].map((chip) => (
          <button
            key={chip.id}
            onClick={() => setSelectedFilter(chip.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedFilter === chip.id
                ? 'bg-dark text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-dark'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Map & Space Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Map */}
        <div className="lg:col-span-7 sticky top-20">
          <div className="bg-white p-2 rounded-3xl border border-slate-200 shadow-card">
            <InteractiveMap
              parkings={filteredParkings}
              selectedParking={selectedParking}
              onSelectParking={(p) => setSelectedParking(p)}
              userCoords={userCoords}
              height="540px"
            />
          </div>
        </div>

        {/* Right Column: Spaces List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-dark">
              Nearby Parking Spaces ({filteredParkings.length})
            </h3>
            <span className="text-xs text-slate-400">Sorted by distance</span>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <ParkingCardSkeleton />
              <ParkingCardSkeleton />
            </div>
          ) : filteredParkings.length === 0 ? (
            <Card className="p-8 text-center text-slate-500">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-bold text-dark">No parking spaces match your filter</p>
              <p className="text-xs text-slate-400 mt-1">Try broadening your search or resetting filters.</p>
              <Button size="sm" variant="outline" className="mt-4" onClick={() => { setSelectedFilter('ALL'); setSearchQuery(''); }}>
                Reset Filters
              </Button>
            </Card>
          ) : (
            <div className="space-y-3.5 max-h-[540px] overflow-y-auto pr-1">
              {filteredParkings.map((p) => {
                const isSelected = selectedParking?.id === p.id;
                const photo = p.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a';

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedParking(p)}
                    className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-subtle ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/10 shadow-card'
                        : 'border-slate-100 hover:border-slate-300 hover:shadow-card'
                    }`}
                  >
                    <div className="flex gap-4">
                      <img
                        src={photo}
                        alt={p.name}
                        className="w-24 h-24 rounded-xl object-cover shrink-0 bg-slate-100"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-1.5 py-0.2 rounded border border-emerald-200">
                              VERIFIED
                            </span>
                            <span className="text-sm font-black text-primary">
                              ₹{p.price_per_hour}
                              <span className="text-[10px] text-slate-400 font-normal">/hr</span>
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-dark truncate mt-1">{p.name}</h4>
                          <p className="text-[11px] text-slate-500 truncate">{p.address}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{p.average_rating.toFixed(1)}</span>
                            {p.distance_km !== null && p.distance_km !== undefined && (
                              <span className="text-slate-400 font-normal">({p.distance_km} km)</span>
                            )}
                          </div>

                          <Link
                            to={`/app/parking/${p.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-primary hover:bg-primary-700 text-white text-[11px] font-bold px-3 py-1 rounded-lg transition-colors inline-flex items-center gap-1"
                          >
                            <span>Book</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
