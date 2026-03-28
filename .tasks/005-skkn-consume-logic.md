---
id: "005"
title: "Logic SKKN tiêu: rule-driven consume engine"
status: "todo"
area: "backend"
agent: "@backend-developer"
priority: "high"
created_at: "2026-03-28"
prd_refs: ["FR-023", "FR-026", "FR-028"]
blocks: ["006", "008"]
blocked_by: ["001", "002"]
---

## Description

Đây là logic cốt lõi của toàn ứng dụng. Phải đúng 100% — sai ở đây có thể dẫn đến vi phạm quy định thi đua.

**Quyết định quan trọng (2026-03-28)**: Số lượng SKKN tiêu và điều kiện năm KHÔNG hardcode. Tất cả do Admin cấu hình trong EligibilityRule. Code chỉ đọc rule và thực thi — không có logic riêng cho "Bằng khen TP" hay "CSTĐ Cách 2".

Cơ chế tiêu SKKN:
- Khi GV lưu thành tích có rule liên kết với `consumeAfterEval: true`
- Hệ thống đọc rule → xác định số lượng và điều kiện SKKN cần chọn → GV chọn → tiêu

## Acceptance Criteria

- [ ] Hàm `consumeSKKN(skknId, reason, year, tx)` — tiêu 1 SKKN trong transaction
- [ ] Hàm `getEligibleSKKNToConsume(teacherId, condition, referenceYear)` — trả về SKKN đủ điều kiện để GV chọn (filter theo rule: status, yearConstraint)
- [ ] Hàm `executeConsume(skknIds[], ruleName, referenceYear, tx)` — validate rồi tiêu hàng loạt
- [ ] SKKN đã tiêu không thể tiêu lại — throw error rõ ràng với thông tin "đã xét danh hiệu X năm Y"
- [ ] Unit tests bao phủ 100% cho `src/lib/skkn.ts`:
  - [ ] Tiêu SKKN thành công
  - [ ] Từ chối SKKN đã tiêu rồi
  - [ ] Từ chối SKKN không thuộc GV này
  - [ ] Từ chối SKKN vi phạm ràng buộc năm của rule
  - [ ] Từ chối khi số SKKN chọn < minCount trong rule
- [ ] Tất cả thao tác tiêu SKKN dùng Prisma transaction

## Technical Notes

```ts
// src/lib/skkn.ts

export async function consumeSKKN(
  skknId: string,
  reason: string,    // tên danh hiệu, e.g. "Bằng khen UBND TP"
  usedYear: string,  // năm học, e.g. "2024-2025"
  tx: PrismaTransaction
): Promise<void> {
  const skkn = await tx.sKKN.findUniqueOrThrow({ where: { id: skknId } })
  if (skkn.status === 'USED') {
    throw new Error(`SKKN "${skkn.title}" đã được dùng để xét ${skkn.usedFor} năm ${skkn.usedYear}`)
  }
  await tx.sKKN.update({
    where: { id: skknId },
    data: { status: 'USED', usedFor: reason, usedYear: usedYear }
  })
}
```

**Parse năm học**: `"2024-2025"` → startYear=2024, endYear=2025. Hàm `parseAcademicYear(s)` và `prevAcademicYear(s)` dùng chung toàn app.

**yearConstraint trong rule**:
```ts
type YearConstraint =
  | { type: 'CURRENT_YEAR' }
  | { type: 'WITHIN_N_YEARS'; n: number }  // năm hiện tại và n-1 năm liền trước
  | { type: 'ANY' }
```

## History

| Date | Agent / Human | Event |
|------|--------------|-------|
| 2026-03-28 | human | Task created |
| 2026-03-28 | human | Cập nhật: logic không hardcode, do rule config (theo quyết định câu 4) |
