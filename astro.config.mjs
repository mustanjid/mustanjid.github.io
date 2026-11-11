import {defineConfig} from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";

import {readdirSync} from 'node:fs';
import {SITE_METADATA} from "./src/consts.ts";

// /projects/research/<paper> used to be one page per paper; papers now live under /research.
const paperRedirects = Object.fromEntries(
    readdirSync('./src/content/research')
        .filter((file) => /\.mdx?$/.test(file))
        .map((file) => file.replace(/\.mdx?$/, ''))
        .map((slug) => [`/projects/research/${slug}`, `/research#${slug}`])
);

// https://astro.build/config
export default defineConfig({
    prefetch: true,
    redirects: paperRedirects,
    site: SITE_METADATA.siteUrl,
    integrations: [mdx(), sitemap(), tailwind()]
});
