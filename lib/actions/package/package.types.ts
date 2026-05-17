import { ItemInterface } from '@/lib/interfaces/item.interface';

export type PackageSource =
  | 'shop' | 'auction' | 'market'
  | 'expedition' | 'arena' | 'quest' | 'dungeon' | 'other';

export interface PackageView {
  _id: string;
  source: PackageSource;
  detail: string;
  item: ItemInterface | null;
}
