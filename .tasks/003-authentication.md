---
id: "003"
title: "Authentication: Admin đăng nhập + Admin tạo tài khoản GV"
status: "todo"
area: "backend"
agent: "@backend-developer"
priority: "high"
created_at: "2026-03-28"
prd_refs: ["FR-001", "FR-002", "FR-003", "FR-004", "FR-005"]
blocks: ["004", "006", "007", "008", "009", "010", "011", "012"]
blocked_by: ["001", "002"]
---

## Description

Triển khai toàn bộ luồng authentication và phân quyền. GV không tự đăng ký — đây là quy tắc bất biến.

## Acceptance Criteria

- [ ] NextAuth.js Credentials provider với bcrypt password hashing (cost 12)
- [ ] Login page tại `/login` — redirect về trang phù hợp sau login (admin→`/admin`, teacher→`/teacher`)
- [ ] Middleware Next.js bảo vệ `/admin/*` (chỉ ADMIN) và `/teacher/*` (chỉ TEACHER)
- [ ] API `POST /api/admin/teachers` — Admin tạo tài khoản GV mới (email + password tạm + thông tin hồ sơ)
- [ ] API `POST /api/admin/teachers/:id/reset-password` — Admin reset mật khẩu GV
- [ ] GV có thể đổi mật khẩu của mình tại `/teacher/settings`
- [ ] Session hết hạn sau 8 giờ không hoạt động (FR-004)
- [ ] Unit tests cho password hashing và session logic

## Technical Notes

NextAuth.js v5 config cơ bản:
```ts
// src/lib/auth.ts
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Credentials({ ... })],
  callbacks: {
    jwt({ token, user }) { if (user) token.role = user.role; return token; },
    session({ session, token }) { session.user.role = token.role; return session; }
  }
})
```

Middleware protect routes:
```ts
// middleware.ts
export default auth((req) => {
  const isAdmin = req.nextUrl.pathname.startsWith('/admin')
  if (isAdmin && req.auth?.user.role !== 'ADMIN') redirect('/login')
})
```

## History

| Date | Agent / Human | Event |
|------|--------------|-------|
| 2026-03-28 | human | Task created |
