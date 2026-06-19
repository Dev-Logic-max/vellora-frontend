/** Recruiting types — mirror the backend (09-recruiting). */
export type JobStatus = "draft" | "published" | "closed";
export type CandidateStage = "applied" | "review" | "interview" | "offer" | "hired" | "rejected";
export type InterviewMode = "onsite" | "phone" | "video";

export interface ScreenerQuestion {
  id: string;
  label: string;
  required: boolean;
}

export interface Job {
  id: string;
  companyId: string;
  storeId: string | null;
  title: string;
  slug: string;
  description: string;
  employmentType: string;
  location: string | null;
  status: JobStatus;
  published: boolean;
  screenerQuestions: ScreenerQuestion[];
  createdAt: string;
}

export interface Candidate {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone: string | null;
  resumeKey: string | null;
  parsed: Record<string, unknown> | null;
  score: number | null;
  stage: CandidateStage;
  source: string;
  notes: string | null;
  createdAt: string;
  job?: { id: string; title: string };
  interviews?: Interview[];
}

export interface Interview {
  id: string;
  candidateId: string;
  scheduledAt: string;
  durationMins: number;
  mode: InterviewMode;
  location: string | null;
  interviewers: string[];
  status: string;
}

export interface Insights {
  total: number;
  byStage: Record<CandidateStage, number>;
  bySource: Record<string, number>;
}

export interface CreateJobInput {
  title: string;
  description?: string;
  storeId?: string;
  employmentType?: string;
  location?: string;
  screenerQuestions?: ScreenerQuestion[];
}

export const STAGE_ORDER: CandidateStage[] = [
  "applied",
  "review",
  "interview",
  "offer",
  "hired",
  "rejected",
];

export const STAGE_LABELS: Record<CandidateStage, string> = {
  applied: "Applied",
  review: "Review",
  interview: "Interview",
  offer: "Offer",
  hired: "Hired",
  rejected: "Rejected",
};
