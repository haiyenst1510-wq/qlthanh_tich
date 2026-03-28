# Architecture Decision Records — Quản lý Thành tích Giáo viên

> Format: ADR (Architecture Decision Record)
> Last updated: 2026-03-28

Tài liệu này ghi lại các quyết định kiến trúc quan trọng của dự án. Trước khi đề xuất thay đổi kỹ thuật lớn, hãy đọc các ADR liên quan để tránh xung đột.

---

## ADR-001: Next.js App Router thay vì Pages Router

**Date**: 2026-03-28
**Status**: Accepted

**Context**:
Dự án cần một framework React hỗ trợ SSR, routing, và API routes trong một codebase. Next.js là lựa chọn rõ ràng. Tuy nhiên, Next.js cung cấp hai hệ thống routing: Pages Router (ổn định, cũ) và App Router (mới, được Next.js đẩy mạnh từ v13+). Cần quyết định dùng cái nào.

**Decision**:
Dùng **App Router** (introduced in Next.js 13, stable từ 14).

Lý do:
- App Router là hướng đi chính thức của Next.js — Pages Router vẫn được support nhưng không nhận tính năng mới.
- React Server Components giúp giảm bundle size, fetch data trực tiếp trong component mà không cần `getServerSideProps`.
- Route Groups `(admin)` / `(teacher)` cho phép tổ chức routes theo vai trò mà không ảnh hưởng URL.
- Layouts lồng nhau (`layout.tsx`) đơn giản hóa việc bảo vệ route theo role.
- Server Actions (nếu cần) giảm boilerplate API route cho các form đơn giản.

**Consequences**:
- (+) Codebase align với hướng phát triển dài hạn của Next.js.
- (+) RSC giảm tải phía client, tốt cho máy tính giáo viên có thể yếu.
- (+) Route groups làm rõ ranh giới Admin / Teacher ngay trong cấu trúc thư mục.
- (-) Học curve cho dev quen Pages Router (RSC, `use client` directive, caching behavior thay đổi).
- (-) Một số thư viện cũ chưa tương thích RSC hoàn toàn — cần wrap bằng `use client`.

---

## ADR-002: Supabase thay vì self-hosted PostgreSQL

**Date**: 2026-03-28
**Status**: Accepted

**Context**:
Dự án cần PostgreSQL. Các lựa chọn: (1) self-hosted PostgreSQL trên VPS, (2) AWS RDS / Neon / Railway, (3) Supabase. Trường học không có đội DevOps riêng, budget hạn chế, dự án quy mô nhỏ (~100 giáo viên).

**Decision**:
Dùng **Supabase** làm PostgreSQL host.

Lý do:
- Free tier đủ dùng cho quy mô trường học (500MB database, 2GB bandwidth).
- Không cần tự quản lý server, backup, patching.
- Dashboard Supabase hữu ích để admin kiểm tra data trực tiếp khi debug.
- Supabase cung cấp 2 connection strings: `DATABASE_URL` (pgBouncer pooling cho runtime) và `DIRECT_URL` (direct connection cho Prisma migrations) — phù hợp với Prisma.

**Consequences**:
- (+) Zero ops overhead — tập trung code.
- (+) Built-in connection pooling qua pgBouncer.
- (+) Dashboard, SQL editor, backups included.
- (-) Vendor lock-in ở tầng hosting (dữ liệu vẫn là PostgreSQL chuẩn, có thể migrate).
- (-) Free tier có giới hạn — nếu trường mở rộng cần nâng cấp plan.
- (-) Latency phụ thuộc region Supabase (chọn Singapore cho Việt Nam).

---

## ADR-003: NextAuth.js v5 thay vì Supabase Auth

**Date**: 2026-03-28
**Status**: Accepted

**Context**:
Khi đã chọn Supabase, Supabase Auth là lựa chọn "tự nhiên". Tuy nhiên, hệ thống xác thực có yêu cầu đặc thù: GV không tự đăng ký, chỉ Admin tạo tài khoản; cần phân quyền 2 role (ADMIN / TEACHER) rõ ràng trong JWT; password hash do ứng dụng kiểm soát.

**Decision**:
Dùng **NextAuth.js v5** với **Credentials Provider**, không dùng Supabase Auth.

Lý do:
- Kiểm soát hoàn toàn luồng auth: Admin tạo user trong DB (qua Prisma), không có self-registration flow.
- Role (`ADMIN` / `TEACHER`) được lưu trong DB và inject vào JWT qua NextAuth callbacks — không phụ thuộc metadata của Supabase Auth.
- Credentials Provider + bcrypt là pattern đơn giản, dễ hiểu, dễ audit.
- Tách biệt auth logic khỏi Supabase → nếu sau này chuyển hosting DB, auth không bị ảnh hưởng.

**Consequences**:
- (+) Full control over user lifecycle và session data.
- (+) Role-based access control rõ ràng trong JWT.
- (+) Không bị ràng buộc với Supabase Auth API.
- (-) Phải tự implement password reset flow (email gửi link, v.v.) — Supabase Auth có sẵn.
- (-) Phải tự quản lý bcrypt hashing khi tạo/đổi password.
- (-) NextAuth.js v5 còn ở giai đoạn beta (tháng 3/2026) — API có thể thay đổi nhỏ.

---

## ADR-004: Prisma ORM thay vì raw SQL hoặc Drizzle

**Date**: 2026-03-28
**Status**: Accepted

**Context**:
Cần một layer để tương tác với PostgreSQL. Các lựa chọn: (1) raw SQL (pg / postgres.js), (2) Drizzle ORM, (3) Prisma ORM. Yêu cầu: type safety, migration tool, developer experience tốt.

**Decision**:
Dùng **Prisma ORM**.

Lý do:
- `schema.prisma` là single source of truth cho database schema — dễ đọc, dễ review.
- `prisma migrate dev` tạo và track migration files — phù hợp workflow có DIRECT_URL cho Supabase.
- Prisma Client auto-generated cung cấp type-safe queries — IDE autocomplete đầy đủ.
- `prisma.$transaction()` API rõ ràng, quan trọng cho `consumeSKKN()` logic.
- Ecosystem lớn, tài liệu tốt, nhiều ví dụ với Next.js.

**Consequences**:
- (+) Type-safe queries ngăn bugs ở compile time.
- (+) Migration workflow rõ ràng với Prisma Migrate.
- (+) Schema readable — mọi agent có thể hiểu DB structure từ `schema.prisma`.
- (-) Prisma Client nặng hơn raw SQL drivers — cold start trên Vercel serverless có thể chậm hơn (giảm thiểu bằng singleton pattern trong `src/lib/db.ts`).
- (-) Một số advanced PostgreSQL features (full-text search, complex CTEs) cần raw query qua `prisma.$queryRaw`.
- (-) Drizzle nhẹ hơn và bundle-size friendly hơn nếu performance là ưu tiên tối cao — nhưng DX và maturity của Prisma phù hợp hơn cho dự án này.

---

## ADR-005: SKKN consume logic rule-driven, không hardcode

**Date**: 2026-03-28
**Status**: Accepted

**Context**:
Quy định thi đua thay đổi theo từng năm học và từng danh hiệu. Ví dụ: "CSTĐ Cơ sở cần 1 SKKN trong 2 năm gần nhất", "CSTĐ Cấp tỉnh cần 2 SKKN trong 5 năm". Nếu hardcode các con số này trong code, mỗi lần quy định thay đổi phải sửa code và deploy lại.

**Decision**:
Toàn bộ quy tắc SKKN (số lượng cần tiêu, điều kiện năm, cấp SKKN) được lưu trong bảng `EligibilityRule` dưới dạng cấu hình JSON. Code trong `src/lib/skkn.ts` và `src/lib/eligibility.ts` chỉ đọc rule và thực thi — không chứa hằng số nghiệp vụ.

Ví dụ cấu trúc `EligibilityRule.conditions`:
```json
{
  "skknRequired": 2,
  "skknYearRange": { "type": "relative", "yearsBack": 5 },
  "skknMinLevel": "TRUONG",
  "consecutiveCSTD": { "years": 5, "minTitle": "LDTE" }
}
```

Admin có thể tạo/sửa rule qua UI mà không cần deploy lại.

**Consequences**:
- (+) Quy định thay đổi → Admin cập nhật rule, không cần dev can thiệp.
- (+) Hỗ trợ nhiều loại danh hiệu với rule khác nhau trong cùng một codebase.
- (+) Engine logic tái sử dụng được cho mọi rule.
- (-) Logic phức tạp hơn: code phải parse và validate JSON rule trước khi thực thi.
- (-) Cần validate schema của conditions JSON (dùng Zod) để tránh Admin nhập sai format.
- (-) Debug khó hơn so với hardcode — cần logging rõ ràng khi chạy engine.

---

## ADR-006: shadcn/ui thay vì Material UI hoặc Ant Design

**Date**: 2026-03-28
**Status**: Accepted

**Context**:
Cần component library cho UI. Các lựa chọn phổ biến: Material UI (MUI), Ant Design, Chakra UI, shadcn/ui. Yêu cầu: dễ tuỳ biến, không lock-in, compatible với React Server Components, bundle size hợp lý.

**Decision**:
Dùng **shadcn/ui** kết hợp **Tailwind CSS**.

Lý do:
- shadcn/ui không phải npm package — components được copy vào codebase (`src/components/ui/`), hoàn toàn kiểm soát được.
- Không có peer dependency conflicts, không bị ảnh hưởng khi shadcn release breaking change.
- Components dựa trên Radix UI (accessible) + Tailwind CSS (utility-first) — dễ style theo thiết kế riêng.
- Tương thích tốt với React Server Components (không force `use client` toàn bộ).
- Bundle size chỉ include đúng component đang dùng.

**Consequences**:
- (+) Full ownership of component code — sửa thoải mái không lo upstream breaking.
- (+) Accessible by default (Radix UI primitives).
- (+) Tailwind giúp styling nhất quán, responsive dễ.
- (-) Không có "update" tự động khi shadcn ra pattern mới — phải tự pull/merge.
- (-) Cần thêm bước setup (`npx shadcn@latest add [component]`) khi cần component mới.
- (-) Ít "out-of-the-box" hơn MUI/Ant Design — một số complex components (DataTable, DatePicker) cần tự compose.

---

## ADR-007: EligibilityRule.conditions lưu dưới dạng JSON thay vì normalize thành bảng riêng

**Date**: 2026-03-28
**Status**: Accepted

**Context**:
`EligibilityRule` cần lưu nhiều loại điều kiện khác nhau tùy theo danh hiệu: số SKKN, khoảng năm, số năm CSTĐ liên tiếp, mức thi đua tối thiểu, v.v. Có thể thiết kế normalized (bảng `RuleCondition` với `type` + `value` columns) hoặc lưu JSON trong một column.

**Decision**:
Lưu `conditions` dưới dạng **JSON column** trong `EligibilityRule`.

Lý do:
- Mỗi loại danh hiệu có cấu trúc điều kiện khác nhau — normalize thành bảng sẽ cần EAV (Entity-Attribute-Value) pattern, rất khó query và maintain.
- JSON column trong PostgreSQL (jsonb) hỗ trợ index và query nếu cần.
- Zod schema validate JSON khi Admin save rule — đảm bảo format đúng trước khi lưu DB.
- Eligibility engine đọc toàn bộ `conditions` object một lần — không cần JOIN với bảng phụ.
- Dễ thêm loại điều kiện mới mà không cần migration DB.

**Consequences**:
- (+) Schema đơn giản — một bảng `EligibilityRule` thay vì 2-3 bảng liên kết.
- (+) Dễ mở rộng: thêm loại điều kiện mới chỉ cần update Zod schema và engine logic.
- (+) Đọc rule trong một query, không JOIN.
- (-) Không có foreign key constraint trên từng điều kiện — validation phải ở application layer (Zod).
- (-) Query SQL thuần trên từng điều kiện khó hơn (cần jsonb operators) — nhưng use case này không phổ biến trong dự án.
- (-) Nếu structure conditions thay đổi lớn, cần migration script để update existing JSON records.

---

## ADR-008: Vercel Singapore region
**Date**: 2026-03-28
**Status**: Accepted
**Context**: Ứng dụng phục vụ người dùng tại Việt Nam, cần latency thấp nhất.
**Decision**: Deploy Vercel region `sin1` (Singapore) — region gần Việt Nam nhất trong hệ thống Vercel.
**Consequences**: Latency ~30-50ms từ Việt Nam. Trade-off: không phải region rẻ nhất nhưng acceptable cho internal app.
