import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { MapPinOff } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-3xl bg-blue-50 text-primary flex items-center justify-center mb-4">
        <MapPinOff className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-black text-dark tracking-tight">404 - Page Not Found</h1>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
        The destination you navigated to does not exist or may have moved.
      </p>
      <Link to="/">
        <Button size="md">Return to Home</Button>
      </Link>
    </div>
  );
};
