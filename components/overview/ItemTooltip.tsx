'use client';

import { ReactNode } from 'react';

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { ItemInterface } from '@/lib/interfaces/item.interface';
import { QUALITY_COLOR, fullItemName } from '@/lib/utils/itemUtils';

interface ItemTooltipProps {
  item: ItemInterface;
  children: ReactNode;
}

const STAT_LABELS: Record<string, string> = {
  strength: 'Strength',
  endurance: 'Endurance',
  agility: 'Agility',
  dexterity: 'Dexterity',
  intelligence: 'Intelligence',
  charisma: 'Charisma',
  armor: 'Armor',
};

const ItemTooltip = ({ item, children }: ItemTooltipProps) => {
  const nameColor = QUALITY_COLOR[item.quality ?? 'common'];

  const durabilityMax = item.durabilityMax ?? 0;
  const durability = item.durability ?? durabilityMax;
  const conditioningMax = item.conditioningMax ?? 0;
  const conditioning = item.conditioning ?? conditioningMax;

  return (
    <HoverCard openDelay={120} closeDelay={0}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent
        className='w-auto p-0 border-none shadow-md'
        side='right'
        align='start'
      >
        <div
          style={{
            background: '#1f1612',
            border: '1px solid #b59964',
            color: '#eed7a1',
            padding: '10px 12px',
            minWidth: '200px',
            fontSize: '12px',
            lineHeight: '1.5',
          }}
        >
          <div
            style={{
              color: nameColor,
              fontWeight: 700,
              fontSize: '13px',
              marginBottom: '6px',
            }}
          >
            {fullItemName(item)}
          </div>

          {item.damage && item.damage.length === 2 && (
            <div>Damage <strong>{item.damage[0]} - {item.damage[1]}</strong></div>
          )}

          {(item as any).damageBonus ? (
            <div>Damage bonus <strong>+{(item as any).damageBonus}</strong></div>
          ) : null}

          {item.armor != null && item.armor !== 0 && (
            <div>Armor <strong>{item.armor > 0 ? '+' : ''}{item.armor}</strong></div>
          )}

          {(['strength', 'dexterity', 'agility', 'endurance', 'charisma', 'intelligence'] as const).map((s) => {
            const flat = item[s];
            const pct = (item as any)[`${s}Pct`] as number | undefined;
            if (!flat && !pct) return null;
            const parts: string[] = [];
            if (flat) parts.push(`${flat > 0 ? '+' : ''}${flat}`);
            if (pct) parts.push(`${pct > 0 ? '+' : ''}${pct}%`);
            return <div key={s}>{STAT_LABELS[s]} <strong>{parts.join(' / ')}</strong></div>;
          })}

          {(item as any).health ? (
            <div>Health <strong>+{(item as any).health}</strong></div>
          ) : null}

          {(item as any).blockChanceBonus ? (
            <div>Block chance <strong>+{(item as any).blockChanceBonus}%</strong></div>
          ) : null}

          {(item as any).critChanceBonus ? (
            <div>Critical chance <strong>+{(item as any).critChanceBonus}%</strong></div>
          ) : null}

          {/* Dungeon-only -- shown for completeness, ignored by current combat. */}
          {(item as any).threat ? (
            <div style={{ color: '#a08758' }}>Threat <strong>+{(item as any).threat}</strong></div>
          ) : null}
          {(item as any).hardeningValue ? (
            <div style={{ color: '#a08758' }}>Hardening <strong>+{(item as any).hardeningValue}</strong></div>
          ) : null}
          {(item as any).healing ? (
            <div style={{ color: '#a08758' }}>Healing <strong>+{(item as any).healing}</strong></div>
          ) : null}
          {(item as any).criticalHealingValue ? (
            <div style={{ color: '#a08758' }}>Crit. heal <strong>+{(item as any).criticalHealingValue}</strong></div>
          ) : null}

          <div>Level <strong>{item.level}</strong></div>

          {item.sellPrice != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>Value <strong>{item.sellPrice}</strong></span>
              <span style={{ fontSize: '10px' }}>🪙</span>
            </div>
          )}

          {durabilityMax > 0 && (
            <div style={{ color: '#5dd45d', marginTop: '4px' }}>
              Durability {durability}/{durabilityMax}
            </div>
          )}

          {conditioningMax > 0 && (
            <div style={{ color: '#e6c14a' }}>
              Conditioning {conditioning}/{conditioningMax}
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default ItemTooltip;
