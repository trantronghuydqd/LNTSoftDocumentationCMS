import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

type CloudinaryListResponse = {
    resources?: Array<{
        public_id: string;
        secure_url: string;
        bytes: number;
        created_at: string;
        format?: string;
    }>;
    error?: {
        message?: string;
    };
    next_cursor?: string;
};

function getCloudinaryConfig() {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    return { cloudName, apiKey, apiSecret };
}

function hasCloudinaryConfig() {
    const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
    return Boolean(cloudName && apiKey && apiSecret);
}

function buildBasicAuthHeader(apiKey: string, apiSecret: string) {
    const token = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
    return `Basic ${token}`;
}

export async function GET(req: NextRequest) {
    if (!hasCloudinaryConfig()) {
        return NextResponse.json(
            { error: "Thiếu cấu hình Cloudinary trong biến môi trường." },
            { status: 500 },
        );
    }

    const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
    const cursor = req.nextUrl.searchParams.get("cursor")?.trim();

    try {
        const query = new URLSearchParams({
            max_results: "30",
        });

        if (cursor) {
            query.set("next_cursor", cursor);
        }

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload?${query.toString()}`,
            {
                headers: {
                    Authorization: buildBasicAuthHeader(apiKey!, apiSecret!),
                },
                cache: "no-store",
            },
        );

        const data = (await response.json()) as CloudinaryListResponse;
        if (!response.ok) {
            return NextResponse.json(
                {
                    error:
                        data.error?.message ||
                        "Không thể tải danh sách ảnh Cloudinary.",
                },
                { status: response.status },
            );
        }

        const items = (data.resources || []).map((item) => ({
            publicId: item.public_id,
            name: item.public_id.split("/").pop() || item.public_id,
            url: item.secure_url,
            size: item.bytes || 0,
            updated: item.created_at || "",
            format: item.format || "",
        }));

        return NextResponse.json(
            {
                items,
                nextCursor: data.next_cursor || null,
            },
            { status: 200 },
        );
    } catch {
        return NextResponse.json(
            { error: "Lỗi kết nối Cloudinary khi tải danh sách ảnh." },
            { status: 500 },
        );
    }
}

export async function DELETE(req: NextRequest) {
    if (!hasCloudinaryConfig()) {
        return NextResponse.json(
            { error: "Thiếu cấu hình Cloudinary trong biến môi trường." },
            { status: 500 },
        );
    }

    const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();

    try {
        const body = (await req.json()) as { publicId?: string };
        const publicId = body.publicId?.trim();

        if (!publicId) {
            return NextResponse.json(
                { error: "Thiếu publicId để xóa ảnh." },
                { status: 400 },
            );
        }

        const timestamp = Math.floor(Date.now() / 1000);
        const signatureBase = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
        const signature = crypto
            .createHash("sha1")
            .update(signatureBase)
            .digest("hex");

        const formData = new FormData();
        formData.append("public_id", publicId);
        formData.append("api_key", apiKey!);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
            {
                method: "POST",
                body: formData,
            },
        );

        const data = (await response.json()) as {
            result?: string;
            error?: { message?: string };
        };

        if (!response.ok || data.result !== "ok") {
            return NextResponse.json(
                {
                    error: data.error?.message || "Cloudinary từ chối xóa ảnh.",
                },
                { status: response.ok ? 400 : response.status },
            );
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch {
        return NextResponse.json(
            { error: "Lỗi xử lý xóa ảnh Cloudinary." },
            { status: 500 },
        );
    }
}
