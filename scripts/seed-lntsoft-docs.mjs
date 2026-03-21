import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
    addDoc,
    collection,
    doc,
    getDocs,
    getFirestore,
    limit,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";

function loadEnvLocal() {
    const filePath = resolve(process.cwd(), ".env.local");
    if (!existsSync(filePath)) return;

    const content = readFileSync(filePath, "utf8");
    const lines = content.split(/\r?\n/);

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;

        const index = trimmed.indexOf("=");
        if (index <= 0) continue;

        const key = trimmed.slice(0, index).trim();
        const value = trimmed.slice(index + 1).trim();

        if (!process.env[key]) {
            process.env[key] = value;
        }
    }
}

loadEnvLocal();

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const requiredKeys = Object.entries(firebaseConfig).filter(
    ([, value]) => !value,
);
if (requiredKeys.length > 0) {
    console.error(
        "Thieu bien moi truong Firebase:",
        requiredKeys.map(([key]) => key).join(", "),
    );
    process.exit(1);
}

const seedPosts = [
    {
        key: "gioi-thieu",
        parentKey: null,
        orderIndex: 0,
        title: "Giới thiệu LNTSoft",
        slug: "lntsoft-gioi-thieu",
        content: `# Giới thiệu LNTSoft

LNTSoft là đơn vị cung cấp giải pháp phần mềm doanh nghiệp với định hướng lấy công nghệ làm đòn bẩy tăng trưởng.

Trên website chính thức, LNTSoft tập trung truyền tải thông điệp về một nền tảng công nghệ rõ ràng cho đổi mới tương lai, đồng thời nhấn mạnh năng lực triển khai các hệ thống nghiệp vụ có độ phức tạp cao.

## Định hướng tổng quan

- Tập trung số hóa vận hành doanh nghiệp
- Tối ưu năng suất và minh bạch dữ liệu
- Đồng hành cùng doanh nghiệp trong lộ trình chuyển đổi số

## Cách sử dụng tài liệu này

Tài liệu được tổ chức theo cấu trúc cây để người đọc có thể đi từ bức tranh tổng thể đến từng giải pháp chi tiết.`,
    },
    {
        key: "tam-nhin-su-menh",
        parentKey: "gioi-thieu",
        orderIndex: 1,
        title: "Tầm nhìn và sứ mệnh",
        slug: "lntsoft-tam-nhin-su-menh",
        content: `# Tầm nhìn và sứ mệnh

## Tầm nhìn

Xây dựng nền tảng công nghệ có khả năng thích ứng nhanh với sự thay đổi của thị trường, giúp doanh nghiệp ra quyết định tốt hơn dựa trên dữ liệu.

## Sứ mệnh

- Cung cấp bộ giải pháp thực tiễn, dễ tích hợp
- Rút ngắn khoảng cách giữa vận hành và công nghệ
- Tạo ra giá trị bền vững thông qua cải tiến liên tục

## Giá trị cốt lõi

- Linh hoạt
- Tập trung khách hàng
- Kết quả đo lường được
- Đồng hành dài hạn`,
    },
    {
        key: "nang-luc-cong-nghe",
        parentKey: "gioi-thieu",
        orderIndex: 2,
        title: "Năng lực công nghệ",
        slug: "lntsoft-nang-luc-cong-nghe",
        content: `# Năng lực công nghệ

Từ nội dung website, LNTSoft nhấn mạnh hướng tiếp cận cloud-first, AI-powered và khả năng tích hợp công nghệ hiện đại vào quy trình nghiệp vụ.

## Trọng tâm kỹ thuật

- Nền tảng cloud giúp triển khai nhanh và mở rộng linh hoạt
- Tích hợp AI hỗ trợ phân tích và ra quyết định
- Kiến trúc module để tùy biến theo ngành
- Hỗ trợ tích hợp với hệ thống hiện hữu qua API

## Giá trị vận hành

- Giảm phân mảnh dữ liệu
- Tăng khả năng kiểm soát quy trình
- Chuẩn hóa vận hành đa phòng ban`,
    },
    {
        key: "giai-phap",
        parentKey: null,
        orderIndex: 10,
        title: "Danh mục giải pháp",
        slug: "lntsoft-danh-muc-giai-phap",
        content: `# Danh mục giải pháp

LNTSoft cung cấp nhiều nhóm giải pháp cho các bối cảnh doanh nghiệp khác nhau.

## Nhóm chính

- LNTBOOST ERP
- FXPRO Apparel Product Suite
- Data Analytic Toolkit
- Insurance Solutions
- Banking & Wealth Solutions
- Other Solutions

Mỗi nhóm bên dưới gồm mô tả, phạm vi áp dụng và gợi ý triển khai thực tế.`,
    },
    {
        key: "lntboost-erp",
        parentKey: "giai-phap",
        orderIndex: 11,
        title: "LNTBOOST ERP",
        slug: "lntboost-erp",
        content: `# LNTBOOST ERP

Theo mô tả từ website, LNTBOOST ERP là bộ ứng dụng ERP toàn diện, tích hợp AI và cloud nhằm tăng hiệu quả tổ chức.

## Mục tiêu hệ thống

- Tự động hóa quy trình nghiệp vụ
- Tăng minh bạch vận hành
- Nâng cao năng lực giám sát và kiểm soát nguồn lực

## Lợi ích nổi bật

- Tăng nhận thức vận hành theo thời gian thực
- Quản trị tập trung dữ liệu và quy trình
- Giảm chồng chéo thao tác giữa các phòng ban

## Gợi ý cho tài liệu nội bộ tiếp theo

- Bản đồ module chi tiết theo phòng ban
- KPI trước/sau triển khai
- Quy chuẩn dữ liệu và phân quyền người dùng`,
    },
    {
        key: "lntboost-features",
        parentKey: "lntboost-erp",
        orderIndex: 12,
        title: "LNTBOOST ERP - Tính năng đề xuất",
        slug: "lntboost-erp-tinh-nang",
        content: `# LNTBOOST ERP - Tính năng đề xuất

Đây là khung chức năng đề xuất để đội nội bộ tham chiếu khi tư vấn hoặc triển khai.

## Khối vận hành

- Quản lý quy trình chuẩn
- Luồng phê duyệt đa cấp
- Theo dõi trạng thái công việc theo thời gian thực

## Khối dữ liệu và phân tích

- Báo cáo điều hành theo vai trò
- Dashboard tổng hợp KPI
- Cảnh báo ngoại lệ tự động

## Khối tích hợp

- API kết nối hệ thống ngoài
- Đồng bộ dữ liệu định kỳ hoặc realtime
- Chuẩn hóa mapping dữ liệu liên hệ thống`,
    },
    {
        key: "fxpro",
        parentKey: "giai-phap",
        orderIndex: 20,
        title: "FXPRO Apparel Product Suite",
        slug: "fxpro-apparel-product-suite",
        content: `# FXPRO Apparel Product Suite

FXPRO là bộ ERP cloud dành cho ngành may mặc, hướng tới việc hợp nhất các quy trình sản xuất trên một nền tảng tích hợp.

## Giá trị chính từ website

- Giải quyết khoảng cách công nghệ trong ngành
- Tăng giao tiếp giữa các bộ phận
- Loại bỏ data silo
- Tối ưu hiệu quả và lợi nhuận
- Hỗ trợ lộ trình IoT và Industry 4.0

## Đối tượng phù hợp

- Doanh nghiệp may mặc đang mở rộng quy mô
- Đơn vị muốn kiểm soát end-to-end từ đơn hàng đến giao hàng
- Tổ chức cần chuẩn hóa dữ liệu và phối hợp liên phòng ban`,
    },
    {
        key: "fxpro-modules",
        parentKey: "fxpro",
        orderIndex: 21,
        title: "FXPRO - Danh sách module",
        slug: "fxpro-danh-sach-module",
        content: `# FXPRO - Danh sách module

Theo nội dung website, bộ FXPRO bao gồm nhiều module xuyên suốt chuỗi vận hành:

- PDM
- Order Management
- Costing
- Sale Planning
- Production Scheduling
- Planning Board
- TNA
- Sourcing
- Inventory
- Warehouse
- MRP
- Cut Plan
- MES
- Quality
- P2S
- Sale & Distribution
- FG Inventory
- Management Accounting
- Document Portal
- Analytic, Report and BI

## Cách đọc module

Nên triển khai theo thứ tự ưu tiên nghiệp vụ, tránh rollout toàn bộ trong một pha nếu tổ chức chưa sẵn sàng dữ liệu nền.`,
    },
    {
        key: "fxpro-framework",
        parentKey: "fxpro",
        orderIndex: 22,
        title: "FXPRO - Nền tảng và khả năng mở rộng",
        slug: "fxpro-nen-tang-kha-nang-mo-rong",
        content: `# FXPRO - Nền tảng và khả năng mở rộng

Website nhấn mạnh 3 đặc điểm của FXPRO:

- Agility adaptable
- Customer-specific next-generation framework
- Cloud-based ERP platform

## Ý nghĩa vận hành

- Dễ tùy biến theo đặc thù doanh nghiệp
- Có khả năng mở rộng khi nhu cầu tăng
- Hỗ trợ tích hợp API để kết nối hệ sinh thái phần mềm nội bộ`,
    },
    {
        key: "datoolkit",
        parentKey: "giai-phap",
        orderIndex: 30,
        title: "Data Analytic Toolkit",
        slug: "data-analytic-toolkit",
        content: `# Data Analytic Toolkit

Bộ công cụ BI và Analytics hướng đến việc cung cấp insight giá trị để tối ưu vận hành và hỗ trợ quyết định.

## Trọng tâm

- Business intelligence có hỗ trợ AI
- Báo cáo trực quan cho điều hành
- Tăng tốc quá trình phân tích dữ liệu

## Kết quả kỳ vọng

- Ra quyết định nhanh hơn
- Giảm phụ thuộc báo cáo thủ công
- Tăng khả năng phát hiện cơ hội tăng trưởng`,
    },
    {
        key: "insurance",
        parentKey: "giai-phap",
        orderIndex: 40,
        title: "Insurance Solutions",
        slug: "insurance-solutions",
        content: `# Insurance Solutions

Nhóm giải pháp bảo hiểm phục vụ số hóa nghiệp vụ đặc thù ngành, giúp chuẩn hóa xử lý và tăng kiểm soát rủi ro.

## Định hướng áp dụng

- Chuẩn hóa quy trình nghiệp vụ cốt lõi
- Tối ưu thời gian xử lý hồ sơ
- Nâng cao năng lực giám sát và tuân thủ

## Gợi ý tài liệu mở rộng

- Quy trình nghiệp vụ chuẩn theo vai trò
- Mẫu báo cáo giám sát vận hành
- Bộ chỉ số chất lượng dịch vụ`,
    },
    {
        key: "banking-wealth",
        parentKey: "giai-phap",
        orderIndex: 50,
        title: "Banking & Wealth Solutions",
        slug: "banking-wealth-solutions",
        content: `# Banking & Wealth Solutions

Giải pháp cho khối ngân hàng và quản lý tài sản, định hướng số hóa trải nghiệm và nâng hiệu quả quản trị.

## Mục tiêu chính

- Tối ưu trải nghiệm khách hàng số
- Tăng tốc xử lý giao dịch và dịch vụ
- Hỗ trợ minh bạch dữ liệu phục vụ quản trị rủi ro

## Khuyến nghị triển khai

- Triển khai theo giai đoạn để kiểm soát rủi ro thay đổi
- Xây chuẩn dữ liệu chung ngay từ đầu
- Thiết kế dashboard cho từng cấp vận hành`,
    },
    {
        key: "other-solutions",
        parentKey: "giai-phap",
        orderIndex: 60,
        title: "Other Solutions",
        slug: "other-solutions",
        content: `# Other Solutions

Nhóm giải pháp mở rộng cho các bài toán doanh nghiệp ngoài các nhóm ngành trọng tâm.

## Nguyên tắc tiếp cận

- Bám sát bài toán nghiệp vụ thực tế
- Thiết kế linh hoạt theo đặc thù tổ chức
- Ưu tiên khả năng đo lường hiệu quả sau triển khai`,
    },
    {
        key: "contact",
        parentKey: null,
        orderIndex: 70,
        title: "Liên hệ và hợp tác",
        slug: "lntsoft-lien-he-hop-tac",
        content: `# Liên hệ và hợp tác

Nếu cần thêm thông tin, hỗ trợ hoặc tư vấn chuyên sâu, đội ngũ LNTSoft sẵn sàng kết nối.

## Kênh liên hệ

- Trang liên hệ chính thức: https://lntsoft.vn/contact
- Hành động chính trên website: Book A Demo / Contact Us / Schedule a Meeting / Send Message

## Mục tiêu của bước liên hệ

- Xác định bối cảnh và nhu cầu doanh nghiệp
- Đề xuất lộ trình triển khai phù hợp
- Thống nhất phạm vi và kỳ vọng đầu ra`,
    },
    {
        key: "demo-process",
        parentKey: "contact",
        orderIndex: 71,
        title: "Quy trình demo đề xuất",
        slug: "lntsoft-quy-trinh-demo-de-xuat",
        content: `# Quy trình demo đề xuất

## Bước 1: Thu thập bối cảnh

- Mô hình vận hành hiện tại
- Điểm nghẽn chính cần xử lý
- Hệ thống đang sử dụng

## Bước 2: Demo theo kịch bản nghiệp vụ

- Chọn use case gần nhất với thực tế doanh nghiệp
- Thể hiện dữ liệu đầu vào và đầu ra cụ thể

## Bước 3: Chốt đề xuất triển khai

- Phạm vi phase 1
- Nguồn lực hai bên
- KPI đo hiệu quả sau go-live`,
    },
    {
        key: "faq",
        parentKey: null,
        orderIndex: 80,
        title: "FAQ triển khai nhanh",
        slug: "lntsoft-faq-trien-khai-nhanh",
        content: `# FAQ triển khai nhanh

## 1) Tôi nên bắt đầu từ giải pháp nào?

Nên bắt đầu từ bài toán tạo giá trị nhanh nhất và có dữ liệu tương đối sẵn sàng.

## 2) Có cần triển khai toàn bộ module ngay không?

Không bắt buộc. Khuyến nghị triển khai theo phase để giảm rủi ro và tăng tỷ lệ hấp thụ thay đổi.

## 3) Vì sao cần chuẩn hóa dữ liệu sớm?

Dữ liệu chuẩn là nền cho tự động hóa, báo cáo và AI. Nếu bỏ qua bước này, chi phí sửa sau rất lớn.

## 4) Làm sao đo hiệu quả?

Xác định KPI trước triển khai, đo baseline, theo dõi theo tuần/tháng sau go-live để so sánh định lượng.`,
    },
];

async function upsertBySlug(db, payload, parentId, authorId) {
    const postRef = collection(db, "posts");
    const q = query(postRef, where("slug", "==", payload.slug), limit(1));
    const snapshot = await getDocs(q);

    const finalPayload = {
        ...payload,
        parentId,
        published: true,
        coverImage: payload.coverImage ?? "",
        authorId,
        updatedAt: serverTimestamp(),
    };

    if (snapshot.empty) {
        const created = await addDoc(postRef, {
            ...finalPayload,
            createdAt: serverTimestamp(),
        });

        return created.id;
    }

    const targetDoc = snapshot.docs[0];
    await updateDoc(doc(db, "posts", targetDoc.id), finalPayload);
    return targetDoc.id;
}

async function main() {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);

    const adminEmailFromList = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)[0];

    const signInEmail = process.env.SEED_ADMIN_EMAIL || adminEmailFromList;
    const signInPassword = process.env.SEED_ADMIN_PASSWORD;
    let authorId = "seed-script";

    if (signInEmail && signInPassword) {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            signInEmail,
            signInPassword,
        );
        authorId = userCredential.user.uid;
        console.log(`Da dang nhap de seed voi tai khoan: ${signInEmail}`);
    } else {
        console.warn(
            "Khong tim thay SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD, se thu ghi du lieu voi quyen hien tai.",
        );
    }

    const createdMap = new Map();

    for (const item of seedPosts) {
        const parentId = item.parentKey
            ? createdMap.get(item.parentKey) || null
            : null;

        const id = await upsertBySlug(
            db,
            {
                title: item.title,
                slug: item.slug,
                content: item.content,
                orderIndex: item.orderIndex,
                coverImage: "",
            },
            parentId,
            authorId,
        );

        createdMap.set(item.key, id);
        console.log(`Da upsert: ${item.title} (${item.slug})`);
    }

    console.log("Hoan tat seed tai lieu LNTSoft vao Firestore.");
}

main().catch((error) => {
    console.error("Seed that bai:", error?.message || error);
    process.exit(1);
});
