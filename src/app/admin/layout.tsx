import BrandHeader from "@/components/BrandHeader";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <BrandHeader logoHref="/" active="admin" />

            <div className="relative flex-1 bg-[linear-gradient(180deg,#e9f3ff_0%,#f5f9ff_45%,#ffffff_100%)]">
                {children}
            </div>
        </>
    );
}
