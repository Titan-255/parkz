import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { User, Building2, Phone, Mail, ShieldCheck, LogOut, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const OwnerProfilePage: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateProfile({ name, phone });
      await refreshUser();
      showToast('Host profile updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-dark tracking-tight">Host Profile Settings</h1>
        <p className="text-xs text-slate-500">Manage your business contact details and verification profile.</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-card">
            {user?.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-dark">{user?.name}</h2>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified Space Host
              </span>
            </div>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pt-6">
          <Input
            label="Host Name / Business Entity"
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
              Save Profile
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
