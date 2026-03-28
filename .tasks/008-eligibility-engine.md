---
id: "008"
title: "Engine lọc GV tiềm năng theo danh hiệu"
status: "todo"
area: "backend"
agent: "@backend-developer"
priority: "normal"
created_at: "2026-03-28"
prd_refs: ["FR-040", "FR-041", "FR-042", "FR-043"]
blocks: ["011"]
blocked_by: ["005", "007"]
---

## Description

Engine đọc EligibilityRule đã cấu hình, quét toàn bộ GV, và trả về kết quả chi tiết: GV nào đủ, GV nào thiếu điều kiện gì, và nếu đủ thì những SKKN nào sẽ bị tiêu.

Engine này KHÔNG tiêu SKKN thật — chỉ là dry-run/preview. Tiêu SKKN thật chỉ xảy ra khi Admin xác nhận.

## Acceptance Criteria

- [ ] Hàm `checkEligibility(teacherId, ruleId, referenceYear)` trong `src/lib/eligibility.ts`
- [ ] API `GET /api/admin/eligibility?ruleId=X&year=2024-2025` — trả về kết quả cho tất cả GV
- [ ] Kết quả mỗi GV: `{ teacherId, name, eligible: boolean, details: ConditionResult[] }`
- [ ] Mỗi `ConditionResult`: `{ conditionIndex, met: boolean, found: Item[], needed: number, willConsume: Item[] }`
- [ ] Performance: < 5s cho 200 GV (dùng batch query, không N+1)
- [ ] Unit tests cho engine: đủ điều kiện, thiếu SKKN, SKKN đúng loại nhưng đã tiêu, ràng buộc năm

## Technical Notes

Đọc `EligibilityRule.conditions` (JSON array), với mỗi điều kiện:
1. Xác định loại thành tích cần có (SKKN, CSTĐ, Bằng khen...)
2. Lấy dữ liệu GV phù hợp điều kiện năm
3. Filter theo statusRequired (UNUSED/bất kỳ)
4. So sánh count với minCount
5. Ghi chú items sẽ bị tiêu nếu `consumeAfterEval: true`

Dùng `Promise.all` để query song song cho nhiều GV, nhưng batch tối đa 20 GV/lần để tránh quá tải DB.

## History

| Date | Agent / Human | Event |
|------|--------------|-------|
| 2026-03-28 | human | Task created |
