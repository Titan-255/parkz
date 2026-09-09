import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, MapPin, Car, DollarSign, Clock, 
  Image, Shield, CheckCircle2, ArrowRight, ArrowLeft, Sparkles 
} from 'lucide-react';
import { api } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';

export const AddParkingWizard: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(13.0418);
  const [longitude, setLongitude] = useState(80.2341);
  const [vehicleType, setVehicleType] = useState('BOTH');
  const [totalSpaces, setTotalSpaces] = useState(4);
  const [pricePerHour, setPricePerHour] = useState(30);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80');
  const [rules, setRules] = useState('Reverse parking only. Keep vehicle locked. No overnight stay without prior reservation.');
  const [entranceInstructions, setEntranceInstructions] = useState('Enter through the main sliding security gate. Display ParkZ pass to on-duty guard.');

  const totalSteps = 8;

  const handleNext = () => {
    if (currentStep === 1 && !name.trim()) {
      showToast('Please enter a parking facility name', 'error');
      return;
    }
    if (currentStep === 2 && !address.trim()) {
      showToast('Please enter a complete address', 'error');
      return;
    }
    setCurrentStep((prev) => Math.min(totalSteps, prev + 1));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.createParking({
        name,
        description,
        address,
        latitude: Number(latitude),
        longitude: Number(longitude),
        price_per_hour: Number(pricePerHour),
        vehicle_type: vehicleType,
        total_spaces: Number(totalSpaces),
        rules,
        entrance_instructions: entranceInstructions,
        images: imageUrl ? [imageUrl] : [],
      });

      showToast('Listing submitted! It is now pending admin verification.', 'success');
      navigate('/owner/parking');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit parking', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Step Progress Bar */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
          <span>STEP {currentStep} OF {totalSteps}</span>
          <span>{Math.round((currentStep / totalSteps) * 100)}% Completed</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <Card className="p-6 md:p-8">
        {/* Step 1: Name & Description */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-dark flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <span>Step 1: Space Title & Overview</span>
            </h2>
            <p className="text-xs text-slate-500">Give your parking facility a clear, recognizable name.</p>

            <Input
              label="Parking Facility Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. T. Nagar Covered Executive Garage"
              required
            />

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Highlight key amenities (e.g. 24/7 CCTV, covered shade, wide bays, EV charger)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        )}

        {/* Step 2: Address & Coordinates */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-dark flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span>Step 2: Location & Address</span>
            </h2>
            <p className="text-xs text-slate-500">Provide the exact street address and coordinates for driver navigation.</p>

            <Input
              label="Street Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 45 Usman Road, T. Nagar, Chennai, Tamil Nadu 600017"
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Latitude"
                type="number"
                step="0.0001"
                value={latitude}
                onChange={(e) => setLatitude(Number(e.target.value))}
                required
              />
              <Input
                label="Longitude"
                type="number"
                step="0.0001"
                value={longitude}
                onChange={(e) => setLongitude(Number(e.target.value))}
                required
              />
            </div>

            {/* Quick Chennai Presets */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 block mb-1">Quick Chennai Location Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { name: 'T. Nagar', lat: 13.0418, lng: 80.2341, addr: 'Usman Road, T. Nagar, Chennai' },
                  { name: 'Marina Beach', lat: 13.0334, lng: 80.2785, addr: 'Kamarajar Salai, Santhome, Chennai' },
                  { name: 'Anna Nagar', lat: 13.0850, lng: 80.2101, addr: '2nd Avenue, Anna Nagar, Chennai' },
                  { name: 'OMR IT Tech Park', lat: 12.9647, lng: 80.2458, addr: 'OMR Road, Kandanchavadi, Chennai' },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setLatitude(preset.lat);
                      setLongitude(preset.lng);
                      setAddress(preset.addr);
                    }}
                    className="text-[10px] bg-slate-100 hover:bg-primary hover:text-white px-2.5 py-1 rounded-lg transition-colors font-semibold"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Vehicle Type & Capacity */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-dark flex items-center gap-2">
              <Car className="w-5 h-5 text-primary" />
              <span>Step 3: Vehicle Type & Capacity</span>
            </h2>
            <p className="text-xs text-slate-500">Select which vehicle types fit your bays and how many slots you have.</p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Accepted Vehicle Type</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'BOTH', label: 'Car & 2-Wheeler' },
                  { id: 'CAR', label: 'Car Only' },
                  { id: 'TWO_WHEELER', label: '2-Wheeler Only' },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setVehicleType(type.id)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                      vehicleType === type.id
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Total Available Parking Slots"
              type="number"
              min="1"
              max="100"
              value={totalSpaces}
              onChange={(e) => setTotalSpaces(Number(e.target.value))}
              required
            />
          </div>
        )}

        {/* Step 4: Hourly Rate */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-dark flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <span>Step 4: Hourly Rate</span>
            </h2>
            <p className="text-xs text-slate-500">Set your base price per hour. You keep 80% net revenue directly.</p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Price per Hour (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min="10"
                  max="500"
                  step="5"
                  value={pricePerHour}
                  onChange={(e) => setPricePerHour(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
              <div className="font-bold">Earnings Estimate:</div>
              <div>Gross Driver Price: ₹{pricePerHour.toFixed(2)}/hr</div>
              <div>Platform Commission (20%): -₹{(pricePerHour * 0.2).toFixed(2)}</div>
              <div className="font-bold text-emerald-700">Your Net Earnings: ₹{(pricePerHour * 0.8).toFixed(2)} / slot / hr</div>
            </div>
          </div>
        )}

        {/* Step 5: Schedule Availability */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-dark flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span>Step 5: Operational Hours</span>
            </h2>
            <p className="text-xs text-slate-500">Default schedule is active 7 days a week, 24 hours.</p>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Standard 24/7 Full Week Booking Enabled automatically.</span>
            </div>
          </div>
        )}

        {/* Step 6: Photos */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-dark flex items-center gap-2">
              <Image className="w-5 h-5 text-primary" />
              <span>Step 6: Facility Photos</span>
            </h2>
            <p className="text-xs text-slate-500">Provide a high quality photo URL of the parking area.</p>

            <Input
              label="Primary Photo URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />

            {imageUrl && (
              <div className="mt-2 h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        )}

        {/* Step 7: Rules & Instructions */}
        {currentStep === 7 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-dark flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span>Step 7: Parking Rules & Gate Instructions</span>
            </h2>
            <p className="text-xs text-slate-500">Give clear instructions so drivers park safely.</p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Entrance & Gate Guide</label>
              <textarea
                rows={3}
                value={entranceInstructions}
                onChange={(e) => setEntranceInstructions(e.target.value)}
                placeholder="e.g. Enter through Gate 2..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Facility Rules</label>
              <textarea
                rows={3}
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                placeholder="e.g. Speed limit 10km/h..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        )}

        {/* Step 8: Review & Submit */}
        {currentStep === 8 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-dark flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>Step 8: Review & Finalize</span>
            </h2>
            <p className="text-xs text-slate-500">
              Confirm your details. Upon submission, your listing will be verified by the Admin team.
            </p>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
              <div><span className="font-bold">Facility:</span> {name}</div>
              <div><span className="font-bold">Address:</span> {address}</div>
              <div><span className="font-bold">Capacity:</span> {totalSpaces} slots ({vehicleType.replace('_', ' ')})</div>
              <div><span className="font-bold">Price:</span> ₹{pricePerHour}/hour</div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              Listing status will be <strong>PENDING VERIFICATION</strong> until approved by ParkZ operations.
            </div>
          </div>
        )}

        {/* Navigation Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={currentStep === 1 || isSubmitting}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>

          {currentStep < totalSteps ? (
            <Button size="sm" onClick={handleNext} icon={<ArrowRight className="w-4 h-4" />}>
              Continue
            </Button>
          ) : (
            <Button size="md" isLoading={isSubmitting} onClick={handleSubmit} icon={<CheckCircle2 className="w-4 h-4" />}>
              Submit Listing for Verification
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
