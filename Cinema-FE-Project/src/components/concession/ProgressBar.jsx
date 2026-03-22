import React from 'react';

export const ProgressBar = () => {
  return (
    <div className="max-w-4xl mx-auto mb-12">
      <div className="flex justify-between items-end mb-3">
        <div>
          <span className="text-primary-container font-label text-xs uppercase tracking-widest block mb-1">Booking Flow</span>
          <h2 className="text-headline-lg font-headline font-bold text-3xl">Step 3: Snacks</h2>
        </div>
        <span className="text-on-surface-variant font-label text-sm">Almost there!</span>
      </div>
      <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
        <div className="h-full bg-primary-container w-[75%] shadow-[0_0_10px_rgba(229,9,20,0.5)]"></div>
      </div>
    </div>
  );
};
