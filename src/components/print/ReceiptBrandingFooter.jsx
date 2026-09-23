import React from 'react';

/**
 * Universal Branding Footer for all thermal receipts
 * Applied to: Sales, Reservations, Expenses, Z/X-Reports, Returns, Handover, and Movement receipts.
 */
export function ReceiptBrandingFooter() {
  return (
    <div
      className="pt-2 mt-1.5 text-center text-black select-none"
      style={{ color: '#000000', backgroundColor: '#ffffff' }}
    >
      {/* Neat dashed divider */}
      <div
        className="text-[9px] font-mono tracking-widest leading-none text-black select-none"
        style={{ color: '#000000' }}
      >
        --------------------------------
      </div>

      {/* Mandatory Brand Tagline */}
      <div
        className="text-[9.5px] font-bold text-black pt-1 leading-tight tracking-wide"
        style={{ color: '#000000' }}
      >
        نظام POS بواسطة shamkhi25
      </div>
    </div>
  );
}
