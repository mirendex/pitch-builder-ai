export type ClientProfile = {
  name?: string | null;
  company?: string | null;
  role?: string | null;
  industry?: string | null;
};

export type PainPoint = {
  title: string;
  description: string;
  severity: string;
};

export type ProposedSolution = {
  title: string;
  description: string;
  linked_pain_points: string[];
};

export type KeyMetric = {
  label: string;
  value: string;
};

export type AnalysisResult = {
  client_profile: ClientProfile;
  pain_points: PainPoint[];
  proposed_solutions: ProposedSolution[];
  executive_summary: string;
  next_steps: string[];
  key_metrics: KeyMetric[];
};

export type AnalysisDetail = {
  id: string;
  source_filename?: string | null;
  status: string;
  status_message: string;
  error_message?: string | null;
  result_json?: AnalysisResult | null;
  created_at: string;
  updated_at: string;
};

export type FollowUpEmail = {
  subject: string;
  body: string;
};
