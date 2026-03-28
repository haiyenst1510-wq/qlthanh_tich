---
id: "001"
title: "Khởi tạo dự án Next.js + Prisma + PostgreSQL + Auth"
status: "todo"
area: "setup"
agent: "@systems-architect"
priority: "high"
created_at: "2026-03-28"
prd_refs: ["FR-001", "FR-002", "FR-003", "FR-004", "FR-005"]
blocks: ["002", "003", "004", "005", "006", "007", "008", "009", "010", "011", "012", "013", "014"]
blocked_by: []
---

## Description

Khởi tạo toàn bộ infrastructure của dự án. Đây là task nền tảng — tất cả task khác đều blocked by task này.

## Acceptance Criteria

- [ ] `npx create-next-app` với TypeScript, App Router, Tailwind CSS
- [ ] Cài đặt và cấu hình Prisma với PostgreSQL
- [ ] Cài đặt NextAuth.js v5 với Credentials provider
- [ ] Cài đặt shadcn/ui (components: Button, Input, Form, Table, Dialog, Select, Badge)
- [ ] Cài đặt Vitest cho unit tests
- [ ] Cài đặt Playwright cho E2E tests
- [ ] `.env.example` với tất cả biến môi trường cần thiết
- [ ] `npm run dev`, `npm run build`, `npm test`, `npm run lint` đều chạy được
- [ ] Cấu trúc thư mục đúng với CLAUDE.md (src/app/(auth), (admin), (teacher), api/)
- [ ] README cập nhật hướng dẫn setup local

## Technical Notes

**Stack đã quyết định** (xem DECISIONS.md sau khi tạo):
- Next.js 14.x App Router
- TypeScript strict mode
- Prisma ORM (không dùng raw SQL)
- PostgreSQL: Supabase (production) / local Docker (dev)
- NextAuth.js v5 (Auth.js) — KHÔNG dùng Supabase Auth
- Tailwind CSS + shadcn/ui
- Cloudinary (file storage nếu cần)
- Vitest + Playwright
- Deploy: Vercel

**Biến môi trường cần**:
```
# Supabase (2 URL vì Prisma cần direct connection cho migrations)
DATABASE_URL=postgresql://...        # connection pooling (runtime)
DIRECT_URL=postgresql://...          # direct connection (migrations)

NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000

# Cloudinary (nếu dùng)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

**Lưu ý Supabase + Prisma**: thêm `directUrl = env("DIRECT_URL")` vào datasource trong schema.prisma.

## History

| Date | Agent / Human | Event |
|------|--------------|-------|
| 2026-03-28 | human | Task created |
