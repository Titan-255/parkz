import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, Star, ShieldCheck, Car, Clock, 
  Info, ExternalLink, Flag, ArrowRight, UserCheck, ShieldAlert 
} from 'lucide-react';
import { api } from '../../api/client';
import { ParkingSpace, Review } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { StarRating } from '../../components/common/StarRating';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../context/ToastContext';

export const ParkingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [parking, setParking] = useState<ParkingSpace | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Report modal state
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportType, setReportType] = useState('FAKE_LISTING');
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const [parkingData, reviewsData] = await Promise.all([
          api.getParkingById(Number(id)),
          api.getParkingReviews(Number(id)).catch(() => []),
        ]);
        setParking(parkingData);
        setReviews(reviewsData);
      } catch (err) {
        console.error(err);
        showToast('Parking space not found', 'error');
        navigate('/app');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [id, navigate, showToast]);

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDescription.trim()) return;
    setIsSubmittingReport(true);
    try {
      await api.fileComplaint({
        parking_id: Number(id),
        type: reportType,
        description: reportDescription,
      });
      showToast('Thank you for reporting. Our fraud team will review this space.', 'success');
      setIsReportOpen(false);
      setReportDescription('');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit report', 'error');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  if (isLoading || !parking) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-80 w-full rounded-3xl" />
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const primaryPhoto = parking.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a';
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${parking.latitude},${parking.longitude}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Photo Gallery Banner */}
      <div className="relative h-72 sm:h-96 rounded-3xl overflow-hidden shadow-card bg-slate-900">
        <img
          src={primaryPhoto}
          alt={parking.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="bg-emerald-500 text-slate-950 text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified by ParkZ</span>
          </span>
          <span className="bg-slate-900/80 backdrop-blur text-white text-xs font-semibold px-2.5 py-1 rounded-full border border-white/10">
            {parking.vehicle_type.replace('_', ' ')}
          </span>
        </div>

        {/* Bottom Banner Content */}
        <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{parking.name}</h1>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary-300 shrink-0" />
              <span>{parking.address}</span>
            </p>
          </div>

          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/20 hover:bg-white/30 backdrop-blur text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto shrink-0 border border-white/30"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Google Maps Directions</span>
          </a>
        </div>
      </div>

      {/* Main Grid: Details Left, Booking Card Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details, Rules, Reviews */}
        <div className="lg:col-span-2 space-y-6">
          {/* Rating & Stats Bar */}
          <Card className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl font-black text-dark">{parking.average_rating.toFixed(1)}</div>
              <div>
                <StarRating rating={parking.average_rating} size="md" />
                <div className="text-[11px] text-slate-500 font-medium">Based on {reviews.length} completed parkings</div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-bold text-slate-700">Total Spaces</div>
              <div className="text-base font-black text-primary">{parking.total_spaces} Slots</div>
            </div>
          </Card>

          {/* Description */}
          {parking.description && (
            <Card className="p-6">
              <h3 className="text-sm font-bold text-dark mb-2">About this Facility</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {parking.description}
              </p>
            </Card>
          )}

          {/* Entrance Instructions */}
          {parking.entrance_instructions && (
            <Card className="p-6 bg-blue-50/40 border-blue-100">
              <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2">
                <Info className="w-4 h-4" />
                <span>Entrance & Access Guide</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {parking.entrance_instructions}
              </p>
            </Card>
          )}

          {/* Rules */}
          {parking.rules && (
            <Card className="p-6">
              <h3 className="text-sm font-bold text-dark mb-2">Parking Rules</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {parking.rules}
              </p>
            </Card>
          )}

          {/* Reviews List */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-dark">Verified Driver Reviews ({reviews.length})</h3>
            </div>

            {reviews.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No reviews yet for this space.</p>
            ) : (
              <div className="divide-y divide-slate-100 space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="pt-3 first:pt-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700">
                          {r.driver_name?.charAt(0) || 'D'}
                        </div>
                        <span className="text-xs font-bold text-dark">{r.driver_name || 'Verified Driver'}</span>
                      </div>
                      <StarRating rating={r.rating} size="sm" />
                    </div>
                    {r.comment && <p className="text-xs text-slate-600 mt-1">{r.comment}</p>}
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Fraud Report Button */}
          <div className="pt-2">
            <button
              onClick={() => setIsReportOpen(true)}
              className="text-xs font-semibold text-slate-400 hover:text-danger flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Report this listing / Fraud</span>
            </button>
          </div>
        </div>

        {/* Right Column: Pricing & Booking CTA Box */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-20 border-slate-200 shadow-card space-y-5">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-black text-primary">₹{parking.price_per_hour}</span>
                <span className="text-xs text-slate-500 font-medium ml-1">/ hour</span>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Available Now
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span>Vehicle Accepted:</span>
                <span className="font-bold text-dark">{parking.vehicle_type.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Host:</span>
                <span className="font-bold text-dark">{parking.owner_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Check-in:</span>
                <span className="font-bold text-dark">Instant QR Scan</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Cancellation:</span>
                <span className="font-bold text-emerald-600">Full refund &gt;2h prior</span>
              </div>
            </div>

            <Link to={`/app/booking/${parking.id}`} className="block">
              <Button size="lg" className="w-full text-sm font-bold h-12 shadow-card" icon={<ArrowRight className="w-4 h-4" />}>
                Proceed to Book
              </Button>
            </Link>

            <p className="text-[11px] text-slate-400 text-center">
              Guaranteed slot with atomic concurrency protection.
            </p>
          </Card>
        </div>
      </div>

      {/* Report Listing Modal */}
      <Modal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        title="Report Parking Listing"
        description="Help ParkZ maintain verified trust in our community."
      >
        <form onSubmit={handleReportSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Reason for Report</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="FAKE_LISTING">Fake or Non-existent listing</option>
              <option value="PARKING_UNAVAILABLE">Parking is physically unavailable/blocked</option>
              <option value="WRONG_LOCATION">Incorrect map location or address</option>
              <option value="UNSAFE_PARKING">Unsafe or hazardous conditions</option>
              <option value="OTHER">Other violation</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
            <textarea
              rows={3}
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Describe what went wrong or why this listing is suspicious..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsReportOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" type="submit" isLoading={isSubmittingReport}>
              Submit Report
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
