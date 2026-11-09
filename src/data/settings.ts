// Single typed entry point for the homepage switches edited in /admin.
// A malformed settings file fails the build with a readable error instead of shipping a broken page.
import { z } from "astro/zod";
import raw from "./site-settings.json";

const blank = (v: unknown) => (v === "" || v === null ? undefined : v);
const text = z.preprocess(blank, z.string().optional());
const url = z.preprocess(blank, z.string().url().optional());
const date = z.preprocess(blank, z.coerce.date().optional());

const schema = z.object({
  rightNow: z.object({
    enabled: z.boolean().default(false),
    text: z.string().max(140, "Right now line must be 140 characters or fewer").default(""),
    updatedAt: date,
    url,
  }).default({}),
  news: z.object({
    enabled: z.boolean().default(false),
  }).default({}),
  achievement: z.object({
    enabled: z.boolean().default(false),
    title: text,
    description: text,
    date,
    url,
    expires: date,
  }).default({}),
  latestCard: z.object({
    showResearch: z.boolean().default(false),
  }).default({}),
  scholarUrl: url,
  spotlight: z.object({
    kind: z.enum(["research", "ml", "devops", "other"]).default("other"),
    stage: z.enum(["idea", "plan", "in-progress", "demo", "shipped"]).default("idea"),
    title: text,
    summary: text,
    tags: z.array(z.string()).default([]),
    repoUrl: url,
    demoUrl: url,
  }).default({}),
});

export type SiteSettings = z.infer<typeof schema>;
export const settings: SiteSettings = schema.parse(raw);

/** Achievement shows only when switched on and not past its optional expiry date. */
export const achievementVisible = (s: SiteSettings = settings, now = new Date()): boolean =>
  s.achievement.enabled && !!s.achievement.title && !(s.achievement.expires && s.achievement.expires < now);
