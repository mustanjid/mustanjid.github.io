// Link-preview (Open Graph) images.
//
// Facebook, WhatsApp, LinkedIn and X are picky about og:image: WhatsApp skips images over ~300 KB, Facebook and
// WhatsApp are unreliable with WebP, and a 2560px photo is far too heavy. So every preview image is re-encoded at
// build time (see src/pages/og/[slug].jpg.ts) as a 1200x630 JPEG under 300 KB, and pages point at that copy.
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export const isLocalImage = (src: string) => !/^[a-z][a-z0-9+.-]*:/i.test(src) && !src.startsWith("//");

/** "static/x.png", "/static/x.png" and "public/static/x.png" all become "/static/x.png". */
export const normalizeSrc = (src: string) => "/" + src.trim().replace(/^\/+/, "").replace(/^public\//, "");

export const publicFile = (src: string) => path.join(process.cwd(), "public", normalizeSrc(src));

export const ogKey = (src: string) => {
  const normalized = normalizeSrc(src);
  const name = path.basename(normalized).replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "image";
  return `${name}-${createHash("md5").update(normalized).digest("hex").slice(0, 8)}`;
};

/**
 * Site path of the generated preview JPEG for a local image. Returns undefined for a missing file or an external
 * URL (its size/format can't be controlled, and a slow or hot-link-blocking host breaks the preview), so the caller
 * falls back to the site default image.
 */
export const ogImagePath = (src?: string): string | undefined => {
  const value = src?.trim();
  if (!value || !isLocalImage(value)) return undefined;
  return existsSync(publicFile(value)) ? `/og/${ogKey(value)}.jpg` : undefined;
};

/**
 * The "Link preview image" choice saved by the CMS on every shareable item (blog post, research paper, project,
 * moment): "cover" = the item's own cover image, "logo" = the site-wide default image, "custom" = a chosen/uploaded one.
 */
export interface SharePreview {
  source?: "cover" | "logo" | "custom";
  image?: string;
}

/**
 * Image to hand to <BaseHead image=...>. Returning undefined makes BaseHead use the site-wide default (the logo).
 * Items without a saved choice keep the old behaviour: their cover image, else the logo. A custom choice whose file
 * is missing falls back to the cover image rather than silently dropping to the logo.
 */
export const shareImageSource = (cover?: string, preview?: SharePreview): string | undefined => {
  if (preview?.source === "logo") return undefined;
  if (preview?.source === "custom") {
    const custom = preview.image?.trim();
    if (custom && ogImagePath(custom)) return custom;
  }
  return cover?.trim() || undefined;
};
