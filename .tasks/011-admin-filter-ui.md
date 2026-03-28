---
id: "011"
title: "UI Admin: trang lọc GV tiềm năng"
status: "todo"
area: "frontend"
agent: "@frontend-developer"
priority: "normal"
created_at: "2026-03-28"
prd_refs: ["FR-040", "FR-041", "FR-042", "FR-043", "FR-044"]
blocks: ["014"]
blocked_by: ["008", "013"]
---

## Description

Trang quan trọng nhất cho Admin: chọn danh hiệu → xem ngay ai đủ điều kiện, ai thiếu gì.

## Acceptance Criteria

- [ ] `/admin/eligibility` — dropdown chọn danh hiệu + chọn năm học xét
- [ ] Bảng kết quả: mỗi hàng là 1 GV, badge ĐỦ (xanh) / THIẾU (đỏ)
- [ ] Expandable row: click vào GV để xem chi tiết từng điều kiện
- [ ] Với GV ĐỦ: liệt kê SKKN/thành tích cụ thể sẽ bị tiêu (highlight màu cam)
- [ ] Filter chỉ xem GV ĐỦ điều kiện
- [ ] Nút xuất Excel — call API export từ task #013

## History

| Date | Agent / Human | Event |
|------|--------------|-------|
| 2026-03-28 | human | Task created |
