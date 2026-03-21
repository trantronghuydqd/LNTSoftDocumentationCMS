import type { Metadata } from "next";
import { Geist_Mono, Nunito } from "next/font/google";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

const nunito = Nunito({
    variable: "--font-nunito",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Company Documentation CMS",
    description:
        "Nền tảng quản trị và hiển thị tài liệu nội bộ với Next.js + Firebase",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="vi"
            className={`${nunito.variable} ${geistMono.variable} h-full antialiased`}
        >
            <body className="min-h-full flex flex-col">
                {children}
                <SiteFooter />
            </body>
        </html>
    );
}
