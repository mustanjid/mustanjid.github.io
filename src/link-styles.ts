/**
 * Link style presets for rich text written in the CMS (home intro, blog posts, project write-ups).
 * In the editor, give a link a title equal to a preset name:   [software development](/projects "indigo")
 * A link with no title (or an unknown one) keeps the normal link style.
 * Keep class names as full literal strings so Tailwind can see and generate them.
 */
export const LINK_STYLES: Record<string, string> = {
    indigo: "font-semibold text-gray-900 underline decoration-indigo-500 decoration-2 underline-offset-4 hover:decoration-indigo-700 dark:text-gray-100 dark:decoration-indigo-400",
    brand: "font-semibold text-gray-900 underline decoration-primary-500 decoration-2 underline-offset-4 hover:decoration-primary-700 dark:text-gray-100 dark:decoration-primary-400",
    success: "font-semibold text-gray-900 underline decoration-emerald-500 decoration-2 underline-offset-4 hover:decoration-emerald-700 dark:text-gray-100 dark:decoration-emerald-400",
    danger: "font-semibold text-gray-900 underline decoration-red-500 decoration-2 underline-offset-4 hover:decoration-red-700 dark:text-gray-100 dark:decoration-red-400",
    sky: "font-semibold text-gray-900 underline decoration-sky-500 decoration-2 underline-offset-4 hover:decoration-sky-700 dark:text-gray-100 dark:decoration-sky-400",
    amber: "font-semibold text-gray-900 underline decoration-amber-500 decoration-2 underline-offset-4 hover:decoration-amber-700 dark:text-gray-100 dark:decoration-amber-400",
    rose: "font-semibold text-gray-900 underline decoration-rose-500 decoration-2 underline-offset-4 hover:decoration-rose-700 dark:text-gray-100 dark:decoration-rose-400",
    bold: "font-semibold text-gray-900 dark:text-gray-100",
};
