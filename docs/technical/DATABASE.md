# Database Schema — Quản lý Thành tích Giáo viên

> Stack: Prisma ORM + Supabase PostgreSQL
> Schema file: `prisma/schema.prisma`
> Last updated: 2026-03-28

---

## Tổng quan

Hệ thống dùng **PostgreSQL** (host trên Supabase) với **Prisma ORM** làm single source of truth cho schema. Prisma Client tự sinh type-safe query từ `schema.prisma`. Tất cả quy tắc xét duyệt danh hiệu được lưu dưới dạng JSON rule (xem mục EligibilityRule) thay vì hardcode — phù hợp với ADR-005 và ADR-007.

---

## ERD (Entity-Relationship Diagram)

```
┌──────────────┐       ┌──────────────────┐
│    User      │ 1───1 │  TeacherProfile  │
│──────────────│       │──────────────────│
│ id (PK)      │       │ id (PK)          │
│ email        │       │ userId (FK,UQ)   │
│ passwordHash │       │ fullName         │
│ role         │       │ dateOfBirth      │
│ isActive     │       │ department       │
│ createdAt    │       │ teachingSince    │
│ updatedAt    │       │ isPartyMember    │
└──────────────┘       │ partyJoinDate    │
                       └────────┬─────────┘
                                │ 1
                    ┌───────────┼────────────┐
                    │           │            │
                    │ N         │ N          │ N
          ┌─────────▼──┐  ┌────▼────┐  ┌───▼─────┐
          │YearlyRecord│  │  SKKN   │  │  Award  │
          │────────────│  │─────────│  │─────────│
          │ id (PK)    │  │ id (PK) │  │ id (PK) │
          │ teacherId  │  │teacherId│  │teacherId│
          │academicYear│  │ title   │  │ type    │
          │ taskResult │  │ level   │  │issuingLv│
          │ partyRating│  │ rating  │  │ content │
          │ createdAt  │  │academicY│  │ year    │
          │ updatedAt  │  │ status  │  │createdAt│
          └─────┬──────┘  │ usedFor │  └────┬────┘
                │ 1       │ usedYear│       │
                │ N       │createdAt│       │ N
    ┌───────────▼──────┐  └────┬────┘       │
    │ CompetitionTitle │       │ N          │ N
    │──────────────────│       └────────────▼────┐
    │ id (PK)          │              │AwardSKKN │
    │ yearlyRecordId   │              │──────────│
    │ type             │              │ id (PK)  │
    │ level            │              │ awardId  │
    │ achievementMethod│              │ skknId   │
    └──────────────────┘              └──────────┘

┌─────────────────────────────────────────┐
│            EligibilityRule              │
│─────────────────────────────────────────│
│ id (PK)                                 │
│ targetTitle   (tên danh hiệu)           │
│ conditions    (Json — Condition[])      │
│ isActive                                │
│ createdAt                               │
│ updatedAt                               │
└─────────────────────────────────────────┘
(Bảng độc lập — không có foreign key quan hệ)
```

---

## Mô tả các Model

### User

| Field        | Type     | Mô tả                                  |
|-------------|----------|----------------------------------------|
| id          | String   | CUID, primary key                      |
| email       | String   | Unique, dùng để đăng nhập              |
| passwordHash| String   | Bcrypt hash (salt 12)                  |
| role        | Role     | `ADMIN` hoặc `TEACHER`                 |
| isActive    | Boolean  | Soft-disable tài khoản, default true   |
| createdAt   | DateTime | Tự sinh                                |
| updatedAt   | DateTime | Auto-update (`@updatedAt`)             |

Lưu ý: chỉ Admin tạo tài khoản, không có self-registration (ADR-003).

---

### TeacherProfile

| Field         | Type     | Mô tả                                              |
|--------------|----------|----------------------------------------------------|
| id           | String   | CUID, primary key                                  |
| userId       | String   | Unique FK → User (1-1 relation)                    |
| fullName     | String   | Họ tên đầy đủ                                      |
| dateOfBirth  | DateTime | Ngày sinh (nullable)                               |
| department   | String   | Tổ chuyên môn, ví dụ "Tổ Toán - Tin"              |
| teachingSince| Int      | Năm vào nghề, ví dụ `2010`                         |
| isPartyMember| Boolean  | Có phải đảng viên không, default false             |
| partyJoinDate| DateTime | Nullable — chỉ set khi `isPartyMember = true`      |

---

### YearlyRecord

| Field        | Type       | Mô tả                                              |
|-------------|------------|----------------------------------------------------|
| id          | String     | CUID, primary key                                  |
| teacherId   | String     | FK → TeacherProfile                                |
| academicYear| String     | Format cố định `"2024-2025"`                       |
| taskResult  | TaskResult | `GOOD` hoặc `EXCELLENT` (HTTốt / HTXS)            |
| partyRating | PartyRating| `GOOD`, `EXCELLENT`, hoặc null (không phải đảng viên) |
| createdAt   | DateTime   | Tự sinh                                            |
| updatedAt   | DateTime   | Auto-update                                        |

Constraint: `@@unique([teacherId, academicYear])` — mỗi GV chỉ có 1 record/năm.

---

### CompetitionTitle

| Field             | Type                | Mô tả                                          |
|------------------|---------------------|------------------------------------------------|
| id               | String              | CUID                                           |
| yearlyRecordId   | String              | FK → YearlyRecord                              |
| type             | CompetitionTitleType| `CHIEN_SI_THI_DUA`, `GV_GIOI`, `GV_CN_GIOI`  |
| level            | TitleLevel          | `SCHOOL`, `DISTRICT`, `CITY` — nullable với CSTĐ |
| achievementMethod| AchievementMethod   | `METHOD_1`, `METHOD_2` — chỉ dùng với CSTĐ   |

---

### SKKN

| Field        | Type      | Mô tả                                              |
|-------------|------------|-----------------------------------------------------|
| id          | String    | CUID                                                |
| teacherId   | String    | FK → TeacherProfile                                 |
| title       | String    | Tên sáng kiến                                       |
| level       | SKKNLevel | `SCHOOL`, `DISTRICT`, `CITY`                        |
| rating      | String    | Xếp loại: "Tốt", "Khá", "Xuất sắc", v.v.           |
| academicYear| String    | Năm học SKKN được công nhận, format `"2024-2025"`   |
| status      | SKKNStatus| `UNUSED` (chưa dùng) hoặc `USED` (đã tiêu)         |
| usedFor     | String    | Tên danh hiệu đã dùng SKKN này để xét (nullable)    |
| usedYear    | String    | Năm xét duyệt (nullable)                            |
| createdAt   | DateTime  | Tự sinh                                             |

Index đặc biệt: `@@index([teacherId, status])` — hay query "SKKN chưa dùng của GV X".

---

### Award

| Field        | Type      | Mô tả                                          |
|-------------|-----------|------------------------------------------------|
| id          | String    | CUID                                           |
| teacherId   | String    | FK → TeacherProfile                            |
| type        | AwardType | `CERTIFICATE` (Giấy khen) hoặc `COMMENDATION` (Bằng khen) |
| issuingLevel| String    | Cơ quan khen thưởng: "UBND Thành phố", "BGH Trường", v.v. |
| content     | String    | Nội dung khen thưởng                           |
| year        | String    | Năm khen, format `"2024"`                      |
| createdAt   | DateTime  | Tự sinh                                        |

---

### AwardSKKN (Junction Table)

| Field   | Type   | Mô tả                            |
|--------|--------|----------------------------------|
| id     | String | CUID                             |
| awardId| String | FK → Award                       |
| skknId | String | FK → SKKN                        |

Bảng này ghi lại SKKN nào đã được tiêu (consumed) để xét cho Award nào. Ràng buộc `@@unique([awardId, skknId])` tránh duplicate.

---

### EligibilityRule

| Field       | Type    | Mô tả                                                   |
|------------|---------|----------------------------------------------------------|
| id         | String  | CUID                                                     |
| targetTitle| String  | Tên danh hiệu, ví dụ `"Chiến sĩ thi đua cơ sở"`        |
| conditions | Json    | Mảng `Condition[]` — xem schema chi tiết bên dưới        |
| isActive   | Boolean | Rule có đang được áp dụng không, default true            |
| createdAt  | DateTime| Tự sinh                                                  |
| updatedAt  | DateTime| Auto-update                                              |

---

## Conditions JSON Schema

Mỗi `EligibilityRule` chứa một mảng `Condition[]`. Eligibility engine trong `src/lib/eligibility.ts` đọc mảng này và đánh giá từng điều kiện lần lượt.

### TypeScript Type

```typescript
type YearConstraint =
  | { type: 'CURRENT_YEAR' }                   // Chỉ năm hiện tại đang xét
  | { type: 'WITHIN_N_YEARS'; n: number }      // Trong n năm học gần nhất
  | { type: 'ANY' }                            // Bất kỳ năm nào

type Condition = {
  type: 'SKKN' | 'COMPETITION_TITLE' | 'AWARD' | 'TASK_RESULT'
  minCount: number             // Số lượng tối thiểu cần đáp ứng
  statusRequired: 'UNUSED' | 'ANY'  // Chỉ xét SKKN chưa dùng, hay bất kỳ
  yearConstraint: YearConstraint
  consumeAfterEval: boolean    // Sau khi xét, có đánh dấu SKKN là USED không
  legalNote?: string           // Ghi chú căn cứ pháp lý (tùy chọn)
}
```

### Ví dụ 1: Chiến sĩ thi đua cơ sở — Cách 2

Điều kiện: HTTốt hoặc HTXS trong năm xét, và có ít nhất 1 SKKN chưa dùng trong 2 năm học gần nhất.

```json
[
  {
    "type": "TASK_RESULT",
    "minCount": 1,
    "statusRequired": "ANY",
    "yearConstraint": { "type": "CURRENT_YEAR" },
    "consumeAfterEval": false,
    "legalNote": "Hoàn thành tốt nhiệm vụ (GOOD hoặc EXCELLENT) trong năm xét"
  },
  {
    "type": "SKKN",
    "minCount": 1,
    "statusRequired": "UNUSED",
    "yearConstraint": { "type": "WITHIN_N_YEARS", "n": 2 },
    "consumeAfterEval": true,
    "legalNote": "Cách 2: Có 1 SKKN cấp trường trở lên chưa sử dụng trong 2 năm học gần nhất. Căn cứ: Nghị định 91/2017/NĐ-CP Điều 25"
  }
]
```

### Ví dụ 2: Bằng khen UBND Thành phố

Điều kiện: Đạt CSTĐCS hoặc GV Giỏi ít nhất 2 năm liền kề, và có 2 SKKN chưa dùng trong 2 năm đó. SKKN bị tiêu sau khi xét.

```json
[
  {
    "type": "SKKN",
    "minCount": 2,
    "statusRequired": "UNUSED",
    "yearConstraint": { "type": "WITHIN_N_YEARS", "n": 2 },
    "consumeAfterEval": true,
    "legalNote": "Phải có 2 SKKN cấp trường trở lên chưa sử dụng trong 2 năm học liền kề. Căn cứ: Nghị định 91/2017/NĐ-CP Điều 72, Thông tư 12/2019/TT-BNV"
  },
  {
    "type": "COMPETITION_TITLE",
    "minCount": 2,
    "statusRequired": "ANY",
    "yearConstraint": { "type": "WITHIN_N_YEARS", "n": 2 },
    "consumeAfterEval": false,
    "legalNote": "Đạt danh hiệu CSTĐCS hoặc GV Giỏi ít nhất 2 năm trong 2 năm liền kề"
  }
]
```

### Lưu ý khi thêm rule mới

1. Validate bằng Zod schema trước khi lưu DB (xem `src/lib/validators/eligibility-rule.ts`)
2. `consumeAfterEval: true` chỉ áp dụng cho `type: 'SKKN'` — engine bỏ qua flag này với các type khác
3. `statusRequired: 'UNUSED'` chỉ có nghĩa với `type: 'SKKN'` — COMPETITION_TITLE và AWARD không có status

---

## Enums

| Enum                 | Values                                          |
|---------------------|-------------------------------------------------|
| Role                | `ADMIN`, `TEACHER`                              |
| TaskResult          | `GOOD` (HTTốt), `EXCELLENT` (HTXS)             |
| PartyRating         | `GOOD`, `EXCELLENT`                             |
| CompetitionTitleType| `CHIEN_SI_THI_DUA`, `GV_GIOI`, `GV_CN_GIOI`   |
| TitleLevel          | `SCHOOL`, `DISTRICT`, `CITY`                    |
| AchievementMethod   | `METHOD_1`, `METHOD_2`                          |
| SKKNLevel           | `SCHOOL`, `DISTRICT`, `CITY`                    |
| SKKNStatus          | `UNUSED`, `USED`                                |
| AwardType           | `CERTIFICATE` (Giấy khen), `COMMENDATION` (Bằng khen) |

---

## Naming Conventions

| Element            | Convention      | Ví dụ                          |
|-------------------|-----------------|--------------------------------|
| Model fields      | camelCase        | `teacherId`, `academicYear`    |
| Enum names        | PascalCase       | `TaskResult`, `SKKNLevel`      |
| Enum values       | SCREAMING_SNAKE  | `CHIEN_SI_THI_DUA`, `UNUSED`   |
| DB table names    | snake_case       | `teacher_profiles`, `skkns`    |
| JSON keys (cond.) | camelCase        | `minCount`, `yearConstraint`   |

Table names dùng `@@map("snake_case")` trong schema để DB nhất quán dù Prisma model dùng PascalCase.

---

## Index Rationale

| Model          | Index                    | Lý do                                                         |
|---------------|--------------------------|---------------------------------------------------------------|
| User          | `email`                  | Login query — unique lookup thường xuyên                      |
| TeacherProfile| `userId`                 | Join từ User sang TeacherProfile                              |
| YearlyRecord  | `teacherId`              | List tất cả năm học của 1 GV                                  |
| YearlyRecord  | `(teacherId, academicYear)`| Unique constraint (cũng đóng vai trò index)                  |
| SKKN          | `teacherId`              | List SKKN của 1 GV                                            |
| SKKN          | `status`                 | Filter SKKN chưa dùng toàn hệ thống (báo cáo)                |
| SKKN          | `(teacherId, status)`    | Query hay nhất: "SKKN chưa dùng của GV X" — dùng trong engine|
| Award         | `teacherId`              | List khen thưởng của 1 GV                                     |
| Award         | `year`                   | Filter theo năm khen                                          |
| AwardSKKN     | `awardId`, `skknId`      | Lookup 2 chiều trong junction table                           |
| EligibilityRule| `targetTitle`            | Tìm rule theo tên danh hiệu                                   |
| EligibilityRule| `isActive`               | Chỉ load active rules khi chạy engine                         |
| CompetitionTitle| `yearlyRecordId`        | List danh hiệu trong 1 năm học                                |

---

## Migration Workflow

Dự án dùng 2 connection strings theo ADR-002:

```
DATABASE_URL  → pgBouncer (port 6543) — dùng cho runtime queries
DIRECT_URL    → direct (port 5432)    — dùng cho prisma migrate
```

Khi có thay đổi schema:
```bash
# 1. Cập nhật prisma/schema.prisma
# 2. Tạo migration (cần DIRECT_URL)
npx prisma migrate dev --name <tên-migration>

# 3. Deploy lên production
npx prisma migrate deploy

# 4. Seed data (nếu cần)
npx prisma db seed
```

Xem thêm: ADR-004 trong `docs/technical/DECISIONS.md`.

---

## Seed Data

File `prisma/seed.ts` tạo data ban đầu:

| Tài khoản              | Mật khẩu     | Role    |
|-----------------------|--------------|---------|
| admin@school.edu.vn   | Admin@123    | ADMIN   |
| gv1@school.edu.vn     | Teacher@123  | TEACHER |
| gv2@school.edu.vn     | Teacher@123  | TEACHER |

GV1 (Nguyễn Thị Lan) có 3 SKKN mẫu và 2 EligibilityRule mẫu được tạo sẵn.

Để thêm seed vào `package.json`:
```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```
