"use client";

import { PostTreeNode } from "@/types/post";
import SidebarItem from "@/components/SidebarItem";
import { SupportedLanguage } from "@/types/post";

type Props = {
    tree: PostTreeNode[];
    activeSlug: string;
    ancestorIds: string[];
    lang: SupportedLanguage;
};

export default function Sidebar({
    tree,
    activeSlug,
    ancestorIds,
    lang,
}: Props) {
    return (
        <aside className="w-full rounded-2xl border border-[#d3e3f8] bg-white p-4 shadow-sm lg:sticky lg:top-24 lg:w-80 lg:self-start">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#134186]">
                Tài liệu
            </p>
            <div className="space-y-1">
                {tree.map((node) => (
                    <SidebarItem
                        key={node.id}
                        node={node}
                        activeSlug={activeSlug}
                        ancestorIds={ancestorIds}
                        lang={lang}
                    />
                ))}
            </div>
        </aside>
    );
}
