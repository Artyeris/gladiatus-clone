import type { QuestCategory, QuestVerb } from '@/constants/quests';

export interface QuestView {
  _id: string;
  templateId: string;
  category: QuestCategory;
  verb: QuestVerb;
  title: string;
  target: number;
  progress: number;
  rewardGold: number;
  rewardExp: number;
  ready: boolean;          // progress >= target
}
