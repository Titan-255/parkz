import React, { useEffect, useRef, useState } from 'react';
import { ParkingSpace } from '../../types';
import { Navigation, Compass, Layers, MapPin, ExternalLink, Star } from 'lucide-react';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';

interface InteractiveMapProps {
  parkings: ParkingSpace[];
  selectedParking?: ParkingSpace | null;
  onSelectParking?: (parking: ParkingSpace) => void;
  userCoords?: { latitude: number; longitude: number };
  center?: [number, number];
  zoom?: number;
  className?: string;
  height?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  parkings,
  selectedParking,
  onSelectParking,
  userCoords = { latitude: 13.0827, longitude: 80.2707 }, // Chennai
  center = [13.0450, 80.2400],
  zoom = 13,
  className = '',
  height = '500px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: number]: any }>({});
  const [mapError, setMapError] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    let map: any = null;

    const initMap = async () => {
      try {
        const L = (window as any).L || (await import('leaflet')).default;
        if (!mapContainerRef.current) return;

        // Clean up previous instance
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }

        map = L.map(mapContainerRef.current, {
          center: selectedParking ? [selectedParking.latitude, selectedParking.longitude] : center,
          zoom: zoom,
          zoomControl: false,
        });

        // Add standard OSM tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors | ParkZ',
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Add user location marker
        if (userCoords) {
          const userIcon = L.divIcon({
            className: 'user-location-marker-container',
            html: `<div class="user-location-marker"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });
          L.marker([userCoords.latitude, userCoords.longitude], { icon: userIcon })
            .addTo(map)
            .bindPopup('<b>Your Current Location</b>');
        }

        // Add parking markers with custom price badges
        markersRef.current = {};
        parkings.forEach((p) => {
          const isSelected = selectedParking?.id === p.id;
          const priceHtml = `
            <div class="custom-price-marker ${isSelected ? 'active' : ''}">
              <span>₹${p.price_per_hour.toFixed(0)}/h</span>
            </div>
          `;

          const customIcon = L.divIcon({
            className: 'custom-leaflet-marker',
            html: priceHtml,
            iconSize: [60, 28],
            iconAnchor: [30, 14],
          });

          const marker = L.marker([p.latitude, p.longitude], { icon: customIcon }).addTo(map);

          marker.on('click', () => {
            if (onSelectParking) {
              onSelectParking(p);
            }
          });

          markersRef.current[p.id] = marker;
        });

        mapInstanceRef.current = map;
      } catch (err) {
        console.error('Leaflet map initialization fallback:', err);
        setMapError(true);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [parkings, userCoords.latitude, userCoords.longitude]);

  // Pan to selected parking when changed
  useEffect(() => {
    if (selectedParking && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [selectedParking.latitude, selectedParking.longitude],
        15,
        { animate: true, duration: 1 }
      );
    }
  }, [selectedParking]);

  const handleLocateMe = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([pos.coords.latitude, pos.coords.longitude], 14);
          }
        },
        () => {
          setIsLocating(false);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([userCoords.latitude, userCoords.longitude], 14);
          }
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  if (mapError) {
    return (
      <div className={`relative bg-slate-100 rounded-2xl flex flex-col items-center justify-center p-6 border border-slate-200 text-center ${className}`} style={{ height }}>
        <MapPin className="w-10 h-10 text-primary mb-2" />
        <h4 className="text-sm font-bold text-dark">Interactive Map View</h4>
        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
          Showing {parkings.length} verified parking spaces around Chennai.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md max-h-60 overflow-y-auto">
          {parkings.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectParking && onSelectParking(p)}
              className="p-3 bg-white rounded-xl border border-slate-200 text-left hover:border-primary cursor-pointer transition-all text-xs"
            >
              <div className="font-bold text-dark truncate">{p.name}</div>
              <div className="text-primary font-bold">₹{p.price_per_hour}/hr</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-slate-200 shadow-subtle ${className}`} style={{ height }}>
      {/* Map canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Map Overlays: Top Bar Controls */}
      <div className="absolute top-3 left-3 z-[400] flex items-center gap-2">
        <div className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>{parkings.length} live spaces nearby</span>
        </div>
      </div>

      <div className="absolute top-3 right-3 z-[400] flex flex-col gap-2">
        <button
          onClick={handleLocateMe}
          title="Locate Me"
          className="w-9 h-9 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center transition-colors cursor-pointer"
        >
          <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin text-primary' : ''}`} />
        </button>
      </div>

      {/* Floating Selected Parking Preview Card */}
      {selectedParking && (
        <div className="absolute bottom-4 left-4 right-4 md:left-4 md:right-auto md:w-80 z-[400] bg-white rounded-2xl p-4 border border-slate-200 shadow-popover animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex justify-between items-start gap-2 mb-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-200">VERIFIED</span>
                <span className="text-xs text-slate-400">• {selectedParking.vehicle_type.replace('_', ' ')}</span>
              </div>
              <h4 className="text-sm font-bold text-dark line-clamp-1 mt-1">{selectedParking.name}</h4>
              <p className="text-xs text-slate-500 line-clamp-1">{selectedParking.address}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-base font-black text-primary">₹{selectedParking.price_per_hour}</span>
              <span className="text-[10px] text-slate-400 block font-medium">/hour</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{selectedParking.average_rating.toFixed(1)}</span>
              {selectedParking.distance_km !== null && selectedParking.distance_km !== undefined && (
                <span className="text-slate-400 font-normal">({selectedParking.distance_km} km)</span>
              )}
            </div>

            <Link
              to={`/app/parking/${selectedParking.id}`}
              className="bg-primary hover:bg-primary-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
            >
              <span>View Spot</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
