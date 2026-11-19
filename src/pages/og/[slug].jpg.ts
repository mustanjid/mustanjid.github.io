// Build-time generator for link-preview images: /og/<name>.jpg (1200x630 JPEG, under ~300 KB).
// Covers the site default image, blog / research / project covers, every Moments photo and any custom link-preview
// image picked in the CMS.
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import sharp from "sharp";
import { siteData } from "@/data/content";
import { getAchievements, getMoments, getProjects, getResearchEntries } from "@/functions";
import { FALLBACK_OG_IMAGE, OG_HEIGHT, OG_WIDTH, isLocalImage, normalizeSrc, ogKey, publicFile } from "@/og";

const MAX_BYTES = 280_000; // WhatsApp ignores og:image files much larger than ~300 KB

export async function getStaticPaths() {
  const posts = (await getCollection("blog")) ?? [];
  const research = await getResearchEntries();
  const projects = await getProjects();
  const achievements = getAchievements();
  const sources = [
    siteData.ogImage,
    FALLBACK_OG_IMAGE,
    ...posts.flatMap(({ data }) => [data.images, data.sharePreview?.image]),
    ...projects.flatMap(({ data }) => [data.imgSrc, data.sharePreview?.image]),
    ...research.flatMap(({ data }) => [data.image, data.sharePreview?.image]),
    ...getMoments().flatMap(({ images, sharePreview }) => [...images, sharePreview?.image]),
    ...[achievements.featured.image, achievements.featured.sharePreview?.image],
    ...achievements.awards.map(({ sharePreview }) => sharePreview?.image),
    ...achievements.certificates.map(({ sharePreview }) => sharePreview?.image),
  ].filter((src): src is string => !!src && isLocalImage(src) && existsSync(publicFile(src)));

  const unique = new Map(sources.map((src) => [ogKey(src), { src: normalizeSrc(src), fit: "cover" as "cover" | "contain" }]));
  // A certificate is a document: show all of it (on white) rather than a cropped 1200x630 slice.
  achievements.certificates
    .map(({ image }) => image)
    .filter((src) => isLocalImage(src) && existsSync(publicFile(src)))
    .forEach((src) => unique.set(ogKey(src), { src: normalizeSrc(src), fit: "contain" }));
  return [...unique].map(([slug, { src, fit }]) => ({ params: { slug }, props: { src, fit } }));
}

export const GET: APIRoute = async ({ props }) => {
  const input = await readFile(publicFile(props.src));
  let quality = 86;
  let output: Buffer;
  do {
    output = await sharp(input)
      .rotate() // honour phone-camera orientation
      .resize(OG_WIDTH, OG_HEIGHT, { fit: props.fit, position: "centre", background: "#ffffff" })
      .flatten({ background: "#ffffff" }) // no transparent PNGs turning black
      .jpeg({ quality, progressive: true, mozjpeg: true })
      .toBuffer();
    quality -= 8;
  } while (output.length > MAX_BYTES && quality >= 40);

  return new Response(output, { headers: { "Content-Type": "image/jpeg" } });
};
