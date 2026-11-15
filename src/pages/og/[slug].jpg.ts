// Build-time generator for link-preview images: /og/<name>.jpg (1200x630 JPEG, under ~300 KB).
// Covers the site default image, blog covers, project images and every Moments photo.
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import sharp from "sharp";
import { siteData } from "@/data/content";
import { getMoments, getProjects } from "@/functions";
import { OG_HEIGHT, OG_WIDTH, isLocalImage, normalizeSrc, ogKey, publicFile } from "@/og";

const MAX_BYTES = 280_000; // WhatsApp ignores og:image files much larger than ~300 KB

export async function getStaticPaths() {
  const posts = (await getCollection("blog")) ?? [];
  const sources = [
    siteData.ogImage,
    ...posts.map(({ data }) => data.images),
    ...(await getProjects()).map(({ data }) => data.imgSrc),
    ...getMoments().flatMap(({ images }) => images),
  ].filter((src): src is string => !!src && isLocalImage(src) && existsSync(publicFile(src)));

  const unique = new Map(sources.map((src) => [ogKey(src), normalizeSrc(src)]));
  return [...unique].map(([slug, src]) => ({ params: { slug }, props: { src } }));
}

export const GET: APIRoute = async ({ props }) => {
  const input = await readFile(publicFile(props.src));
  let quality = 86;
  let output: Buffer;
  do {
    output = await sharp(input)
      .rotate() // honour phone-camera orientation
      .resize(OG_WIDTH, OG_HEIGHT, { fit: "cover", position: "centre" })
      .flatten({ background: "#ffffff" }) // no transparent PNGs turning black
      .jpeg({ quality, progressive: true, mozjpeg: true })
      .toBuffer();
    quality -= 8;
  } while (output.length > MAX_BYTES && quality >= 40);

  return new Response(output, { headers: { "Content-Type": "image/jpeg" } });
};
