import {getCollection} from 'astro:content';
import {excludeDrafts, getProjects, getResearchEntries} from '@/functions';
import {NAVIGATION} from '@/consts';

// Static search index, built once at deploy time (works on GitHub Pages, no server).
const clip = (text: string | undefined, max = 220) => (text ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

export async function GET() {
    const posts = (await getCollection('blog', excludeDrafts)) ?? [];
    const research = await getResearchEntries();
    const projects = await getProjects();

    const items = [
        ...NAVIGATION.filter(({href}) => href !== '/').map(({href, title}) => ({
            type: 'Page', title, url: href, text: '',
        })),
        ...posts.map(({slug, data}) => ({
            type: 'Thought',
            title: data.title,
            url: `/blog/${slug}/`,
            text: clip(`${data.summary ?? ''} ${(data.tags ?? []).map((t: {id?: string; slug?: string}) => t.id ?? t.slug).join(' ')}`),
        })),
        ...research.map(({slug, data}) => ({
            type: 'Research',
            title: data.title,
            url: `/research/${slug}/`,
            text: clip(`${data.summary ?? ''} ${data.authors} ${data.venue ?? ''} ${data.tags.join(' ')}`),
        })),
        ...projects.map(({slug, data}) => ({
            type: 'Project',
            title: data.title,
            url: `/projects/${slug}/`,
            text: clip(`${data.description} ${data.areas.join(' ')} ${data.stack.join(' ')}`),
        })),
    ];

    return new Response(JSON.stringify(items), {headers: {'Content-Type': 'application/json'}});
}
