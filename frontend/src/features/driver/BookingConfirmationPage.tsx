import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, AlertCircle, QrCode, MapPin, 
  Clock, Navigation, ShieldCheck, X, ExternalLink, 
  Check, Star, RotateCcw, ArrowLeft, Camera 
} from 'lucide-react';
import { api } from '../../api/client';
import { Booking, QRCodeData } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { QRViewer } from '../../components/common/QRViewer';
import { StarRating } from '../../components/common/StarRating';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../context/ToastContext';

export const BookingConfirmationPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [parkingQr, setParkingQr] = useState<QRCodeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  // Review state
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Check in simulation state
  const [inputToken, setInputToken] = useState('');
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // Cancellation state
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchBooking = async () => {
    if (!bookingId) return;
    try {
      const data = await api.getBookingById(bookingId);
      setBooking(data);
      if (data.parking_id) {
        const qr = await api.getParkingQR(data.parking_id).catch(() => null);
        setParkingQr(qr);
        if (qr) setInputToken(qr.secure_token); // Pre-fill for seamless 1-click scan simulation
      }
    } catch (err) {
      showToast('Booking not found', 'error');
      navigate('/app/bookings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const handleSimulatedCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking || !inputToken) return;
    setIsCheckingIn(true);
    try {
      const result = await api.checkIn(booking.booking_id, inputToken);
      showToast(result.message, 'success');
      setIsCheckInOpen(false);
      await fetchBooking();
    } catch (err: any) {
      showToast(err.message || 'Check-in failed', 'error');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCompleteSession = async () => {
    if (!booking) return;
    try {
      await api.completeBooking(booking.booking_id);
      showToast('Parking session completed! Please leave a review.', 'success');
      await fetchBooking();
      setIsReviewOpen(true);
    } catch (err: any) {
      showToast(err.message || 'Could not complete session', 'error');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;
    setIsSubmittingReview(true);
    try {
      await api.createReview({
        booking_id: booking.booking_id,
        rating: rating,
        comment: reviewComment,
      });
      showToast('Thank you for your rating!', 'success');
      setIsReviewOpen(false);
      await fetchBooking();
    } catch (err: any) {
      showToast(err.message || 'Review submission error', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    setIsCancelling(true);
    try {
      const res = await api.cancelBooking(booking.booking_id);
      showToast(`Booking cancelled. Refund of ₹${res.refund_amount.toFixed(2)} processed.`, 'info');
      setIsCancelOpen(false);
      await fetchBooking();
    } catch (err: any) {
      showToast(err.message || 'Cancellation failed', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading || !booking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${booking.parking?.latitude},${booking.parking?.longitude}`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/app/bookings"
          className="text-xs font-semibold text-slate-500 hover:text-dark flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Bookings</span>
        </Link>

        <span className="text-xs font-mono font-bold text-slate-500">
          Pass #{booking.booking_id}
        </span>
      </div>

      {/* Main Confirmed Card */}
      <Card className="p-6 md:p-8 space-y-6 border-slate-200 shadow-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              booking.status === 'CONFIRMED' || booking.status === 'CHECKED_IN' || booking.status === 'COMPLETED'
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : 'bg-red-50 text-red-600 border border-red-200'
            }`}>
              {booking.status === 'CONFIRMED' || booking.status === 'CHECKED_IN' || booking.status === 'COMPLETED' ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <AlertCircle className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-dark tracking-tight">
                  {booking.status === 'CONFIRMED' && 'Parking Confirmed'}
                  {booking.status === 'CHECKED_IN' && 'Checked In & Active'}
                  {booking.status === 'COMPLETED' && 'Parking Completed'}
                  {booking.status === 'CANCELLED' && 'Booking Cancelled'}
                  {booking.status === 'FAILED' && 'Payment Failed'}
                </h1>
                <Badge
                  variant={
                    booking.status === 'CONFIRMED' || booking.status === 'CHECKED_IN' || booking.status === 'COMPLETED'
                      ? 'success'
                      : 'danger'
                  }
                >
                  {booking.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {booking.parking?.name} • License: {booking.vehicle_number}
              </p>
            </div>
          </div>

          <div className="text-right sm:self-auto self-end">
            <div className="text-xl font-black text-primary">₹{booking.amount.toFixed(2)}</div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Paid</div>
          </div>
        </div>

        {/* QR Code Pass (For Confirmed or Checked In) */}
        {(booking.status === 'CONFIRMED' || booking.status === 'CHECKED_IN') && (
          <div className="flex flex-col items-center justify-center py-2">
            <QRViewer
              value={booking.parking?.qr_code?.secure_token || `PARKZ-PASS-${booking.booking_id}`}
              title="Entrance QR Pass"
              subtitle="Display or scan this token at the parking gate entrance."
              size={180}
            />

            {/* Check-In / Complete Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
              {booking.status === 'CONFIRMED' && (
                <Button
                  size="md"
                  className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold px-6 shadow-sm"
                  icon={<Camera className="w-4 h-4" />}
                  onClick={() => setIsCheckInOpen(true)}
                >
                  Simulate QR Gate Check-In
                </Button>
              )}

              {booking.status === 'CHECKED_IN' && (
                <Button
                  size="md"
                  className="bg-slate-900 hover:bg-black text-xs font-bold px-6 shadow-sm"
                  icon={<Check className="w-4 h-4" />}
                  onClick={handleCompleteSession}
                >
                  Complete Parking Session
                </Button>
              )}

              <a
                href={googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
              >
                <ExternalLink className="w-4 h-4 text-primary" />
                <span>Google Maps Directions</span>
              </a>
            </div>
          </div>
        )}

        {/* Completed State Rating Button */}
        {booking.status === 'COMPLETED' && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-emerald-900">Session Finished Smoothly</div>
              <p className="text-[11px] text-emerald-700">Thank you for parking with ParkZ. How was your host?</p>
            </div>
            <Button size="sm" icon={<Star className="w-4 h-4" />} onClick={() => setIsReviewOpen(true)}>
              Rate & Review
            </Button>
          </div>
        )}

        {/* Schedule & Rules details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="space-y-1.5">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Time Interval</span>
            <p className="font-semibold text-dark">
              {new Date(booking.start_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
            <p className="text-slate-500">
              to {new Date(booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Location Address</span>
            <p className="font-semibold text-dark">{booking.parking?.address}</p>
          </div>
        </div>

        {/* Cancellation CTA if applicable */}
        {booking.status === 'CONFIRMED' && booking.can_cancel && (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-[11px] text-slate-500">
              Change of plans? Full refund is permitted before scheduled arrival.
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => setIsCancelOpen(true)}
            >
              Cancel Reservation
            </Button>
          </div>
        )}
      </Card>

      {/* QR Check-in Simulation Modal */}
      <Modal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        title="Gate QR Scanner Simulation"
        description="Verify parking entrance by scanning the location's secure QR code token."
      >
        <form onSubmit={handleSimulatedCheckIn} className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
            <div className="font-bold mb-0.5">Facility Gate Token Detected</div>
            <p className="font-mono text-[11px] opacity-90 truncate">{inputToken}</p>
          </div>

          <Input
            label="Scanned QR Security Token"
            value={inputToken}
            onChange={(e) => setInputToken(e.target.value)}
            placeholder="PARKZ-QR-..."
            required
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsCheckInOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" isLoading={isCheckingIn}>
              Confirm Check-In
            </Button>
          </div>
        </form>
      </Modal>

      {/* Leave Review Modal */}
      <Modal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        title="Review Parking Experience"
        description={`Share feedback for ${booking.parking?.name}`}
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Overall Rating</label>
            <StarRating
              rating={rating}
              size="lg"
              interactive={true}
              onRatingChange={(r) => setRating(r)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Your Feedback (Optional)</label>
            <textarea
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="How was the entrance access, security, and space quality?"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsReviewOpen(false)}>
              Skip
            </Button>
            <Button size="sm" type="submit" isLoading={isSubmittingReview}>
              Submit Review
            </Button>
          </div>
        </form>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        title="Cancel Reservation"
        description="Are you sure you want to cancel this booking?"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Based on ParkZ cancellation policy, your refund amount will be approximately{' '}
            <span className="font-bold text-dark">₹{booking.refund_amount_preview?.toFixed(2) || booking.amount.toFixed(2)}</span>.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsCancelOpen(false)}>
              Keep Booking
            </Button>
            <Button variant="danger" size="sm" isLoading={isCancelling} onClick={handleCancelBooking}>
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
