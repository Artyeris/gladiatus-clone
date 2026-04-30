import { CharacterInterface } from '@/lib/interfaces/character.interface';
import CharacterPanel from '../overview/CharacterPanel';
import InventoryEquipment from '../overview/InventoryEquipment';

interface OverviewContentProps {
  character: CharacterInterface;
}

const OverviewContent = ({ character }: OverviewContentProps) => {
  return (
    <div className="game-container">

      <div className="game-header">
        <div className="header-tab active">Bendras vaizdas</div>
        <div className="header-tab">Statistika</div>
        <div className="header-tab">Pergalės</div>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>

        <div style={{ flex: '0 0 300px', borderRight: '2px solid #5c3a21', paddingRight: '20px' }}>
           <CharacterPanel user={character} />
        </div>

        <div style={{ flex: 2 }}>
           <InventoryEquipment character={character} />
        </div>
      </div>
    </div>
  );
};

export default OverviewContent;
