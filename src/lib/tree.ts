import { PostRecord, PostTreeNode } from "@/types/post";

export function buildPostTree(posts: PostRecord[]) {
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
                a.orderIndex - b.orderIndex || a.title.localeCompare(b.title),
        );
        nodes.forEach((node) => sortTree(node.children));
        return nodes;
    };

    return sortTree(roots);
}

export function collectAncestorIds(posts: PostRecord[], slug: string) {
    const postBySlug = posts.find((post) => post.slug === slug);
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
