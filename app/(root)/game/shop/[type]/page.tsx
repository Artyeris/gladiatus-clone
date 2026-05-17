import { notFound, redirect } from 'next/navigation';

import ShopContent from '@/components/content/ShopContent';
import { getShop } from '@/lib/actions/shop/shop.action';
import { getUser } from '@/lib/actions/user/getUser.action';
import {
  SHOP_FORCE_REFRESH_COST,
  SHOP_LABELS,
  SHOP_TAGLINES,
  isShopType,
} from '@/lib/utils/shopRotation';

interface Props {
  params: { type: string };
}

const Page = async ({ params }: Props) => {
  if (!isShopType(params.type)) notFound();

  const user = await getUser().catch(() => redirect('/'));
  if (!user) return null;
  if (!user.character) redirect('/onboarding');

  const result = await getShop(params.type);
  if (result.error || !result.shop) {
    return (
      <div className='px-6 text-brown2'>
        <h1 className='text-xl font-bold'>{SHOP_LABELS[params.type]}</h1>
        <p>{result.error?.message ?? 'Failed to load shop.'}</p>
      </div>
    );
  }

  return (
    <ShopContent
      shop={result.shop}
      character={user.character}
      title={SHOP_LABELS[params.type]}
      tagline={SHOP_TAGLINES[params.type]}
      refreshCost={SHOP_FORCE_REFRESH_COST}
    />
  );
};

export default Page;
