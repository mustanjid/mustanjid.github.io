// Turns [text](url "indigo") into <a class="...preset classes..."> using src/link-styles.ts.
// Only links whose title is a known preset name are touched; every other link is left alone.
import { LINK_STYLES } from "../link-styles.ts";

const walk = (node) => {
    if (node.type === "element" && node.tagName === "a" && typeof node.properties?.title === "string") {
        const preset = LINK_STYLES[node.properties.title.trim().toLowerCase()];
        if (preset) {
            const existing = Array.isArray(node.properties.className) ? node.properties.className : [];
            node.properties.className = [...existing, ...preset.split(" ")];
            delete node.properties.title;
        }
    }
    node.children?.forEach(walk);
};

export default function rehypeLinkStyles() {
    return (tree) => walk(tree);
}
