---
id: "009"
title: "UI GV: trang hồ sơ + form nhập thành tích"
status: "todo"
area: "frontend"
agent: "@frontend-developer"
priority: "normal"
created_at: "2026-03-28"
prd_refs: ["FR-013", "FR-020", "FR-021", "FR-022", "FR-023", "FR-025", "FR-026", "FR-027", "FR-028", "FR-029"]
blocks: ["014"]
blocked_by: ["006", "004"]
---

## Description

Giao diện phía GV: xem hồ sơ, chọn năm học, nhập thành tích với UX rõ ràng cho người không rành công nghệ.

## Acceptance Criteria

- [ ] `/teacher` — dashboard GV: tóm tắt thành tích năm hiện tại + số SKKN chưa dùng (badge nổi bật)
- [ ] `/teacher/profile` — xem hồ sơ cá nhân (read-only, Admin mới sửa được)
- [ ] `/teacher/years` — danh sách năm học, click vào để nhập/xem thành tích
- [ ] `/teacher/years/:year` — form nhập thành tích với 5 section: Kết quả nhiệm vụ, Danh hiệu, SKKN, Khen thưởng, Xếp loại ĐV
- [ ] CSTĐ Cách 2: dropdown chọn SKKN hiển thị rõ "chưa dùng", sau khi lưu SKKN tự chuyển sang "Đã dùng — xét CSTĐ năm X"
- [ ] Bằng khen TP: dialog bắt buộc chọn 2 SKKN, checkbox multi-select, disable SKKN đã dùng
- [ ] Trường xếp loại ĐV: ẩn hoàn toàn nếu GV không phải đảng viên
- [ ] Dùng `data-testid` cho tất cả interactive elements (cho Playwright)

## History

| Date | Agent / Human | Event |
|------|--------------|-------|
| 2026-03-28 | human | Task created |
