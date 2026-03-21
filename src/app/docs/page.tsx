"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPublishedPosts } from "@/lib/posts";
import { PostRecord } from "@/types/post";

export default function DocsIndexPage() {
    const router = useRouter();
    const [posts, setPosts] = useState<PostRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const run = async () => {
            try {
                const data = await getPublishedPosts();
                setPosts(data);

                if (data.length > 0) {
                    router.replace(`/docs/${data[0].slug}`);
                }
            } catch {
                setError("Không thể tải tài liệu.");
            } finally {
                setLoading(false);
            }
        };

        run();
    }, [router]);

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
                            href={`/docs/${post.slug}`}
                            className="text-slate-800 underline"
                        >
                            {post.title}
                        </Link>
                    </li>
                ))}
            </ul>
        </main>
    );
}
