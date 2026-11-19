// Like / Love buttons. Counts live in a free Supabase table (see supabase/reactions.sql); the settings come from
// src/data/site.json ("Likes and Loves" in the CMS). Without settings, the buttons are hidden on the live site and
// shown in a local "demo" mode while running `npm run dev`, so you can see how they look.
import { siteData } from "@/data/content";

const looksSecret = (key: string) => {
  if (key.startsWith("sb_secret_")) return true;
  const payload = key.split(".")[1];
  if (!payload) return false;
  try {
    const json = JSON.parse(Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
    return json?.role === "service_role";
  } catch {
    return false;
  }
};

export const getReactionConfig = () => {
  const { enabled, url, key } = siteData.reactions;
  const cleanKey = (key ?? "").trim();
  if (cleanKey && looksSecret(cleanKey)) {
    // site.json is public, so a secret key there would hand out full database access.
    throw new Error("The Likes and Loves key in site.json is a SECRET key. Use the public anon/publishable key instead, and rotate the secret one in Supabase.");
  }
  const cleanUrl = (url ?? "").trim().replace(/\/+$/, "");
  const live = enabled && cleanUrl !== "" && cleanKey !== "";
  const demo = !live && import.meta.env.DEV;
  return { live, demo, available: live || demo, url: live ? cleanUrl : "", key: live ? cleanKey : "" };
};

/** True when ReactionBar will render something (live, or demo mode in `npm run dev`). */
export const reactionsAvailable = () => getReactionConfig().available;
