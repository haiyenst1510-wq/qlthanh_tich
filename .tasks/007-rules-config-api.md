---
id: "007"
title: "API cấu hình quy tắc xét duyệt danh hiệu (Admin)"
status: "todo"
area: "backend"
agent: "@backend-developer"
priority: "normal"
created_at: "2026-03-28"
prd_refs: ["FR-030", "FR-031", "FR-032"]
blocks: ["008", "011", "012"]
blocked_by: ["001", "002", "003"]
---

## Description

API cho Admin tạo/sửa/xóa bộ quy tắc xét danh hiệu. Mỗi quy tắc là JSON conditions array.

## Acceptance Criteria

- [ ] `GET /api/admin/rules` — danh sách tất cả rules
- [ ] `POST /api/admin/rules` — tạo rule mới với conditions
- [ ] `PUT /api/admin/rules/:id` — cập nhật rule
- [ ] `DELETE /api/admin/rules/:id` — xóa rule (chỉ được xóa nếu chưa từng dùng trong eligibility check)
- [ ] `POST /api/admin/rules/:id/preview?teacherId=X` — chạy thử rule trên 1 GV cụ thể (FR-032)
- [ ] Validate JSON conditions schema trước khi lưu (dùng Zod)
- [ ] Seed sẵn 2 rules mẫu: "CSTĐ cơ sở" và "Bằng khen UBND TP" theo đúng spec

## History

| Date | Agent / Human | Event |
|------|--------------|-------|
| 2026-03-28 | human | Task created |
