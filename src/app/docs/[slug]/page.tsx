"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { getPublishedPosts } from "@/lib/posts";
import { PostRecord } from "@/types/post";

export default function DocsSlugPage() {
    const params = useParams<{ slug: string }>();
    const slug = params.slug;

    const [posts, setPosts] = useState<PostRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const run = async () => {
            try {
                const data = await getPublishedPosts();
                setPosts(data);
            } catch (err) {
                console.error("Lỗi tải tài liệu:", err);
                setError("Không thể tải dữ liệu tài liệu.");
            } finally {
                setLoading(false);
            }
        };

        run();
    }, []);

    const activePost = useMemo(
        () => posts.find((post) => post.slug === slug),
        [posts, slug],
    );

    if (loading) {
        return <div className="p-8">Đang tải tài liệu...</div>;
    }

    if (error) {
        return <div className="p-8 text-red-700">{error}</div>;
    }

    return (
        <section className="min-w-0 flex-1 rounded-2xl border border-[#d3e3f8] bg-white p-6 shadow-sm lg:p-10">
            {!activePost ? (
                <div className="space-y-3">
                    <h1 className="text-2xl font-bold text-slate-900">
                        Không tìm thấy tài liệu
                    </h1>
                    <Link href="/docs" className="text-[#134186] underline">
                        Quay về danh sách tài liệu
                    </Link>
                </div>
            ) : (
                <>
                    <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-[#134186]">
                        {activePost.title}
                    </h1>
                    {activePost.coverImage && (
                        <Image
                            src={activePost.coverImage}
                            alt={activePost.title}
                            width={1200}
                            height={560}
                            className="mb-6 max-h-96 w-full rounded-xl object-cover"
                        />
                    )}
                    <MarkdownRenderer content={activePost.content} />
                </>
            )}
        </section>
    );
}
