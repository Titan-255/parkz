import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, Car, CreditCard, ShieldCheck, 
  AlertCircle, CheckCircle2, XCircle, ArrowRight, ArrowLeft 
} from 'lucide-react';
import { api } from '../../api/client';
import { ParkingSpace, BookingCalculation, Booking } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import confetti from 'canvas-confetti';

export const BookingFlowPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [parking, setParking] = useState<ParkingSpace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Booking selection state
  const now = new Date();
  const defaultStartTime = new Date(now.getTime() + 15 * 60000); // 15 mins from now
  const defaultEndTime = new Date(defaultStartTime.getTime() + 2 * 3600000); // 2 hours later

  const [date, setDate] = useState(defaultStartTime.toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(
    defaultStartTime.toTimeString().split(' ')[0].substring(0, 5)
  );
  const [durationHours, setDurationHours] = useState(2);
  const [vehicleNumber, setVehicleNumber] = useState(user?.vehicle_number || 'TN-01-AB-1234');
  const [vehicleType, setVehicleType] = useState(user?.vehicle_type || 'CAR');

  // Calculation & Booking creation
  const [calculation, setCalculation] = useState<BookingCalculation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    const fetchParking = async () => {
      if (!id) return;
      try {
        const data = await api.getParkingById(Number(id));
        setParking(data);
      } catch (err) {
        showToast('Parking space not found', 'error');
        navigate('/app');
      } finally {
        setIsLoading(false);
      }
    };
    fetchParking();
  }, [id, navigate, showToast]);

  // Recalculate price whenever time changes
  useEffect(() => {
    if (!parking) return;

    const computeBackendPrice = async () => {
      setIsCalculating(true);
      try {
        const startIso = new Date(`${date}T${startTime}:00`).toISOString();
        const endDateObj = new Date(new Date(startIso).getTime() + durationHours * 3600000);
        const endIso = endDateObj.toISOString();

        const calc = await api.calculatePrice({
          parking_id: parking.id,
          start_time: startIso,
          end_time: endIso,
        });
        setCalculation(calc);
      } catch (err) {
        console.error('Calculation error:', err);
      } finally {
        setIsCalculating(false);
      }
    };

    computeBackendPrice();
  }, [parking, date, startTime, durationHours]);

  const handleCreateAndInitiatePayment = async (simulateSuccess: boolean) => {
    if (!parking || !calculation) return;
    setIsProcessingPayment(true);

    try {
      const startIso = new Date(`${date}T${startTime}:00`).toISOString();
      const endIso = new Date(new Date(startIso).getTime() + durationHours * 3600000).toISOString();

      // 1. Create atomic booking (validates concurrency & conflict)
      const booking = await api.createBooking({
        parking_id: parking.id,
        start_time: startIso,
        end_time: endIso,
        vehicle_number: vehicleNumber,
        vehicle_type: vehicleType,
      });

      // 2. Process Mock payment
      const paymentRes = await api.verifyPayment({
        booking_id: booking.booking_id,
        provider: 'mock',
        status: simulateSuccess ? 'SUCCESS' : 'FAILED',
      });

      if (simulateSuccess) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        showToast('Payment Successful! Parking confirmed.', 'success');
        navigate(`/app/bookings/${booking.booking_id}`);
      } else {
        showToast('Payment was declined in mock mode.', 'error');
        navigate(`/app/bookings/${booking.booking_id}`);
      }
    } catch (err: any) {
      showToast(err.message || 'Booking conflict or payment failure', 'error');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (isLoading || !parking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-500">Preparing booking checkout...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-dark hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-black text-dark tracking-tight">Checkout & Reservation</h1>
          <p className="text-xs text-slate-500">Complete your booking for {parking.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: Schedule & Vehicle Form */}
        <div className="md:col-span-7 space-y-4">
          <Card className="p-5 space-y-4">
            <h3 className="text-xs font-bold text-dark flex items-center gap-1.5 uppercase tracking-wider text-slate-400">
              <Calendar className="w-4 h-4 text-primary" />
              <span>1. Schedule & Duration</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Arrival Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Duration: <span className="text-primary font-black">{durationHours} hours</span>
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 8].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setDurationHours(h)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      durationHours === h
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-5 space-y-4">
            <h3 className="text-xs font-bold text-dark flex items-center gap-1.5 uppercase tracking-wider text-slate-400">
              <Car className="w-4 h-4 text-primary" />
              <span>2. Vehicle Details</span>
            </h3>

            <Input
              label="Vehicle License Number"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
              placeholder="TN-01-AB-1234"
              required
            />
          </Card>
        </div>

        {/* Right: Price Calculation & Mock Payment Simulation */}
        <div className="md:col-span-5 space-y-4">
          <Card className="p-5 border-slate-200 shadow-card space-y-4">
            <h3 className="text-xs font-bold text-dark uppercase tracking-wider text-slate-400">
              Booking Summary
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Rate per hour:</span>
                <span className="font-semibold text-dark">₹{parking.price_per_hour.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Duration:</span>
                <span className="font-semibold text-dark">{durationHours} hours</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Base Subtotal:</span>
                <span className="font-semibold text-dark">
                  ₹{calculation ? calculation.base_price.toFixed(2) : (parking.price_per_hour * durationHours).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Platform Commission (20%):</span>
                <span className="font-semibold text-dark">
                  ₹{calculation ? calculation.platform_fee.toFixed(2) : (parking.price_per_hour * durationHours * 0.2).toFixed(2)}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                <span className="text-sm font-bold text-dark">Total Amount:</span>
                <span className="text-2xl font-black text-primary">
                  ₹{calculation ? calculation.total_amount.toFixed(2) : (parking.price_per_hour * durationHours * 1.2).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Mock Payment Simulation Gateway */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-[11px] text-amber-800">
                <div className="flex items-center gap-1.5 font-bold mb-0.5">
                  <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                  <span>Development Payment Mode</span>
                </div>
                <p>Simulate instant sandbox transaction verification below.</p>
              </div>

              <Button
                size="lg"
                className="w-full text-xs font-bold h-11 bg-emerald-600 hover:bg-emerald-700 shadow-card"
                icon={<CheckCircle2 className="w-4 h-4" />}
                isLoading={isProcessingPayment}
                onClick={() => handleCreateAndInitiatePayment(true)}
              >
                Simulate Payment Success
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-semibold text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                icon={<XCircle className="w-4 h-4" />}
                disabled={isProcessingPayment}
                onClick={() => handleCreateAndInitiatePayment(false)}
              >
                Simulate Payment Failure
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
