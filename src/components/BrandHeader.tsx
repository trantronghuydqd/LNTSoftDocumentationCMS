import Link from "next/link";

type Props = {
    logoHref: string;
    active?: "docs" | "admin" | "none";
};

export default function BrandHeader({ logoHref, active = "none" }: Props) {
    return (
        <header className="sticky top-0 z-30 border-b border-[#0e2f61] bg-[#134186] text-white shadow-md">
            <div className="page-container flex items-center justify-between gap-4 py-3">
                <Link href={logoHref} className="flex items-center">
                    <span
                        className="block h-11 w-56 bg-contain bg-left bg-no-repeat"
                        style={{
                            backgroundImage:
                                "url('https://lntsoft.vn/img/LNTlogo_horizontal_color.png')",
                        }}
                        aria-label="LNTSoft"
                    />
                </Link>

                <nav className="hidden items-center gap-2 sm:flex">
                    <Link
                        href="/docs"
                        className={`rounded-md px-3 py-1.5 text-sm font-semibold text-white transition ${
                            active === "docs"
                                ? "bg-[#06A3DA]"
                                : "border border-white/30 hover:bg-white/10"
                        }`}
                    >
                        Docs
                    </Link>
                    <Link
                        href="/admin"
                        className={`rounded-md px-3 py-1.5 text-sm font-semibold text-white transition ${
                            active === "admin"
                                ? "bg-[#06A3DA]"
                                : "border border-white/30 hover:bg-white/10"
                        }`}
                    >
                        Admin
                    </Link>
                    <a
                        href="https://lntsoft.vn/contact"
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md border border-white/30 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                        Contact Us
                    </a>
                </nav>
            </div>
        </header>
    );
}
