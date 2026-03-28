# Architecture — Quản lý Thành tích Giáo viên

> Last updated: 2026-03-28
> Stack: Next.js 14 (App Router) · TypeScript · Supabase (PostgreSQL) · Prisma · NextAuth.js v5 · Tailwind CSS · shadcn/ui · Cloudinary · Vercel

---

## Overview

Ứng dụng web nội bộ dành cho một trường học, phục vụ hai nhóm người dùng:

| Actor | Vai trò |
|-------|---------|
| **Admin** | Tạo/quản lý tài khoản giáo viên; xem, lọc, và xuất danh sách giáo viên tiềm năng theo danh hiệu thi đua; quản lý EligibilityRule (bộ quy tắc xét danh hiệu); xuất báo cáo. |
| **Teacher (Giáo viên)** | Tự nhập thành tích hàng năm (SKKN, danh hiệu, khen thưởng...); xem hồ sơ cá nhân và lịch sử thành tích; không thể tự đăng ký — tài khoản do Admin tạo. |

Tính năng phân biệt cốt lõi: **hệ thống SKKN tiêu** — mỗi SKKN của giáo viên chỉ được dùng một lần để xét một danh hiệu cụ thể trong một năm học cụ thể. Quy tắc (số lượng SKKN cần tiêu, điều kiện năm) do Admin cấu hình, không hardcode.

---

## Tech Stack

| Tầng | Công nghệ | Lý do chọn |
|------|-----------|------------|
| Frontend framework | Next.js 14 (App Router) | SSR/SSG tích hợp, route groups, Server Actions, ecosystem phong phú |
| Language | TypeScript (strict) | Type safety, IDE support, phát hiện lỗi sớm |
| UI components | shadcn/ui + Tailwind CSS | Copy-paste components, không lock-in, dễ tuỳ biến, accessible |
| Database | Supabase (PostgreSQL) | Managed PostgreSQL miễn phí/rẻ cho dự án trường học, không cần tự vận hành |
| ORM | Prisma | Type-safe queries, migration tool mạnh, schema-as-code |
| Auth | NextAuth.js v5 (Credentials) | Kiểm soát hoàn toàn (không phụ thuộc Supabase Auth), JWT/session linh hoạt |
| File storage | Cloudinary | Managed CDN, free tier đủ dùng, SDK đơn giản |
| Hosting | Vercel | Zero-config Next.js deploy, preview URLs, Edge Network |
| Unit testing | Vitest | Nhanh, tương thích Vite ecosystem, colocated với source |
| E2E testing | Playwright | Cross-browser, reliable, tích hợp tốt với CI |

---

## System Architecture (C4 Level 2 — Containers)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Internet (Browser)                       │
│                    Admin / Teacher (HTTPS)                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Vercel Edge Network (CDN)                      │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │          Web App Container — Next.js 14                  │   │
│  │                                                          │   │
│  │  ┌─────────────────┐   ┌──────────────────────────────┐  │   │
│  │  │  React Server   │   │   API Routes (Route Handler) │  │   │
│  │  │  Components     │   │   /api/auth/[...nextauth]    │  │   │
│  │  │  (App Router)   │   │   /api/achievements          │  │   │
│  │  └────────┬────────┘   │   /api/teachers              │  │   │
│  │           │            │   /api/eligibility           │  │   │
│  │           └────────────┤   /api/reports               │  │   │
│  │                        └──────────────┬───────────────┘  │   │
│  │  ┌─────────────────┐                  │                   │   │
│  │  │  NextAuth.js v5 │◄─────────────────┤                   │   │
│  │  │  (JWT sessions) │                  │                   │   │
│  │  └─────────────────┘                  │                   │   │
│  │  ┌─────────────────┐                  │                   │   │
│  │  │  Prisma Client  │◄─────────────────┘                   │   │
│  │  └────────┬────────┘                                      │   │
│  └───────────┼──────────────────────────────────────────────┘   │
└──────────────┼──────────────────────────────────────────────────┘
               │
     ┌─────────┼──────────────┐
     │         │              │
     ▼         ▼              ▼
┌─────────┐ ┌──────────┐ ┌───────────┐
│Supabase │ │Supabase  │ │Cloudinary │
│Postgres │ │(pooling) │ │(files)    │
│DIRECT_  │ │DATABASE_ │ │           │
│URL      │ │URL       │ │           │
│(migrate)│ │(runtime) │ │           │
└─────────┘ └──────────┘ └───────────┘
```

### Containers

| Container | Teknologi | Mô tả |
|-----------|-----------|-------|
| **Web App** | Next.js 14 trên Vercel | Toàn bộ frontend và backend logic. Phục vụ SSR pages, API routes, xử lý auth. |
| **Database** | Supabase PostgreSQL | Lưu tất cả dữ liệu: users, achievements, SKKN, rules. Kết nối qua 2 URL: pooling (runtime) và direct (migrations). |
| **File Storage** | Cloudinary | Lưu file đính kèm (minh chứng SKKN, văn bản khen thưởng). Optional trong v1. |
| **Hosting/CDN** | Vercel Edge Network | Phân phối tĩnh, preview deployments, environment variables management. |

---

## Application Structure

```
src/app/
├── (auth)/
│   └── login/               # /login — trang đăng nhập (public)
├── (admin)/                 # route group Admin — protected by middleware
│   ├── dashboard/           # /dashboard
│   ├── teachers/            # /teachers — danh sách, tạo tài khoản GV
│   ├── eligibility/         # /eligibility — lọc GV tiềm năng
│   ├── rules/               # /rules — quản lý EligibilityRule
│   └── reports/             # /reports — xuất báo cáo
├── (teacher)/               # route group Teacher — protected by middleware
│   ├── profile/             # /profile
│   └── achievements/        # /achievements — nhập và xem thành tích
└── api/
    ├── auth/[...nextauth]/  # NextAuth.js handler
    ├── achievements/        # CRUD thành tích
    ├── teachers/            # Quản lý GV (Admin only)
    ├── eligibility/         # Chạy eligibility engine
    └── reports/             # Xuất báo cáo
```

### Route Groups và Middleware

- `(auth)` — public routes, redirect nếu đã login
- `(admin)` — yêu cầu session với `role === "ADMIN"`, redirect về `/login` nếu chưa auth
- `(teacher)` — yêu cầu session với `role === "TEACHER"`, redirect về `/login` nếu chưa auth
- Middleware (`src/middleware.ts`) kiểm tra JWT token và phân quyền theo route prefix

---

## Authentication Flow

```
Browser                    Next.js App             Supabase DB
   │                            │                       │
   │  POST /api/auth/signin     │                       │
   │  { email, password }       │                       │
   ├──────────────────────────►│                       │
   │                            │  SELECT * FROM users  │
   │                            │  WHERE email = ?      │
   │                            ├──────────────────────►│
   │                            │◄──────────────────────┤
   │                            │  bcrypt.compare()     │
   │                            │  (password hash)      │
   │                            │                       │
   │  Set-Cookie: next-auth.    │                       │
   │  session-token (JWT)       │                       │
   │◄──────────────────────────┤                       │
   │                            │                       │
   │  GET /admin/dashboard      │                       │
   ├──────────────────────────►│                       │
   │                            │  middleware: verify   │
   │                            │  JWT, check role      │
   │  200 OK / 302 /login       │                       │
   │◄──────────────────────────┤                       │
```

**Chi tiết:**

1. **Credentials Provider**: NextAuth.js v5 dùng `CredentialsProvider`. Hàm `authorize()` trong `src/lib/auth.ts` tra cứu user trong DB qua Prisma, so sánh password bằng `bcrypt.compare()`.
2. **JWT Strategy**: NextAuth lưu session dưới dạng JWT trong httpOnly cookie. Payload JWT bao gồm `userId`, `email`, `role`.
3. **Session Callback**: `session` callback inject `role` vào session object để frontend/API có thể đọc.
4. **Middleware**: `src/middleware.ts` dùng `getToken()` từ NextAuth để verify JWT và kiểm tra `role` trước mọi request đến `(admin)` và `(teacher)` routes.
5. **Không dùng Supabase Auth**: Toàn bộ auth đi qua NextAuth + Prisma. Supabase chỉ là PostgreSQL host.

---

## Key Domain Logic

### SKKN Tiêu Flow

SKKN (Sáng kiến kinh nghiệm) là thành tích quan trọng nhất. Một SKKN chỉ được "tiêu" (sử dụng) một lần cho một danh hiệu trong một năm học.

```
GV chọn "Xét danh hiệu X năm Y"
        │
        ▼
[API] Đọc EligibilityRule cho danh hiệu X
        │
        ▼
[skkn.ts] getAvailableSKKN(teacherId, rule)
  → Lấy tất cả SKKN của GV
  → Lọc: chỉ những SKKN chưa bị tiêu (consumed = false)
  → Lọc theo điều kiện năm trong rule (ví dụ: "năm liền trước hoặc hiện tại")
        │
        ▼
GV chọn SKKN từ danh sách available
        │
        ▼
[skkn.ts] consumeSKKN(skknIds, { usedFor, usedYear }) — trong transaction
  → BEGIN TRANSACTION
  → Verify lại từng SKKN: consumed = false (race condition protection)
  → UPDATE skkn SET consumed = true, usedFor = ?, usedYear = ?
  → INSERT eligibility_application (teacherId, ruleId, year, status)
  → COMMIT
        │
        ▼
Kết quả: SKKN đã bị tiêu, không thể dùng lại
```

**Quy tắc bất biến:**
- Số SKKN cần tiêu lấy từ `rule.skknRequired` (không hardcode)
- Điều kiện năm lấy từ `rule.conditions` (JSON config)
- SKKN không bao giờ bị xóa, chỉ update `consumed = true`

### Eligibility Engine

Engine lọc giáo viên tiềm năng cho một danh hiệu:

```
[Admin] Chọn rule + năm học
        │
        ▼
[eligibility.ts] runEligibilityCheck(ruleId, academicYear)
        │
        ├─► Đọc EligibilityRule (bao gồm conditions JSON)
        │
        ├─► Lấy tất cả GV active
        │
        └─► Với mỗi GV: checkTeacherEligibility(teacher, rule, year)
              ├─ Kiểm tra số năm đạt CSTĐ liên tiếp (từ conditions)
              ├─ Kiểm tra số SKKN available đúng cấp
              ├─ Kiểm tra các điều kiện khác (khen thưởng, không vi phạm...)
              └─ Return: { eligible: boolean, missingConditions: string[] }
        │
        ▼
Return: danh sách GV đủ điều kiện + GV thiếu điều kiện gì
```

---

## Data Flow

```
GV nhập thành tích
      │
      ▼ HTTP POST
API Route (src/app/api/achievements/route.ts)
      │ Validate input (zod schema)
      ▼
Prisma Client (src/lib/db.ts)
      │ Type-safe query
      ▼
Supabase PostgreSQL (qua DATABASE_URL / connection pool)
      │
      ▼
Response trả về GV
```

**File upload (nếu có):**
```
GV upload file
      │
      ▼ multipart/form-data
API Route
      │ Upload lên Cloudinary SDK
      ▼
Cloudinary
      │ Return public_url
      ▼
Lưu URL vào Prisma (liên kết với SKKN record)
```

---

## Security

| Mối đe dọa | Biện pháp |
|------------|-----------|
| Unauthenticated access | Middleware kiểm tra JWT trên mọi protected route |
| Role escalation | `role` trong JWT được set từ DB, không từ client input |
| SQL Injection | Prisma dùng parameterized queries — không raw SQL |
| Password exposure | Passwords hash bằng `bcrypt` (salt rounds = 12), không bao giờ lưu plain text |
| CSRF | NextAuth.js v5 có CSRF protection tích hợp |
| Race condition (SKKN) | `consumeSKKN()` chạy trong transaction, re-verify trước khi update |
| Secrets | Tất cả credentials trong environment variables (Vercel), không trong source code |
| Insecure file uploads | Cloudinary validate file type phía client + server; chỉ lưu URL |
