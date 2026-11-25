import {defineConfig} from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";

import {readdirSync} from 'node:fs';
import {SITE_METADATA} from "./src/consts.ts";
import rehypeLinkStyles from "./src/plugins/rehype-link-styles.mjs";

// /projects/research/<paper> used to be one page per paper; each paper now has its own page under /research/<paper>.
const paperRedirects = Object.fromEntries(
    readdirSync('./src/content/research')
        .filter((file) => /\.mdx?$/.test(file))
        .map((file) => file.replace(/\.mdx?$/, ''))
        .map((slug) => [`/projects/research/${slug}`, `/research/${slug}`])
);

// https://astro.build/config
export default defineConfig({
    prefetch: true,
    redirects: paperRedirects,
    markdown: {rehypePlugins: [rehypeLinkStyles]},
    // Patch files are not site assets; exclude them from Vite's watcher on Windows.
    vite: {
        server: {
            watch: {
                ignored: ["**/*.patch"]
            }
        }
    },
    site: SITE_METADATA.siteUrl,
    integrations: [mdx(), sitemap(), tailwind()]
});
