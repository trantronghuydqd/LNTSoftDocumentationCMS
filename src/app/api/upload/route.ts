import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

function slugify(input: string) {
    return input
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

function stripExtension(fileName: string) {
    return fileName.replace(/\.[^.]+$/, "");
}

function buildPublicId(postSlug: string, fileName: string) {
    const postPart = slugify(postSlug) || "bai-viet";
    const filePart = slugify(stripExtension(fileName)) || "hinh-anh";
    const randomPart = Math.random().toString(36).slice(2, 8);
    const base = `${postPart}-${filePart}-${randomPart}`;
    return base.slice(0, 120);
}

type CloudinaryUploadResult = {
    ok: boolean;
    status: number;
    url?: string;
    error?: string;
};

async function parseCloudinaryError(response: Response) {
    const text = await response.text();

    try {
        const parsed = JSON.parse(text) as { error?: { message?: string } };
        return parsed.error?.message || text;
    } catch {
        return text || response.statusText;
    }
}

async function uploadWithSignedRequest({
    cloudName,
    apiKey,
    apiSecret,
    blob,
    fileName,
    publicId,
}: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
    blob: Blob;
    fileName: string;
    publicId: string;
}): Promise<CloudinaryUploadResult> {
    const timestamp = Math.floor(Date.now() / 1000);
    const signatureBase = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto
        .createHash("sha1")
        .update(signatureBase)
        .digest("hex");

    const formData = new FormData();
    formData.append("file", blob, fileName);
    formData.append("public_id", publicId);
    formData.append("api_key", apiKey);
    formData.append("timestamp", String(timestamp));
    formData.append("signature", signature);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
            method: "POST",
            body: formData,
        },
    );

    if (!response.ok) {
        const error = await parseCloudinaryError(response);
        return { ok: false, status: response.status, error };
    }

    const data = (await response.json()) as { secure_url?: string };
    if (!data.secure_url) {
        return {
            ok: false,
            status: 500,
            error: "Cloudinary không trả về secure_url.",
        };
    }

    return { ok: true, status: 200, url: data.secure_url };
}

export async function POST(req: NextRequest) {
    const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
    const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudinaryCloudName) {
        return NextResponse.json(
            {
                error: "Thiếu cấu hình Cloudinary. Kiểm tra biến môi trường.",
            },
            { status: 500 },
        );
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const postSlugRaw = (formData.get("postSlug") as string | null) || "";
        const postSlug = postSlugRaw.trim();

        if (!file) {
            return NextResponse.json(
                { error: "Không có file được gửi." },
                { status: 400 },
            );
        }

        // Validate file size (limit to 10MB for free tier)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "File quá lớn. Tối đa 10MB." },
                { status: 400 },
            );
        }

        // Validate MIME type
        if (!file.type.startsWith("image/")) {
            return NextResponse.json(
                { error: "Chỉ chấp nhận file ảnh." },
                { status: 400 },
            );
        }

        const buffer = await file.arrayBuffer();
        const blob = new Blob([buffer], { type: file.type });
        const publicId = buildPublicId(postSlug, file.name);

        if (!cloudinaryApiKey || !cloudinaryApiSecret) {
            return NextResponse.json(
                {
                    error: "Thiếu CLOUDINARY_API_KEY hoặc CLOUDINARY_API_SECRET cho signed upload.",
                },
                { status: 500 },
            );
        }

        const signedResult = await uploadWithSignedRequest({
            cloudName: cloudinaryCloudName,
            apiKey: cloudinaryApiKey,
            apiSecret: cloudinaryApiSecret,
            blob,
            fileName: file.name,
            publicId,
        });

        if (!signedResult.ok || !signedResult.url) {
            return NextResponse.json(
                {
                    error:
                        signedResult.error ||
                        "Cloudinary upload thất bại. Vui lòng thử lại.",
                },
                { status: signedResult.status || 500 },
            );
        }

        return NextResponse.json({ url: signedResult.url }, { status: 200 });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Lỗi upload ảnh. Vui lòng thử lại." },
            { status: 500 },
        );
    }
}
