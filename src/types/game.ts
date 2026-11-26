export type PlayableFoodId =
  | 'sausage'
  | 'chicken'
  | 'shrimp'
  | 'steak'
  | 'tomato'
  | 'radish'
  | 'mushroom'
  | 'corn';

export type OutcomeId = PlayableFoodId | 'pizza' | 'salad';

export type FoodCategory = 'meat' | 'veggie' | 'special';

export interface FoodItemConfig {
  id: OutcomeId;
  nameAr: string;
  multiplier: number;
  category: FoodCategory;
  icon: string;
  whiteIcon: string;
  weight: number;
}

export const FOOD_ITEMS: Record<OutcomeId, FoodItemConfig> = {
  sausage: {
    id: 'sausage',
    nameAr: 'سجق',
    multiplier: 10,
    category: 'meat',
    icon: '/assets/icons/sausage.png',
    whiteIcon: '/assets/icons/sausage_white.png',
    weight: 9,
  },
  chicken: {
    id: 'chicken',
    nameAr: 'دجاج',
    multiplier: 15,
    category: 'meat',
    icon: '/assets/icons/chicken.png',
    whiteIcon: '/assets/icons/chicken_white.png',
    weight: 6,
  },
  shrimp: {
    id: 'shrimp',
    nameAr: 'جمبري',
    multiplier: 25,
    category: 'meat',
    icon: '/assets/icons/shrimp.png',
    whiteIcon: '/assets/icons/shrimp_white.png',
    weight: 3.5,
  },
  steak: {
    id: 'steak',
    nameAr: 'ستيك',
    multiplier: 45,
    category: 'meat',
    icon: '/assets/icons/steak.png',
    whiteIcon: '/assets/icons/steak_white.png',
    weight: 1.8,
  },
  tomato: {
    id: 'tomato',
    nameAr: 'طماطم',
    multiplier: 5,
    category: 'veggie',
    icon: '/assets/icons/tomato.png',
    whiteIcon: '/assets/icons/tomato_white.png',
    weight: 19,
  },
  radish: {
    id: 'radish',
    nameAr: 'فجل',
    multiplier: 5,
    category: 'veggie',
    icon: '/assets/icons/radish.png',
    whiteIcon: '/assets/icons/radish_white.png',
    weight: 19,
  },
  mushroom: {
    id: 'mushroom',
    nameAr: 'فطر',
    multiplier: 5,
    category: 'veggie',
    icon: '/assets/icons/mushroom.png',
    whiteIcon: '/assets/icons/mushroom_white.png',
    weight: 19,
  },
  corn: {
    id: 'corn',
    nameAr: 'ذرة',
    multiplier: 5,
    category: 'veggie',
    icon: '/assets/icons/corn.png',
    whiteIcon: '/assets/icons/corn_white.png',
    weight: 19,
  },
  pizza: {
    id: 'pizza',
    nameAr: 'بيتزا',
    multiplier: 0, // Pays ALL 4 meats by their individual multipliers!
    category: 'special',
    icon: '/assets/icons/pizza.png',
    whiteIcon: '/assets/icons/pizza_white.png',
    weight: 1.5,
  },
  salad: {
    id: 'salad',
    nameAr: 'سلطة',
    multiplier: 0, // Pays ALL 4 vegetables by their individual multipliers!
    category: 'special',
    icon: '/assets/icons/salad.png',
    whiteIcon: '/assets/icons/salad_white.png',
    weight: 2.2,
  },
};

// Exact board grid order matching Screenshot 4 (top row meats L->R, bottom row veggies L->R)
export const TOP_ROW_FOODS: PlayableFoodId[] = ['sausage', 'chicken', 'shrimp', 'steak'];
export const BOTTOM_ROW_FOODS: PlayableFoodId[] = ['tomato', 'radish', 'mushroom', 'corn'];
export const ALL_PLAYABLE_FOODS: PlayableFoodId[] = [...TOP_ROW_FOODS, ...BOTTOM_ROW_FOODS];

// Clockwise visual order around the 2x4 board for smooth roulette sweep
export const CLOCKWISE_RING: PlayableFoodId[] = [
  'sausage',
  'chicken',
  'shrimp',
  'steak',
  'corn',
  'mushroom',
  'radish',
  'tomato',
];

// Exact vertical order in the Trend Details matrix matching Screenshot 3
export const TREND_ROW_ORDER: OutcomeId[] = [
  'sausage',
  'chicken',
  'shrimp',
  'steak',
  'tomato',
  'radish',
  'mushroom',
  'corn',
  'pizza',
  'salad',
];

export const CHIP_VALUES = [2000, 10000, 50000, 100000] as const;
export type ChipValue = (typeof CHIP_VALUES)[number];

export type GamePhase = 'BETTING' | 'SPINNING' | 'RESULT';

export interface RoundRecord {
  roundNumber: number;
  outcome: OutcomeId;
}

export interface BetHistoryEntry {
  id: string;
  roundNumber: number;
  bets: Partial<Record<PlayableFoodId, number>>;
  totalStaked: number;
  outcome: OutcomeId;
  totalWon: number;
  timestamp: number;
}

export interface TopWinnerInfo {
  name: string;
  winAmount: number;
  isCurrentUser: boolean;
  avatarBg: string;
  initials: string;
}

/**
 * Exact initial omission offsets before round 764 so that rounds 764..772
 * display the EXACT omission counts seen in Screenshot 3!
 * (sausage last hit at 764 -> 8 at 772, chicken 18 at 772, shrimp 14 at 772,
 *  steak 41 at 772, tomato 6 at 772, radish hit 772, mushroom hit 771,
 *  corn hit 770, pizza 500+, salad 53 at 772)
 */
export const BASE_OMISSION_BEFORE_763: Record<OutcomeId, number> = {
  sausage: 5,
  chicken: 9,
  shrimp: 5,
  steak: 32,
  tomato: 4,
  radish: 1,
  mushroom: 0,
  corn: 6,
  pizza: 520,
  salad: 44,
};

/**
 * Exact initial history matching Screenshots 3 & 4 (newest first!)
 * Bottom bar of Screenshot 4: radish (NEW), mushroom, corn, corn, radish, corn, tomato, corn, sausage, mushroom
 * Trend chart of Screenshot 3: 772=radish, 771=mushroom, 770=corn, 769=corn, 768=radish, 767=corn, 766=tomato, 765=corn, 764=sausage
 */
export const INITIAL_ROUND_HISTORY: RoundRecord[] = [
  { roundNumber: 772, outcome: 'radish' },
  { roundNumber: 771, outcome: 'mushroom' },
  { roundNumber: 770, outcome: 'corn' },
  { roundNumber: 769, outcome: 'corn' },
  { roundNumber: 768, outcome: 'radish' },
  { roundNumber: 767, outcome: 'corn' },
  { roundNumber: 766, outcome: 'tomato' },
  { roundNumber: 765, outcome: 'corn' },
  { roundNumber: 764, outcome: 'sausage' },
  { roundNumber: 763, outcome: 'mushroom' },
  { roundNumber: 762, outcome: 'radish' },
];

export const INITIAL_ROUND_NUMBER = 773;
export const BETTING_DURATION_SECONDS = 20;
export const RESULT_MODAL_DURATION_SECONDS = 5;

export function pickWeightedOutcome(): OutcomeId {
  const entries = Object.values(FOOD_ITEMS);
  const totalWeight = entries.reduce((sum, item) => sum + item.weight, 0);
  let r = Math.random() * totalWeight;
  for (const item of entries) {
    r -= item.weight;
    if (r <= 0) return item.id;
  }
  return 'corn';
}

export function getWinningFoods(outcome: OutcomeId): PlayableFoodId[] {
  if (outcome === 'pizza') return [...TOP_ROW_FOODS];
  if (outcome === 'salad') return [...BOTTOM_ROW_FOODS];
  return [outcome];
}

export function calculatePayout(
  bets: Partial<Record<PlayableFoodId, number>>,
  outcome: OutcomeId
): number {
  const winners = getWinningFoods(outcome);
  let total = 0;
  for (const foodId of winners) {
    const staked = bets[foodId] || 0;
    if (staked > 0) {
      total += staked * FOOD_ITEMS[foodId].multiplier;
    }
  }
  return total;
}

export function formatRoundCode(num: number): string {
  return String(num).padStart(4, '0');
}

export function formatCompactNumber(val: number): string {
  if (val >= 1_000_000) {
    const m = val / 1_000_000;
    return Number.isInteger(m) ? `${m}M` : `${m.toFixed(1)}M`;
  }
  if (val >= 1_000) {
    const k = val / 1_000;
    return Number.isInteger(k) ? `${k}K` : `${k.toFixed(1)}K`;
  }
  return String(val);
}

const ROOM_PLAYERS = [
  { name: 'tuấn anh', avatarBg: 'linear-gradient(135deg, #4b5563, #1f2937)', initials: 'TA' },
  { name: 'أبو فهد', avatarBg: 'linear-gradient(135deg, #0d9488, #0f766e)', initials: 'أف' },
  { name: 'سارة الملكة', avatarBg: 'linear-gradient(135deg, #db2777, #9d174d)', initials: 'سم' },
  { name: 'كريم VIP', avatarBg: 'linear-gradient(135deg, #2563eb, #1d4ed8)', initials: 'كر' },
  { name: 'محمد علي', avatarBg: 'linear-gradient(135deg, #d97706, #b45309)', initials: 'مع' },
  { name: 'نور الهدى', avatarBg: 'linear-gradient(135deg, #7c3aed, #5b21b6)', initials: 'نه' },
  { name: 'Khaled_99', avatarBg: 'linear-gradient(135deg, #059669, #047857)', initials: 'KH' },
];

export function generateTopWinner(userWin: number, outcome: OutcomeId): TopWinnerInfo {
  const baseMult =
    outcome === 'pizza' ? 25 : outcome === 'salad' ? 15 : FOOD_ITEMS[outcome].multiplier;
  const botBaseBets = [10000, 20000, 50000, 100000];
  const botBet = botBaseBets[Math.floor(Math.random() * botBaseBets.length)];
  const botWin = Math.min(botBet * baseMult, 900_000);

  if (userWin > 0 && userWin >= botWin * 0.5) {
    return {
      name: 'أنت',
      winAmount: userWin,
      isCurrentUser: true,
      avatarBg: 'linear-gradient(135deg, #f59e0b, #ea580c)',
      initials: 'أنت',
    };
  }

  const pick = ROOM_PLAYERS[Math.floor(Math.random() * ROOM_PLAYERS.length)];
  return {
    name: pick.name,
    winAmount: Math.max(50_000, botWin),
    isCurrentUser: false,
    avatarBg: pick.avatarBg,
    initials: pick.initials,
  };
}
