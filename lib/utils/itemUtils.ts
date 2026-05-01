import { ItemInterface, ItemQuality } from '@/lib/interfaces/item.interface';

// Color used for item names in tooltips, matching the Gladiatus quality wheel.
export const QUALITY_COLOR: Record<ItemQuality, string> = {
  common: '#dddddd',
  common_plus: '#ffffff',
  green: '#3ca33c',
  green_plus: '#5dd45d',
  blue: '#3a7bd6',
  blue_plus: '#6aa6ff',
  purple: '#a157c8',
  purple_plus: '#c47ee8',
  orange: '#e08a30',
  orange_plus: '#ffae5a',
  red: '#d63a3a',
};

export const QUALITY_LABEL: Record<ItemQuality, string> = {
  common: 'Common',
  common_plus: 'Common+',
  green: 'Green',
  green_plus: 'Green+',
  blue: 'Blue',
  blue_plus: 'Blue+',
  purple: 'Purple',
  purple_plus: 'Purple+',
  orange: 'Orange',
  orange_plus: 'Orange+',
  red: 'Red',
};

// "Sharp Short Dagger of the Bear" – combine prefix + base + suffix.
export function fullItemName(item: Pick<ItemInterface, 'name' | 'prefix' | 'suffix'>): string {
  return [item.prefix, item.name, item.suffix].filter(Boolean).join(' ');
}
