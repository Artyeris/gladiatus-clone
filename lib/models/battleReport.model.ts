import mongoose from 'mongoose';

const battleReportSchema = new mongoose.Schema({
  result: {
    type: {
      winner: String,
      attackerFinalHealth: Number,
      defenderFinalHealth: Number,
      attackerTotalDamage: Number,
      defenderTotalDamage: Number,
      attackerHealth: Number,
      defenderHealth: Number,
      honorEarned: Number,
      honorLost: Number,
      experienceDrop: Number,
      crownsDrop: Number,
      // Detailed combat counters surfaced on the battle report page;
      // omitting these from the schema makes Mongoose's strict mode
      // drop them on save (hence the all-zero rows that used to render).
      attackerHitsLanded: Number,
      attackerHitsAttempted: Number,
      attackerCritsLanded: Number,
      attackerArmorAbsorbed: Number,
      defenderHitsLanded: Number,
      defenderHitsAttempted: Number,
      defenderCritsLanded: Number,
      defenderArmorAbsorbed: Number,
      totalRounds: Number,
    }
  },
  rounds: {
    type: [{
      roundNumber: Number,
      attackerHP: Number,
      defenderHP: Number,
      events: [String],
    }]
  },
  expedition: {
    type: String,
  },
  defender: {
    type: mongoose.Schema.Types.Mixed, 
    refPath: 'defenderType',
  },
  defenderType: {
    type: String,
    enum: ['Character', 'Enemy'],
  },
  attacker: {
    type: mongoose.Types.ObjectId,
    ref: 'Character',
  },
  honorEarned: {
    type: Number,
  },
  honorLost: {
    type: Number,
  },
  // Loot summary surfaced on the battle report page so the player can
  // see expedition drops without checking inventory.
  loot: {
    name:    { type: String },
    quality: { type: String },
    image:   { type: String },
  },
  // Arena jackpot transferred when the attacker dethroned the tier's #1.
  potClaimed: {
    type: Number,
  },
}, {
  timestamps: true
});

const BattleReport = mongoose.models.BattleReport || mongoose.model('BattleReport', battleReportSchema);

export default BattleReport;