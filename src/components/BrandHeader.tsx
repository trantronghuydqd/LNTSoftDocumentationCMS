import Link from "next/link";

type Props = {
    logoHref: string;
    active?: "docs" | "admin" | "none";
    rightAddon?: React.ReactNode;
};

export default function BrandHeader({
    logoHref,
    active = "none",
    rightAddon,
}: Props) {
    return (
        <header className="sticky top-0 z-30 border-b border-[#0e2f61] bg-[#134186] text-white shadow-md">
            <div className="page-container flex items-center gap-3 py-3">
                <Link href={logoHref} className="flex min-w-0 items-center">
                    <span
                        className="block h-9 w-40 bg-contain bg-left bg-no-repeat sm:h-11 sm:w-56"
                        style={{
                            backgroundImage:
                                "url('https://lntsoft.vn/img/LNTlogo_horizontal_color.png')",
                        }}
                        aria-label="LNTSoft"
                    />
                </Link>

                <div className="ml-auto flex items-center gap-2">
                    {rightAddon ? (
                        <div className="shrink-0">{rightAddon}</div>
                    ) : null}

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
            </div>

            <div className="page-container pb-3 sm:hidden">
                <nav className="-mx-1 flex items-center gap-2 overflow-x-auto px-1">
                    <Link
                        href="/docs"
                        className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-semibold text-white transition ${
                            active === "docs"
                                ? "bg-[#06A3DA]"
                                : "border border-white/30 hover:bg-white/10"
                        }`}
                    >
                        Docs
                    </Link>
                    <Link
                        href="/admin"
                        className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-semibold text-white transition ${
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
                        className="shrink-0 rounded-md border border-white/30 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                        Contact Us
                    </a>
                </nav>
            </div>
        </header>
    );
}
