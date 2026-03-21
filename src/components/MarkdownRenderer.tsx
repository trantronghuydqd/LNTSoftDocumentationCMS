"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

type Props = {
    content: string;
};

export default function MarkdownRenderer({ content }: Props) {
    return (
        <article className="prose prose-slate max-w-none prose-headings:scroll-mt-24">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
            >
                {content}
            </ReactMarkdown>
        </article>
    );
}
