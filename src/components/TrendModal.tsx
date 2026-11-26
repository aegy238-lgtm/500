import React, { useMemo } from 'react';
import {
  BASE_OMISSION_BEFORE_763,
  FOOD_ITEMS,
  OutcomeId,
  RoundRecord,
  TREND_ROW_ORDER,
} from '../types/game';

interface TrendModalProps {
  history: RoundRecord[]; // newest first
  onClose: () => void;
}

const VISIBLE_COLS = 9;
const TOP_STRIP_COUNT = 11;

export const TrendModal: React.FC<TrendModalProps> = ({ history, onClose }) => {
  // Top strip shows up to 11 most recent winners (left = newest in orange, right = older in green)
  const topStrip = useMemo(() => history.slice(0, TOP_STRIP_COUNT), [history]);

  // Matrix columns: newest 9 rounds displayed left-to-right (772, 771, ..., 764)
  const visibleRounds = useMemo(() => history.slice(0, VISIBLE_COLS), [history]);

  // Compute exact omission count for every (item, roundIndex) chronologically!
  const omissionMatrix = useMemo(() => {
    // Work oldest -> newest across full history
    const chronological = [...history].reverse();
    const running: Record<OutcomeId, number> = { ...BASE_OMISSION_BEFORE_763 };
    const snapshots = new Map<number, Record<OutcomeId, number>>();

    for (const rec of chronological) {
      for (const item of TREND_ROW_ORDER) {
        if (rec.outcome === item) {
          running[item] = 0;
        } else {
          running[item] = running[item] + 1;
        }
      }
      snapshots.set(rec.roundNumber, { ...running });
    }

    return snapshots;
  }, [history]);

  // Build SVG polyline points connecting winning cells across the visible 9 columns
  // Coordinate space: viewBox 0..(VISIBLE_COLS * 100) by 0..(TREND_ROW_ORDER.length * 100)
  const polylinePoints = useMemo(() => {
    return visibleRounds
      .map((rec, colIdx) => {
        const rowIdx = TREND_ROW_ORDER.indexOf(rec.outcome);
        if (rowIdx === -1) return null;
        const cx = colIdx * 100 + 50;
        const cy = rowIdx * 100 + 50;
        return `${cx},${cy}`;
      })
      .filter(Boolean)
      .join(' ');
  }, [visibleRounds]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-[2px] px-2.5 py-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[460px] rounded-[22px] bg-[#ffffe6] border-[2.5px] border-[#61cc59] shadow-[0_20px_50px_rgba(24,88,36,0.34)] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Soft Pastel Green Header (Screenshot 3) */}
        <div className="relative bg-gradient-to-b from-[#d2f9b6] to-[#e4fdd5] py-3.5 px-12 flex items-center justify-center shrink-0">
          <h2 dir="rtl" className="text-[#2f9938] font-extrabold text-[20px]">
            تفاصيل الاتجاه
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="absolute top-1/2 -translate-y-1/2 right-3.5 w-8 h-8 rounded-full bg-[#52c74c] hover:bg-[#43b43d] active:scale-95 text-white flex items-center justify-center shadow-sm transition-transform cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-2.5 pt-2 flex flex-col overflow-hidden">
          {/* Top Summary Strip: 11 recent winners (orange newest on left, green rest) */}
          <div className="flex items-center rounded-[10px] overflow-hidden bg-[#f2fde7] border border-[#daf5c7]">
            <div className="w-[46px] sm:w-[54px] shrink-0 h-10 bg-[#d5f7bb]" />
            <div className="flex-1 flex items-center justify-around px-1.5 py-1.5 gap-0.5 overflow-x-auto">
              {topStrip.map((rec, idx) => {
                const item = FOOD_ITEMS[rec.outcome];
                const isLatest = idx === 0;
                return (
                  <div
                    key={`${rec.roundNumber}-${idx}`}
                    title={`جولة ${rec.roundNumber}: ${item.nameAr}`}
                    className={`w-[27px] h-[27px] sm:w-[30px] sm:h-[30px] rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                      isLatest ? 'bg-[#f58a27]' : 'bg-[#56ca45]'
                    }`}
                  >
                    <img
                      src={item.whiteIcon}
                      alt={item.nameAr}
                      className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] object-contain"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subheading */}
          <div dir="rtl" className="text-center text-[#3ca342] font-bold text-[15px] py-1.5">
            تفاصيل
          </div>

          {/* Matrix Table Container */}
          <div className="rounded-[14px] overflow-hidden border border-[#d6f5bf] bg-[#eefce3]">
            {/* Header Row: Round Numbers */}
            <div className="grid grid-cols-[48px_1fr] sm:grid-cols-[56px_1fr] bg-[#dbf9c3]">
              <div className="h-8 bg-[#cef5b0]" />
              <div
                className="grid items-center h-8 text-[#3ea444] font-bold text-[11px] sm:text-[12px] tabular-nums"
                style={{ gridTemplateColumns: `repeat(${visibleRounds.length}, minmax(0, 1fr))` }}
              >
                {visibleRounds.map((rec) => (
                  <div key={rec.roundNumber} className="text-center">
                    {rec.roundNumber}
                  </div>
                ))}
              </div>
            </div>

            {/* Matrix Body: 10 food rows + connecting SVG green line */}
            <div className="grid grid-cols-[48px_1fr] sm:grid-cols-[56px_1fr]">
              {/* Left Sticky Food Icon Column */}
              <div className="flex flex-col bg-[#d5f7bb]">
                {TREND_ROW_ORDER.map((foodId, rIdx) => {
                  const item = FOOD_ITEMS[foodId];
                  return (
                    <div
                      key={foodId}
                      className={`h-[34px] sm:h-[38px] flex items-center justify-center ${
                        rIdx % 2 === 1 ? 'bg-[#cef4b2]/70' : ''
                      }`}
                    >
                      <div className="w-[27px] h-[27px] sm:w-[30px] sm:h-[30px] rounded-full bg-white flex items-center justify-center shadow-xs p-0.5">
                        <img
                          src={item.icon}
                          alt={item.nameAr}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Data Grid + Connecting SVG Polyline */}
              <div className="relative">
                {/* Connecting bright-green line matching Screenshot 3 */}
                {visibleRounds.length > 1 && (
                  <svg
                    viewBox={`0 0 ${visibleRounds.length * 100} ${TREND_ROW_ORDER.length * 100}`}
                    preserveAspectRatio="none"
                    className="pointer-events-none absolute inset-0 w-full h-full z-10"
                  >
                    <polyline
                      points={polylinePoints}
                      fill="none"
                      stroke="#58ca47"
                      strokeWidth="9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}

                {/* Rows */}
                <div className="flex flex-col">
                  {TREND_ROW_ORDER.map((foodId, rIdx) => {
                    const item = FOOD_ITEMS[foodId];
                    return (
                      <div
                        key={foodId}
                        className={`grid items-center h-[34px] sm:h-[38px] ${
                          rIdx % 2 === 0 ? 'bg-[#f4feea]' : 'bg-[#eafad9]'
                        }`}
                        style={{
                          gridTemplateColumns: `repeat(${visibleRounds.length}, minmax(0, 1fr))`,
                        }}
                      >
                        {visibleRounds.map((rec, cIdx) => {
                          const isHit = rec.outcome === foodId;
                          const isLatestCol = cIdx === 0;
                          const snap = omissionMatrix.get(rec.roundNumber);
                          const count = snap ? snap[foodId] : 0;

                          return (
                            <div
                              key={`${foodId}-${rec.roundNumber}`}
                              className="relative flex items-center justify-center h-full"
                            >
                              {isHit ? (
                                <div
                                  className={`relative z-20 w-[26px] h-[26px] sm:w-[30px] sm:h-[30px] rounded-full flex items-center justify-center shadow-sm ${
                                    isLatestCol ? 'bg-[#f58a27]' : 'bg-[#56ca45]'
                                  }`}
                                >
                                  <img
                                    src={item.whiteIcon}
                                    alt={item.nameAr}
                                    className="w-[17px] h-[17px] sm:w-[20px] sm:h-[20px] object-contain"
                                  />
                                </div>
                              ) : (
                                <span className="text-[#4ca650] font-semibold text-[11px] sm:text-[12px] tabular-nums">
                                  {count >= 500 ? '500+' : count}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
