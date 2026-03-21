# Documentation CMS

CMS tai lieu noi bo duoc xay bang Next.js App Router + Firebase (Auth/Firestore) + Cloudinary (media).

## Tong quan

Du an nay cho phep:

- Quan tri tai lieu theo cay cha-con.
- Noi dung song ngu VI/EN trong cung 1 document.
- Trang public `/docs` cho nguoi dung doc tai lieu theo ngon ngu.
- Upload anh cho noi dung bang Cloudinary (signed upload qua server route).
- Quan ly thu vien anh trong admin (list, copy URL/markdown, xoa, tai them theo cursor).

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Firebase Auth + Firestore
- Cloudinary (upload/list/delete)
- react-markdown + remark-gfm + rehype-raw

## Chuc nang chinh

### Public docs

- `/docs` tu dong redirect den bai dau tien da publish.
- `/docs/[slug]?lang=vi|en` hien thi bai theo ngon ngu.
- Sidebar dang cay, tu mo theo ancestor va active slug.
- Chuyen ngon ngu VI/EN tren khu docs.

### Admin

- Dang nhap bang Firebase Auth.
- Chi email trong `NEXT_PUBLIC_ADMIN_EMAILS` moi duoc quan tri.
- CRUD bai viet song ngu (VI/EN).
- Cover image bang URL.
- Upload nhieu anh cho noi dung markdown.
- Dat ten anh tu dong theo slug bai + ten file + random suffix.
- Trang quan ly media: `/admin/media`
    - Load anh tu Cloudinary Admin API
    - Copy URL / Copy markdown
    - Xoa anh
    - Phan trang bang `next_cursor` (nut Tai them)

## Cau truc route

- `/` Landing page
- `/docs` Danh sach/redirect docs
- `/docs/[slug]` Chi tiet bai viet
- `/admin` Dang nhap + dashboard
- `/admin/create` Tao bai viet
- `/admin/edit/[id]` Sua bai viet
- `/admin/media` Quan ly media Cloudinary
- `/api/upload` Upload anh (signed upload)
- `/api/media` GET list media + DELETE media

## Cai dat local

1. Cai dependencies

```bash
npm install
```

2. Tao `.env.local` tu `.env.example` va dien cac bien

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

3. Chay dev server

```bash
npm run dev
```

4. Mo trinh duyet

- `http://localhost:3000`

## Bien moi truong

### Firebase

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_ADMIN_EMAILS` (danh sach email, cach nhau boi dau phay)

### Cloudinary

- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Luu y:

- Hien tai upload anh duoc chuan hoa ve signed upload (1 co che duy nhat).
- Khong can `CLOUDINARY_UPLOAD_PRESET` trong flow hien tai.

## Firestore schema

Collection: `posts`

Moi document luu theo schema song ngu:

```ts
{
    title: {
        vi: string;
        en: string;
    }
    slug: {
        vi: string;
        en: string;
    }
    content: {
        vi: string;
        en: string;
    }
    parentId: string | null;
    orderIndex: number;
    coverImage: string;
    published: boolean;
    authorId: string;
    createdAt: timestamp;
    updatedAt: timestamp;
}
```

## Scripts

- `npm run dev` Chay local
- `npm run build` Build production
- `npm run start` Chay ban build
- `npm run lint` Kiem tra lint
- `npm run seed:lntsoft` Seed docs mau

## Bao mat va van hanh

- Khong commit `.env.local`.
- API key/secret Cloudinary la server-side secret, can rotate neu lo.
- Firestore rules can gioi han ghi/xoa cho admin.
- `NEXT_PUBLIC_ADMIN_EMAILS` chi la lop chan UI/business; van can rules ben backend.

## Ghi chu hien tai

- Trang docs da fallback render cover image bang `img` de tranh crash khi URL cover khong hop le.
- Media manager dang lay toi da 30 item moi request va dung `next_cursor` de tai them.
