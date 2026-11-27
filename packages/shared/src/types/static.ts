export interface WorkHistoryItem {
  id: string;
  company: string;
  roleEn: string;
  roleId?: string;
  periodEn: string;
  periodId?: string;
  location?: string;
  highlightsEn: string[];
  highlightsId?: string[];
}

export interface SkillGroup {
  id: string;
  categoryEn: string;
  categoryId?: string;
  items: string[];
}
