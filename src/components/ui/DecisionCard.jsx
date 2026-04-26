import React from 'react';
import { motion } from 'framer-motion';

export default function DecisionCard({ title, impact, onSelect, selected }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      role="radio"
      aria-checked={selected ? 'true' : 'false'}
      className={`w-full text-left p-4 rounded-xl border-2 transition-colors duration-200 outline-none ${
        selected 
          ? 'border-primary bg-orange-50 shadow-md' 
          : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-lg text-secondary">{title}</h3>
        {selected && (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </span>
        )}
      </div>
      {impact && (
        <p className="text-sm mt-2 font-medium text-slate-600 bg-slate-100 p-2 rounded-md inline-block">
          Impact: {impact}
        </p>
      )}
    </motion.button>
  );
}
