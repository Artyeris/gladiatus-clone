// Auction phase logic. At 1x server speed each auction lives for the
// original 2.5-hour cycle. Phases are derived from time remaining so
// the UI never shows an exact countdown.

export const AUCTION_TOTAL_SECONDS = 150 * 60; // 1x 2.5h cycle

export type AuctionPhase = 'Very Long' | 'Long' | 'Medium' | 'Short' | 'Very Short' | 'Ended';

// Same phase shape as before, scaled up 5x so the bands feel right
// for a 2.5h auction (was tuned for a compressed 30-minute cycle).
const PHASE_THRESHOLDS: { name: AuctionPhase; min: number }[] = [
  { name: 'Very Long', min: 120 * 60 },
  { name: 'Long',      min:  90 * 60 },
  { name: 'Medium',    min:  60 * 60 },
  { name: 'Short',     min:  30 * 60 },
  { name: 'Very Short', min:  0 },
];

export function auctionPhase(endsAt: Date | string | number): AuctionPhase {
  const ends = endsAt instanceof Date ? endsAt.getTime() : new Date(endsAt).getTime();
  const secondsLeft = Math.floor((ends - Date.now()) / 1000);
  if (secondsLeft <= 0) return 'Ended';
  for (const phase of PHASE_THRESHOLDS) {
    if (secondsLeft >= phase.min) return phase.name;
  }
  return 'Very Short';
}

export function newAuctionEndsAt(now: Date = new Date()): Date {
  return new Date(now.getTime() + AUCTION_TOTAL_SECONDS * 1000);
}

// Minimum bid required to outbid the current bid. We follow Gladiatus'
// "must be strictly higher" rule with a +1 minimum step.
export function minNextBid(currentBid: number, hasBids: boolean): number {
  return hasBids ? currentBid + 1 : currentBid;
}
