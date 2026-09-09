import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ParkzLogo } from '../components/common/ParkzLogo';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Mail, Lock, Sparkles, Car, Building2, Shield, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, quickDemoLogin, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const redirectAfterAuth = (role: string) => {
    const from = (location.state as any)?.from?.pathname;
    if (from && from !== '/login') {
      navigate(from, { replace: true });
      return;
    }
    if (role === 'ADMIN') navigate('/admin');
    else if (role === 'OWNER') navigate('/owner');
    else navigate('/app');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login({ email, password });
      redirectAfterAuth(user.role);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    }
  };

  const handleQuickDemo = async (role: 'DRIVER' | 'OWNER' | 'ADMIN') => {
    setError('');
    try {
      const user = await quickDemoLogin(role);
      redirectAfterAuth(user.role);
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-background">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <ParkzLogo size="lg" className="justify-center mb-4" />
        <h2 className="text-2xl font-black text-dark tracking-tight">Sign in to ParkZ</h2>
        <p className="mt-1 text-xs text-slate-500">
          Enter your credentials or choose a quick demo role below.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Quick Demo One-Touch Panel */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/60 shadow-subtle">
          <div className="flex items-center gap-1.5 text-xs font-bold text-primary mb-3">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>1-Click Development Demo Accounts</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('DRIVER')}
              disabled={isLoading}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white hover:bg-blue-600 hover:text-white border border-slate-200 hover:border-blue-600 shadow-sm transition-all text-center group cursor-pointer"
            >
              <Car className="w-4 h-4 text-primary group-hover:text-white mb-1" />
              <span className="text-[11px] font-bold">Driver</span>
              <span className="text-[9px] opacity-70">Demo</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('OWNER')}
              disabled={isLoading}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white hover:bg-slate-900 hover:text-white border border-slate-200 hover:border-slate-900 shadow-sm transition-all text-center group cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-purple-600 group-hover:text-white mb-1" />
              <span className="text-[11px] font-bold">Owner</span>
              <span className="text-[9px] opacity-70">Demo</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('ADMIN')}
              disabled={isLoading}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white hover:bg-red-600 hover:text-white border border-slate-200 hover:border-red-600 shadow-sm transition-all text-center group cursor-pointer"
            >
              <Shield className="w-4 h-4 text-red-600 group-hover:text-white mb-1" />
              <span className="text-[11px] font-bold">Admin</span>
              <span className="text-[9px] opacity-70">Demo</span>
            </button>
          </div>
        </div>

        {/* Standard Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
                {error}
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. driver@parkz.local"
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Button
              type="submit"
              className="w-full text-sm h-11 mt-2"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-bold text-primary hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
