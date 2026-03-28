---
id: "006"
title: "API nhập thành tích theo năm học (GV)"
status: "todo"
area: "backend"
agent: "@backend-developer"
priority: "normal"
created_at: "2026-03-28"
prd_refs: ["FR-020", "FR-021", "FR-022", "FR-023", "FR-024", "FR-025", "FR-026", "FR-027", "FR-028", "FR-029"]
blocks: ["009"]
blocked_by: ["001", "002", "003", "005"]
---

## Description

API cho phép GV nhập và cập nhật thành tích của mình theo từng năm học. Tích hợp với SKKN tiêu logic từ task #005.

## Acceptance Criteria

- [ ] `GET /api/teacher/years` — danh sách năm học và trạng thái nhập liệu
- [ ] `GET /api/teacher/years/:year` — chi tiết thành tích năm đó (bao gồm SKKN với status)
- [ ] `PUT /api/teacher/years/:year/record` — lưu kết quả nhiệm vụ + xếp loại đảng viên
- [ ] `PUT /api/teacher/years/:year/title` — lưu danh hiệu thi đua (tích hợp SKKN tiêu nếu là CSTĐ Cách 2)
- [ ] `POST /api/teacher/skkn` — thêm SKKN mới
- [ ] `DELETE /api/teacher/skkn/:id` — xóa SKKN (chỉ được xóa nếu status UNUSED)
- [ ] `POST /api/teacher/awards` — thêm khen thưởng (tích hợp SKKN tiêu nếu là Bằng khen TP)
- [ ] GV chỉ truy cập được dữ liệu của chính mình (kiểm tra teacherId === session.teacherId)
- [ ] Tất cả mutation trong Prisma transaction

## History

| Date | Agent / Human | Event |
|------|--------------|-------|
| 2026-03-28 | human | Task created |
