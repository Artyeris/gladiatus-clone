import Image from 'next/image';

import DescriptionCard from '@/components/cards/DescriptionCard';

const Page = () => {
  return (
    <div className='px-8 gap-4 flex flex-col'>
      <div className='flex gap-4'>
        <Image
          width={168}
          height={194}
          src='/images/barracks.jpg'
          alt='market'
        />
        <DescriptionCard title='Market'>
          <p>
            The traders haven&apos;t arrived in town yet. The market will open
            once the first merchants set up their stalls.
          </p>
          <p className='text-xs italic mt-2'>Coming soon.</p>
        </DescriptionCard>
      </div>
    </div>
  );
};

export default Page;
