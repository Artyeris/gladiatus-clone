// Auction phase logic. Server runs at 5x speed: a 1x cycle of 2.5h
// becomes a 30-minute cycle. Phases are derived from time remaining
// so the UI never shows an exact countdown.

export const AUCTION_TOTAL_SECONDS = 30 * 60; // 5x of 1x 2.5h cycle

export type AuctionPhase = 'Very Long' | 'Long' | 'Medium' | 'Short' | 'Very Short' | 'Ended';

const PHASE_THRESHOLDS: { name: AuctionPhase; min: number }[] = [
  { name: 'Very Long', min: 24 * 60 },
  { name: 'Long',      min: 18 * 60 },
  { name: 'Medium',    min: 12 * 60 },
  { name: 'Short',     min:  6 * 60 },
  { name: 'Very Short', min: 0 },
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
