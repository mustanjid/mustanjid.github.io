import {defineCollection, reference, z} from 'astro:content';

const authors = defineCollection({
    type: 'content',
    schema: z.object({
        name: z.string(),
        avatar: z.string().optional(),
        occupation: z.string().optional(),
        company: z.string().optional(),
        email: z.string().email(),
        twitter: z.string().url().optional(),
        linkedin: z.string().url().optional(),
        github: z.string().url().optional(),
        layout: z.string().url().optional(),
    }),
});

const blog = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        date: z.coerce.date(),
        tags: z.array(reference('tags')).default(['default']),
        lastmod: z.coerce.date().optional(),
        draft: z.boolean().default(false),
        summary: z.string().optional(),
        images: z.string().optional(),
        authors: z.array(reference('authors')).default(['default']),
        // TODO: Add support for tags-and-list layout
        layout: z.enum(['list', 'tags-and-list']).default('list'),
        bibliography: z.string().optional(),
        canonicalUrl: z.string().optional(), // Maybe remove later, as Astro provide a better solution for canonical urls
        // Add related posts
        related: z.array(reference('blog')).default([]),
        // LinkedIn sharing (used by the optional auto-post workflow)
        linkedin: z.boolean().optional(),
        linkedinText: z.string().optional(),
        linkedinPosted: z.boolean().optional(),
    }),
});

const tags = defineCollection({
    type: 'content',
    schema: z.object({
        name: z.string(),
        description: z.string().optional(),
        // TODO: Add support for images and layout
        // image: z.string().optional(),
        // layout: z.string().optional(),
    }),
});

const research = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        // Where the paper stands. Change this as it moves through the pipeline.
        status: z.enum(['published', 'accepted', 'under-review', 'submitted', 'preprint', 'in-preparation']),
        publicationType: z.enum(['thesis', 'journal', 'conference']).optional(),
        citation: z.string().optional(),
        authors: z.string(),                 // free text, e.g. "A. Name, B. Name, You"
        venue: z.string().optional(),        // journal/conference; leave empty while under review if you prefer
        publisher: z.string().optional(),
        citationDetails: z.string().optional(),
        date: z.coerce.date().optional(),     // publication date, or submission date for pending work
        doi: z.string().optional(),
        pdfUrl: z.string().url().optional(),
        url: z.string().url().optional(),    // publisher page
        preprintUrl: z.string().url().optional(), // arXiv / bioRxiv / SSRN
        codeUrl: z.string().url().optional(),
        datasetUrl: z.string().url().optional(),
        projectUrl: z.string().url().optional(),
        image: z.string().optional(),
        summary: z.string().optional(),      // 1-2 plain-language sentences
        tags: z.array(z.string()).default([]),
        featured: z.boolean().default(false),
        draft: z.boolean().default(false),
    }),
});

const projects = defineCollection({
    type: 'data',
    schema: z.object({
        title: z.string(),
        order: z.number().default(100),      // lower number = shown first
        draft: z.boolean().default(false),
        description: z.string(),
        imgSrc: z.string().optional(),
        projectdesc: z.string().optional(),  // README / notes link
        srccode: z.string().optional(),      // source code link
        url: z.string().optional(),          // live demo link
        stack: z.array(z.string()).default([]),
    }),
});

export const collections = {blog, authors, tags, research, projects};
