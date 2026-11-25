// Automatic brand icons. Social links are matched by their URL, and tools/technologies by name.
// Icons come from the Simple Icons set (build time, no network calls on the page).
import * as si from "simple-icons";

/** Social-link keys the existing social-icons component already knows how to draw. */
const SOCIAL_HOSTS: [RegExp, string][] = [
  [/(^|\.)linkedin\.com$/, "linkedin"],
  [/(^|\.)github\.com$/, "github"],
  [/(^|\.)facebook\.com$|(^|\.)fb\.com$/, "facebook"],
  [/(^|\.)youtube\.com$|(^|\.)youtu\.be$/, "youtube"],
  [/(^|\.)(twitter|x)\.com$/, "twitter"],
  [/(^|\.)mastodon\.|(^|\.)fosstodon\.org$/, "mastodon"],
  [/(^|\.)scholar\.google\./, "scholar"],
  [/(^|\.)leetcode\.com$/, "leetcode"],
  [/(^|\.)mendeley\.com$/, "mendely"],
  [/(^|\.)news\.ycombinator\.com$/, "hacker"],
];

/** Works out the icon key for a social URL. Returns undefined when the host is unknown. */
export const socialKindFromUrl = (url: string): string | undefined => {
  if (url.startsWith("mailto:")) return "mail";
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return undefined;
  }
  return SOCIAL_HOSTS.find(([pattern]) => pattern.test(host))?.[1];
};

/** Tool / technology name (lowercase, no spaces or dots) -> Simple Icons entry. */
const TOOL_ICONS: Record<string, si.SimpleIcon> = {
  cisco: si.siCisco,
  mikrotik: si.siMikrotik,
  fortinet: si.siFortinet,
  ubiquiti: si.siUbiquiti,
  openwrt: si.siOpenwrt,
  linux: si.siLinux,
  ubuntu: si.siUbuntu,
  docker: si.siDocker,
  git: si.siGit,
  node: si.siNodedotjs,
  nodejs: si.siNodedotjs,
  express: si.siExpress,
  mongodb: si.siMongodb,
  react: si.siReact,
  laravel: si.siLaravel,
  php: si.siPhp,
  javascript: si.siJavascript,
  js: si.siJavascript,
  cloudflare: si.siCloudflare,
  mendeley: si.siMendeley,
};

const normalise = (name: string) => name.toLowerCase().replace(/[\s._-]+/g, "");

/** Icon data for a tool name, or undefined when there is no brand icon (a text chip is shown instead). */
export const toolIcon = (name: string): si.SimpleIcon | undefined => TOOL_ICONS[normalise(name)];
