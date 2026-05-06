import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CharacterInterface } from '@/lib/interfaces/character.interface';

const HighscoreContent = ({ arenaHighscore }: { arenaHighscore: CharacterInterface[] }) => {
  return (
    <>
      <h1 className='text-xl font-bold border-b-[3px] border-brown2 text-center text-brown2'>
        Player Highscore
      </h1>
      <Table className='info-card'>
        <TableHeader className='border-[2px] border-brown bg-cream2'>
          <TableRow>
            <TableHead className='text-brown2 font-semibold'>Rank</TableHead>
            <TableHead className='text-brown2 font-semibold'>Name</TableHead>
            <TableHead className='text-brown2 font-semibold'>Level</TableHead>
            <TableHead className='text-brown2 font-semibold'>Honor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {arenaHighscore.map((character, index) => (
            <TableRow
              key={character._id}
              className='border-none'
            >
              <TableCell className='py-2 text-brown2 font-medium'>{index + 1}</TableCell>
              <TableCell className='py-2 text-red3 font-medium'>
                {character.name}
                {(character as any).isBot && (
                  <span className='ml-1 text-[10px] opacity-70 italic text-brown2'>NPC</span>
                )}
              </TableCell>
              <TableCell className='py-2 text-brown2 font-medium'>{character.level}</TableCell>
              <TableCell className='py-2 text-brown2 font-medium'>{character.honor}</TableCell>
            </TableRow>
          ))}
      </TableBody>
      </Table>
    </>
  )
}

export default HighscoreContent;