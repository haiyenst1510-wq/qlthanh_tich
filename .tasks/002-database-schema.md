---
id: "002"
title: "Database schema: GV, thành tích, SKKN, khen thưởng, quy tắc"
status: "todo"
area: "database"
agent: "@database-expert"
priority: "high"
created_at: "2026-03-28"
prd_refs: ["FR-010", "FR-011", "FR-012", "FR-020", "FR-021", "FR-022", "FR-023", "FR-025", "FR-026", "FR-027", "FR-028", "FR-030", "FR-031"]
blocks: ["003", "004", "005", "006", "007", "008"]
blocked_by: ["001"]
---

## Description

Thiết kế và viết Prisma schema cho toàn bộ domain. Đây là quyết định quan trọng nhất vì logic SKKN tiêu phụ thuộc hoàn toàn vào schema.

## Acceptance Criteria

- [ ] Model `User` (id, email, passwordHash, role: ADMIN|TEACHER, isActive)
- [ ] Model `TeacherProfile` (1-1 với User: fullName, dateOfBirth, department, teachingSince, isPartyMember, partyJoinDate?)
- [ ] Model `AcademicYear` (id, label: "2024-2025") — lookup table
- [ ] Model `YearlyRecord` (GV × năm học: taskResult: GOOD|EXCELLENT, partyRating?)
- [ ] Model `CompetitionTitle` (loại danh hiệu thi đua, cấp, năm học, liên kết YearlyRecord)
- [ ] Model `SKKN` (id, teacherId, title, level: SCHOOL|DISTRICT|CITY, rating, academicYear, status: UNUSED|USED, usedFor?, usedYear?, usedInRecordId?)
- [ ] Model `Award` (id, teacherId, type: CERTIFICATE|COMMENDATION, issuingLevel, content, year, linkedSkknIds[])
- [ ] Model `EligibilityRule` (id, targetTitle, conditions: JSON)
- [ ] Indexes: teacherId trên SKKN/Award, (teacherId, academicYear) trên YearlyRecord
- [ ] Migration chạy thành công: `npx prisma migrate dev`
- [ ] Seed script tạo 1 Admin account + vài GV mẫu
- [ ] `docs/technical/DATABASE.md` được cập nhật với ERD text

## Technical Notes

**SKKN tiêu logic** — trường quan trọng nhất:
```prisma
model SKKN {
  id          String   @id @default(cuid())
  teacherId   String
  title       String
  level       SKKNLevel  // SCHOOL | DISTRICT | CITY
  rating      String
  academicYear String   // format: "2024-2025"
  status      SKKNStatus @default(UNUSED)  // UNUSED | USED
  usedFor     String?  // tên danh hiệu đã xét, ví dụ "CSTĐ cơ sở"
  usedYear    String?  // năm học đã xét, ví dụ "2024-2025"
  // ...
}
```

**Conditions JSON trong EligibilityRule** — dùng JSON thay vì normalize để dễ extend:
```json
{
  "conditions": [
    {
      "type": "SKKN",
      "minCount": 2,
      "statusRequired": "UNUSED",
      "yearConstraint": { "type": "WITHIN_N_YEARS", "n": 2 },
      "consumeAfterEval": true,
      "legalNote": "Điều 8 NĐ 98/2023"
    }
  ]
}
```

## History

| Date | Agent / Human | Event |
|------|--------------|-------|
| 2026-03-28 | human | Task created |
