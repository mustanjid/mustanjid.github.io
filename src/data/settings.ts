// Single typed entry point for the homepage switches edited in /admin.
// A malformed settings file fails the build with a readable error instead of shipping a broken page.
import { z } from "astro/zod";
import raw from "./site-settings.json";

const blank = (v: unknown) => (v === "" || v === null ? undefined : v);
const text = z.preprocess(blank, z.string().optional());
const url = z.preprocess(blank, z.string().url().optional());
const date = z.preprocess(blank, z.coerce.date().optional());

const schema = z.object({
  greeting: z.string().max(60).default("Hello, folks!"),
  rightNow: z.object({
    enabled: z.boolean().default(false),
    text: z.string().max(140, "Right now line must be 140 characters or fewer").default(""),
    updatedAt: date,
    url,
  }).default({}),
  claudeUsage: z.object({
    enabled: z.boolean().default(false),
    value: z.string().max(40).default(""),
    period: z.string().max(60).default("Tokens used"),
    detail: text,
    updatedAt: date,
  }).default({}),
  tools: z.array(z.object({
    name: z.string().min(1).max(40),
    icon: z.string().max(8).default("🔧"),
    url,
  })).default([]),
  news: z.object({
    enabled: z.boolean().default(false),
  }).default({}),
  announcements: z.object({
    enabled: z.boolean().default(false),
    items: z.array(z.object({
      title: z.string().min(1, "Announcement title is required"),
      description: text,
      date,
      url,
    })).default([]),
  }).default({}),
  achievement: z.object({
    enabled: z.boolean().default(false),
    title: text,
    description: text,
    date,
    url,
    expires: date,
  }).default({}),
  scholarUrl: url,
});

export type SiteSettings = z.infer<typeof schema>;
export const settings: SiteSettings = schema.parse(raw);

/** Achievement shows only when switched on and not past its optional expiry date. */
export const achievementVisible = (s: SiteSettings = settings, now = new Date()): boolean =>
  s.achievement.enabled && !!s.achievement.title && !(s.achievement.expires && s.achievement.expires < now);
