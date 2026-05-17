import type { ItemInterface } from '@/lib/interfaces/item.interface';
import type { ShopType } from '@/lib/utils/shopRotation';

export interface ShopSlotView {
  index: number;
  item: ItemInterface | null;
  price: number;
  soldOut: boolean;
}

export interface ShopView {
  shopType: ShopType;
  slots: ShopSlotView[];
  msUntilRefresh: number;
}
