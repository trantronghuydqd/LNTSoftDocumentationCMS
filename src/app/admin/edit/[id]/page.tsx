"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import ImageUploader from "@/components/ImageUploader";
import { getFirebaseAuth, isAdminEmail } from "@/lib/firebase";
import { getAllPosts, getPostById, updatePost } from "@/lib/posts";
import { LocalizedField, PostRecord, SupportedLanguage } from "@/types/post";
import { readPostTitle } from "@/lib/post-i18n";
import { slugify } from "@/lib/slugify";

const defaultLocalized: LocalizedField = { vi: "", en: "" };

export default function EditPostPage() {
    const auth = useMemo(() => getFirebaseAuth(), []);
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const id = params.id;

    const [activeLang, setActiveLang] = useState<SupportedLanguage>("vi");
    const [title, setTitle] = useState<LocalizedField>(defaultLocalized);
    const [slug, setSlug] = useState<LocalizedField>(defaultLocalized);
    const [content, setContent] = useState<LocalizedField>(defaultLocalized);
    const [parentId, setParentId] = useState<string>("");
    const [orderIndex, setOrderIndex] = useState(0);
    const [coverImage, setCoverImage] = useState("");
    const [published, setPublished] = useState(true);

    const [posts, setPosts] = useState<PostRecord[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [ready, setReady] = useState(false);
    const [allow, setAllow] = useState(false);
    const [authorId, setAuthorId] = useState("");

    useEffect(() => {
        if (!auth) {
            setReady(true);
            setError(
                "Thiếu cấu hình Firebase. Vui lòng kiểm tra file .env.local.",
            );
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setReady(true);

            if (!user || !isAdminEmail(user.email)) {
                setAllow(false);
                return;
            }

            setAllow(true);
            setAuthorId(user.uid);
        });

        return () => unsubscribe();
    }, [auth]);

    useEffect(() => {
        if (!allow) return;

        const run = async () => {
            setLoading(true);
            setError(null);

            try {
                const [current, allPosts] = await Promise.all([
                    getPostById(id),
                    getAllPosts(),
                ]);

                if (!current) {
                    setError("Không tìm thấy bài viết.");
                    return;
                }

                setTitle(current.title);
                setSlug(current.slug);
                setContent(current.content);
                setParentId(current.parentId ?? "");
                setOrderIndex(current.orderIndex);
                setCoverImage(current.coverImage);
                setPublished(current.published);
                setPosts(allPosts);
            } catch {
                setError("Không thể tải dữ liệu bài viết.");
            } finally {
                setLoading(false);
            }
        };

        run();
    }, [allow, id]);

    const parentOptions = useMemo(
        () => posts.filter((item) => item.id !== id),
        [posts, id],
    );

    const setLocalizedField = (
        setter: React.Dispatch<React.SetStateAction<LocalizedField>>,
        lang: SupportedLanguage,
        value: string,
    ) => {
        setter((prev) => ({ ...prev, [lang]: value }));
    };

    const generateSlug = () => {
        const current = title[activeLang].trim();
        if (!current) return;
        setSlug((prev) => ({ ...prev, [activeLang]: slugify(current) }));
    };

    const handleSubmit = async () => {
        if (!title.vi || !slug.vi || !content.vi) {
            setError(
                "Nội dung tiếng Việt (tiêu đề/slug/nội dung) là bắt buộc.",
            );
            return;
        }

        if (published && (!title.en || !slug.en || !content.en)) {
            setError(
                "Khi xuất bản, cần đủ tiêu đề/slug/nội dung tiếng Anh. Có thể để bản nháp nếu chưa đủ.",
            );
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            await updatePost(id, {
                title,
                slug,
                content,
                parentId: parentId || null,
                orderIndex,
                coverImage,
                published,
                authorId,
            });

            router.push("/admin");
        } catch {
            setError("Không thể cập nhật bài viết.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!ready) {
        return <main className="p-8">Đang kiểm tra quyền truy cập...</main>;
    }

    if (!allow) {
        return (
            <main className="mx-auto w-full max-w-2xl p-8">
                <p className="mb-4 text-red-700">
                    Bạn không có quyền truy cập trang này.
                </p>
                <Link href="/admin" className="text-slate-800 underline">
                    Quay lại trang quản trị
                </Link>
            </main>
        );
    }

    if (loading) {
        return <main className="p-8">Đang tải bài viết...</main>;
    }

    return (
        <main className="mx-auto w-full max-w-4xl p-8">
            <h1 className="mb-6 text-3xl font-extrabold text-[#134186]">
                Chỉnh sửa bài viết
            </h1>

            <div className="space-y-4 rounded-xl border border-[#d3e3f8] bg-white p-5 shadow-sm">
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveLang("vi")}
                        className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
                            activeLang === "vi"
                                ? "bg-[#134186] text-white"
                                : "border border-slate-300 text-slate-700"
                        }`}
                    >
                        Tiếng Việt
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveLang("en")}
                        className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
                            activeLang === "en"
                                ? "bg-[#134186] text-white"
                                : "border border-slate-300 text-slate-700"
                        }`}
                    >
                        English
                    </button>
                </div>

                <input
                    placeholder={`Tiêu đề (${activeLang.toUpperCase()})`}
                    value={title[activeLang]}
                    onChange={(event) =>
                        setLocalizedField(
                            setTitle,
                            activeLang,
                            event.target.value,
                        )
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                />

                <div className="flex gap-2">
                    <input
                        placeholder={`Slug (${activeLang.toUpperCase()})`}
                        value={slug[activeLang]}
                        onChange={(event) =>
                            setLocalizedField(
                                setSlug,
                                activeLang,
                                event.target.value,
                            )
                        }
                        className="w-full rounded-md border border-slate-300 px-3 py-2"
                    />
                    <button
                        type="button"
                        onClick={generateSlug}
                        className="shrink-0 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        Tạo slug
                    </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <select
                        value={parentId}
                        onChange={(event) => setParentId(event.target.value)}
                        className="w-full rounded-md border border-slate-300 px-3 py-2"
                    >
                        <option value="">Không có mục cha</option>
                        {parentOptions.map((post) => (
                            <option key={post.id} value={post.id}>
                                {readPostTitle(post, "vi")}
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        value={orderIndex}
                        onChange={(event) =>
                            setOrderIndex(Number(event.target.value || 0))
                        }
                        className="w-full rounded-md border border-slate-300 px-3 py-2"
                        placeholder="Thứ tự"
                    />
                </div>

                <input
                    placeholder="URL ảnh cover"
                    value={coverImage}
                    onChange={(event) => setCoverImage(event.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                />

                <ImageUploader
                    onUploaded={(url) => {
                        setContent((prev) => ({
                            ...prev,
                            [activeLang]: `${prev[activeLang]}\n\n![hinh-anh](${url})\n`,
                        }));
                    }}
                />

                <textarea
                    rows={16}
                    value={content[activeLang]}
                    onChange={(event) =>
                        setLocalizedField(
                            setContent,
                            activeLang,
                            event.target.value,
                        )
                    }
                    placeholder={`Nội dung Markdown (${activeLang.toUpperCase()})`}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 font-mono"
                />

                <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                        type="checkbox"
                        checked={published}
                        onChange={(event) => setPublished(event.target.checked)}
                    />
                    Xuất bản
                </label>

                {error && <p className="text-red-700">{error}</p>}

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="rounded-md bg-[#06A3DA] px-4 py-2 font-semibold text-white hover:bg-[#0e8dbb] disabled:opacity-60"
                    >
                        {submitting ? "Đang cập nhật..." : "Lưu thay đổi"}
                    </button>
                    <Link
                        href="/admin"
                        className="rounded-md border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        Hủy
                    </Link>
                </div>
            </div>
        </main>
    );
}
