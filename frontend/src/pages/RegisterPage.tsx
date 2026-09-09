import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ParkzLogo } from '../components/common/ParkzLogo';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Mail, Lock, User, Phone, Car, Building2, ShieldCheck } from 'lucide-react';
import { UserRole } from '../types';

export const RegisterPage: React.FC = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>('DRIVER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('CAR');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const payload: any = {
        name,
        email,
        phone,
        password,
        role,
      };

      if (role === 'DRIVER') {
        payload.vehicle_number = vehicleNumber;
        payload.vehicle_type = vehicleType;
      }

      const user = await register(payload);
      if (user.role === 'OWNER') navigate('/owner');
      else navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-background">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <ParkzLogo size="lg" className="justify-center mb-4" />
        <h2 className="text-2xl font-black text-dark tracking-tight">Create your ParkZ account</h2>
        <p className="mt-1 text-xs text-slate-500">
          Join the verified parking network.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="p-6">
          {/* Role Selection Tabs */}
          <div className="mb-6">
            <label className="text-xs font-bold text-slate-700 block mb-2">I am joining as a:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('DRIVER')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  role === 'DRIVER'
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Car className="w-4 h-4" />
                <span>Driver</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('OWNER')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  role === 'OWNER'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Space Owner</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
                {error}
              </div>
            )}

            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              leftIcon={<User className="w-4 h-4" />}
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. ramesh@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Phone Number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98400 00000"
              leftIcon={<Phone className="w-4 h-4" />}
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            {/* Driver specifics */}
            {role === 'DRIVER' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <div className="text-xs font-bold text-dark flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-primary" />
                  <span>Vehicle Information</span>
                </div>

                <Input
                  label="Vehicle Number Plate"
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. TN-01-AB-1234"
                  required={role === 'DRIVER'}
                />

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Vehicle Type</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="CAR">Car / SUV</option>
                    <option value="TWO_WHEELER">2 Wheeler (Bike / Scooter)</option>
                    <option value="BOTH">Both</option>
                  </select>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full text-sm h-11 mt-2"
              isLoading={isLoading}
            >
              Create {role === 'DRIVER' ? 'Driver' : 'Owner'} Account
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-primary hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
