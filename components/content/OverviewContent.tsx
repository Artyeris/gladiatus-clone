import { CharacterInterface } from '@/lib/interfaces/character.interface';
import CharacterPanel from '../overview/CharacterPanel';
import EquipmentSlots from '../overview/EquipmentSlots';
import InventoryGrid from '../overview/Inventory';

interface OverviewContentProps {
  character: CharacterInterface;
}

const OverviewContent = ({ character }: OverviewContentProps) => {
  return (
    <div className="game-container">
      <div className="game-header">
        <div className="header-tab active">Bendras vaizdas</div>
        <div className="header-tab">Statistika</div>
        <div className="header-tab">Pergales</div>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1, borderRight: '2px solid #5c3a21', paddingRight: '20px' }}>
          <CharacterPanel character={character} />
        </div>

        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <EquipmentSlots />

          <div style={{
            border: '3px solid #5c3a21',
            padding: '10px',
            backgroundColor: '#e8dcc0',
          }}>
            <InventoryGrid inventory={character.inventory} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewContent;
