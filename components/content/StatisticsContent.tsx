import Image from 'next/image';

import { CharacterInterface } from '@/lib/interfaces/character.interface';
import { ItemInterface } from '@/lib/interfaces/item.interface';
import { calculatePower } from '@/lib/utils/characterUtils';
import { EQUIPMENT_SLOTS } from '@/lib/utils/equipment';

interface Props {
  character: CharacterInterface;
}

function valueOfItems(items: ItemInterface[]): number {
  return items.reduce((sum, item) => sum + (item.sellPrice ?? 0), 0);
}

function gatherEquipped(user: CharacterInterface): ItemInterface[] {
  const equipment = (user.equipment ?? {}) as Record<string, unknown>;
  const out: ItemInterface[] = [];
  for (const slot of EQUIPMENT_SLOTS) {
    const cell = equipment[slot];
    if (cell && typeof cell === 'object' && '_id' in (cell as object)) {
      out.push(cell as ItemInterface);
    }
  }
  return out;
}

function gatherInventory(user: CharacterInterface): ItemInterface[] {
  const inv = (user.inventory ?? []) as any;
  const out: ItemInterface[] = [];
  if (!Array.isArray(inv)) return out;
  // New flat list: [{ item, x, y }]
  if (inv.length === 0 || !Array.isArray(inv[0])) {
    for (const entry of inv) {
      const it = entry?.item;
      if (it && typeof it === 'object' && 'name' in it) out.push(it as ItemInterface);
    }
    return out;
  }
  // Legacy 2-D form (transitional).
  for (const row of inv as any[][]) {
    for (const cell of row) {
      if (cell && typeof cell === 'object' && 'name' in cell) {
        out.push(cell as ItemInterface);
      }
    }
  }
  return out;
}

function pct(n: number, total: number): string {
  if (total <= 0) return '0%';
  return `${Math.round((n / total) * 100)}%`;
}

const StatisticsContent = ({ character }: Props) => {
  const equipped = gatherEquipped(character);
  const inventory = gatherInventory(character);

  const equipmentValue = valueOfItems(equipped);
  const inventoryValue = valueOfItems(inventory);

  // Journal lives on the populated character. Default to zeros so the
  // page renders even for a fresh character whose journal hasn't been
  // touched yet.
  const journal = (character as any).journal ?? {};
  const arena = journal.arena ?? {};
  const world = journal.world ?? {};

  const aBattles = arena.battles ?? 0;
  const aWins = arena.wins ?? 0;
  const aLosses = arena.defeats ?? 0;
  const aDraws = arena.draws ?? 0;
  const aDealt = arena.damageInflicted ?? 0;
  const aReceived = arena.damageReceived ?? 0;
  const aHonor = arena.honorEarned ?? 0;

  const wBattles = world.battles ?? 0;
  const wWins = world.wins ?? 0;
  const wLosses = world.defeats ?? 0;
  const wDealt = world.damageInflicted ?? 0;
  const wReceived = world.damageReceived ?? 0;
  const wCrowns = world.crownsEarned ?? 0;

  const arenaWLR = aLosses > 0 ? (aWins / aLosses).toFixed(2) : aWins.toFixed(2);

  return (
    <div className='px-6 flex flex-col gap-4 text-brown2'>
      <div className='flex gap-2'>
        <Tab href='/game/overview' label='Overview' />
        <Tab href='/game/statistics' label='Statistics' active />
        <Tab href='/game/victories' label='Victories' />
      </div>

      <Section title='Combat Stats - Arena'>
        <Row label='Battles' value={String(aBattles)} />
        <Row label='Wins' value={`${aWins} (${pct(aWins, aBattles)})`} />
        <Row label='Losses' value={`${aLosses} (${pct(aLosses, aBattles)})`} />
        <Row label='Draws' value={`${aDraws} (${pct(aDraws, aBattles)})`} />
        <Row label='Win/Loss ratio' value={String(arenaWLR)} />
        <Row label='Damage dealt' value={String(aDealt)} />
        <Row label='Damage received' value={String(aReceived)} />
        <Row label='Difference' value={String(aDealt - aReceived)} />
        <Row label='Honor earned' value={String(aHonor)} />
      </Section>

      <Section title='Combat Stats - Expeditions'>
        <Row label='Battles' value={String(wBattles)} />
        <Row label='Wins' value={`${wWins} (${pct(wWins, wBattles)})`} />
        <Row label='Losses' value={`${wLosses} (${pct(wLosses, wBattles)})`} />
        <Row label='Damage dealt' value={String(wDealt)} />
        <Row label='Damage received' value={String(wReceived)} />
        <Row label='Crowns earned' value={String(wCrowns)} coin />
      </Section>

      <Section title='Wealth'>
        <Row label='Equipment value' value={String(equipmentValue)} coin />
        <Row label='Inventory value' value={String(inventoryValue)} coin />
        <Row label='Crowns on hand' value={String(character.crowns ?? 0)} coin />
      </Section>

      <Section title='Victories'>
        <Row label='Honor' value={String(character.honor ?? 0)} />
        <Row label='Power rank' value={String(calculatePower(character))} />
        <Row label='Level' value={String(character.level ?? 1)} />
        <Row label='Experience' value={String(character.experience ?? 0)} />
      </Section>
    </div>
  );
};

export default StatisticsContent;

function Tab({ href, label, active = false }: { href: string; label: string; active?: boolean }) {
  return (
    <a
      href={href}
      className={`px-4 py-1 border-b-[3px] font-semibold text-sm ${
        active
          ? 'border-red3 text-red3'
          : 'border-transparent text-brown2 hover:text-red3'
      }`}
    >
      {label}
    </a>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className='brown-card rounded-sm flex flex-col text-sm'>
      <div className='red-card text-cream2 font-semibold text-sm px-3 py-1'>{title}</div>
      <div className='flex flex-col'>{children}</div>
    </div>
  );
}

function Row({ label, value, coin = false }: { label: string; value: string; coin?: boolean }) {
  return (
    <div className='flex justify-between items-center px-3 py-1 border-b-[2px] border-cream2 last:border-b-0'>
      <span>{label}</span>
      <span className='font-semibold text-red3 flex items-center gap-1'>
        {value}
        {coin && (
          <Image src='/images/crowns.png' width={12} height={12} alt='crowns' />
        )}
      </span>
    </div>
  );
}
