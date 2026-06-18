"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type {
  Assignment,
  AssignmentStatus,
  OnboardingOverview,
  OnboardingTask,
  TaskGroup,
} from "./types";

const OVERVIEW_KEY = "onboarding-overview";
const GROUPS_KEY = "onboarding-groups";
const ASSIGNMENTS_KEY = "onboarding-assignments";

export function useOnboardingOverview() {
  return useQuery({
    queryKey: [OVERVIEW_KEY],
    queryFn: () => api.get<OnboardingOverview>("/api/onboarding/overview"),
  });
}

export function useTaskGroups() {
  return useQuery({
    queryKey: [GROUPS_KEY],
    queryFn: () => api.get<TaskGroup[]>("/api/onboarding/groups"),
  });
}

export function useAssignments(employeeId?: string) {
  return useQuery({
    queryKey: [ASSIGNMENTS_KEY, employeeId ?? "all"],
    queryFn: () =>
      api.get<Assignment[]>(
        `/api/onboarding/assignments${employeeId ? `?employeeId=${employeeId}` : ""}`,
      ),
    enabled: employeeId !== "",
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; stage?: string }) =>
      api.post<TaskGroup>("/api/onboarding/groups", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [GROUPS_KEY] }),
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { groupId: string; title: string; description?: string }) =>
      api.post<OnboardingTask>("/api/onboarding/tasks", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [GROUPS_KEY] }),
  });
}

export function useReorderTasks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: { id: string; groupId: string; sortOrder: number }[]) =>
      api.post("/api/onboarding/tasks/reorder", { items }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [GROUPS_KEY] }),
  });
}

export function useAssign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { employeeIds: string[]; taskIds?: string[]; onlyMissing?: boolean }) =>
      api.post<{ created: number }>("/api/onboarding/assign", input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [OVERVIEW_KEY] });
      void qc.invalidateQueries({ queryKey: [ASSIGNMENTS_KEY] });
    },
  });
}

export function useSetAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AssignmentStatus }) =>
      api.patch<Assignment>(`/api/onboarding/assignments/${id}`, { status }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [OVERVIEW_KEY] });
      void qc.invalidateQueries({ queryKey: [ASSIGNMENTS_KEY] });
    },
  });
}
