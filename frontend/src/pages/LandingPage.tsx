import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, ShieldCheck, QrCode, Navigation, ArrowRight, 
  Car, Building2, CheckCircle2, Clock, Zap, Star, HelpCircle 
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ParkzLogo } from '../components/common/ParkzLogo';

export const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-24 bg-gradient-to-b from-blue-50/60 via-white to-background border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Headline */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/70 border border-blue-200/80 text-primary text-xs font-bold shadow-sm">
                <Zap className="w-3.5 h-3.5 fill-primary" />
                <span>Underused parking spaces converted into instant revenue</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-dark tracking-tight leading-[1.1]">
                Find parking <span className="text-primary">before you arrive.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Discover, book, and pay for verified private parking spaces near your destination in Chennai. Guaranteed spot, zero hassle, instant QR entry.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link to="/app" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto text-base px-8 h-12 shadow-card" icon={<Search className="w-5 h-5" />}>
                    Find Parking
                  </Button>
                </Link>
                <Link to="/owner" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 h-12" icon={<Building2 className="w-5 h-5" />}>
                    List Your Space
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% Verified Locations</span>
                </div>
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-primary" />
                  <span>Instant QR Check-in</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Double Booking Protection</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-5 shadow-popover border border-slate-200/80">
                {/* Visual Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold text-dark">Live Spots in Chennai</span>
                  </div>
                  <span className="text-[11px] font-bold text-primary bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100">
                    Verified
                  </span>
                </div>

                {/* Mini Sample Cards */}
                <div className="space-y-3 mt-4">
                  <div className="p-3.5 bg-slate-50 hover:bg-blue-50/40 rounded-2xl border border-slate-100 transition-all flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-dark">T. Nagar Prime Garage</div>
                      <div className="text-[11px] text-slate-500">Usman Road • 150m away</div>
                      <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold mt-1">
                        <Star className="w-3 h-3 fill-amber-400" /> 4.9 (42 reviews)
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-black text-primary">₹30<span className="text-[10px] text-slate-400 font-normal">/hr</span></div>
                      <span className="inline-block text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded mt-1">
                        4 slots free
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 hover:bg-blue-50/40 rounded-2xl border border-slate-100 transition-all flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-dark">Marina Promenade Valet</div>
                      <div className="text-[11px] text-slate-500">Kamarajar Salai • Beachfront</div>
                      <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold mt-1">
                        <Star className="w-3 h-3 fill-amber-400" /> 4.8 (89 reviews)
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-black text-primary">₹25<span className="text-[10px] text-slate-400 font-normal">/hr</span></div>
                      <span className="inline-block text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded mt-1">
                        8 slots free
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 hover:bg-blue-50/40 rounded-2xl border border-slate-100 transition-all flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-dark">Anna Nagar 2nd Avenue</div>
                      <div className="text-[11px] text-slate-500">Near Tower Park</div>
                      <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold mt-1">
                        <Star className="w-3 h-3 fill-amber-400" /> 4.7 (31 reviews)
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-black text-primary">₹35<span className="text-[10px] text-slate-400 font-normal">/hr</span></div>
                      <span className="inline-block text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded mt-1">
                        2 slots free
                      </span>
                    </div>
                  </div>
                </div>

                <Link to="/app" className="block mt-4">
                  <Button variant="secondary" size="sm" className="w-full text-xs font-bold h-9">
                    Explore All Verified Locations
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. How ParkZ Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xs font-black tracking-widest text-primary uppercase mb-2">How It Works</h2>
          <p className="text-3xl font-extrabold text-dark tracking-tight">Park in 3 Simple Steps</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-primary flex items-center justify-center font-black text-lg mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-dark mb-2">Find Verified Parking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Search around your destination. Filter by price, vehicle compatibility, and distance with live map availability.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-primary flex items-center justify-center font-black text-lg mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-dark mb-2">Book & Pay Ahead</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose your duration and confirm your reservation. Transparent pricing with concurrency-locked double booking protection.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-primary flex items-center justify-center font-black text-lg mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-dark mb-2">Scan QR & Park</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Arrive at the gated parking, scan the entrance QR pass on your phone, and park without waiting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. For Drivers & For Owners */}
      <section className="py-20 bg-background border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Drivers */}
            <Card className="p-8 border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center mb-4">
                <Car className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-dark mb-2">For Drivers</h3>
              <p className="text-sm text-slate-600 mb-6">Stop wasting fuel and time circling the block searching for parking.</p>

              <ul className="space-y-3 text-xs font-semibold text-slate-700 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Guaranteed slot waiting upon arrival</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Accurate transparent hourly pricing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>CCTV monitored & guard-verified facilities</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Automated QR check-in & flexible cancellation</span>
                </li>
              </ul>

              <Link to="/app">
                <Button size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                  Explore Driver App
                </Button>
              </Link>
            </Card>

            {/* Owners */}
            <Card className="p-8 border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-dark mb-2">For Space Owners</h3>
              <p className="text-sm text-slate-600 mb-6">Turn unused driveways, commercial plots, and garages into recurring monthly income.</p>

              <ul className="space-y-3 text-xs font-semibold text-slate-700 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span>List your space in under 3 minutes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span>Full control over hourly rates and active hours</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span>Printable entrance QR code for seamless guest check-ins</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span>Direct automated net payout tracking</span>
                </li>
              </ul>

              <Link to="/owner">
                <Button variant="secondary" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                  Host Your Parking
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* 4. Trust & Security */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xs font-black tracking-widest text-primary-400 uppercase mb-2">Built on Trust</h2>
          <p className="text-3xl font-extrabold tracking-tight">Enterprise Safety & Concurrency</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 text-left">
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700">
              <ShieldCheck className="w-6 h-6 text-emerald-400 mb-3" />
              <h4 className="text-sm font-bold text-white mb-1">Human Verification</h4>
              <p className="text-xs text-slate-400">Every host and facility is reviewed and approved by the ParkZ Operations team.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700">
              <Zap className="w-6 h-6 text-blue-400 mb-3" />
              <h4 className="text-sm font-bold text-white mb-1">Zero Double Booking</h4>
              <p className="text-xs text-slate-400">Atomic database transaction locking ensures spots cannot be overbooked.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700">
              <QrCode className="w-6 h-6 text-amber-400 mb-3" />
              <h4 className="text-sm font-bold text-white mb-1">Encrypted QR Tokens</h4>
              <p className="text-xs text-slate-400">Cryptographically secure check-in validation ensures correct facility access.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700">
              <Star className="w-6 h-6 text-purple-400 mb-3" />
              <h4 className="text-sm font-bold text-white mb-1">Verified Driver Reviews</h4>
              <p className="text-xs text-slate-400">Only verified drivers with completed parking sessions can post ratings.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-black tracking-widest text-primary uppercase mb-2">FAQ</h2>
            <p className="text-3xl font-extrabold text-dark tracking-tight">Frequently Asked Questions</p>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <h4 className="text-sm font-bold text-dark mb-1">How does QR check-in work?</h4>
              <p className="text-xs text-slate-600">
                When you arrive at the booked parking space, open your active booking pass on the ParkZ app and scan the QR sign displayed at the gate. The system validates your session instantly.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <h4 className="text-sm font-bold text-dark mb-1">What is the cancellation policy?</h4>
              <p className="text-xs text-slate-600">
                Cancellations made more than 2 hours before your scheduled start time receive a 100% full refund. Cancellations made within 2 hours receive a partial 50% refund.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <h4 className="text-sm font-bold text-dark mb-1">How do space owners receive their earnings?</h4>
              <p className="text-xs text-slate-600">
                ParkZ collects a modest 20% platform commission on bookings. Net earnings are calculated and recorded to your host wallet immediately upon booking confirmation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start">
            <ParkzLogo size="md" showTagline={true} />
            <p className="text-xs text-slate-500 mt-2">© 2026 PARKZ Technologies Inc. All rights reserved.</p>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold">
            <Link to="/app" className="hover:text-white transition-colors">Find Parking</Link>
            <Link to="/owner" className="hover:text-white transition-colors">Host Space</Link>
            <Link to="/login" className="hover:text-white transition-colors">Demo Login</Link>
            <Link to="/admin" className="hover:text-white transition-colors">Admin Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
