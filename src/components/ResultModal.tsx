import React from 'react';
import {
  FOOD_ITEMS,
  OutcomeId,
  TopWinnerInfo,
  formatCompactNumber,
  formatRoundCode,
  getWinningFoods,
} from '../types/game';

interface ResultModalProps {
  roundNumber: number;
  outcome: OutcomeId;
  userStaked: number;
  userWon: number;
  secondsLeft: number;
  topWinner: TopWinnerInfo;
  onClose: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  roundNumber,
  outcome,
  userStaked,
  userWon,
  secondsLeft,
  topWinner,
  onClose,
}) => {
  const outcomeItem = FOOD_ITEMS[outcome];
  const winningFoods = getWinningFoods(outcome);
  const didWin = userWon > 0;
  const didBet = userStaked > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] px-3 py-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[430px] rounded-[24px] bg-[#ffffe2] border-[2.5px] border-[#51c551] shadow-[0_18px_45px_rgba(32,96,42,0.28)] pt-7 pb-6 px-4 overflow-visible"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Sunburst & Winning Food bursting over top notch (Screenshot 1) */}
        <div className="pointer-events-none absolute -top-[54px] left-1/2 -translate-x-1/2 flex items-center justify-center w-[132px] h-[132px]">
          <div className="absolute inset-0 rounded-full sunburst-rays opacity-75 [mask-image:radial-gradient(circle,black_38%,transparent_72%)]" />
          <div className="relative z-10 w-[76px] h-[76px] flex items-center justify-center drop-shadow-[0_6px_12px_rgba(68,148,54,0.3)]">
            <img
              src={outcomeItem.icon}
              alt={outcomeItem.nameAr}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Circular green X close button (top-right, matching Screenshot 1) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق"
          className="absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full bg-[#52c74c] hover:bg-[#43b43d] active:scale-95 text-white flex items-center justify-center shadow-sm transition-transform cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        {/* Inner scalloped/notched decorative green frame matching Screenshot 1 */}
        <div className="relative rounded-[18px] border-[1.5px] border-[#59c659] border-t-0 pt-5 pb-5 px-3.5 mt-1">
          {/* Scalloped perforated top border SVG */}
          <svg
            viewBox="0 0 400 22"
            preserveAspectRatio="none"
            className="pointer-events-none absolute -top-[1px] left-0 right-0 w-full h-[22px]"
          >
            <path
              d="M 1 21 L 1 12 Q 1 1 14 1 L 24 1 A 11 11 0 0 0 46 1 L 68 1 A 11 11 0 0 0 90 1 L 112 1 A 11 11 0 0 0 134 1 L 156 1 A 11 11 0 0 0 178 1 L 222 1 A 11 11 0 0 0 244 1 L 266 1 A 11 11 0 0 0 288 1 L 310 1 A 11 11 0 0 0 332 1 L 354 1 A 11 11 0 0 0 376 1 L 386 1 Q 399 1 399 12 L 399 21"
              fill="none"
              stroke="#59c659"
              strokeWidth="1.8"
            />
          </svg>

          {/* Top 2-column content area */}
          <div className="grid grid-cols-[1.02fr_1fr] gap-3 items-start mt-2">
            {/* LEFT BOX: Pastel mint card with yellow pin, countdown badge, and emoji/win */}
            <div className="relative rounded-[16px] bg-gradient-to-b from-[#c7fab6] via-[#d3fcce] to-[#defde8] p-3 pt-6 pb-4 flex flex-col items-center justify-center min-h-[174px] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
              {/* Yellow Push-Pin at top center */}
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#fff066] via-[#ffd01c] to-[#f49b00] shadow-[0_2px_4px_rgba(180,115,0,0.35)]" />
                <div className="w-[3.5px] h-3.5 -mt-1 rotate-[-14deg] rounded-full bg-gradient-to-b from-[#ff9800] to-[#d96c00]" />
                <div className="w-3.5 h-3.5 -mt-2 rounded-full bg-[#ffffe2] -z-10" />
              </div>

              {/* White Countdown pill at top-right */}
              <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-white text-[#48ad48] text-xs font-bold tabular-nums shadow-xs">
                {secondsLeft}s
              </div>

              {didWin ? (
                <div className="flex flex-col items-center justify-center text-center mt-2">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-[#ffe65c]/60 blur-md" />
                    <img
                      src="/assets/icons/coin.png"
                      alt="فوز"
                      className="relative w-16 h-16 object-contain drop-shadow-md animate-bounce"
                    />
                  </div>
                  <div className="mt-1 px-3 py-0.5 rounded-full bg-[#ff9b17] text-white font-extrabold text-sm tabular-nums shadow-sm">
                    +{userWon.toLocaleString('en-US')}
                  </div>
                </div>
              ) : (
                <img
                  src="/assets/icons/sad_emoji.png"
                  alt="لم تفز"
                  className="w-[116px] h-[116px] object-contain mt-1 drop-shadow-[0_4px_8px_rgba(218,154,28,0.22)]"
                />
              )}
            </div>

            {/* RIGHT COLUMN: Round Win Banner + Arabic Message */}
            <div className="flex flex-col items-center pt-1">
              {/* Green-bordered round winner card */}
              <div className="w-full rounded-[10px] border-[1.5px] border-[#51c551] overflow-hidden bg-[#fffff2] shadow-xs">
                <div
                  dir="rtl"
                  className="bg-gradient-to-b from-[#bdf5a3] via-[#cdf8bc] to-[#e1fce0] py-1 px-2 text-center text-[#39993c] text-xs font-bold tabular-nums"
                >
                  فوز بجولة {formatRoundCode(roundNumber)}:
                </div>
                <div className="py-1.5 px-2 flex items-center justify-center gap-1 flex-wrap bg-[#fffff4]">
                  {outcome === 'pizza' || outcome === 'salad' ? (
                    <>
                      <img
                        src={outcomeItem.icon}
                        alt={outcomeItem.nameAr}
                        className="w-7 h-7 object-contain"
                      />
                      <span className="text-[#51c551] font-extrabold text-xs">=</span>
                      {winningFoods.map((fid) => (
                        <img
                          key={fid}
                          src={FOOD_ITEMS[fid].icon}
                          alt={FOOD_ITEMS[fid].nameAr}
                          className="w-6 h-6 object-contain"
                        />
                      ))}
                    </>
                  ) : (
                    <img
                      src={outcomeItem.icon}
                      alt={outcomeItem.nameAr}
                      className="w-8 h-8 object-contain"
                    />
                  )}
                </div>
              </div>

              {/* Status Arabic text matching Screenshot 1 */}
              <div dir="rtl" className="mt-5 text-center leading-snug px-1">
                {didWin ? (
                  <>
                    <p className="text-[#2f9e36] font-extrabold text-[17px]">
                      تهانينا! لقد فزت
                    </p>
                    <p className="text-[#e68400] font-extrabold text-[16px] mt-1 tabular-nums">
                      {outcome === 'pizza'
                        ? 'جائزة البيتزا الكبرى!'
                        : outcome === 'salad'
                        ? 'جائزة السلطة الكبرى!'
                        : `ربحت ${userWon.toLocaleString('en-US')} عملة!`}
                    </p>
                  </>
                ) : didBet ? (
                  <>
                    <p className="text-[#3ca342] font-bold text-[17px]">إنه لأمر مؤسف</p>
                    <p className="text-[#3ca342] font-bold text-[16px] mt-0.5">
                      لقد فقدت الجائزة الكبرى!
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[#3ca342] font-bold text-[17px]">إنه لأمر مؤسف</p>
                    <p className="text-[#3ca342] font-bold text-[15px] mt-0.5">
                      لم تشارك بالرهان في هذه الجولة!
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* BOTTOM CENTER: #1 Top Winner Showcase matching Screenshot 1 */}
          <div className="mt-6 flex flex-col items-center">
            <span className="text-[#e39634] font-bold text-sm tracking-wide">
              {topWinner.name}
            </span>

            <div className="relative mt-2">
              {/* Gold Crown #1 Badge on top-left */}
              <div className="absolute -top-2 -left-2 z-10 flex flex-col items-center">
                <svg viewBox="0 0 24 14" className="w-4 h-2.5 -mb-1 text-[#ffc107] drop-shadow-xs" fill="currentColor">
                  <path d="M2 12L4 3l5 5 3-7 3 7 5-5 2 9H2z" />
                </svg>
                <div className="w-7 h-7 rounded-full bg-gradient-to-b from-[#ffd53b] to-[#f79d15] border-2 border-[#fff9d4] text-white text-xs font-extrabold flex items-center justify-center shadow-sm">
                  1
                </div>
              </div>

              {/* Circular Avatar */}
              <div
                className="w-[74px] h-[74px] rounded-full flex items-center justify-center text-white font-extrabold text-xl border-[3px] border-[#fff8cc] shadow-md"
                style={{ background: topWinner.avatarBg }}
              >
                {topWinner.initials}
              </div>
            </div>

            {/* Gold Coin + Win Amount */}
            <div className="mt-2 flex items-center gap-1.5">
              <img
                src="/assets/icons/coin.png"
                alt="عملة"
                className="w-5 h-5 object-contain"
              />
              <span className="text-[#df8c26] font-extrabold text-base tabular-nums">
                {formatCompactNumber(topWinner.winAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
