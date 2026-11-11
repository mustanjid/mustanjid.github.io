import {getCollection, type CollectionEntry} from "astro:content";

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
 * Development projects from the `projects` collection, ordered by the CMS "order" field.
 * Returns the same shape the old src/projects.ts exported, so Card.astro is unchanged.
 */
export const getProjects = async () => {
    const all = (await getCollection('projects')) ?? [];
    return all
        .filter(({data}) => (import.meta.env.PROD ? !data.draft : true))
        .sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title))
        .map(({id, data}) => ({
            slug: id.replace(/\.json$/, ''),
            title: data.title,
            description: data.description,
            imgSrc: data.imgSrc || undefined,
            projectdesc: data.projectdesc || undefined,
            srccode: data.srccode || undefined,
            url: data.url || undefined,
            stack: data.stack,
        }));
}

export type DevProject = Awaited<ReturnType<typeof getProjects>>[number];
