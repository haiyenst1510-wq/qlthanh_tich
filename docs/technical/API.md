# API Reference — Quản lý Thành tích Giáo viên

> Base path: `/api`
> All requests/responses use `Content-Type: application/json`.
> Authentication uses NextAuth.js v5 JWT sessions (cookie-based).

---

## Authentication

### Session structure

```json
{
  "user": {
    "id": "cuid",
    "email": "string",
    "role": "ADMIN | TEACHER"
  }
}
```

### Security rules

- **`/api/admin/*`** — requires `session.user.role === 'ADMIN'`. Returns `401` if no session, `403` if wrong role.
- **`/api/teacher/*`** — requires any authenticated session. Returns `401` if not authenticated.
- `passwordHash` is **never** returned in any response.

---

## Admin — Teacher Management

### `GET /api/admin/teachers`

List all teachers with their profiles.

**Query parameters**

| Name         | Type    | Description                        |
|--------------|---------|------------------------------------|
| `department` | string  | Filter by department name          |
| `active`     | boolean | Filter by active status (`true`/`false`) |

**Response 200**

```json
[
  {
    "id": "cuid",
    "email": "string",
    "role": "TEACHER",
    "isActive": true,
    "createdAt": "ISO datetime",
    "updatedAt": "ISO datetime",
    "teacherProfile": {
      "id": "cuid",
      "userId": "cuid",
      "fullName": "string",
      "dateOfBirth": "ISO datetime | null",
      "department": "string",
      "teachingSince": 2010,
      "isPartyMember": false,
      "partyJoinDate": "ISO datetime | null"
    }
  }
]
```

---

### `POST /api/admin/teachers`

Create a new teacher account and profile in a single transaction.

**Request body**

```json
{
  "email": "teacher@school.edu.vn",
  "password": "min8chars",
  "fullName": "Nguyễn Văn A",
  "dateOfBirth": "1985-06-15",
  "department": "Toán",
  "teachingSince": 2010,
  "isPartyMember": true,
  "partyJoinDate": "2015-03-01"
}
```

| Field           | Type            | Required | Notes                                    |
|-----------------|-----------------|----------|------------------------------------------|
| `email`         | string (email)  | Yes      | Must be unique                           |
| `password`      | string          | Yes      | Min 8 characters; hashed with bcrypt 12 |
| `fullName`      | string          | Yes      | Min 2 characters                         |
| `dateOfBirth`   | string (ISO)    | Yes      | ISO date string                          |
| `department`    | string          | Yes      | Tổ chuyên môn                            |
| `teachingSince` | integer         | Yes      | Year, 1970–current year                  |
| `isPartyMember` | boolean         | Yes      |                                          |
| `partyJoinDate` | string (ISO)?   | No       | Required only when `isPartyMember=true`  |

**Response 201** — created teacher object (same shape as GET list item)

**Error responses**

| Status | Reason                     |
|--------|----------------------------|
| 401    | Not authenticated          |
| 403    | Not admin                  |
| 409    | Email already in use       |
| 422    | Validation failed          |

---

### `GET /api/admin/teachers/[id]`

Get a single teacher with full profile.

**Response 200** — single teacher object
**Response 404** — teacher not found

---

### `PUT /api/admin/teachers/[id]`

Update teacher profile fields. **Email and password cannot be changed via this endpoint.**

**Request body** (all fields optional)

```json
{
  "fullName": "string",
  "dateOfBirth": "ISO date string",
  "department": "string",
  "teachingSince": 2012,
  "isPartyMember": true,
  "partyJoinDate": "ISO date string | null"
}
```

**Response 200** — updated teacher object
**Response 404** — teacher not found
**Response 422** — validation failed

---

### `PATCH /api/admin/teachers/[id]`

Soft-delete (deactivate) a teacher account.

**Request body**

```json
{ "action": "deactivate" }
```

Sets `isActive = false` on the user. The teacher cannot log in while deactivated.

**Response 200** — updated teacher object with `isActive: false`
**Response 400** — unknown action
**Response 404** — teacher not found

---

### `POST /api/admin/teachers/[id]/reset-password`

Admin resets a teacher's password to a new value.

**Request body**

```json
{ "newPassword": "newmin8chars" }
```

| Field         | Type   | Required | Notes            |
|---------------|--------|----------|------------------|
| `newPassword` | string | Yes      | Min 8 characters |

**Response 200**

```json
{ "message": "Password reset successfully" }
```

**Error responses**

| Status | Reason                |
|--------|-----------------------|
| 401    | Not authenticated     |
| 403    | Not admin             |
| 404    | Teacher not found     |
| 422    | Validation failed     |

---

## Teacher — Self-service

### `POST /api/teacher/change-password`

Authenticated teacher changes their own password.

**Request body**

```json
{
  "currentPassword": "currentPassword",
  "newPassword": "newmin8chars"
}
```

| Field             | Type   | Required | Notes                                         |
|-------------------|--------|----------|-----------------------------------------------|
| `currentPassword` | string | Yes      | Must match current stored hash                |
| `newPassword`     | string | Yes      | Min 8 characters; must differ from current    |

**Response 200**

```json
{ "message": "Password changed successfully" }
```

**Error responses**

| Status | Reason                                      |
|--------|---------------------------------------------|
| 400    | Current password is incorrect               |
| 400    | New password must differ from current       |
| 401    | Not authenticated                           |
| 404    | User not found                              |
| 422    | Validation failed                           |

---

## Shared validation schemas (`src/lib/validations/teacher.ts`)

### `createTeacherSchema`

Used by `POST /api/admin/teachers`.

### `updateTeacherSchema`

`createTeacherSchema` without `email` and `password`, all fields optional. Used by `PUT /api/admin/teachers/[id]`.

### `resetPasswordSchema`

`{ newPassword: string (min 8) }`. Used by `POST /api/admin/teachers/[id]/reset-password`.

### `changePasswordSchema`

`{ currentPassword: string, newPassword: string (min 8) }`. Used by `POST /api/teacher/change-password`.

---

## Helper utilities (`src/lib/api-helpers.ts`)

### `requireAdmin()`

Validates session and asserts `role === 'ADMIN'`. Returns `{ session }` on success or `{ error: NextResponse }` on failure.

### `requireAuth()`

Validates session exists (any role). Returns `{ session }` on success or `{ error: NextResponse }` on failure.

**Usage pattern in route handlers:**

```ts
const { session, error } = await requireAdmin()
if (error) return error
// session is guaranteed to be defined here
```
