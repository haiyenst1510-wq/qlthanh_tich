# Quản lý Thành tích Giáo viên

Ứng dụng web nội bộ quản lý thành tích thi đua giáo viên.

## Local Development

### Prerequisites
- Node.js 20+ (xem `.nvmrc`)
- Docker & Docker Compose (cho local PostgreSQL)

### Setup

1. Clone repo và cài dependencies:
```bash
npm install
```

2. Khởi động PostgreSQL local:
```bash
docker-compose up -d
```

3. Cấu hình environment:
```bash
cp .env.local.example .env.local
# Chỉnh sửa .env.local nếu cần
```

4. Chạy migrations và seed:
```bash
npx prisma migrate dev
npm run db:seed
```

5. Chạy dev server:
```bash
npm run dev
```

Mở http://localhost:3000 — login với `admin@school.edu.vn` / `Admin@123`

## Production

Deploy trên Vercel + Supabase. Xem `docs/technical/ARCHITECTURE.md` để biết thêm.
