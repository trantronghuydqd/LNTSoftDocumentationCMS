export type SupportedLanguage = "vi" | "en";

export type LocalizedField = {
    vi: string;
    en: string;
};

export type PostRecord = {
    id: string;
    title: LocalizedField;
    slug: LocalizedField;
    content: LocalizedField;
    parentId: string | null;
    orderIndex: number;
    coverImage: string;
    published: boolean;
    authorId: string;
    createdAt?: string;
    updatedAt?: string;
};

export type PostInput = {
    title: LocalizedField;
    slug: LocalizedField;
    content: LocalizedField;
    parentId: string | null;
    orderIndex: number;
    coverImage: string;
    published: boolean;
    authorId: string;
};

export type PostTreeNode = PostRecord & {
    children: PostTreeNode[];
};
