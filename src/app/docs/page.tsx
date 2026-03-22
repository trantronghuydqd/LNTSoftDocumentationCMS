"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getPublishedPosts } from "@/lib/posts";
import { PostRecord } from "@/types/post";
import { readPostSlug, readPostTitle, resolveLanguage } from "@/lib/post-i18n";

function DocsIndexPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const lang = resolveLanguage(searchParams.get("lang"));
    const [posts, setPosts] = useState<PostRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const run = async () => {
            try {
                const data = await getPublishedPosts();
                setPosts(data);

                if (data.length > 0) {
                    router.replace(
                        `/docs/${readPostSlug(data[0], lang)}?lang=${lang}`,
                    );
                }
            } catch {
                setError("Không thể tải tài liệu.");
            } finally {
                setLoading(false);
            }
        };

        run();
    }, [router, lang]);

    if (loading) {
        return <main className="p-8">Đang chuyển hướng...</main>;
    }

    if (error) {
        return <main className="p-8 text-red-700">{error}</main>;
    }

    return (
        <main className="mx-auto w-full max-w-5xl p-8">
            <h1 className="mb-4 text-2xl font-bold text-slate-900">
                Danh sách tài liệu
            </h1>
            <ul className="space-y-2">
                {posts.map((post) => (
                    <li key={post.id}>
                        <Link
                            href={`/docs/${readPostSlug(post, lang)}?lang=${lang}`}
                            className="text-slate-800 underline"
                        >
                            {readPostTitle(post, lang)}
                        </Link>
                    </li>
                ))}
            </ul>
        </main>
    );
}

export default function DocsIndexPage() {
    return (
        <Suspense fallback={<main className="p-8">Đang chuyển hướng...</main>}>
            <DocsIndexPageContent />
        </Suspense>
    );
}
