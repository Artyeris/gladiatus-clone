'use client';

import { useDrag } from 'react-dnd';

interface Item {
  id: number;
  name: string;
  emoji: string;
  type: string;
}

interface Props {
  item: Item;
  index: number;
}

const DraggableItem = ({ item, index }: Props) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ITEM',
    item: { ...item, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`w-14 h-14 border-2 border-[#5c4033] bg-[#f5e8c7] flex items-center justify-center text-3xl cursor-grab active:cursor-grabbing transition-all hover:bg-yellow-200
        ${isDragging ? 'opacity-50 scale-95' : ''}`}
    >
      {item.emoji}
    </div>
  );
};

export default DraggableItem;