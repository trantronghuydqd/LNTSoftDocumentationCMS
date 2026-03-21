export type PostRecord = {
    id: string;
    title: string;
    slug: string;
    content: string;
    parentId: string | null;
    orderIndex: number;
    coverImage: string;
    published: boolean;
    authorId: string;
    createdAt?: string;
    updatedAt?: string;
};

export type PostInput = {
    title: string;
    slug: string;
    content: string;
    parentId: string | null;
    orderIndex: number;
    coverImage: string;
    published: boolean;
    authorId: string;
};

export type PostTreeNode = PostRecord & {
    children: PostTreeNode[];
};
