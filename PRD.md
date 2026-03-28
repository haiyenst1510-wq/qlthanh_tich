# Product Requirements Document

> [!WARNING]
> **READ-ONLY FOR ALL AGENTS**
> This document is the source of truth for what we are building.
> Claude agents must READ this document to understand requirements.
> **Do not edit, rewrite, or "update to reflect current state" without explicit human instruction.**
> When in doubt, leave it unchanged and ask the human.

---

**Version**: 1.0
**Status**: Draft
**Last updated by human**: 2026-03-28
**Product owner**: Admin trường

---

## 1. Executive Summary

Ứng dụng web nội bộ giúp một trường học quản lý thành tích thi đua của giáo viên theo từng năm học. Giáo viên tự nhập thành tích cá nhân; Admin quản lý toàn bộ, cấu hình quy tắc xét danh hiệu, lọc giáo viên tiềm năng, và xuất báo cáo. Tính năng đặc trưng là hệ thống theo dõi "SKKN đã tiêu" — mỗi sáng kiến kinh nghiệm chỉ được sử dụng một lần để xét một danh hiệu cụ thể, đảm bảo đúng quy định pháp luật thi đua khen thưởng.

---

## 2. Problem Statement

### 2.1 Current Situation

Hiện tại nhà trường theo dõi thành tích giáo viên thủ công bằng Excel hoặc sổ sách. Cuối năm học, Ban giám hiệu phải tổng hợp thủ công để xét danh hiệu và đề xuất khen thưởng. Việc kiểm tra SKKN nào đã dùng, năm nào, cho danh hiệu gì hoàn toàn dựa vào trí nhớ hoặc ghi chép rời rạc.

### 2.2 The Problem

- Không có nguồn dữ liệu tập trung: thành tích nằm rải rác ở nhiều chỗ
- Sai sót trong xét SKKN: dùng nhầm SKKN đã tiêu, vi phạm quy định NĐ 98/2023
- Tốn thời gian tổng hợp: Admin mất nhiều giờ để lọc GV đủ điều kiện danh hiệu
- Không truy vết được: không biết SKKN nào đã xét danh hiệu gì, năm nào

### 2.3 Why Now

Quy định thi đua khen thưởng ngày càng chặt chẽ (NĐ 98/2023). Trường cần hệ thống số hóa để đảm bảo minh bạch và đúng quy trình trong mùa bình xét thi đua.

---

## 3. Goals & Success Metrics

### 3.1 Business Goals

- Số hóa toàn bộ hồ sơ thành tích GV, loại bỏ Excel thủ công
- Không để xảy ra sai sót SKKN bị tiêu nhầm/dùng hai lần
- Admin lọc được GV tiềm năng theo bất kỳ danh hiệu nào trong < 1 phút
- Xuất được báo cáo tổng hợp khi cần

### 3.2 Success Metrics

| Metric | Baseline | Target | How Measured |
|--------|----------|--------|--------------|
| GV tự nhập thành tích đúng quy trình | 0% | 100% | Không có SKKN tiêu sai |
| Thời gian Admin lọc GV tiềm năng | 2-3 giờ thủ công | < 1 phút | Thực đo |
| Sai sót SKKN dùng 2 lần | Thường xuyên | 0 | Audit log |

---

## 4. User Personas

### Persona: Admin (Ban giám hiệu / Văn phòng)

- **Role**: Quản trị hệ thống, quản lý GV, xét duyệt thi đua
- **Goals**: Có cái nhìn tổng thể về thành tích toàn trường; lọc nhanh GV đủ điều kiện danh hiệu; xuất báo cáo cho Phòng/Sở
- **Pain points**: Tổng hợp thủ công mất thời gian; dễ nhầm SKKN đã tiêu; không có lịch sử truy vết
- **Technical level**: Moderate (dùng Excel thành thạo)
- **Usage frequency**: Weekly (thường xuyên trong mùa bình xét cuối năm)

### Persona: Giáo viên

- **Role**: Nhân viên trường, người nhập thành tích của chính mình
- **Goals**: Nhập thành tích nhanh chóng; biết mình còn bao nhiêu SKKN chưa dùng; xem lại lịch sử thành tích
- **Pain points**: Không biết SKKN nào còn/đã dùng; quy trình nhập trước đây rắc rối
- **Technical level**: Non-technical đến Moderate
- **Usage frequency**: Occasional (cuối mỗi năm học)

---

## 5. Functional Requirements

### 5.1 Authentication & Phân quyền

- **FR-001**: Admin đăng nhập bằng email + mật khẩu
- **FR-002**: Giáo viên đăng nhập bằng email + mật khẩu (do Admin tạo)
- **FR-003**: GV không thể tự đăng ký tài khoản — chỉ Admin tạo
- **FR-004**: Session hết hạn sau 8 giờ không hoạt động
- **FR-005**: Admin truy cập được tất cả route `/admin/*`; GV chỉ truy cập `/teacher/*`

### 5.2 Hồ sơ Giáo viên (Module 1)

- **FR-010**: Admin tạo tài khoản GV với: họ tên, ngày sinh, tổ chuyên môn, năm vào nghề, email, mật khẩu tạm
- **FR-011**: Admin xem, sửa, vô hiệu hóa tài khoản GV
- **FR-012**: Hồ sơ GV có trường "Là đảng viên": có/không; nếu có thì có thêm trường ngày kết nạp
- **FR-013**: GV xem hồ sơ cá nhân của mình; chỉ Admin mới sửa được thông tin hồ sơ

### 5.3 Nhập Thành tích theo Năm học (Module 2)

- **FR-020**: GV chọn năm học (dropdown) để nhập thành tích cho năm đó
- **FR-021**: Mỗi năm học GV nhập Kết quả nhiệm vụ: "Hoàn thành tốt" hoặc "Hoàn thành xuất sắc"
- **FR-022**: GV nhập Danh hiệu thi đua — chọn từ: Chiến sĩ thi đua cơ sở, GV Giỏi (cấp), GV Chủ nhiệm giỏi (cấp)
- **FR-023**: Khi chọn CSTĐ cơ sở, GV chọn cách đạt:
  - Cách 1: HTXS (không tiêu SKKN)
  - Cách 2: HTTốt + chọn 1 SKKN từ danh sách SKKN chưa dùng → SKKN đó tự động bị tiêu (ghi `usedFor: "CSTĐ cơ sở"`, `usedYear: năm học đó`)
- **FR-024**: GV Giỏi và GV Chủ nhiệm giỏi có thêm trường cấp: Cấp trường / Cấp phường / Cấp thành phố
- **FR-025**: GV nhập SKKN: tên, cấp (trường/phường/TP), xếp loại; có thể nhập nhiều SKKN một năm
- **FR-026**: Trạng thái SKKN hiển thị tự động: "Chưa dùng" hoặc "Đã dùng — xét [danh hiệu] năm [X]"
- **FR-027**: GV nhập Khen thưởng: loại (Giấy khen / Bằng khen), cấp ban hành, nội dung, năm nhận
- **FR-028**: Khi nhập một khen thưởng có rule yêu cầu tiêu SKKN (ví dụ Bằng khen UBND TP), hệ thống đọc EligibilityRule tương ứng và yêu cầu GV chọn đúng số lượng SKKN theo cấu hình của Admin (số lượng, ràng buộc năm, trạng thái) → các SKKN được chọn tự động bị tiêu. Số lượng và điều kiện không hardcode mà do Admin cấu hình.
- **FR-029**: Trường xếp loại Đảng viên chỉ hiển thị nếu GV là đảng viên; giá trị: "HT tốt nhiệm vụ" hoặc "HTXS nhiệm vụ"

### 5.4 Cấu hình Quy tắc Xét duyệt (Module 3 — Admin only)

- **FR-030**: Admin tạo/sửa/xóa "Danh hiệu đích" (ví dụ: Bằng khen UBND TP, CSTĐ cơ sở...)
- **FR-031**: Mỗi danh hiệu đích có danh sách điều kiện; mỗi điều kiện gồm:
  - Loại thành tích cần có: SKKN / CSTĐ / GV Giỏi / Bằng khen / ...
  - Số lượng tối thiểu (integer ≥ 1)
  - Trạng thái yêu cầu: "Chưa dùng" hoặc "Bất kỳ"
  - Ràng buộc năm: "Trong năm hiện tại" / "Trong N năm liền kề" / "Không giới hạn"
  - Có bị tiêu sau khi xét: true/false
  - Ghi chú luật (text tự do, ví dụ: "Điều 8 NĐ 98/2023")
- **FR-032**: Admin có thể preview rule bằng cách chạy thử trên một GV cụ thể

### 5.5 Lọc GV Tiềm năng (Module 4 — Admin only)

- **FR-040**: Admin chọn danh hiệu đích → hệ thống quét toàn bộ GV theo rule đã cấu hình
- **FR-041**: Kết quả hiển thị từng GV: ĐỦ điều kiện (✅) hoặc THIẾU điều kiện (❌) kèm chi tiết từng điều kiện
- **FR-042**: Với GV ĐỦ điều kiện: liệt kê cụ thể các thành tích/SKKN sẽ bị tiêu nếu xét
- **FR-043**: Admin có thể lọc kết quả: chỉ xem GV đủ điều kiện / tất cả
- **FR-044**: Xuất kết quả lọc ra file Excel (.xlsx)

### 5.6 Thống kê & Báo cáo (Admin only)

- **FR-050**: Dashboard thống kê: tổng GV, số GV theo danh hiệu từng năm, phân bổ theo tổ chuyên môn
- **FR-051**: Xuất danh sách thành tích GV (toàn trường hoặc từng năm học) ra Excel
- **FR-052**: Admin xem và sửa thành tích của bất kỳ GV nào

---

## 6. Non-Functional Requirements

### Performance
- API response time < 300ms ở p95 cho query thông thường
- Engine lọc tiềm năng < 5s cho trường có tối đa 100 GV

### Security
- Tất cả API endpoint yêu cầu authentication
- Password hash bằng bcrypt (cost factor ≥ 12)
- OWASP Top 10 cơ bản: SQL injection prevention (Prisma ORM), XSS prevention (React)
- Không log thông tin nhạy cảm (password, session token)

### Scalability
- Thiết kế cho 1 trường, tối đa 200 giáo viên — không cần multi-tenant

### Accessibility
- Dùng được trên máy tính bàn và laptop (desktop-first)
- Font đủ lớn cho người lớn tuổi (minimum 14px)

### Browser Support
- Chrome 110+, Firefox 110+, Edge 110+
- Không yêu cầu mobile responsive (ứng dụng nội bộ, dùng trên máy tính)

### Reliability
- Data không bao giờ bị xóa vĩnh viễn (soft delete cho GV)
- Database backup hàng ngày (do hosting provider)

---

## 7. Out of Scope (v1.0)

- **Đa trường (multi-tenant)** — v1 chỉ phục vụ 1 trường
- **GV tự đăng ký** — Admin tạo tài khoản thủ công
- **Thông báo email** — không gửi email tự động
- **Mobile app** — chỉ web desktop
- **Tích hợp với hệ thống Sở/Phòng GD** — xuất file thủ công là đủ
- **Workflow phê duyệt** — GV nhập, Admin xem, không có luồng approve/reject
- **Audit log chi tiết** — chỉ lưu trạng thái SKKN, không log mọi thao tác

---

## 8. Open Questions

| # | Question | Owner | Status | Decision |
|---|----------|-------|--------|----------|
| 1 | Hosting: Railway hay tự host trên VPS nhà trường? | Admin trường | **Closed** | Vercel (deploy) + Supabase (PostgreSQL) + Cloudinary (file storage) |
| 2 | Năm học bắt đầu từ năm nào cần nhập lại dữ liệu cũ? | Admin trường | **Closed** | Cho phép nhập thành tích cho bất kỳ năm học nào trong quá khứ — không giới hạn |
| 3 | Có cần import dữ liệu GV từ Excel hiện tại không? | Admin trường | **Closed** | Không — Admin tự tạo tài khoản GV thủ công |
| 4 | Bằng khen UBND TP có phải luôn tiêu đúng 2 SKKN hay có ngoại lệ? | Admin trường | **Closed** | Số lượng SKKN tiêu và điều kiện năm do Admin cấu hình trong EligibilityRule — không hardcode |

---

## 9. Revision History

> Human entries only. Agents do not modify this section.

| Date | Author | Change Description |
|------|--------|--------------------|
| 2026-03-28 | Human | Initial draft từ spec do người dùng cung cấp |
| 2026-03-28 | Human | Đóng 4 câu hỏi mở: hosting→Supabase+Vercel, năm học→không giới hạn, tài khoản→Admin tạo thủ công, SKKN tiêu→do Admin config. Cập nhật FR-028: số lượng SKKN tiêu do rule config, không hardcode. |
