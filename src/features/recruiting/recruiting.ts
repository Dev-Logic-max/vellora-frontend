"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type {
  Candidate,
  CandidateStage,
  CreateJobInput,
  Insights,
  Interview,
  Job,
} from "./types";

const JOBS_KEY = "recruiting-jobs";
const CANDIDATES_KEY = "recruiting-candidates";
const INSIGHTS_KEY = "recruiting-insights";

// ── jobs ───────────────────────────────────────────────────────────────────
export function useJobs() {
  return useQuery({ queryKey: [JOBS_KEY], queryFn: () => api.get<Job[]>("/api/recruiting/jobs") });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateJobInput) => api.post<Job>("/api/recruiting/jobs", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [JOBS_KEY] }),
  });
}

export function useUpdateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & Partial<CreateJobInput>) =>
      api.patch<Job>(`/api/recruiting/jobs/${id}`, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [JOBS_KEY] }),
  });
}

export function useTogglePublish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) =>
      api.post<Job>(`/api/recruiting/jobs/${id}/${publish ? "publish" : "unpublish"}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [JOBS_KEY] }),
  });
}

export function useDraftJd() {
  return useMutation({
    mutationFn: (input: { title: string; notes?: string }) =>
      api.post<{ text: string }>("/api/recruiting/ai/draft-jd", input),
  });
}

// ── candidates ────────────────────────────────────────────────────────────────
export function useCandidates(jobId?: string) {
  const path = jobId
    ? `/api/recruiting/candidates?jobId=${jobId}`
    : "/api/recruiting/candidates";
  return useQuery({ queryKey: [CANDIDATES_KEY, jobId ?? "all"], queryFn: () => api.get<Candidate[]>(path) });
}

export function useCandidate(id: string | null) {
  return useQuery({
    queryKey: [CANDIDATES_KEY, "detail", id],
    queryFn: () => api.get<Candidate>(`/api/recruiting/candidates/${id}`),
    enabled: Boolean(id),
  });
}

export function useMoveCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: CandidateStage }) =>
      api.post<Candidate>(`/api/recruiting/candidates/${id}/move`, { stage }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [CANDIDATES_KEY] }),
  });
}

export function useScoreCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<Candidate>(`/api/recruiting/candidates/${id}/score`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [CANDIDATES_KEY] }),
  });
}

export function useResumeUrl() {
  return useMutation({
    mutationFn: (id: string) => api.get<{ url: string | null }>(`/api/recruiting/candidates/${id}/resume`),
    onSuccess: ({ url }) => {
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    },
  });
}

// ── interviews ───────────────────────────────────────────────────────────────
export function useScheduleInterview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      candidateId: string;
      scheduledAt: string;
      durationMins?: number;
      mode?: string;
      location?: string;
      interviewers?: string[];
    }) => api.post<Interview>("/api/recruiting/interviews", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [CANDIDATES_KEY] }),
  });
}

// ── insights ──────────────────────────────────────────────────────────────────
export function useRecruitingInsights() {
  return useQuery({
    queryKey: [INSIGHTS_KEY],
    queryFn: () => api.get<Insights>("/api/recruiting/insights"),
  });
}
