import mongoose from 'mongoose';

// Active multi-step dungeon run for a character. One row per active
// run; on completion or abandonment the row is deleted. Only one
// active run per character at a time -- entering another dungeon
// while a run is open is blocked at the action layer.
const dungeonRunSchema = new mongoose.Schema({
  owner:      { type: mongoose.Schema.Types.ObjectId, ref: 'Character', required: true, index: true },
  dungeonId:  { type: String, required: true },
  // Step indices count from 0. totalSteps = 4 in Phase 1 (3 trash + boss).
  currentStep: { type: Number, default: 0 },
  totalSteps:  { type: Number, default: 4 },
  // Snapshot of the party at run-start so swapping mercs mid-run
  // doesn't change the fighters; HP is tracked per snapshot entry.
  // Stored as Mixed: each entry is
  //   { source: 'player' | 'mercenary', refId?: string,
  //     role, name, level, type, quality, maxHp, hp, power }.
  party: { type: [mongoose.Schema.Types.Mixed], default: [] },
  // Last fight summary (for the UI to replay -- enemy names, hits).
  lastFight: { type: mongoose.Schema.Types.Mixed, default: null },
}, { timestamps: true });

const DungeonRun = mongoose.models.DungeonRun || mongoose.model('DungeonRun', dungeonRunSchema);
export default DungeonRun;
