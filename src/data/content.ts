// Typed loaders for the JSON files edited in /admin (same pattern as settings.ts).
// Empty strings from the CMS are treated as "not set"; a malformed file fails the build with a readable error.
import { z } from "astro/zod";
import siteRaw from "./site.json";
import researchPageRaw from "./research-page.json";
import achievementsRaw from "./achievements.json";
import momentsRaw from "./moments.json";
import pagesRaw from "./pages.json";
import cvRaw from "./cv.json";

const blank = (v: unknown) => (v === "" || v === null ? undefined : v);
const text = z.preprocess(blank, z.string().optional());

// Icon names must exist in src/components/social-icons/index.astro
export const SOCIAL_KINDS = ["github", "linkedin", "hacker", "scholar", "leetcode", "twitter", "facebook", "youtube", "mastodon", "mendely", "mail"] as const;
export const SOCIAL_LABELS: Record<(typeof SOCIAL_KINDS)[number], string> = {
  github: "GitHub", linkedin: "LinkedIn", hacker: "HackerRank", scholar: "Google Scholar", leetcode: "LeetCode",
  twitter: "X / Twitter", facebook: "Facebook", youtube: "YouTube", mastodon: "Mastodon", mendely: "Mendeley", mail: "Email",
};

export const MOTIFS = ["art", "gears", "city", "leaf", "lake", "mountains"] as const;

const site = z.object({
  title: z.string().min(1),
  headerTitle: z.string().min(1),
  description: z.string().min(1),
  author: z.string().min(1),
  keywords: z.array(z.string()).default([]),
  ogImage: z.string().min(1).default("/static/logo.png"),
  // Footer, home hero, About page and CV all render this list; add or delete entries in the CMS.
  socialLinks: z.array(z.object({
    kind: z.enum(SOCIAL_KINDS),
    url: z.string().min(1),
  })).default([]),
  navigation: z.array(z.object({
    title: z.string().min(1),
    href: z.string().min(1),
    visible: z.boolean().default(true),
  })).default([]),
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
    images: z.array(z.string().min(1).transform((src) => {
      const path = src.replace(/^\/?public\//, "");
      return path.startsWith("static/") ? `/${path}` : path;
    })).min(1).max(2),
    alt: z.string().default(""),
    caption: z.string().min(1),
    writeup: text,
    category: z.string().min(1),
    motif: z.enum(MOTIFS).default("art"),
  })).default([]),
});

export const siteData = site.parse(siteRaw);
export const researchPageData = researchPage.parse(researchPageRaw);
export const achievementsData = achievements.parse(achievementsRaw);
export const momentsData = moments.parse(momentsRaw);

// Every label/heading/SEO string that used to be hardcoded in pages and components.
// *Description keys are optional; every other key must be non-empty so a page never renders a blank heading.
const labels = <K extends string>(keys: readonly K[]) =>
  z.object(
    Object.fromEntries(
      keys.map((k) => [k, k.endsWith("Description") ? text : z.string().min(1)]),
    ) as Record<K, z.ZodType<string | undefined>>,
  );

const pages = z.object({
  home: labels(["latestPublicationsEyebrow", "latestPublicationsTitle", "publicationsEmpty", "allResearchButton", "latestThoughtsTitle", "thoughtsEmpty", "allThoughtsButton", "readLabel", "updatesTitle", "updatesLinkLabel", "nowLabel", "techNewsLabel", "currentProjectEyebrow", "areasLabel", "toolsLabel", "projectDetailsLabel", "repositoryLabel", "implementationLabel"]),
  thoughts: labels(["seoTitle", "seoDescription", "title", "subtitle", "filterLabel", "allTopicsLabel", "readMoreLabel"]),
  research: labels(["seoTitle", "seoDescription", "interestsTitle", "publicationsTitle", "scholarLinkLabel", "groupUnderReview", "groupJournal", "groupConference", "groupThesis", "empty"]),
  projects: labels(["seoTitle", "seoDescription", "title", "subtitle", "tabLatest", "tabResearch", "tabDevelopment", "detailsLabel", "emptyResearch", "emptyDevelopment", "comingSoonResearch", "comingSoonDevelopment", "backLabel", "researchKindLabel", "developmentKindLabel", "overviewLabel", "areasLabel", "toolsLabel", "liveLabel", "sourceLabel", "notesLabel", "paperLabel"]),
  achievements: labels(["seoTitle", "seoDescription", "title", "subtitle", "filterAll", "filterAwards", "filterCertificates", "awardsHeading", "certificatesHeading", "certificatesHint", "closeLabel"]),
  moments: labels(["seoTitle", "seoDescription", "title"]),
  about: labels(["seoTitle", "seoDescription", "title", "subtitle", "latestPostsTitle"]),
  cv: labels(["seoTitle", "seoDescription", "title", "downloadLabel", "summaryTitle", "experienceTitle", "educationTitle", "skillsTitle", "publicationsTitle", "awardsTitle", "certificatesTitle"]),
  notFound: labels(["seoTitle", "heading", "message", "hint", "button"]),
  post: labels(["breadcrumbLabel", "publishedOn", "lastUpdatedOn", "relatedTitle", "relatedHint", "previous", "next", "onThisPage"]),
  tags: labels(["seoTitle", "title", "empty"]),
});

const cv = z.object({
  headline: text,
  summary: text,
  pdf: text,
  experience: z.array(z.object({
    role: z.string().min(1),
    organization: text,
    location: text,
    start: text,
    end: text,
    bullets: z.array(z.string()).default([]),
  })).default([]),
  education: z.array(z.object({
    degree: z.string().min(1),
    institution: text,
    period: text,
    details: text,
  })).default([]),
  skills: z.array(z.object({
    group: z.string().min(1),
    items: z.array(z.string()).default([]),
  })).default([]),
  showPublications: z.boolean().default(true),
  showAwards: z.boolean().default(true),
  showCertificates: z.boolean().default(true),
});

export const pagesData = pages.parse(pagesRaw) as {
  [G in keyof typeof pagesRaw]: { [K in keyof (typeof pagesRaw)[G]]: string };
};
export const cvData = cv.parse(cvRaw);
