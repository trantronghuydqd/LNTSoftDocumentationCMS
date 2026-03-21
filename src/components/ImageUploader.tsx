"use client";

import { ChangeEvent, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getFirebaseStorage } from "@/lib/firebase";

type Props = {
    onUploaded: (url: string) => void;
};

export default function ImageUploader({ onUploaded }: Props) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError(null);

        try {
            const storage = getFirebaseStorage();
            if (!storage) {
                throw new Error("missing-firebase-config");
            }

            const path = `images/${Date.now()}-${file.name}`;
            const storageRef = ref(storage, path);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            onUploaded(url);
        } catch {
            setError("Upload ảnh thất bại. Vui lòng thử lại.");
        } finally {
            setUploading(false);
            event.target.value = "";
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
                Tải ảnh
            </label>
            <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-700"
            />
            {uploading && (
                <p className="text-sm text-slate-500">Đang upload...</p>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
}
