"use client";

import { ChangeEvent, useState } from "react";

type Props = {
    onUploaded: (url: string) => void;
    postSlug?: string;
};

export default function ImageUploader({ onUploaded, postSlug }: Props) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        setError(null);
        setProgress(0);

        const fileArray = Array.from(files);
        const failedFiles: string[] = [];
        const uploadedUrls: string[] = [];

        for (let i = 0; i < fileArray.length; i++) {
            const file = fileArray[i];
            try {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("postSlug", postSlug || "tai-lieu");

                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    const data = (await response.json()) as { error?: string };
                    throw new Error(
                        data.error || "Upload ảnh thất bại. Vui lòng thử lại.",
                    );
                }

                const data = (await response.json()) as { url?: string };
                if (!data.url) {
                    throw new Error("Không nhận được URL từ server.");
                }

                uploadedUrls.push(data.url);
            } catch {
                failedFiles.push(file.name);
            }

            setProgress(Math.round(((i + 1) / fileArray.length) * 100));
        }

        // Callback với tất cả URL (hoặc rỗng nếu tất cả fail)
        if (uploadedUrls.length > 0) {
            uploadedUrls.forEach((url) => onUploaded(url));
        }

        if (failedFiles.length > 0) {
            setError(
                `Upload thất bại: ${failedFiles.join(", ")}. Vui lòng thử lại.`,
            );
        }

        setUploading(false);
        setProgress(0);
        event.target.value = "";
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
                Tải ảnh (có thể chọn nhiều)
            </label>
            <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleUpload}
                disabled={uploading}
                className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-700 disabled:opacity-50"
            />
            {uploading && (
                <div className="space-y-1">
                    <div className="h-2 w-full rounded-full bg-slate-200">
                        <div
                            className="h-2 rounded-full bg-blue-500 transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-sm text-slate-500">
                        Đang upload {progress}%...
                    </p>
                </div>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
}
