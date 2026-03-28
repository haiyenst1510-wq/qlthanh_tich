# Quản lý Thành tích Giáo viên — Claude Instructions

> Stack: Next.js 14 (App Router) · TypeScript · Supabase (PostgreSQL) · Prisma · NextAuth.js v5 · Tailwind CSS · shadcn/ui · Cloudinary · Vercel
> Last updated: 2026-03-28

## Project Context

Ứng dụng web nội bộ cho một trường học, cho phép giáo viên tự nhập thành tích hàng năm và admin quản lý, thống kê, lọc giáo viên tiềm năng theo danh hiệu, và xuất báo cáo. Tính năng cốt lõi là hệ thống theo dõi "SKKN đã tiêu" — mỗi SKKN chỉ được dùng một lần để xét một danh hiệu cụ thể, đảm bảo đúng quy định thi đua.

**Tech stack summary**: Next.js 14 App Router · Prisma ORM · Supabase (PostgreSQL) · NextAuth.js v5 · shadcn/ui + Tailwind CSS · Cloudinary · Vercel

---

## Agents Available

**Mandatory delegation — this is not optional.** Every task that falls within a specialist's domain MUST be routed to that agent. Do not implement code, design schemas, write docs, or configure pipelines yourself — delegate. Only handle directly: project-level questions, routing decisions, and tasks explicitly outside all specialist domains.

| Agent | Role | Invoke when... |
|-------|------|----------------|
| `project-manager` | Backlog & coordination | "What's next?", sprint planning, breaking down features, reprioritizing |
| `systems-architect` | Architecture & ADRs | New feature design, tech decisions, system integration |
| `frontend-developer` | UI implementation | Components, pages, client-side state, styling |
| `backend-developer` | API & business logic | Endpoints, auth, background jobs, integrations |
| `ui-ux-designer` | UX & design system | User flows, wireframes, component specs, accessibility |
| `database-expert` | Schema & queries | Migrations, schema design, query optimization |
| `qa-engineer` | Testing (Playwright) | E2E tests, test strategy, coverage gaps |
| `documentation-writer` | Living docs | User guide updates, post-feature documentation |
| `cicd-engineer` | CI/CD & GitHub Actions | Pipelines, deployments, branch protection, release automation |
| `docker-expert` | Containerization | Dockerfiles, docker-compose, image optimization, container networking |
| `copywriter-seo` | Copy & SEO | Landing page copy, marketing content, meta tags, keyword strategy |

---

## Critical Rules

These apply to all agents at all times. No exceptions without explicit human instruction.

1. **PRD.md is read-only.** Never modify it. Read it to understand requirements.
2. **TODO.md is the living backlog.** Agents may add items, mark items complete, and move items to "Completed". Preserve section order and existing item priority.
3. **All commits use Conventional Commits format** (see Git Conventions below).
4. **Update the relevant `docs/` file** after every significant change before marking a task complete.
5. **Run tests before marking any implementation task complete.**
6. **Never hardcode secrets, credentials, or environment-specific values** in source code.
7. **Consult `docs/technical/DECISIONS.md`** before proposing changes that may conflict with prior architectural decisions.
8. **Always delegate to the right specialist.** The delegation table above is binding, not advisory.

### Domain-specific rules

- **SKKN tiêu logic is sacred**: Khi một SKKN bị tiêu (dùng để xét danh hiệu), phải ghi rõ `usedFor` (danh hiệu gì) và `usedYear` (năm học nào). Không bao giờ xóa SKKN, chỉ cập nhật trạng thái.
- **SKKN tiêu do rule config, không hardcode**: Số lượng SKKN cần tiêu và điều kiện năm do Admin cấu hình trong EligibilityRule, không được hardcode "2 SKKN" hay "năm liền trước" trong code. Code chỉ đọc rule và thực thi.
- **PRD.md bảo vệ 3 lớp**: Cảnh báo trong file, rule trong CLAUDE.md, và system prompt của mỗi agent — không agent nào được sửa PRD.md.
- **Năm học format**: Dùng chuỗi `"2024-2025"` (không phải số nguyên) để tránh nhầm lẫn. GV có thể nhập thành tích cho bất kỳ năm học nào trong quá khứ.
- **Admin tạo tài khoản GV**: GV không tự đăng ký — chỉ Admin tạo tài khoản qua trang quản lý.
- **Supabase**: Dùng Supabase làm PostgreSQL host. Kết nối qua `DATABASE_URL` (connection pooling) và `DIRECT_URL` (migrations). Không dùng Supabase Auth — dùng NextAuth.js.
- **Cloudinary**: Dùng lưu trữ file nếu cần (ví dụ: file đính kèm SKKN). Không bắt buộc trong v1 nếu không có yêu cầu upload file.

---

## Project Structure

```
src/
  app/                    # Next.js App Router
    (auth)/               # Login page
    (admin)/              # Admin routes (dashboard, GV management, reports)
    (teacher)/            # Teacher routes (profile, nhập thành tích)
    api/                  # API routes
  components/             # Shared UI components (shadcn/ui based)
  lib/
    db.ts                 # Prisma client singleton
    auth.ts               # NextAuth config
    skkn.ts               # SKKN tiêu logic (core domain)
    eligibility.ts        # Engine lọc GV tiềm năng
  types/                  # TypeScript type definitions
prisma/
  schema.prisma           # Database schema
  migrations/             # Prisma migrations
tests/
  e2e/                    # Playwright E2E tests (*.spec.ts)
docs/
  user/USER_GUIDE.md
  technical/              # ARCHITECTURE.md, DECISIONS.md, API.md, DATABASE.md
.claude/agents/           # Specialist agent definitions
.tasks/                   # Detailed task files
```

---

## Git Conventions

### Commit Format
```
<type>(<scope>): <short description>

[optional body]
[optional footer: Closes #issue]
```

**Types**: `feat` · `fix` · `docs` · `style` · `refactor` · `test` · `chore` · `perf` · `ci`

Examples:
```
feat(skkn): implement auto-consume logic for CSTĐ Cách 2
fix(eligibility): handle edge case when GV has 0 SKKN
feat(admin): add teacher potential filter page
```

### Branch Naming
```
feature/<ticket-id>-short-description
fix/<ticket-id>-short-description
chore/<description>
docs/<description>
```

---

## Code Style

- **Language**: TypeScript (strict mode)
- **Formatter**: Prettier — config in `.prettierrc`
- **Linter**: ESLint — config in `.eslintrc`
- **Import style**: absolute imports từ `src/` (`@/components/...`)
- **No `console.log`** in production code — dùng logger utility
- **No commented-out code** committed

---

## Testing Conventions

- **Unit tests**: Vitest — colocated `*.test.ts` — đặc biệt quan trọng cho `skkn.ts` và `eligibility.ts`
- **E2E tests**: Playwright — in `tests/e2e/*.spec.ts`
- **Run unit**: `npm test`
- **Run E2E**: `npm run test:e2e`
- **Coverage target**: 80% — bắt buộc 100% cho SKKN tiêu logic

---

## Environment & Commands

- **Node**: 20.x (xem `.nvmrc`)
- **Package manager**: npm
- `npm run dev` — start dev server (port 3000)
- `npm run build` — production build
- `npm test` — unit tests (Vitest)
- `npm run test:e2e` — E2E tests (Playwright)
- `npm run lint` — ESLint check
- `npm run typecheck` — TypeScript check
- `npx prisma migrate dev` — run migrations (dùng DIRECT_URL cho Supabase)
- `npx prisma studio` — DB GUI

---

## Key Documentation

@docs/technical/ARCHITECTURE.md
@docs/technical/DECISIONS.md
@docs/technical/API.md
@docs/technical/DATABASE.md
@docs/user/USER_GUIDE.md
