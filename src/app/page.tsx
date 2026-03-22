import Link from "next/link";
import BrandHeader from "@/components/BrandHeader";

export default function Home() {
    return (
        <>
            <BrandHeader logoHref="/" />

            <main className="relative flex flex-1 items-center overflow-hidden px-4 py-16 lg:px-8">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#e9f3ff_0%,#f5f9ff_45%,#ffffff_100%)]" />
                <div className="pointer-events-none absolute -left-24 -top-20 h-80 w-80 rounded-full bg-[#06A3DA]/15 blur-3xl" />
                <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[#134186]/15 blur-3xl" />

                <section className="page-container relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-10">
                    <div className="flex-1">
                        <p className="mb-4 inline-block rounded-full bg-[#d8ebff] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#134186]">
                            LNTSoft Documentation Hub
                        </p>
                        <h1 className="mb-4 text-4xl font-black leading-tight tracking-tight text-[#134186] md:text-5xl">
                            LNTSoft Documentation
                        </h1>
                        <p className="max-w-2xl text-lg leading-relaxed text-slate-700">
                            Management Documentation for LNTSoft
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href="/docs"
                                className="rounded-xl bg-[#134186] px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#0f346b]"
                            >
                                Vào trang tài liệu
                            </Link>
                            <Link
                                href="/admin"
                                className="rounded-xl border border-[#9bbde7] bg-white px-5 py-3 font-semibold text-[#134186] transition hover:-translate-y-0.5 hover:bg-[#f4f9ff]"
                            >
                                Quản lý bài viết
                            </Link>
                        </div>
                    </div>

                    <div className="w-full max-w-xl rounded-2xl border border-[#d3e3f8] bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-bold text-[#134186]">
                            Có gì trong hệ thống docs
                        </h2>
                        <ul className="space-y-3 text-slate-700">
                            <li>- Sidebar đa cấp</li>
                            <li>
                                - Soạn nội dung Markdown và render tối ưu đọc
                            </li>
                            <li>
                                - Quản lý bài viết tạo/sửa/xóa theo quyền admin
                            </li>
                            <li>
                                - Upload ảnh lên Firebase Storage và chèn trực
                                tiếp
                            </li>
                            <li>- Số hóa tài liệu công ty</li>
                        </ul>
                    </div>
                </section>
            </main>
        </>
    );
}
