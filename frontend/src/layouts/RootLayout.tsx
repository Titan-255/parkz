import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/navbar/Navbar';
import { DriverBottomNav } from '../components/navbar/DriverBottomNav';
import { GoogleMapsAIParkingAssistant } from '../components/ai/GoogleMapsAIParkingAssistant';

export const RootLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-dark">
      <Navbar />
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      <GoogleMapsAIParkingAssistant />
      <DriverBottomNav />
    </div>
  );
};
