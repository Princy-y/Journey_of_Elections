import React from 'react';

export default function ProgressBar({ current, total }) {
  const percentage = Math.round((current / total) * 100);
  
  return (
    <div className="w-full bg-slate-200 rounded-full h-3 mb-6 overflow-hidden border border-slate-300">
      <div 
        className="bg-primary h-3 rounded-full transition-all duration-700 ease-out"
        style={{ width: `${percentage}%` }}
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin="1"
        aria-valuemax={total}
        aria-label={`Scene ${current} of ${total}`}
      ></div>
      <div className="text-center text-xs text-slate-500 mt-1 font-semibold">
        {current} of {total}
      </div>
    </div>
  );
}
