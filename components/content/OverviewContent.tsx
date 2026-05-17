import { CharacterInterface } from '@/lib/interfaces/character.interface';
import CharacterPanel from '../overview/CharacterPanel';
import InventoryEquipment from '../overview/InventoryEquipment';

interface OverviewContentProps {
  character: CharacterInterface;
}

const OverviewContent = ({ character }: OverviewContentProps) => {
  return (
    <div className="game-container">

      <div className='flex gap-2 px-2 mb-3 text-sm font-semibold text-brown2'>
        <a
          href='/game/overview'
          className='px-4 py-1 border-b-[3px] border-red3 text-red3'
        >
          Overview
        </a>
        <a
          href='/game/statistics'
          className='px-4 py-1 border-b-[3px] border-transparent hover:text-red3'
        >
          Statistics
        </a>
        <a
          href='/game/victories'
          className='px-4 py-1 border-b-[3px] border-transparent hover:text-red3'
        >
          Victories
        </a>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '14px',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '0 12px',
        }}
      >
        <div
          className='info-card rounded-sm shadow-md'
          style={{ flex: '0 0 298px', padding: '4px' }}
        >
          <CharacterPanel user={character} />
        </div>

        <div
          className='info-card rounded-sm shadow-md'
          style={{ flexShrink: 0, padding: '10px' }}
        >
          <InventoryEquipment character={character} />
        </div>
      </div>
    </div>
  );
};

export default OverviewContent;
