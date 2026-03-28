---
id: "010"
title: "UI Admin: quản lý GV + xem/sửa thành tích"
status: "todo"
area: "frontend"
agent: "@frontend-developer"
priority: "normal"
created_at: "2026-03-28"
prd_refs: ["FR-010", "FR-011", "FR-012", "FR-052"]
blocks: ["014"]
blocked_by: ["004", "003"]
---

## Description

Trang Admin quản lý danh sách GV và xem/sửa thành tích của bất kỳ GV nào.

## Acceptance Criteria

- [ ] `/admin/teachers` — bảng GV với filter theo tổ chuyên môn, search tên
- [ ] Dialog tạo GV mới: form nhập đầy đủ thông tin + password tạm
- [ ] `/admin/teachers/:id` — xem toàn bộ hồ sơ + thành tích theo từng năm
- [ ] Admin có thể sửa thành tích của GV (dùng lại form từ task #009)
- [ ] Nút vô hiệu hóa tài khoản (hiển thị confirm dialog trước)
- [ ] Nút reset mật khẩu

## History

| Date | Agent / Human | Event |
|------|--------------|-------|
| 2026-03-28 | human | Task created |
