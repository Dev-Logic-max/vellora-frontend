/**
 * Server-side fetch helpers for the PUBLIC careers site. No auth — the backend
 * scopes by company slug. Used from server components for SSR/SEO.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3030";

export interface PublicJobSummary {
  slug: string;
  title: string;
  location: string | null;
  employmentType: string;
}

export interface PublicScreenerQuestion {
  id: string;
  label: string;
  required: boolean;
}

export interface CareersListResponse {
  company: { name: string; slug: string };
  jobs: PublicJobSummary[];
}

export interface CareersJobResponse {
  company: { name: string; slug: string };
  job: {
    slug: string;
    title: string;
    description: string;
    location: string | null;
    employmentType: string;
    screenerQuestions: PublicScreenerQuestion[];
  };
}

export async function fetchCareers(slug: string): Promise<CareersListResponse | null> {
  const res = await fetch(`${API_URL}/api/careers/${slug}/jobs`, {
    // Revalidate the public board periodically; published jobs change rarely.
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  return (await res.json()) as CareersListResponse;
}

export async function fetchCareersJob(
  slug: string,
  jobSlug: string,
): Promise<CareersJobResponse | null> {
  const res = await fetch(`${API_URL}/api/careers/${slug}/jobs/${jobSlug}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  return (await res.json()) as CareersJobResponse;
}
