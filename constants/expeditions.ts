export interface ExpeditionInfo {
  name: string;
  id: string;
  description: string;
  intro?: string;
  entryLevel?: number;
  enemyLevels?: string;
  realLevel?: string;
  additionalInfo?: string;
}

export interface Expeditions {
  [key: string]: ExpeditionInfo;
}

export const expeditions: Expeditions = {
  grimwood: {
    name: 'Grimwood',
    id: 'grimwood',
    intro: "Grimwood is the first expedition in the game. Do not get fooled by it -- it hides some fearsome animals. Rat is really weak but Lynx is far stronger and the gap doesn't scale exponentially. Same goes for Wolf and Bear: don't expect to start farming them anytime soon.",
    description: "If you believe what the old people say around here, there once lived a very popular king in this wood. The wood's original name has been long forgotten and is now only known as Grimwood. Rumour has it that this king made a pact with the dark side so he could continue to reign forever. Grimwood is an extremely sinister place, full of wild animals and impenetrable brushwood. Countless hunters and lumberjacks went too deep into the woods, never to be seen again. If you believe the gossip, the old king took them into his lair so they could serve him for all eternity.",
    entryLevel: 1,
    enemyLevels: '1-10',
    realLevel: '1',
    additionalInfo: "This is the first dungeon, so Rat is really easy. Lynx can be easy too, but its level swings from 2 to 5 -- a level-5 Lynx's stats can be too much for a beginner, so don't fall into despair if you lose some battles against it. Wolf is also strong, so don't expect to defeat him properly before level 5. The big question is whether you start trying the next expedition Pirate Harbour at level 5 or stick with Wolf. Stick with Wolf unless you are really twinked low level. Bear is really profitable if you can start beating it early (before level 8) -- the Gold reward and experience are high.",
  },
  pirateharbour: {
    name: 'Pirate Harbour',
    id: 'pirateharbour',
    intro: "Pirate Harbour is the second expedition in the game and it's only 5 levels away. However 5 levels might be too quick.",
    description: "On the coast in the south-east there is a pirate harbour. There are a lot of shady characters and goods that would be forbidden elsewhere. Uninvited guests aren't welcome. Still, many adventurers and nosy people try their luck. Mostly they end up as food for the sharks -- but if you bear up against all these pirates, you'll get exotic treasures.",
    entryLevel: 5,
    enemyLevels: '8-17',
    realLevel: '7-8',
    additionalInfo: "It becomes available too quickly. At level 5 you most likely aren't able to kill Wolf in Grimwood yet. If you're uber-geared and twinked you might start with Fled Slave, but that isn't easy. If you can fight here without losing too many battles, do so -- the gold reward is much bigger than Grimwood, and gold matters. Enemies gradually become harder; the boss Captain reaches level 15-17 which at normal rates is almost impossible to beat at low levels. Assassin is also really strong, with huge variety in levels. The gold boost is sizeable on Assassin and Captain.",
  },
  mistymountains: {
    name: 'Misty Mountains',
    id: 'mistymountains',
    intro: "Misty Mountains is the third expedition in the game and it opens up at level 10 -- but not really doable at level 10, just like its dungeon.",
    description: "The highest pinnacles of the Misty Mountains are hidden from the eyes of wanderers, lost behind the thick clouds surrounding them. Well, it's not as if many people go around there anyway. It is a dangerous area, not only because of the dangers from the mountains themselves, but also because it is said that there are monsters in the caves in the southern slopes -- the sort longing for human meat.",
    entryLevel: 10,
    enemyLevels: '15-23',
    realLevel: '14-15',
    additionalInfo: "Same as Pirate Harbour, the entry level is a bit low for the creatures you have to fight here. The real level is more like 15. Elusive Recruit can be farmed easily but the rest are just plain hard. Harpy and Cerberus jump 4-6 levels higher, which is insane. As with Pirate Harbour, the third enemy and the Boss are a lot stronger than what you'd normally be able to fight at this level.",
  },
  wolfcave: {
    name: 'Wolf Cave',
    id: 'wolfcave',
    intro: 'Wolf Cave is the fourth expedition in the game and it allows you to enter at level 15.',
    description: "In the hills south of the barbarian village there is a cave system that the townsfolk call Wolf Cave. As the name suggests, a large pack of wolves live there which often attacks the surrounding farms during harsh winters. Some say this wolf pack is led by a large white wolf -- but that may merely be the idle chitchat of simple farmers.",
    entryLevel: 15,
    enemyLevels: '22-31',
    realLevel: '19',
    additionalInfo: "Typical expedition -- nothing unusual about it. The low entry level doesn't mean you can fight here at 15. The real fighting level is around 20, and at 20 you can already travel to Africa. Africa is really hard at level 20 though, so you might want to stay here a bit longer. What's interesting is that the boss Werewolf awards really good experience -- if you can fight him without losing too much. Otherwise he's not worth it if you lose 50% of the fights.",
  },
  ancienttemple: {
    name: 'Ancient Temple',
    id: 'ancienttemple',
    intro: "Ancient Temple is the long awaited return of our glorious gladiator to Italy. After a long absence you are finally home and it's time for the high-level beasts to pay their dues.",
    description: "It is long forgotten for which God this temple was erected. Nonetheless, the old, simple ruin still has an aura of mysticism and power. This distant place of worship towers majestically above the lowlands -- the wind blows eerily through the old ruins and many animals are nested there. Still -- or maybe even because of all this -- treasure hunters come here time and again. There is still the rumour that the true treasure of the temple has never been found.",
    entryLevel: 60,
    enemyLevels: '70-78',
    realLevel: '60',
    additionalInfo: "The first expedition you encounter when you return to Italy from your adventures abroad. A very convenient and interesting dungeon sits in this expedition. Cultist Guard is really good in terms of rewards. 2nd, 3rd and the Boss are not a huge difference in terms of treasure -- but Cultist has a lot of Armour. Rewards from the boss are really good. If you can fight him, go for it.",
  },
  barbarianvillage: {
    name: 'Barbarian Village',
    id: 'barbarianvillage',
    intro: 'Barbarian Village is the second expedition you will see since your return to Italy. Fairly strong enemies and really important dungeons.',
    description: "In the far east there is a barbarian village where barbarians live who have not yet acknowledged the greatness of the Roman Empire. Because they mug travellers and merchants every now and then, you are likely to find many treasures. As long as the Imperial Legion doesn't take any steps against the barbarians, going there is still a daring adventure.",
    entryLevel: 65,
    enemyLevels: '75-83',
    realLevel: '65',
    additionalInfo: "What's typical for the barbarians is that they all have low armour. If you are doing fine in Ancient Temple you might not rush and start all over discovering a new expedition -- rewards are not a lot greater than Ancient Temple. What's fascinating is the damage of the Berserker. The boss is strong, but the drops there are good.",
  },
  banditcamp: {
    name: 'Bandit Camp',
    id: 'banditcamp',
    intro: "Bandit Camp is comprised of deserters, criminals and smugglers from the city. Last expedition in Italy. Once you're done here, you won't return home anymore.",
    description: "Near the city, hidden in the southern foothills of the Misty Mountains, there is a bandit camp. Bandits, smugglers, thieves and other outlaws bustle around there. Although the imperial legion sent troops there countless times, the camp was reconstructed every time.",
    entryLevel: 70,
    enemyLevels: '80-88',
    realLevel: '70',
    additionalInfo: "Now this is a proper upgrade of an expedition. The jump from Barbarian Village to Bandit Camp is greater than the jump from Ancient Temple to Barbarian Village. Fight here if you can. The expedition doesn't have a dungeon of its own, but this is where the Advanced Italy dungeons start to be accessible -- so you might want to stay here and fight. Interesting note: Assassinator is really hard and almost as good as the boss, Bandit Chief.",
  },
}
