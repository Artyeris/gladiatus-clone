import { CharacterInterface } from '@/lib/interfaces/character.interface';
import CharacterPanel from '../overview/CharacterPanel';
import InventoryEquipment from '../overview/InventoryEquipment';

interface OverviewContentProps {
  character: CharacterInterface;
}

const OverviewContent = ({ character }: OverviewContentProps) => {
  return (
    <div className='game-container'>
      {/* Top tabs - separated chips with their own bordered backgrounds */}
      <div className='flex gap-2 px-4 mb-3 font-semibold text-brown2'>
        <Tab href='/game/overview'   label='Overview'   active />
        <Tab href='/game/statistics' label='Statistics' />
        <Tab href='/game/victories'  label='Victories'  />
      </div>

      <div className='flex gap-3 justify-center items-stretch px-3'>
        <div className='info-card rounded-sm shadow-md flex' style={{ flex: '0 0 330px', padding: '4px' }}>
          <CharacterPanel user={character} />
        </div>

        <div className='info-card rounded-sm shadow-md flex flex-col flex-1' style={{ padding: '12px' }}>
          <InventoryEquipment character={character} />
        </div>
      </div>
    </div>
  );
};

export default OverviewContent;

// Tab chip with its own card-style background so the three top
// selectors read as distinct buttons instead of inline text.
function Tab({ href, label, active }: { href: string; label: string; active?: boolean }) {
  if (active) {
    return (
      <a
        href={href}
        className='px-8 py-2 rounded-sm font-semibold text-cream2 cursor-default text-base'
        style={{
          background: '#974342',
          border: '2px solid #eed7a1',
          outline: '2px solid #974342',
        }}
      >
        {label}
      </a>
    );
  }
  return (
    <a
      href={href}
      className='px-8 py-2 rounded-sm font-semibold text-brown2 hover:text-red3 transition text-base'
      style={{
        background: '#b59964',
        border: '2px solid #eed7a1',
        outline: '2px solid #b59964',
      }}
    >
      {label}
    </a>
  );
}
