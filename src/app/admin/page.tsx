"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { getFirebaseAuth, isAdminEmail } from "@/lib/firebase";
import { deletePost, getAllPosts } from "@/lib/posts";
import { PostRecord } from "@/types/post";
import { readPostSlug, readPostTitle } from "@/lib/post-i18n";

export default function AdminPage() {
    const auth = useMemo(() => getFirebaseAuth(), []);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [user, setUser] = useState<User | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);

    const [posts, setPosts] = useState<PostRecord[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [postError, setPostError] = useState<string | null>(null);

    const isAdmin = useMemo(() => isAdminEmail(user?.email), [user?.email]);

    const fetchPosts = async () => {
        setLoadingPosts(true);
        setPostError(null);

        try {
            const data = await getAllPosts();
            setPosts(data);
        } catch {
            setPostError("Không thể tải danh sách bài viết.");
        } finally {
            setLoadingPosts(false);
        }
    };

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

    useEffect(() => {
        if (user && isAdmin) {
            fetchPosts();
        }
    }, [user, isAdmin]);

    const handleSignIn = async () => {
        setAuthError(null);

        try {
            if (!auth) {
                throw new Error("missing-auth");
            }

            await signInWithEmailAndPassword(auth, email, password);
        } catch {
            setAuthError("Đăng nhập thất bại. Kiểm tra email hoặc mật khẩu.");
        }
    };

    const handleDelete = async (id: string) => {
        const ok = window.confirm("Bạn có chắc muốn xóa bài viết này không?");
        if (!ok) return;

        try {
            await deletePost(id);
            setPosts((prev) => prev.filter((item) => item.id !== id));
        } catch {
            setPostError("Xóa bài viết thất bại.");
        }
    };

    if (loadingAuth) {
        return <main className="p-8">Đang kiểm tra phiên đăng nhập...</main>;
    }

    if (!user) {
        return (
            <main className="mx-auto w-full max-w-md p-8">
                <h1 className="mb-4 text-2xl font-bold text-[#134186]">
                    Đăng nhập quản trị
                </h1>
                <div className="space-y-3 rounded-xl border border-[#d3e3f8] bg-white p-4 shadow-sm">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="w-full rounded-md border border-slate-300 px-3 py-2"
                    />
                    <input
                        type="password"
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="w-full rounded-md border border-slate-300 px-3 py-2"
                    />
                    <button
                        type="button"
                        onClick={handleSignIn}
                        className="w-full rounded-md bg-[#134186] px-4 py-2 font-semibold text-white hover:bg-[#0f346b]"
                    >
                        Đăng nhập
                    </button>
                    {authError && (
                        <p className="text-sm text-red-700">{authError}</p>
                    )}
                </div>
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
                    className="rounded-md bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-700"
                >
                    Đăng xuất
                </button>
            </main>
        );
    }

    return (
        <main className="mx-auto w-full max-w-5xl p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-3xl font-extrabold text-[#134186]">
                    Quản trị tài liệu
                </h1>
                <div className="flex gap-2">
                    <Link
                        href="/admin/create"
                        className="rounded-md bg-[#06A3DA] px-4 py-2 font-semibold text-white hover:bg-[#0e8dbb]"
                    >
                        Tạo bài mới
                    </Link>
                    <button
                        type="button"
                        onClick={() => auth && signOut(auth)}
                        className="rounded-md bg-[#134186] px-4 py-2 font-semibold text-white hover:bg-[#0f346b]"
                    >
                        Đăng xuất
                    </button>
                </div>
            </div>

            {postError && <p className="mb-4 text-red-700">{postError}</p>}

            {loadingPosts ? (
                <p>Đang tải danh sách bài viết...</p>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-[#d3e3f8] bg-white shadow-sm">
                    <table className="min-w-full text-sm">
                        <thead className="bg-[#f3f8ff] text-left text-[#134186]">
                            <tr>
                                <th className="px-4 py-3">Tiêu đề</th>
                                <th className="px-4 py-3">Slug</th>
                                <th className="px-4 py-3">Public</th>
                                <th className="px-4 py-3">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map((post) => (
                                <tr
                                    key={post.id}
                                    className="border-t border-slate-200"
                                >
                                    <td className="px-4 py-3 font-medium text-slate-900">
                                        {readPostTitle(post, "vi")}
                                    </td>
                                    <td className="px-4 py-3 text-slate-700">
                                        {readPostSlug(post, "vi")}
                                    </td>
                                    <td className="px-4 py-3">
                                        {post.published
                                            ? "Đã xuất bản"
                                            : "Bản nháp"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/admin/edit/${post.id}`}
                                                className="rounded-md bg-blue-600 px-3 py-1.5 font-medium text-white hover:bg-blue-500"
                                            >
                                                Sửa
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDelete(post.id)
                                                }
                                                className="rounded-md bg-red-600 px-3 py-1.5 font-medium text-white hover:bg-red-500"
                                            >
                                                Xóa
                                            </button>
                                            <Link
                                                href={`/docs/${readPostSlug(post, "vi")}?lang=vi`}
                                                className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
                                            >
                                                Xem
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
}
