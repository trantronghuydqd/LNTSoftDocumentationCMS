"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { resolveLanguage } from "@/lib/post-i18n";

type SlugByLang = {
    vi: string;
    en: string;
};

type LanguageSwitcherProps = {
    slugByLang?: SlugByLang | null;
};

export default function LanguageSwitcher({
    slugByLang,
}: LanguageSwitcherProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentLang = useMemo(
        () => resolveLanguage(searchParams.get("lang")),
        [searchParams],
    );

    useEffect(() => {
        const fromStorage = localStorage.getItem("docsLang");
        const preferred = resolveLanguage(fromStorage);

        if (!searchParams.get("lang") && preferred !== currentLang) {
            const params = new URLSearchParams(searchParams.toString());
            params.set("lang", preferred);
            router.replace(`${pathname}?${params.toString()}`);
        }
    }, [currentLang, pathname, router, searchParams]);

    const setLanguage = (lang: "vi" | "en") => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("lang", lang);
        localStorage.setItem("docsLang", lang);

        const isDocsDetailPage =
            pathname.startsWith("/docs/") && pathname !== "/docs";
        const targetSlug = lang === "vi" ? slugByLang?.vi : slugByLang?.en;

        if (isDocsDetailPage && targetSlug) {
            router.push(`/docs/${targetSlug}?${params.toString()}`);
            return;
        }

        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="inline-flex rounded-md border border-white/30 p-0.5">
            <button
                type="button"
                onClick={() => setLanguage("vi")}
                className={`rounded px-2 py-1 text-xs font-semibold transition ${
                    currentLang === "vi"
                        ? "bg-[#06A3DA] text-white"
                        : "text-white hover:bg-white/10"
                }`}
            >
                VI
            </button>
            <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`rounded px-2 py-1 text-xs font-semibold transition ${
                    currentLang === "en"
                        ? "bg-[#06A3DA] text-white"
                        : "text-white hover:bg-white/10"
                }`}
            >
                EN
            </button>
        </div>
    );
}
