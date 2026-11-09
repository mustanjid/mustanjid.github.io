// Shared labels/colors/helpers for research entries (used by /research and the homepage card).
export const STATUS_LABEL: Record<string, string> = {
  published: "Published",
  accepted: "Accepted",
  "under-review": "Under review",
  submitted: "Submitted",
  preprint: "Preprint",
  "in-preparation": "In preparation",
};

export const STATUS_BADGE: Record<string, string> = {
  published: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  accepted: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  "under-review": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  submitted: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  preprint: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "in-preparation": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export const doiUrl = (doi?: string): string | undefined => {
  const value = doi?.trim();
  if (!value) return undefined;

  const identifier = value.replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, "");
  return /^10\.\d{4,9}\/\S+$/i.test(identifier) ? `https://doi.org/${identifier}` : undefined;
};

export const paperPdfUrl = (...urls: (string | undefined)[]): string | undefined =>
  urls.find((url) => url && /^https?:\/\/\S+\.pdf(?:[?#].*)?$/i.test(url));
