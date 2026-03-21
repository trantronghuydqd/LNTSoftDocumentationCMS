import { PostRecord, PostTreeNode } from "@/types/post";
import { readPostSlug, readPostTitle } from "@/lib/post-i18n";
import { SupportedLanguage } from "@/types/post";

export function buildPostTree(posts: PostRecord[], lang: SupportedLanguage) {
    const map: Record<string, PostTreeNode> = {};
    const roots: PostTreeNode[] = [];

    for (const post of posts) {
        map[post.id] = { ...post, children: [] };
    }

    for (const post of posts) {
        const currentNode = map[post.id];

        if (post.parentId && map[post.parentId]) {
            map[post.parentId].children.push(currentNode);
            continue;
        }

        roots.push(currentNode);
    }

    const sortTree = (nodes: PostTreeNode[]) => {
        nodes.sort(
            (a, b) =>
                a.orderIndex - b.orderIndex ||
                readPostTitle(a, lang).localeCompare(readPostTitle(b, lang)),
        );
        nodes.forEach((node) => sortTree(node.children));
        return nodes;
    };

    return sortTree(roots);
}

export function collectAncestorIds(
    posts: PostRecord[],
    slug: string,
    lang: SupportedLanguage,
) {
    const postBySlug = posts.find((post) => readPostSlug(post, lang) === slug);
    if (!postBySlug) return [];

    const postMap = Object.fromEntries(posts.map((post) => [post.id, post]));
    const ancestors = new Set<string>();
    let cursor = postBySlug;

    while (cursor.parentId && postMap[cursor.parentId]) {
        ancestors.add(cursor.parentId);
        cursor = postMap[cursor.parentId];
    }

    return [...ancestors];
}
