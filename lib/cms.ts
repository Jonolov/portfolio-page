import { cache } from "react";
import type {
  CondensedRole,
  Profile,
  Role,
  SideProject,
  SkillGroup,
} from "@/lib/types";
import { profile as staticProfile } from "@/content/profile";
import { skills as staticSkills } from "@/content/skills";
import {
  earlierRoles as staticEarlierRoles,
  experience as staticExperience,
} from "@/content/experience";
import { projects as staticProjects } from "@/content/projects";

/**
 * Reads the site's content from the portfolio CMS API (the same database the admin app edits).
 * The `content/*.ts` files are kept as the fallback: if the API is unreachable at build time or
 * during revalidation, the site renders the last-known-good static content instead of breaking.
 *
 * Content is cached and revalidated hourly (ISR) — an edit in the admin app shows up on the
 * site within the hour, or immediately after a redeploy.
 */

const CMS_BASE = (
  process.env.CMS_API_URL ?? "https://portfolio-cms-api-one.vercel.app"
).replace(/\/$/, "");

const REVALIDATE_SECONDS = 3600;

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${CMS_BASE}${path}`, {
    next: { revalidate: REVALIDATE_SECONDS, tags: ["cms"] },
  });
  if (!res.ok) {
    throw new Error(`CMS ${path} responded ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// --- Raw API shapes (snake_case, as returned by portfolio-cms-api) --------------------------

interface RawSkill {
  id: string;
  name: string;
  category: string;
  featured: boolean;
  position: number;
}

interface RawProfile {
  name: string;
  role_line: string;
  hero_hook: string;
  about_paragraphs: string[];
  contact_email: string;
  contact_company: string;
  contact_location: string;
  contact_linkedin: string;
  available_for_consulting: boolean;
  status_line: string;
}

interface RawRole {
  company: string;
  title: string;
  date_start: string;
  date_end: string;
  summary: string;
  highlights: string[];
  position: number;
  skills: RawSkill[];
}

interface RawEarlierRole {
  company: string;
  title?: string;
  date_start?: string;
  date_end?: string;
  position: number;
}

interface RawSideProject {
  name: string;
  description: string;
  url: string;
  position: number;
  skills: RawSkill[];
}

// --- Mappers to the site's own types ------------------------------------------------------

function toProfile(raw: RawProfile): Profile {
  return {
    name: raw.name,
    roleLine: raw.role_line,
    heroHook: raw.hero_hook,
    about: { paragraphs: raw.about_paragraphs },
    contact: {
      email: raw.contact_email,
      company: raw.contact_company,
      location: raw.contact_location,
      linkedin: raw.contact_linkedin,
      availableForConsulting: raw.available_for_consulting,
      statusLine: raw.status_line,
    },
  };
}

function toSkillGroups(raw: RawSkill[]): SkillGroup[] {
  const byCategory = new Map<string, RawSkill[]>();
  for (const skill of raw) {
    const list = byCategory.get(skill.category) ?? [];
    list.push(skill);
    byCategory.set(skill.category, list);
  }
  // Category order is alphabetical (matching the admin app's grouping); skills within a
  // category follow their `position`.
  return [...byCategory.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, skills]) => ({
      category,
      skills: skills
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((s) => s.name),
    }));
}

function toRoles(raw: RawRole[]): Role[] {
  return raw
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((r) => ({
      company: r.company,
      title: r.title,
      dates: { start: r.date_start, end: r.date_end },
      summary: r.summary,
      highlights: r.highlights,
      tech: r.skills.map((s) => s.name),
    }));
}

function toEarlierRoles(raw: RawEarlierRole[]): CondensedRole[] {
  return raw
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((r) => ({
      company: r.company,
      title: r.title || undefined,
      dates:
        r.date_start && r.date_end
          ? { start: r.date_start, end: r.date_end }
          : undefined,
    }));
}

function toSideProjects(raw: RawSideProject[]): SideProject[] {
  return raw
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((p) => ({
      name: p.name,
      description: p.description,
      url: p.url,
      tech: p.skills.map((s) => s.name),
    }));
}

// --- Public getters (cached per request; static fallback on any failure) -----------------

async function withFallback<T>(
  load: () => Promise<T>,
  fallback: T,
  label: string,
): Promise<T> {
  try {
    return await load();
  } catch (error) {
    console.warn(`[cms] ${label} — falling back to static content:`, error);
    return fallback;
  }
}

export const getProfile = cache((): Promise<Profile> =>
  withFallback(
    async () => toProfile(await fetchJson<RawProfile>("/api/profile")),
    staticProfile,
    "profile",
  ),
);

export const getSkillGroups = cache((): Promise<SkillGroup[]> =>
  withFallback(
    async () => toSkillGroups(await fetchJson<RawSkill[]>("/api/skills")),
    staticSkills,
    "skills",
  ),
);

export const getExperience = cache((): Promise<Role[]> =>
  withFallback(
    async () => toRoles(await fetchJson<RawRole[]>("/api/experience")),
    staticExperience,
    "experience",
  ),
);

export const getEarlierRoles = cache((): Promise<CondensedRole[]> =>
  withFallback(
    async () =>
      toEarlierRoles(await fetchJson<RawEarlierRole[]>("/api/earlier-roles")),
    staticEarlierRoles,
    "earlier-roles",
  ),
);

export const getSideProjects = cache((): Promise<SideProject[]> =>
  withFallback(
    async () =>
      toSideProjects(await fetchJson<RawSideProject[]>("/api/side-projects")),
    staticProjects,
    "side-projects",
  ),
);
