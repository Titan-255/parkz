import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, SlidersHorizontal, MapPin, Star, Car, 
  ArrowUpDown, LayoutGrid, Map as MapIcon, RotateCcw, ArrowRight 
} from 'lucide-react';
import { api } from '../../api/client';
import { ParkingSpace } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Skeleton, ParkingCardSkeleton } from '../../components/ui/Skeleton';
import { InteractiveMap } from '../../components/map/InteractiveMap';

export const ParkingSearchPage: React.FC = () => {
  const [parkings, setParkings] = useState<ParkingSpace[]>([]);
  const [selectedParking, setSelectedParking] = useState<ParkingSpace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [vehicleType, setVehicleType] = useState('ALL');
  const [maxPrice, setMaxPrice] = useState<number>(60);
  const [minRating, setMinRating] = useState<number>(0);
  const [radiusKm, setRadiusKm] = useState<number>(25);
  const [sortBy, setSortBy] = useState('nearest');
  const [viewMode, setViewMode] = useState<'split' | 'grid' | 'map'>('split');

  const userCoords = { latitude: 13.0827, longitude: 80.2707 };

  const fetchResults = async () => {
    setIsLoading(true);
    try {
      const data = await api.getParkings({
        latitude: userCoords.latitude,
        longitude: userCoords.longitude,
        search: search || undefined,
        vehicle_type: vehicleType !== 'ALL' ? vehicleType : undefined,
        max_price: maxPrice,
        min_rating: minRating > 0 ? minRating : undefined,
        radius_km: radiusKm,
        sort_by: sortBy,
      });
      setParkings(data);
      if (data.length > 0) setSelectedParking(data[0]);
    } catch (err) {
      console.error('Failed to search parkings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [vehicleType, maxPrice, minRating, radiusKm, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResults();
  };

  const handleReset = () => {
    setSearch('');
    setVehicleType('ALL');
    setMaxPrice(60);
    setMinRating(0);
    setRadiusKm(25);
    setSortBy('nearest');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header & Main Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-dark tracking-tight">Search Parking Spaces</h1>
          <p className="text-xs text-slate-500">Fine-tune your location, vehicle type, and pricing.</p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-max self-end md:self-auto">
          <button
            onClick={() => setViewMode('split')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              viewMode === 'split' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-dark'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Split View</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-dark'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">List View</span>
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <Card className="p-4 bg-white">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
          {/* Keyword Search */}
          <div className="lg:col-span-2">
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Destination / Landmark</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. Marina, T. Nagar..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Vehicle Type */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Vehicle</label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="ALL">All Vehicles</option>
              <option value="CAR">Car / SUV</option>
              <option value="TWO_WHEELER">2 Wheeler</option>
            </select>
          </div>

          {/* Max Price */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Max: ₹{maxPrice}/hr</label>
            <input
              type="range"
              min="15"
              max="60"
              step="5"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer mt-1"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="nearest">Nearest First</option>
              <option value="cheapest">Cheapest First</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" className="flex-1 text-xs h-9">
              Apply
            </Button>
            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-xl text-slate-400 hover:text-dark hover:bg-slate-100 transition-colors border border-slate-200 h-9 flex items-center justify-center cursor-pointer"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </Card>

      {/* Results View */}
      {viewMode === 'split' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Map Column */}
          <div className="lg:col-span-7 sticky top-20">
            <InteractiveMap
              parkings={parkings}
              selectedParking={selectedParking}
              onSelectParking={(p) => setSelectedParking(p)}
              userCoords={userCoords}
              height="560px"
            />
          </div>

          {/* List Column */}
          <div className="lg:col-span-5 space-y-3 max-h-[560px] overflow-y-auto pr-1">
            {isLoading ? (
              <>
                <ParkingCardSkeleton />
                <ParkingCardSkeleton />
              </>
            ) : parkings.length === 0 ? (
              <Card className="p-8 text-center text-slate-500">
                <MapPin className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p className="text-sm font-bold text-dark">No spaces found</p>
                <p className="text-xs text-slate-400 mt-1">Try increasing your price slider or search radius.</p>
              </Card>
            ) : (
              parkings.map((p) => {
                const isSelected = selectedParking?.id === p.id;
                const photo = p.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a';

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedParking(p)}
                    className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-subtle ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/10 shadow-card'
                        : 'border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex gap-3.5">
                      <img
                        src={photo}
                        alt={p.name}
                        className="w-20 h-20 rounded-xl object-cover shrink-0 bg-slate-100"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-dark truncate">{p.name}</span>
                            <span className="text-sm font-black text-primary">₹{p.price_per_hour}/hr</span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">{p.address}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1">
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{p.average_rating.toFixed(1)}</span>
                            {p.distance_km !== null && (
                              <span className="text-slate-400 font-normal">({p.distance_km} km)</span>
                            )}
                          </div>

                          <Link
                            to={`/app/parking/${p.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-primary hover:bg-primary-700 text-white text-[11px] font-bold px-3 py-1 rounded-lg transition-colors inline-flex items-center gap-1"
                          >
                            <span>Book Now</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <>
              <ParkingCardSkeleton />
              <ParkingCardSkeleton />
              <ParkingCardSkeleton />
            </>
          ) : (
            parkings.map((p) => {
              const photo = p.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a';
              return (
                <Card key={p.id} hoverable className="p-4 flex flex-col justify-between">
                  <div>
                    <div className="relative rounded-xl overflow-hidden h-44 mb-3 bg-slate-100">
                      <img src={photo} alt={p.name} className="w-full h-full object-cover" />
                      <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur px-2 py-0.5 rounded-md text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        VERIFIED
                      </div>
                      <div className="absolute bottom-2.5 right-2.5 bg-slate-900/90 text-white px-2.5 py-1 rounded-lg text-xs font-black">
                        ₹{p.price_per_hour}/hr
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-dark line-clamp-1">{p.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{p.address}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-4">
                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{p.average_rating.toFixed(1)}</span>
                      <span className="text-slate-400 font-normal">({p.total_reviews})</span>
                    </div>

                    <Link to={`/app/parking/${p.id}`}>
                      <Button size="sm" className="text-xs font-bold px-3 py-1.5">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
