import React from 'react';
import {
  BetHistoryEntry,
  FOOD_ITEMS,
  PlayableFoodId,
  formatCompactNumber,
  formatRoundCode,
} from '../types/game';

interface BetHistoryModalProps {
  entries: BetHistoryEntry[];
  onClose: () => void;
}

export const BetHistoryModal: React.FC<BetHistoryModalProps> = ({ entries, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] px-3 py-5"
      onClick={onClose}
    >
      <div
        dir="rtl"
        className="relative w-full max-w-[440px] max-h-[82vh] rounded-[22px] bg-[#ffffe2] border-[2.5px] border-[#51c551] shadow-[0_18px_45px_rgba(32,96,42,0.28)] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-b from-[#d2f9b6] to-[#e4fdd5] py-3.5 px-12 flex items-center justify-center shrink-0">
          <h2 className="text-[#2f9938] font-extrabold text-[20px]">سجل الرهانات</h2>
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

        {/* List */}
        <div className="game-scroll overflow-y-auto p-3.5 space-y-2.5 flex-1">
          {entries.length === 0 ? (
            <div className="py-12 text-center text-[#7ea66e] font-bold text-base">
              لا توجد رهانات مسجلة بعد.
              <p className="text-xs font-semibold text-[#99b38a] mt-1">
                اختر قيمة العملة واضغط على أي صنف طعام للبدء!
              </p>
            </div>
          ) : (
            entries.map((entry) => {
              const outcomeItem = FOOD_ITEMS[entry.outcome];
              const isWin = entry.totalWon > 0;
              const betEntries = Object.entries(entry.bets) as [PlayableFoodId, number][];
              return (
                <div
                  key={entry.id}
                  className="rounded-[14px] bg-[#f5feea] border border-[#cef2b5] p-3 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between border-b border-[#dff5cb] pb-1.5">
                    <span className="text-[#3ca342] font-bold text-sm tabular-nums">
                      جولة {formatRoundCode(entry.roundNumber)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-[#6f9664] font-semibold">الفائز:</span>
                      <img
                        src={outcomeItem.icon}
                        alt={outcomeItem.nameAr}
                        className="w-6 h-6 object-contain"
                      />
                      <span className="text-xs font-bold text-[#38953d]">
                        {outcomeItem.nameAr}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {betEntries.map(([fid, amt]) => (
                        <div
                          key={fid}
                          className="flex items-center gap-1 bg-white/90 border border-[#d6f2c1] rounded-lg px-1.5 py-0.5"
                        >
                          <img
                            src={FOOD_ITEMS[fid].icon}
                            alt={FOOD_ITEMS[fid].nameAr}
                            className="w-4 h-4 object-contain"
                          />
                          <span className="text-[11px] font-bold text-[#8c6828] tabular-nums">
                            {formatCompactNumber(amt)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="text-left shrink-0 tabular-nums">
                      <div className="text-[11px] text-[#8f8959] font-semibold">
                        الرهان: {entry.totalStaked.toLocaleString('en-US')}
                      </div>
                      <div
                        className={`text-sm font-extrabold ${
                          isWin ? 'text-[#289c30]' : 'text-[#d16c2c]'
                        }`}
                      >
                        {isWin
                          ? `+${entry.totalWon.toLocaleString('en-US')}`
                          : `-${entry.totalStaked.toLocaleString('en-US')}`}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
