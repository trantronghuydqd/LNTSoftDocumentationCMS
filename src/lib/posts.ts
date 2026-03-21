import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import { LocalizedField, PostInput, PostRecord } from "@/types/post";

function requireDb() {
    const db = getFirestoreDb();
    if (!db) {
        throw new Error(
            "Thiếu cấu hình Firebase. Vui lòng kiểm tra file .env.local.",
        );
    }

    return db;
}

function toIsoString(value: unknown) {
    if (value && typeof value === "object" && "toDate" in value) {
        const raw = value as { toDate: () => Date };
        return raw.toDate().toISOString();
    }

    if (value instanceof Date) {
        return value.toISOString();
    }

    return undefined;
}

function toLocalizedField(value: unknown, fallbackText = ""): LocalizedField {
    if (value && typeof value === "object") {
        const obj = value as Record<string, unknown>;
        return {
            vi: String(obj.vi ?? fallbackText),
            en: String(obj.en ?? ""),
        };
    }

    const text = String(value ?? fallbackText);
    return {
        vi: text,
        en: "",
    };
}

function toPostRecord(id: string, data: Record<string, unknown>): PostRecord {
    const fallbackTitle = String(data.title ?? "");
    const fallbackSlug = String(data.slug ?? "");
    const fallbackContent = String(data.content ?? "");

    return {
        id,
        title: toLocalizedField(data.title, fallbackTitle),
        slug: toLocalizedField(data.slug, fallbackSlug),
        content: toLocalizedField(data.content, fallbackContent),
        parentId: (data.parentId as string | null) ?? null,
        orderIndex: Number(data.orderIndex ?? 0),
        coverImage: String(data.coverImage ?? ""),
        published: Boolean(data.published),
        authorId: String(data.authorId ?? ""),
        createdAt: toIsoString(data.createdAt),
        updatedAt: toIsoString(data.updatedAt),
    };
}

export async function getAllPosts() {
    const db = requireDb();
    const q = query(collection(db, "posts"), orderBy("orderIndex", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((item) => toPostRecord(item.id, item.data()));
}

export async function getPublishedPosts() {
    const db = requireDb();
    // Không dùng orderBy trong query để tránh cần index
    const q = query(collection(db, "posts"), where("published", "==", true));
    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map((item) =>
        toPostRecord(item.id, item.data()),
    );
    // Sort client-side theo orderIndex
    return posts.sort((a, b) => a.orderIndex - b.orderIndex);
}

export async function getPostById(id: string) {
    const db = requireDb();
    const snapshot = await getDoc(doc(db, "posts", id));
    if (!snapshot.exists()) {
        return null;
    }

    return toPostRecord(snapshot.id, snapshot.data());
}

export async function createPost(input: PostInput) {
    const db = requireDb();
    const payload = {
        ...input,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    const ref = await addDoc(collection(db, "posts"), payload);
    return ref.id;
}

export async function updatePost(id: string, input: PostInput) {
    const db = requireDb();
    await updateDoc(doc(db, "posts", id), {
        ...input,
        updatedAt: serverTimestamp(),
    });
}

export async function deletePost(id: string) {
    const db = requireDb();
    await deleteDoc(doc(db, "posts", id));
}
