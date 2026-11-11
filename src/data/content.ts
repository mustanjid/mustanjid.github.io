// Typed loaders for the JSON files edited in /admin (same pattern as settings.ts).
// Empty strings from the CMS are treated as "not set"; a malformed file fails the build with a readable error.
import { z } from "astro/zod";
import siteRaw from "./site.json";
import homeRaw from "./home.json";
import researchPageRaw from "./research-page.json";
import achievementsRaw from "./achievements.json";
import momentsRaw from "./moments.json";

const blank = (v: unknown) => (v === "" || v === null ? undefined : v);
const text = z.preprocess(blank, z.string().optional());

export const MOTIFS = ["art", "gears", "city", "leaf", "lake", "mountains"] as const;

const site = z.object({
  title: z.string().min(1),
  headerTitle: z.string().min(1),
  description: z.string().min(1),
  author: z.string().min(1),
  keywords: z.array(z.string()).default([]),
  social: z.object({
    github: z.string().url(),
    linkedin: z.string().url(),
    hackerrank: z.string().url(),
  }),
});

const home = z.object({
  tagline: z.array(z.string()).default([]),
  intro: z.array(z.string()).default([]),
  closing: text,
  cvUrl: text,
  cvLabel: z.string().default("CV"),
  showMomentsLink: z.boolean().default(true),
});

const researchPage = z.object({
  interests: z.array(z.string()).default([]),
});

const achievements = z.object({
  featured: z.object({
    enabled: z.boolean().default(false),
    eyebrow: text,
    title: text,
    description: text,
    image: text,
    imageAlt: text,
    organizers: text,
    team: text,
    location: text,
  }).default({}),
  awards: z.array(z.object({
    date: z.string().min(1),
    title: z.string().min(1),
    description: text,
  })).default([]),
  certificates: z.array(z.object({
    title: z.string().min(1),
    provider: z.string().min(1),
    image: z.string().min(1),
  })).default([]),
});

const moments = z.object({
  intro: text,
  items: z.array(z.object({
    src: z.string().min(1),
    alt: z.string().default(""),
    caption: z.string().min(1),
    writeup: text,
    motif: z.enum(MOTIFS).default("art"),
  })).default([]),
});

export const siteData = site.parse(siteRaw);
export const homeData = home.parse(homeRaw);
export const researchPageData = researchPage.parse(researchPageRaw);
export const achievementsData = achievements.parse(achievementsRaw);
export const momentsData = moments.parse(momentsRaw);
