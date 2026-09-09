import React from 'react';
import { Link } from 'react-router-dom';

interface ParkzLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  to?: string;
}

export const ParkzLogo: React.FC<ParkzLogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
  to = '/'
}) => {
  const sizeClasses = {
    sm: { icon: 'w-7 h-7', text: 'text-lg', badge: 'text-[9px]' },
    md: { icon: 'w-9 h-9', text: 'text-2xl', badge: 'text-[10px]' },
    lg: { icon: 'w-12 h-12', text: 'text-3xl', badge: 'text-xs' },
  };

  const { icon, text } = sizeClasses[size];

  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`${icon} bg-primary rounded-xl flex items-center justify-center text-white shadow-subtle relative overflow-hidden flex-shrink-0`}>
        <svg viewBox="0 0 40 40" fill="none" className="w-4/5 h-4/5">
          <path d="M14 30V10H22.5C26.0899 10 29 12.9101 29 16.5C29 20.0899 26.0899 23 22.5 23H19.5V30H14ZM19.5 18.5H22C23.1046 18.5 24 17.6046 24 16.5C24 15.3954 23.1046 14.5 22 14.5H19.5V18.5Z" fill="white"/>
          <circle cx="29" cy="28" r="4.5" fill="#16A34A"/>
          <path d="M27.5 28L28.5 29L30.5 27" stroke="white" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-black tracking-tight text-dark ${text}`}>PARK<span className="text-primary">Z</span></span>
          <span className="bg-primary-50 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded border border-primary-200">MVP</span>
        </div>
        {showTagline && (
          <span className="text-[11px] text-slate-500 font-medium tracking-wide mt-0.5">Park smarter. Arrive faster.</span>
        )}
      </div>
    </div>
  );

  if (to) {
    return <Link to={to} className="inline-block hover:opacity-95 transition-opacity">{content}</Link>;
  }
  return content;
};
