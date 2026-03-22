"use client";

import { Suspense, useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import BrandHeader from "@/components/BrandHeader";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getPublishedPosts } from "@/lib/posts";
import { buildPostTree, collectAncestorIds } from "@/lib/tree";
import { PostRecord } from "@/types/post";
import { usePathname, useSearchParams } from "next/navigation";
import { readPostSlug, resolveLanguage } from "@/lib/post-i18n";

function DocsLayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const slug = pathname.split("/").pop() || "";
    const lang = resolveLanguage(searchParams.get("lang"));

    const [posts, setPosts] = useState<PostRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const run = async () => {
            try {
                const data = await getPublishedPosts();
                setPosts(data);
            } catch (err) {
                console.error("Lỗi tải sidebar:", err);
            } finally {
                setLoading(false);
            }
        };

        run();
    }, []);

    const tree = buildPostTree(posts, lang);
    const ancestorIds = collectAncestorIds(posts, slug, lang);
    const currentPost = posts.find((post) => {
        const viSlug = readPostSlug(post, "vi");
        const enSlug = readPostSlug(post, "en");
        return viSlug === slug || enSlug === slug;
    });

    const slugByLang = currentPost
        ? {
              vi: readPostSlug(currentPost, "vi"),
              en: readPostSlug(currentPost, "en"),
          }
        : null;

    if (loading) {
        return <main className="p-8">Đang tải tài liệu...</main>;
    }

    return (
        <>
            <BrandHeader
                logoHref={`/docs?lang=${lang}`}
                active="docs"
                rightAddon={<LanguageSwitcher slugByLang={slugByLang} />}
            />

            <div className="page-container flex flex-1 flex-col gap-4 py-4 lg:flex-row lg:py-8">
                <Sidebar
                    tree={tree}
                    activeSlug={slug}
                    ancestorIds={ancestorIds}
                    lang={lang}
                />
                {children}
            </div>
        </>
    );
}

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense fallback={<main className="p-8">Đang tải tài liệu...</main>}>
            <DocsLayoutContent>{children}</DocsLayoutContent>
        </Suspense>
    );
}
