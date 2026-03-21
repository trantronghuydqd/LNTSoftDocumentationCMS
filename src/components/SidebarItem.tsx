"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PostTreeNode } from "@/types/post";

type Props = {
    node: PostTreeNode;
    activeSlug: string;
    ancestorIds: string[];
    depth?: number;
};

export default function SidebarItem({
    node,
    activeSlug,
    ancestorIds,
    depth = 0,
}: Props) {
    const hasChildren = node.children.length > 0;
    const shouldOpenByDefault = useMemo(
        () => ancestorIds.includes(node.id) || node.slug === activeSlug,
        [ancestorIds, node.id, node.slug, activeSlug],
    );
    const [open, setOpen] = useState(shouldOpenByDefault);
    const isActive = node.slug === activeSlug;

    return (
        <div>
            <div
                className="group flex items-center gap-1 rounded-lg"
                style={{ paddingLeft: `${depth * 12}px` }}
            >
                {hasChildren ? (
                    <button
                        type="button"
                        onClick={() => setOpen((prev) => !prev)}
                        className="h-6 w-6 shrink-0 rounded text-slate-500 transition hover:bg-[#e9f3fd]"
                        aria-label={open ? "Thu gọn mục" : "Mở rộng mục"}
                    >
                        {open ? "▾" : "▸"}
                    </button>
                ) : (
                    <span className="h-6 w-6 shrink-0" />
                )}

                <Link
                    href={`/docs/${node.slug}`}
                    className={`block flex-1 rounded-md px-2 py-1.5 text-sm transition ${
                        isActive
                            ? "bg-[#e9f3fd] font-semibold text-[#134186]"
                            : "text-slate-700 hover:bg-[#f3f8ff]"
                    }`}
                >
                    {node.title}
                </Link>
            </div>

            {hasChildren && open && (
                <div className="mt-1 space-y-1">
                    {node.children.map((child) => (
                        <SidebarItem
                            key={child.id}
                            node={child}
                            activeSlug={activeSlug}
                            ancestorIds={ancestorIds}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
