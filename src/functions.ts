import {getCollection, type CollectionEntry} from "astro:content";
import {momentsData} from "@/data/content";

/**
 * Filter blog posts by published date and order them.
 * Change the sort order by changing the minus sign to a plus sign, or add your new logic by changing the return value.
 *
 * You have access to the post data, so you can sort by any property you want, ex. by tags or title.
 * The sort order is descending, so the newest posts are first.
 *
 * @param posts Collection of blog posts
 * @returns Collection of blog posts sorted by date
 */
export const sortBlogPosts = (posts: CollectionEntry<'blog'>[]): CollectionEntry<'blog'>[] => {
    return posts.sort((a, b) => {
        return new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
    })
}

/**
 * Exclude draft posts from the collection. If the site is built in production mode, draft posts are excluded by default.
 *
 * @param post Blog post
 * @returns True if the post is not a draft
 */
export const excludeDrafts = ({data}: CollectionEntry<'blog'>): boolean => {
    return import.meta.env.PROD ? !data.draft : true;
}

/**
 * Research entries, newest first. Astro 3 returns undefined for an empty collection,
 * so guard it: the site must still build before the first paper is added.
 */
export const getResearchEntries = async (): Promise<CollectionEntry<'research'>[]> => {
    const all = (await getCollection('research')) ?? [];
    return all
        .filter(({data}) => (import.meta.env.PROD ? !data.draft : true))
        .sort((a, b) => (b.data.date?.getTime() ?? 0) - (a.data.date?.getTime() ?? 0));
}

/**
 * All projects (research, development, devops...) from the `projects` collection.
 * Sorted by the CMS "order" field: lower number first, so the first entry is the "latest".
 */
export const getProjects = async (): Promise<CollectionEntry<'projects'>[]> => {
    const all = (await getCollection('projects')) ?? [];
    return all
        .filter(({data}) => (import.meta.env.PROD ? !data.draft : true))
        .sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title));
}

export interface ProjectCategory {
    slug: string;
    name: string;
    order: number;
    research: boolean;
}

const titleCase = (slug: string) => slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/** Project categories created in the CMS, in tab order. */
export const getProjectCategories = async (): Promise<ProjectCategory[]> => {
    const all = (await getCollection('project-categories')) ?? [];
    return all
        .map(({slug, data}) => ({slug, name: data.name, order: data.order, research: data.research}))
        .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
};

/** Slugs of the categories marked "research". Falls back to "research" until one is marked. */
export const getResearchKinds = async (): Promise<Set<string>> => {
    const kinds = new Set((await getProjectCategories()).filter((category) => category.research).map((category) => category.slug));
    if (kinds.size === 0) kinds.add('research');
    return kinds;
};

export const isResearchProject = ({data}: CollectionEntry<'projects'>, researchKinds: Set<string>) => researchKinds.has(data.kind);

/** Display name for a project's category (a project pointing at a deleted category still gets a readable name). */
export const getProjectCategoryName = async (kind: string): Promise<string> =>
    (await getProjectCategories()).find((category) => category.slug === kind)?.name ?? titleCase(kind);

/** Categories that have at least one project, each with its projects (lowest `order` first = its "latest"). */
export const getProjectGroups = async () => {
    const categories = await getProjectCategories();
    const projects = await getProjects();
    const known = new Set(categories.map((category) => category.slug));
    const orphans: ProjectCategory[] = [...new Set(projects.map(({data}) => data.kind).filter((kind) => !known.has(kind)))]
        .map((slug) => ({slug, name: titleCase(slug), order: 1000, research: false}));
    return [...categories, ...orphans]
        .map((category) => ({category, projects: projects.filter(({data}) => data.kind === category.slug)}))
        .filter((group) => group.projects.length > 0);
};

/**
 * The project shown on the homepage card: the first "featured" project, else the latest one.
 * Pass kind "research" to restrict it to research projects (used on the Research page).
 */
export const getFeaturedProject = async (kind?: 'research'): Promise<CollectionEntry<'projects'> | undefined> => {
    const researchKinds = await getResearchKinds();
    const all = (await getProjects()).filter((entry) => !kind || isResearchProject(entry, researchKinds));
    return all.find(({data}) => data.featured) ?? all[0];
}

/** Props for Card.astro (development-style card). */
export const toCardProps = ({slug, data}: CollectionEntry<'projects'>) => ({
    slug,
    title: data.title,
    description: data.description,
    imgSrc: data.imgSrc || undefined,
    projectdesc: data.projectdesc || undefined,
    srccode: data.srccode || undefined,
    url: data.url || undefined,
    stack: data.stack,
});

export const STAGE_LABEL: Record<string, string> = {
    idea: 'Idea',
    plan: 'Planned',
    'in-progress': 'In progress',
    demo: 'Demo',
    shipped: 'Shipped',
};


const slugify = (value: string): string =>
    value
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);

/**
 * Moments from src/data/moments.json, each with its own shareable /moments/<slug> page.
 * The slug comes from the caption (de-duplicated); captions with no latin letters fall back to "moment-<n>".
 */
export const getMoments = () => {
    const used = new Set<string>();
    return momentsData.items.map((item, index) => {
        const base = slugify(item.caption) || `moment-${index + 1}`;
        let slug = base;
        for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`;
        used.add(slug);
        return {...item, slug};
    });
};
