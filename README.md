# Company Documentation CMS

CMS tài liệu nội bộ xây bằng Next.js App Router + Firebase.

## Tính năng chính

- Quản trị bài viết tài liệu: tạo, sửa, xóa
- Soạn nội dung bằng Markdown
- Render Markdown cho trang public
- Sidebar dạng cây nhiều cấp (dựa trên `parentId`)
- Đăng nhập bằng Firebase Auth, chỉ admin mới vào được khu quản trị
- Upload ảnh lên Firebase Storage rồi chèn vào Markdown

## Cấu trúc route

- `/` : Landing page
- `/docs` : Tự điều hướng tới bài tài liệu đầu tiên
- `/docs/[slug]` : Xem tài liệu public
- `/admin` : Đăng nhập và dashboard quản trị
- `/admin/create` : Tạo bài viết
- `/admin/edit/[id]` : Sửa bài viết

## Cài đặt

1. Cài dependencies:

```bash
npm install
```

2. Tạo file `.env.local` từ `.env.example` và điền cấu hình Firebase:

```bash
cp .env.example .env.local
```

3. Chạy dự án:

```bash
npm run dev
```

Mở `http://localhost:3000`.

## Biến môi trường

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_ADMIN_EMAILS`: danh sách email admin, cách nhau bởi dấu phẩy

## Firestore collection

Collection: `posts`

Mỗi document có schema:

- `title: string`
- `slug: string`
- `content: string`
- `parentId: string | null`
- `orderIndex: number`
- `coverImage: string`
- `published: boolean`
- `authorId: string`
- `createdAt: timestamp`
- `updatedAt: timestamp`

## Gợi ý bảo mật Firebase

- Cấu hình Firestore Rules để chỉ admin được ghi dữ liệu
- Cấu hình Storage Rules để chỉ admin được upload ảnh
- Không dựa hoàn toàn vào chặn UI phía client
