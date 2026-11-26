import React from 'react';

interface RechargeModalProps {
  currentBalance: number;
  onRecharge: (amount: number) => void;
  onClose: () => void;
}

const PACKAGES = [
  { amount: 20_000, label: 'حزمة البداية', bonus: 'مجانية' },
  { amount: 100_000, label: 'حزمة الفوز', bonus: '+100K' },
  { amount: 500_000, label: 'حزمة VIP', bonus: '+500K' },
  { amount: 2_000_000, label: 'حزمة الملوك', bonus: '+2M' },
];

export const RechargeModal: React.FC<RechargeModalProps> = ({
  currentBalance,
  onRecharge,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] px-3 py-5"
      onClick={onClose}
    >
      <div
        dir="rtl"
        className="relative w-full max-w-[410px] rounded-[22px] bg-[#ffffe2] border-[2.5px] border-[#51c551] shadow-[0_18px_45px_rgba(32,96,42,0.28)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-gradient-to-b from-[#d2f9b6] to-[#e4fdd5] py-3.5 px-12 flex items-center justify-center">
          <h2 className="text-[#2f9938] font-extrabold text-[20px]">رصيد الشحن</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="absolute top-1/2 -translate-y-1/2 left-3.5 w-8 h-8 rounded-full bg-[#52c74c] hover:bg-[#43b43d] active:scale-95 text-white flex items-center justify-center shadow-sm transition-transform cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          <div className="rounded-[14px] bg-[#eefce3] border border-[#cdeeb7] py-2.5 px-4 flex items-center justify-between mb-4">
            <span className="text-[#459648] font-bold text-sm">رصيدك الحالي</span>
            <div className="flex items-center gap-1.5">
              <img src="/assets/icons/coin.png" alt="عملة" className="w-5 h-5 object-contain" />
              <span className="text-[#d98014] font-extrabold text-lg tabular-nums">
                {currentBalance.toLocaleString('en-US')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {PACKAGES.map((pkg) => (
              <button
                key={pkg.amount}
                type="button"
                onClick={() => onRecharge(pkg.amount)}
                className="group rounded-[16px] bg-white border-2 border-[#7ed866] hover:border-[#f79d15] p-3 flex flex-col items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <img
                  src="/assets/icons/coin.png"
                  alt="عملة"
                  className="w-10 h-10 object-contain group-hover:scale-110 transition-transform"
                />
                <span className="text-[#349539] font-extrabold text-base tabular-nums">
                  +{pkg.amount.toLocaleString('en-US')}
                </span>
                <span className="text-xs font-bold text-[#a38b43]">{pkg.label}</span>
                <span className="mt-0.5 w-full py-1 rounded-full recharge-pill-surface text-white text-xs font-extrabold">
                  شحن فوري
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
