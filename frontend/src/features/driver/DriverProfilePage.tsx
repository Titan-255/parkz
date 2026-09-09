import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { User, Car, Phone, Mail, ShieldCheck, LogOut, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const DriverProfilePage: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [vehicleNumber, setVehicleNumber] = useState(user?.vehicle_number || '');
  const [vehicleType, setVehicleType] = useState(user?.vehicle_type || 'CAR');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateProfile({
        name,
        phone,
        vehicle_number: vehicleNumber,
        vehicle_type: vehicleType,
      });
      await refreshUser();
      showToast('Profile and vehicle details updated!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-dark tracking-tight">Driver Profile & Vehicle</h1>
        <p className="text-xs text-slate-500">Manage your registered car information and account preferences.</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-xl shadow-card">
            {user?.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-dark">{user?.name}</h2>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified Driver
              </span>
            </div>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pt-6">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
            required
          />

          <Input
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            leftIcon={<Phone className="w-4 h-4" />}
            placeholder="+91 98400 00000"
          />

          <div className="pt-2">
            <h3 className="text-xs font-bold text-dark mb-3 uppercase tracking-wider text-slate-400">
              Primary Vehicle Settings
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Vehicle Number Plate"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                placeholder="TN-01-AB-1234"
                leftIcon={<Car className="w-4 h-4" />}
                required
              />

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Vehicle Type</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary h-10"
                >
                  <option value="CAR">Car / Sedan / SUV</option>
                  <option value="TWO_WHEELER">2 Wheeler (Bike / Scooter)</option>
                  <option value="BOTH">Both</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              type="button"
              className="text-danger border-red-200 hover:bg-red-50"
              icon={<LogOut className="w-4 h-4" />}
              onClick={logout}
            >
              Sign Out
            </Button>

            <Button type="submit" size="md" isLoading={isSaving} icon={<Check className="w-4 h-4" />}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
