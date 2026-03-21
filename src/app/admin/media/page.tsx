"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirebaseAuth, isAdminEmail } from "@/lib/firebase";

type MediaItem = {
    publicId: string;
    name: string;
    url: string;
    size: number;
    updated: string;
    format?: string;
};

function formatSize(bytes: number) {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), 3);
    const value = bytes / 1024 ** index;
    return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function buildMarkdown(url: string, name: string) {
    return `![${name}](${url})`;
}

export default function AdminMediaPage() {
    const auth = useMemo(() => getFirebaseAuth(), []);

    const [user, setUser] = useState<User | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);

    const [items, setItems] = useState<MediaItem[]>([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [deletingPath, setDeletingPath] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);

    const isAdmin = useMemo(() => isAdminEmail(user?.email), [user?.email]);

    useEffect(() => {
        if (!auth) {
            setLoadingAuth(false);
            setAuthError(
                "Thiếu cấu hình Firebase. Vui lòng kiểm tra file .env.local.",
            );
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
            setUser(nextUser);
            setLoadingAuth(false);
        });

        return () => unsubscribe();
    }, [auth]);

    const copyText = async (value: string, key: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(key);
            setTimeout(() => setCopied(null), 1500);
        } catch {
            setCopied(null);
        }
    };

    const loadImages = async ({
        cursor,
        append,
    }: {
        cursor?: string | null;
        append?: boolean;
    } = {}) => {
        if (append) {
            setLoadingMore(true);
        } else {
            setLoadingItems(true);
        }
        setLoadError(null);

        try {
            const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
            const response = await fetch(`/api/media${query}`, {
                cache: "no-store",
            });
            const payload = (await response.json()) as {
                items?: MediaItem[];
                error?: string;
                nextCursor?: string | null;
            };

            if (!response.ok) {
                throw new Error(
                    payload.error ||
                        "Không thể tải danh sách ảnh từ Cloudinary.",
                );
            }

            const imageItems = payload.items || [];

            setItems((prev) => {
                const merged = append ? [...prev, ...imageItems] : imageItems;
                const unique = new Map<string, MediaItem>();

                for (const item of merged) {
                    unique.set(item.publicId, item);
                }

                return Array.from(unique.values()).sort((a, b) =>
                    (b.updated || "").localeCompare(a.updated || ""),
                );
            });
            setNextCursor(payload.nextCursor || null);
        } catch (err) {
            setLoadError(
                err instanceof Error
                    ? err.message
                    : "Không thể tải danh sách ảnh Cloudinary.",
            );
        } finally {
            if (append) {
                setLoadingMore(false);
            } else {
                setLoadingItems(false);
            }
        }
    };

    useEffect(() => {
        if (user && isAdmin) {
            loadImages({ append: false });
        }
    }, [user, isAdmin]);

    const handleDelete = async (publicId: string) => {
        const ok = window.confirm("Bạn chắc chắn muốn xóa ảnh này?");
        if (!ok) return;

        setDeletingPath(publicId);
        try {
            const response = await fetch("/api/media", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ publicId }),
            });
            const payload = (await response.json()) as {
                error?: string;
            };

            if (!response.ok) {
                throw new Error(payload.error || "Xóa ảnh thất bại.");
            }

            setItems((prev) =>
                prev.filter((item) => item.publicId !== publicId),
            );
        } catch (err) {
            setLoadError(
                err instanceof Error ? err.message : "Xóa ảnh thất bại.",
            );
        } finally {
            setDeletingPath(null);
        }
    };

    if (loadingAuth) {
        return <main className="p-8">Đang kiểm tra phiên đăng nhập...</main>;
    }

    if (authError) {
        return <main className="p-8 text-red-700">{authError}</main>;
    }

    if (!user) {
        return (
            <main className="mx-auto w-full max-w-xl space-y-4 p-8">
                <h1 className="text-2xl font-bold text-slate-900">
                    Chưa đăng nhập
                </h1>
                <p className="text-slate-700">
                    Bạn cần đăng nhập trang quản trị để quản lý ảnh.
                </p>
                <Link
                    href="/admin"
                    className="inline-flex rounded-md bg-[#134186] px-4 py-2 font-semibold text-white hover:bg-[#0f346b]"
                >
                    Về trang đăng nhập
                </Link>
            </main>
        );
    }

    if (!isAdmin) {
        return (
            <main className="mx-auto w-full max-w-xl space-y-4 p-8">
                <h1 className="text-2xl font-bold text-slate-900">
                    Không có quyền truy cập
                </h1>
                <p className="text-slate-700">
                    Tài khoản hiện tại không có trong danh sách quản trị viên.
                </p>
                <button
                    type="button"
                    onClick={() => auth && signOut(auth)}
                    className="rounded-md bg-[#134186] px-4 py-2 font-semibold text-white hover:bg-[#0f346b]"
                >
                    Đăng xuất
                </button>
            </main>
        );
    }

    return (
        <main className="mx-auto w-full max-w-6xl p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#134186]">
                        Quản lý ảnh
                    </h1>
                    <p className="text-sm text-slate-600">
                        Ảnh được lấy từ Cloudinary (tối đa 100 ảnh gần nhất).
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => loadImages({ append: false })}
                        className="rounded-md border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        Làm mới
                    </button>
                    <Link
                        href="/admin"
                        className="rounded-md bg-[#06A3DA] px-4 py-2 font-semibold text-white hover:bg-[#0e8dbb]"
                    >
                        Quản lý bài viết
                    </Link>
                </div>
            </div>

            {loadError && <p className="mb-4 text-red-700">{loadError}</p>}

            {loadingItems ? (
                <p>Đang tải danh sách ảnh...</p>
            ) : items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
                    Chưa có ảnh trên Cloudinary.
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((item) => (
                            <article
                                key={item.publicId}
                                className="overflow-hidden rounded-xl border border-[#d3e3f8] bg-white shadow-sm"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={item.url}
                                    alt={item.name}
                                    className="h-44 w-full bg-slate-100 object-cover"
                                    loading="lazy"
                                />

                                <div className="space-y-2 p-3">
                                    <p
                                        className="truncate text-sm font-semibold text-slate-900"
                                        title={item.name}
                                    >
                                        {item.name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {formatSize(item.size)}
                                    </p>
                                    <p
                                        className="truncate text-xs text-slate-500"
                                        title={item.publicId}
                                    >
                                        {item.publicId}
                                    </p>

                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                copyText(
                                                    item.url,
                                                    `${item.publicId}-url`,
                                                )
                                            }
                                            className="rounded-md border border-slate-300 px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                        >
                                            {copied === `${item.publicId}-url`
                                                ? "Đã copy"
                                                : "Copy URL"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                copyText(
                                                    buildMarkdown(
                                                        item.url,
                                                        item.name,
                                                    ),
                                                    `${item.publicId}-md`,
                                                )
                                            }
                                            className="rounded-md border border-slate-300 px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                        >
                                            {copied === `${item.publicId}-md`
                                                ? "Đã copy"
                                                : "Copy Markdown"}
                                        </button>
                                        <a
                                            href={item.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="rounded-md border border-slate-300 px-2 py-1.5 text-center text-xs font-medium text-slate-700 hover:bg-slate-50"
                                        >
                                            Mở ảnh
                                        </a>
                                        <button
                                            type="button"
                                            disabled={
                                                deletingPath === item.publicId
                                            }
                                            onClick={() =>
                                                handleDelete(item.publicId)
                                            }
                                            className="rounded-md bg-red-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-red-500 disabled:opacity-60"
                                        >
                                            {deletingPath === item.publicId
                                                ? "Đang xóa..."
                                                : "Xóa"}
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    {nextCursor && (
                        <div className="flex justify-center">
                            <button
                                type="button"
                                onClick={() =>
                                    loadImages({
                                        append: true,
                                        cursor: nextCursor,
                                    })
                                }
                                disabled={loadingMore}
                                className="rounded-md border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                            >
                                {loadingMore ? "Đang tải thêm..." : "Tải thêm"}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}
