"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import BrandHeader from "@/components/BrandHeader";
import { getPublishedPosts } from "@/lib/posts";
import { buildPostTree, collectAncestorIds } from "@/lib/tree";
import { PostRecord } from "@/types/post";
import { usePathname } from "next/navigation";

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const slug = pathname.split("/").pop() || "";

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

    const tree = buildPostTree(posts);
    const ancestorIds = collectAncestorIds(posts, slug);

    if (loading) {
        return <main className="p-8">Đang tải tài liệu...</main>;
    }

    return (
        <>
            <BrandHeader logoHref="/docs" active="docs" />

            <div className="page-container flex flex-1 flex-col gap-4 py-4 lg:flex-row lg:py-8">
                <Sidebar
                    tree={tree}
                    activeSlug={slug}
                    ancestorIds={ancestorIds}
                />
                {children}
            </div>
        </>
    );
}
