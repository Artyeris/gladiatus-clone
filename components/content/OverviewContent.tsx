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
          gap: '16px',
          justifyContent: 'center',
          alignItems: 'flex-start',
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            flex: '0 0 250px',
            borderRight: '2px solid #5c3a21',
            paddingRight: '12px',
          }}
        >
           <CharacterPanel user={character} />
        </div>

        <div style={{ flexShrink: 0 }}>
           <InventoryEquipment character={character} />
        </div>
      </div>
    </div>
  );
};

export default OverviewContent;
