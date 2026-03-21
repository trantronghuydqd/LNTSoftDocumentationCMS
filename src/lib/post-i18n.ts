import { LocalizedField, PostRecord, SupportedLanguage } from "@/types/post";

export function resolveLanguage(value?: string | null): SupportedLanguage {
    return value === "en" ? "en" : "vi";
}

export function readLocalizedText(
    field: LocalizedField,
    lang: SupportedLanguage,
) {
    const primary = field[lang]?.trim();
    if (primary) return primary;

    const fallback = lang === "vi" ? field.en : field.vi;
    return fallback?.trim() || "";
}

export function readPostSlug(post: PostRecord, lang: SupportedLanguage) {
    return readLocalizedText(post.slug, lang);
}

export function readPostTitle(post: PostRecord, lang: SupportedLanguage) {
    return readLocalizedText(post.title, lang);
}

export function readPostContent(post: PostRecord, lang: SupportedLanguage) {
    return readLocalizedText(post.content, lang);
}
