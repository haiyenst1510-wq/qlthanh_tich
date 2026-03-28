---
id: "004"
title: "API CRUD hồ sơ giáo viên (Admin)"
status: "todo"
area: "backend"
agent: "@backend-developer"
priority: "high"
created_at: "2026-03-28"
prd_refs: ["FR-010", "FR-011", "FR-012", "FR-013"]
blocks: ["006", "009", "010"]
blocked_by: ["001", "002", "003"]
---

## Description

API quản lý hồ sơ GV — tạo, xem, sửa, vô hiệu hóa (soft delete). Không có hard delete.

## Acceptance Criteria

- [ ] `GET /api/admin/teachers` — danh sách GV (filter theo tổ, trạng thái)
- [ ] `GET /api/admin/teachers/:id` — chi tiết 1 GV kèm thành tích
- [ ] `POST /api/admin/teachers` — tạo GV mới (tạo cả User + TeacherProfile)
- [ ] `PUT /api/admin/teachers/:id` — cập nhật hồ sơ
- [ ] `PATCH /api/admin/teachers/:id/deactivate` — vô hiệu hóa (soft delete: isActive=false)
- [ ] Trường `isPartyMember` và `partyJoinDate` xử lý đúng: nếu isPartyMember=false thì partyJoinDate phải null
- [ ] Tất cả endpoint yêu cầu role ADMIN
- [ ] Validation đầy đủ với Zod

## History

| Date | Agent / Human | Event |
|------|--------------|-------|
| 2026-03-28 | human | Task created |
