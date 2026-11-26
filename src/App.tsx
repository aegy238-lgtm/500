import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BETTING_DURATION_SECONDS,
  BOTTOM_ROW_FOODS,
  BetHistoryEntry,
  CHIP_VALUES,
  CLOCKWISE_RING,
  ChipValue,
  FOOD_ITEMS,
  GamePhase,
  INITIAL_ROUND_HISTORY,
  INITIAL_ROUND_NUMBER,
  OutcomeId,
  PlayableFoodId,
  RESULT_MODAL_DURATION_SECONDS,
  RoundRecord,
  TOP_ROW_FOODS,
  TopWinnerInfo,
  calculatePayout,
  formatCompactNumber,
  formatRoundCode,
  generateTopWinner,
  getWinningFoods,
  pickWeightedOutcome,
} from './types/game';
import { soundEngine } from './utils/sound';
import { ResultModal } from './components/ResultModal';
import { RulesModal } from './components/RulesModal';
import { TrendModal } from './components/TrendModal';
import { BetHistoryModal } from './components/BetHistoryModal';
import { RechargeModal } from './components/RechargeModal';

const STORAGE_KEY_BALANCE = 'golden_food_wheel_balance_v1';
const STORAGE_KEY_TODAY = 'golden_food_wheel_today_v1';

interface CoinPop {
  id: number;
  foodId: PlayableFoodId;
  amount: number;
}

export default function App() {
  // Persistent wallet & daily earnings
  const [balance, setBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BALANCE);
      if (saved !== null) {
        const parsed = Number(saved);
        if (!Number.isNaN(parsed) && parsed >= 0) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return 50000;
  });

  const [todayEarnings, setTodayEarnings] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TODAY);
      if (saved !== null) {
        const parsed = Number(saved);
        if (!Number.isNaN(parsed) && parsed >= 0) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return 0;
  });

  // Core game state
  const [roundNumber, setRoundNumber] = useState<number>(INITIAL_ROUND_NUMBER);
  const [phase, setPhase] = useState<GamePhase>('BETTING');
  const [timeLeft, setTimeLeft] = useState<number>(16); // Opens at 16s matching Screenshot 4
  const [selectedChip, setSelectedChip] = useState<ChipValue>(2000);
  const [bets, setBets] = useState<Partial<Record<PlayableFoodId, number>>>({});
  const [history, setHistory] = useState<RoundRecord[]>(INITIAL_ROUND_HISTORY);
  const [betHistory, setBetHistory] = useState<BetHistoryEntry[]>([]);

  // Spin & reveal visuals
  const [highlightedFood, setHighlightedFood] = useState<PlayableFoodId | null>(null);
  const [winningReveal, setWinningReveal] = useState<OutcomeId | null>(null);
  const [coinPops, setCoinPops] = useState<CoinPop[]>([]);

  // Result modal state
  const [resultInfo, setResultInfo] = useState<{
    roundNumber: number;
    outcome: OutcomeId;
    userStaked: number;
    userWon: number;
    topWinner: TopWinnerInfo;
  } | null>(null);
  const [resultCountdown, setResultCountdown] = useState<number>(RESULT_MODAL_DURATION_SECONDS);

  // Utility modals & UI controls
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showRules, setShowRules] = useState<boolean>(false);
  const [showTrend, setShowTrend] = useState<boolean>(false);
  const [showBetHistory, setShowBetHistory] = useState<boolean>(false);
  const [showRecharge, setShowRecharge] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Refs for leak-free timer callbacks
  const betsRef = useRef(bets);
  betsRef.current = bets;
  const roundRef = useRef(roundNumber);
  roundRef.current = roundNumber;
  const spinTimeoutsRef = useRef<number[]>([]);
  const toastTimerRef = useRef<number | null>(null);
  const popIdRef = useRef<number>(1);

  // Sync wallet to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BALANCE, String(balance));
    } catch {
      // ignore
    }
  }, [balance]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TODAY, String(todayEarnings));
    } catch {
      // ignore
    }
  }, [todayEarnings]);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMsg(null);
    }, 2200);
  }, []);

  const clearSpinTimeouts = useCallback(() => {
    spinTimeoutsRef.current.forEach((id) => window.clearTimeout(id));
    spinTimeoutsRef.current = [];
  }, []);

  const startNextRound = useCallback(() => {
    clearSpinTimeouts();
    setResultInfo(null);
    setWinningReveal(null);
    setHighlightedFood(null);
    setBets({});
    setRoundNumber((prev) => prev + 1);
    setTimeLeft(BETTING_DURATION_SECONDS);
    setPhase('BETTING');
  }, [clearSpinTimeouts]);

  // Execute the clockwise arcade roulette spin and settle the round
  const runSpinSequence = useCallback(() => {
    clearSpinTimeouts();
    setPhase('SPINNING');
    setWinningReveal(null);

    const outcome = pickWeightedOutcome();
    const targetRingIndex =
      outcome === 'pizza'
        ? Math.floor(Math.random() * 4) // ends near meats
        : outcome === 'salad'
        ? 4 + Math.floor(Math.random() * 4) // ends near veggies
        : CLOCKWISE_RING.indexOf(outcome);

    // 3 full clockwise laps + landing offset
    const totalSteps = CLOCKWISE_RING.length * 3 + targetRingIndex;
    let elapsed = 0;

    for (let step = 0; step <= totalSteps; step++) {
      const progress = step / totalSteps;
      // Smooth arcade easing: snappy fast spin in middle, dramatic deceleration at end
      const delay =
        progress < 0.55
          ? 70
          : Math.round(70 + Math.pow((progress - 0.55) / 0.45, 2.2) * 265);

      elapsed += delay;
      const ringFood = CLOCKWISE_RING[step % CLOCKWISE_RING.length];
      const isFinalStep = step === totalSteps;

      const tId = window.setTimeout(() => {
        setHighlightedFood(ringFood);
        soundEngine.playSpinTick(progress * 6);

        if (isFinalStep) {
          // Reveal winner on the board (for Pizza -> all 4 meats glow; for Salad -> all 4 veggies glow)
          setWinningReveal(outcome);
          setHighlightedFood(null);

          const currentBets = betsRef.current;
          const currentRound = roundRef.current;
          const totalStaked = Object.values(currentBets).reduce((acc, v) => acc + (v || 0), 0);
          const totalWon = calculatePayout(currentBets, outcome);

          if (totalWon > 0) {
            setBalance((prev) => prev + totalWon);
            setTodayEarnings((prev) => prev + totalWon);
            soundEngine.playWinFanfare(outcome === 'pizza' || outcome === 'salad');
          } else if (totalStaked > 0) {
            soundEngine.playLossTone();
          } else if (outcome === 'pizza' || outcome === 'salad') {
            soundEngine.playWinFanfare(true);
          }

          // Prepend round to global history (drives both bottom bar & TrendModal!)
          setHistory((prev) => [{ roundNumber: currentRound, outcome }, ...prev].slice(0, 80));

          // Save personal bet entry if player placed any bet
          if (totalStaked > 0) {
            setBetHistory((prev) =>
              [
                {
                  id: `${currentRound}-${Date.now()}`,
                  roundNumber: currentRound,
                  bets: { ...currentBets },
                  totalStaked,
                  outcome,
                  totalWon,
                  timestamp: Date.now(),
                },
                ...prev,
              ].slice(0, 40)
            );
          }

          const topWinner = generateTopWinner(totalWon, outcome);

          // Hold golden winner celebration on board for 850ms before popping ResultModal
          const revealModalTimer = window.setTimeout(() => {
            setResultInfo({
              roundNumber: currentRound,
              outcome,
              userStaked: totalStaked,
              userWon: totalWon,
              topWinner,
            });
            setResultCountdown(RESULT_MODAL_DURATION_SECONDS);
            setPhase('RESULT');
          }, 850);

          spinTimeoutsRef.current.push(revealModalTimer);
        }
      }, elapsed);

      spinTimeoutsRef.current.push(tId);
    }
  }, [clearSpinTimeouts]);

  // Betting countdown ticker
  useEffect(() => {
    if (phase !== 'BETTING') return;
    const interval = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          runSpinSequence();
          return 0;
        }
        if (prev <= 4) {
          soundEngine.playCountdownBeep();
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [phase, runSpinSequence]);

  // Result modal auto-countdown ticker -> automatically starts next round
  useEffect(() => {
    if (phase !== 'RESULT') return;
    const interval = window.setInterval(() => {
      setResultCountdown((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          startNextRound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [phase, startNextRound]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearSpinTimeouts();
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, [clearSpinTimeouts]);

  // Place a bet on one of the 8 food circles
  const handlePlaceBet = (foodId: PlayableFoodId) => {
    if (phase !== 'BETTING') {
      showToast('انتظر بدء الجولة القادمة للرهان');
      return;
    }
    if (balance < selectedChip) {
      soundEngine.playInsufficient();
      showToast('الرصيد غير كافٍ — اضغط رصيد الشحن');
      return;
    }

    soundEngine.playBetCoin();
    setBalance((prev) => prev - selectedChip);
    setBets((prev) => ({
      ...prev,
      [foodId]: (prev[foodId] || 0) + selectedChip,
    }));

    const popId = popIdRef.current++;
    setCoinPops((prev) => [...prev, { id: popId, foodId, amount: selectedChip }]);
    window.setTimeout(() => {
      setCoinPops((prev) => prev.filter((p) => p.id !== popId));
    }, 550);
  };

  // Top-left back/refund arrow handler
  const handleBackOrRefund = () => {
    const totalStaked = Object.values(bets).reduce((a, b) => a + (b || 0), 0);
    if (phase === 'BETTING' && totalStaked > 0) {
      soundEngine.playChipSelect();
      setBalance((prev) => prev + totalStaked);
      setBets({});
      showToast(`تم استرداد ${totalStaked.toLocaleString('en-US')} عملة`);
    } else {
      soundEngine.playChipSelect();
      showToast(`الجولة الحالية ${formatRoundCode(roundNumber)} قيد اللعب`);
    }
  };

  const handleSelectChip = (val: ChipValue) => {
    soundEngine.playChipSelect();
    setSelectedChip(val);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEngine.setEnabled(next);
    if (next) {
      soundEngine.playChipSelect();
    }
  };

  const handleRecharge = (amount: number) => {
    soundEngine.playRecharge();
    setBalance((prev) => prev + amount);
    setShowRecharge(false);
    showToast(`تم شحن +${amount.toLocaleString('en-US')} عملة بنجاح!`);
  };

  const winningFoodsSet = winningReveal ? new Set(getWinningFoods(winningReveal)) : null;
  const recentTen = history.slice(0, 10);

  const renderFoodCircle = (foodId: PlayableFoodId) => {
    const item = FOOD_ITEMS[foodId];
    const staked = bets[foodId] || 0;
    const isSpinHighlight = phase === 'SPINNING' && highlightedFood === foodId;
    const isWinner = winningFoodsSet?.has(foodId) ?? false;
    const activePops = coinPops.filter((p) => p.foodId === foodId);

    return (
      <div key={foodId} className="flex flex-col items-center">
        <button
          type="button"
          onClick={() => handlePlaceBet(foodId)}
          disabled={phase !== 'BETTING'}
          aria-label={`${item.nameAr} فوز ${item.multiplier}`}
          className={`group relative w-full aspect-square max-w-[104px] rounded-full bg-[#fffef2] flex items-center justify-center p-[12%] transition-transform duration-150 cursor-pointer disabled:cursor-default ${
            isWinner
              ? 'border-[4px] border-[#ff9800] food-circle-winner z-20'
              : isSpinHighlight
              ? 'border-[4px] border-[#ff9d0a] scale-[1.07] shadow-[0_0_20px_5px_rgba(255,166,0,0.85)] z-10'
              : 'border-[3px] border-[#29b63c] shadow-[0_3px_8px_rgba(165,134,20,0.18)] hover:scale-[1.03] active:scale-[0.95]'
          }`}
        >
          <img
            src={item.icon}
            alt={item.nameAr}
            draggable={false}
            className="w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_2px_3px_rgba(0,0,0,0.08)]"
          />

          {/* Player's active stake badge on this food */}
          {staked > 0 && (
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 z-20 px-2 py-[1px] rounded-full bg-gradient-to-b from-[#ffae19] to-[#ef7d00] border-[1.5px] border-white text-white text-[10px] sm:text-[11px] font-extrabold tabular-nums shadow-sm whitespace-nowrap">
              {formatCompactNumber(staked)}
            </div>
          )}

          {/* Floating +chip pop on tap */}
          {activePops.map((pop) => (
            <span
              key={pop.id}
              className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 z-30 text-[#f57c00] font-black text-xs sm:text-sm drop-shadow-[0_1px_1px_#ffffff] animate-coin-pop whitespace-nowrap tabular-nums"
            >
              +{formatCompactNumber(pop.amount)}
            </span>
          ))}
        </button>

        {/* Exact multiplier text below each circle matching Screenshot 4 */}
        <span
          dir="rtl"
          className="mt-1.5 text-[#b66d26] font-bold text-[13px] sm:text-[15px] leading-none tabular-nums"
        >
          فوز {item.multiplier}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full game-canvas-bg flex items-center justify-center sm:p-4 overflow-x-hidden">
      {/* Main Game Stage — fills mobile 100%, framed gracefully on tablet/desktop */}
      <div className="relative w-full max-w-[520px] min-h-screen sm:min-h-0 flex flex-col justify-between px-3 sm:px-5 pt-3 pb-4 sm:py-5">
        {/* Subtle Toast Banner */}
        {toastMsg && (
          <div
            dir="rtl"
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-full bg-[#2e9c38]/95 text-white text-xs sm:text-sm font-bold shadow-lg whitespace-nowrap"
          >
            {toastMsg}
          </div>
        )}

        {/* ==================== TOP BAR (Matching Screenshot 4) ==================== */}
        <header className="flex items-center justify-between gap-2 mb-1 relative z-20">
          {/* Left: Back/Refund Circle + Round Counter */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleBackOrRefund}
              title={
                Object.keys(bets).length > 0 && phase === 'BETTING'
                  ? 'استرداد رهانات الجولة'
                  : 'معلومات الجولة'
              }
              aria-label="رجوع أو استرداد الرهان"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-[1.8px] border-[#4cc456] bg-white/35 hover:bg-white/60 active:scale-95 text-[#3ca844] flex items-center justify-center transition-all cursor-pointer"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
            <span
              dir="rtl"
              className="text-[#3aa843] font-bold text-[17px] sm:text-[19px] tracking-tight tabular-nums whitespace-nowrap"
            >
              جولة {formatRoundCode(roundNumber)}
            </span>
          </div>

          {/* Right: 3 Circular Green Action Icons (Bet History, Sound, Rules) */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Clipboard / Bet History */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playChipSelect();
                setShowBetHistory(true);
              }}
              aria-label="سجل الرهانات"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-[1.8px] border-[#4cc456] bg-[#e5f8cf]/70 hover:bg-[#d8f4ba] active:scale-95 text-[#3ca844] flex items-center justify-center transition-all cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="4" width="12" height="16" rx="2" fill="#4cc456" fillOpacity="0.18" />
                <path d="M9 4.5h6v2H9z" fill="currentColor" />
                <path d="M9.5 11h5M9.5 15h5" />
              </svg>
            </button>

            {/* Music / Sound Toggle */}
            <button
              type="button"
              onClick={handleToggleSound}
              aria-label={soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
              className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-full text-white flex items-center justify-center shadow-xs active:scale-95 transition-all cursor-pointer ${
                soundEnabled ? 'bg-[#4ec54d] hover:bg-[#42b441]' : 'bg-[#94c98f]'
              }`}
            >
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V6l10-2v12" />
                <circle cx="6.5" cy="18" r="2.5" fill="currentColor" />
                <circle cx="16.5" cy="16" r="2.5" fill="currentColor" />
              </svg>
              {!soundEnabled && (
                <span className="absolute w-6 h-[2.5px] bg-white rotate-45 rounded-full" />
              )}
            </button>

            {/* Help / Rules (?) */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playChipSelect();
                setShowRules(true);
              }}
              aria-label="قواعد اللعبة"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#4ec54d] hover:bg-[#42b441] active:scale-95 text-white font-extrabold text-[17px] flex items-center justify-center shadow-xs transition-all cursor-pointer"
            >
              ?
            </button>
          </div>
        </header>

        {/* ==================== BOARD CROWN + MAIN YELLOW FOOD BOARD ==================== */}
        <section className="relative mt-2">
          {/* Crown sitting flush on top center: Salad Bubble | Orange Timer Tab | Pizza Bubble */}
          <div className="relative z-10 flex items-end justify-center gap-2 sm:gap-3 -mb-[6px]">
            {/* Salad Special Lottery Bubble */}
            <div
              title="السلطة: جميع الخضراوات تفوز!"
              className={`relative w-[52px] h-[52px] sm:w-[60px] sm:h-[60px] rounded-full border-[2.5px] flex items-center justify-center p-1.5 transition-all duration-300 ${
                winningReveal === 'salad'
                  ? 'bg-[#fff7a8] border-[#ff9800] scale-115 shadow-[0_0_24px_6px_rgba(255,176,0,0.9)]'
                  : 'bg-gradient-to-b from-[#d8fbd9]/85 to-[#b4efc9]/70 border-white/85 shadow-[inset_0_2px_6px_rgba(255,255,255,0.85)]'
              }`}
            >
              <img
                src="/assets/icons/salad.png"
                alt="سلطة"
                className="w-full h-full object-contain drop-shadow-xs"
              />
            </div>

            {/* Glossy Golden-Orange Countdown Tab */}
            <div className="timer-tab-surface min-w-[110px] sm:min-w-[130px] h-[44px] sm:h-[50px] rounded-t-[18px] rounded-b-[6px] px-5 flex items-center justify-center">
              <span className="text-white font-bold text-[22px] sm:text-[26px] leading-none tabular-nums drop-shadow-[0_1px_2px_rgba(180,92,0,0.35)]">
                {phase === 'BETTING'
                  ? `${timeLeft}s`
                  : phase === 'SPINNING'
                  ? 'جاري...'
                  : 'انتهى'}
              </span>
            </div>

            {/* Pizza Special Lottery Bubble */}
            <div
              title="البيتزا: جميع اللحوم تفوز!"
              className={`relative w-[52px] h-[52px] sm:w-[60px] sm:h-[60px] rounded-full border-[2.5px] flex items-center justify-center p-1.5 transition-all duration-300 ${
                winningReveal === 'pizza'
                  ? 'bg-[#fff7a8] border-[#ff9800] scale-115 shadow-[0_0_24px_6px_rgba(255,176,0,0.9)]'
                  : 'bg-gradient-to-b from-[#d8fbd9]/85 to-[#b4efc9]/70 border-white/85 shadow-[inset_0_2px_6px_rgba(255,255,255,0.85)]'
              }`}
            >
              <img
                src="/assets/icons/pizza.png"
                alt="بيتزا"
                className="w-full h-full object-contain drop-shadow-xs"
              />
            </div>
          </div>

          {/* Main Golden-Yellow Stadium Board (Screenshot 4) */}
          <div className="relative z-10 food-board-surface rounded-[42px] sm:rounded-[52px] border-[4.5px] sm:border-[5px] border-white px-4 sm:px-6 pt-5 sm:pt-6 pb-5 sm:pb-6">
            {/* Top Row: 4 Meats (10x, 15x, 25x, 45x) */}
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5">
              {TOP_ROW_FOODS.map(renderFoodCircle)}
            </div>

            {/* Bottom Row: 4 Vegetables (5x, 5x, 5x, 5x) */}
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5 mt-4 sm:mt-5">
              {BOTTOM_ROW_FOODS.map(renderFoodCircle)}
            </div>
          </div>
        </section>

        {/* ==================== 4 GLOSSY 3D BETTING CHIPS (Matching Screenshot 4) ==================== */}
        <section className="grid grid-cols-4 gap-2.5 sm:gap-3.5 mt-2 sm:mt-3 relative z-20">
          {CHIP_VALUES.map((val) => {
            const isSelected = selectedChip === val;
            return (
              <button
                key={val}
                type="button"
                onClick={() => handleSelectChip(val)}
                className="chip-btn-shell cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2e9c38]"
              >
                <div
                  className={`w-full py-2 sm:py-2.5 rounded-full flex items-center justify-center transition-all ${
                    isSelected ? 'chip-btn-top-orange' : 'chip-btn-top-green'
                  }`}
                >
                  <span className="text-white font-semibold text-[17px] sm:text-[21px] leading-none tabular-nums drop-shadow-[0_1px_1px_rgba(0,0,0,0.16)]">
                    {val}
                  </span>
                </div>
              </button>
            );
          })}
        </section>

        {/* ==================== WALLET, RECHARGE & TODAY'S EARNINGS ROW ==================== */}
        <section className="grid grid-cols-[1.55fr_0.95fr_1fr] items-center gap-2 sm:gap-2.5 mt-3.5 sm:mt-4">
          {/* Balance Pill */}
          <div className="balance-pill-surface h-[44px] sm:h-[48px] rounded-full px-2 sm:px-3 flex items-center gap-2 overflow-hidden">
            <img
              src="/assets/icons/coin.png"
              alt="عملة"
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0 drop-shadow-xs"
            />
            <span className="text-white font-bold text-[19px] sm:text-[22px] leading-none tabular-nums truncate drop-shadow-[0_1px_1px_rgba(32,102,28,0.3)]">
              {balance}
            </span>
          </div>

          {/* Recharge Orange Pill Button */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playChipSelect();
              setShowRecharge(true);
            }}
            className="recharge-pill-surface h-[44px] sm:h-[48px] rounded-full px-2 flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
          >
            <span dir="rtl" className="text-white font-bold text-[13px] sm:text-[15px] whitespace-nowrap">
              رصيد الشحن
            </span>
          </button>

          {/* Today's Earnings Two-Tone Card */}
          <div className="h-[46px] sm:h-[50px] rounded-[10px] overflow-hidden shadow-[0_2px_6px_rgba(74,158,88,0.18)] flex flex-col border border-[#67cf59]/40">
            <div
              dir="rtl"
              className="bg-[#56c949] text-white text-[11px] sm:text-[12px] font-bold text-center py-[2px] leading-tight whitespace-nowrap"
            >
              أرباح اليوم
            </div>
            <div className="flex-1 bg-[#fffff0] flex items-center justify-center px-1">
              <span className="text-[#e3962e] font-extrabold text-[15px] sm:text-[17px] leading-none tabular-nums truncate">
                {todayEarnings}
              </span>
            </div>
          </div>
        </section>

        {/* ==================== BOTTOM RECENT WINNERS BAR + TREND BUTTON ==================== */}
        <section className="mt-3.5 sm:mt-4">
          <div className="relative h-[48px] sm:h-[52px] rounded-full bg-[#fffff2] border-[2px] border-[#f4cf58] shadow-[0_4px_12px_rgba(128,176,120,0.18)] flex items-center overflow-visible">
            {/* 10 Recent Winners Left -> Right, newest on left with NEW badge */}
            <div className="flex-1 grid grid-cols-10 items-center px-2 sm:px-3 h-full">
              {recentTen.map((rec, idx) => {
                const item = FOOD_ITEMS[rec.outcome];
                const isNewest = idx === 0;
                return (
                  <div
                    key={`${rec.roundNumber}-${idx}`}
                    title={`جولة ${formatRoundCode(rec.roundNumber)}: ${item.nameAr}`}
                    className="relative flex items-center justify-center h-full"
                  >
                    <img
                      src={item.icon}
                      alt={item.nameAr}
                      className="w-[26px] h-[26px] sm:w-[30px] sm:h-[30px] object-contain"
                    />
                    {isNewest && (
                      <span className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 px-1 py-[0.5px] rounded-[4px] bg-[#fffef2] border border-[#f5c74c] text-[#f08314] font-black text-[8px] sm:text-[9px] leading-none tracking-tight shadow-2xs">
                        NEW
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right Attached Orange Trend Arrow Button (Opens TrendModal - Screenshot 3) */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playChipSelect();
                setShowTrend(true);
              }}
              aria-label="تفاصيل الاتجاه"
              className="h-full w-[66px] sm:w-[76px] shrink-0 rounded-r-full bg-gradient-to-b from-[#ffb824] via-[#ff9d0d] to-[#f48500] hover:brightness-105 active:scale-95 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.45)] transition-all cursor-pointer"
            >
              <svg
                viewBox="0 0 32 22"
                className="w-7 h-5 text-white drop-shadow-xs"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 17L11 9.5L16.5 14L26 5" />
                <path d="M19.5 5H26V11.5" />
              </svg>
            </button>
          </div>
        </section>
      </div>

      {/* ==================== MODALS (100% Matching Screenshots 1, 2, 3) ==================== */}
      {phase === 'RESULT' && resultInfo && (
        <ResultModal
          roundNumber={resultInfo.roundNumber}
          outcome={resultInfo.outcome}
          userStaked={resultInfo.userStaked}
          userWon={resultInfo.userWon}
          secondsLeft={resultCountdown}
          topWinner={resultInfo.topWinner}
          onClose={startNextRound}
        />
      )}

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}

      {showTrend && <TrendModal history={history} onClose={() => setShowTrend(false)} />}

      {showBetHistory && (
        <BetHistoryModal entries={betHistory} onClose={() => setShowBetHistory(false)} />
      )}

      {showRecharge && (
        <RechargeModal
          currentBalance={balance}
          onRecharge={handleRecharge}
          onClose={() => setShowRecharge(false)}
        />
      )}
    </div>
  );
}
