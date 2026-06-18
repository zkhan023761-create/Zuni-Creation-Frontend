import React from 'react';

export default function InitialsAvatar({ name, size = 'lg', className = '' }) {
  const initials = name
    ? name.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('')
    : '?';
    
  let sizeClasses = '';
  if (size === 'lg') {
    sizeClasses = 'w-24 h-24 text-3xl';
  } else if (size === 'sm') {
    sizeClasses = 'w-8 h-8 text-sm';
  } else if (size === 'xs') {
    sizeClasses = 'w-6 h-6 text-[10px]';
  }

  return (
    <div className={`${sizeClasses} rounded-full bg-gradient-to-br from-olive-400 to-olive-600 flex items-center justify-center font-bold text-white select-none shrink-0 ${className}`}>
      {initials}
    </div>
  );
}
