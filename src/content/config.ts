import {defineCollection, reference, z} from 'astro:content';

// Sveltia CMS saves cleared optional fields as '' (e.g. `pdfUrl: ''`). Without this, '' fails .url()/.date()/enum
// checks and breaks the whole build. optional(...) turns '' into "not set".
const blank = (value: unknown) => (value === '' || value === null ? undefined : value);
const optional = <T extends z.ZodTypeAny>(schema: T) => z.preprocess(blank, schema.optional());

const authors = defineCollection({
    type: 'content',
    schema: z.object({
        name: z.string(),
        avatar: optional(z.string()),
        occupation: optional(z.string()),
        company: optional(z.string()),
        email: z.string().email(),
        twitter: optional(z.string().url()),
        linkedin: optional(z.string().url()),
        github: optional(z.string().url()),
        layout: optional(z.string().url()),
    }),
});

const blog = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        date: z.coerce.date(),
        tags: z.array(reference('tags')).default(['default']),
        lastmod: optional(z.coerce.date()),
        draft: z.boolean().default(false),
        summary: optional(z.string()),
        images: optional(z.string()),
        authors: z.array(reference('authors')).default(['default']),
        // TODO: Add support for tags-and-list layout
        layout: z.enum(['list', 'tags-and-list']).default('list'),
        bibliography: optional(z.string()),
        canonicalUrl: optional(z.string()), // Maybe remove later, as Astro provide a better solution for canonical urls
        // Add related posts
        related: z.array(reference('blog')).default([]),
        // LinkedIn sharing (used by the optional auto-post workflow)
        linkedin: optional(z.boolean()),
        linkedinText: optional(z.string()),
        linkedinPosted: optional(z.boolean()),
    }),
});

const tags = defineCollection({
    type: 'content',
    schema: z.object({
        name: z.string(),
        description: optional(z.string()),
        // TODO: Add support for images and layout
        // image: z.string().optional(),
        // layout: z.string().optional(),
    }),
});

const momentCategories = defineCollection({
      type: 'content',
      schema: z.object({
          name: z.string().min(1),
      }),
});

const research = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        // Where the paper stands. Change this as it moves through the pipeline.
        status: z.enum(['published', 'accepted', 'under-review', 'submitted', 'preprint', 'in-preparation']),
        publicationType: optional(z.enum(['thesis', 'journal', 'conference'])),
        citation: optional(z.string()),
        authors: z.string(),                 // free text, e.g. "A. Name, B. Name, You"
        venue: optional(z.string()),        // journal/conference; leave empty while under review if you prefer
        publisher: optional(z.string()),
        citationDetails: optional(z.string()),
        date: optional(z.coerce.date()),     // publication date, or submission date for pending work
        doi: optional(z.string()),
        pdfUrl: optional(z.string().url()),
        url: optional(z.string().url()),    // publisher page
        preprintUrl: optional(z.string().url()), // arXiv / bioRxiv / SSRN
        codeUrl: optional(z.string().url()),
        datasetUrl: optional(z.string().url()),
        projectUrl: optional(z.string().url()),
        image: optional(z.string()),
        summary: optional(z.string()),      // 1-2 plain-language sentences
        tags: z.array(z.string()).default([]),
        featured: z.boolean().default(false),
        draft: z.boolean().default(false),
    }),
});

const projects = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        // research = shown under Projects > Research; everything else under Development & DevOps
        kind: z.enum(['research', 'development', 'devops', 'ml', 'other']).default('development'),
        stage: optional(z.enum(['idea', 'plan', 'in-progress', 'demo', 'shipped'])),
        order: z.number().default(100),      // lower number = shown first ("latest")
        draft: z.boolean().default(false),
        featured: z.boolean().default(false), // the featured project is the homepage "current project" card
        date: optional(z.coerce.date()),
        description: z.string(),
        imgSrc: optional(z.string()),
        projectdesc: optional(z.string()),  // README / notes link
        srccode: optional(z.string()),      // source code / repository link
        url: optional(z.string()),          // live demo link
        paper: optional(reference('research')), // related publication
        areas: z.array(z.string()).default([]),
        stack: z.array(z.string()).default([]),
    }),
});

const home = defineCollection({
    type: 'content',
    schema: z.object({
        tagline: z.array(z.string()).default([]),
    }),
});

export const collections = {blog, authors, tags, research, projects, home, 'moment-categories': momentCategories};
