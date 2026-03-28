/**
 * prisma/seed.ts — Seed data ban đầu
 *
 * Chạy: npx prisma db seed
 * Hoặc: ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
 *
 * Seed bao gồm:
 *   - 1 Admin user
 *   - 2 Teacher users + TeacherProfile
 *   - 2 EligibilityRule mẫu
 *   - Vài SKKN mẫu cho GV1
 */

import { PrismaClient, SKKNLevel, SKKNStatus } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Bắt đầu seed data...')

  // ---------------------------------------------------------------------------
  // 1. Admin user
  // ---------------------------------------------------------------------------
  const adminPassword = await hash('Admin@123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@school.edu.vn' },
    update: {},
    create: {
      email: 'admin@school.edu.vn',
      passwordHash: adminPassword,
      role: 'ADMIN',
      isActive: true,
    },
  })
  console.log(`  ✓ Admin: ${admin.email}`)

  // ---------------------------------------------------------------------------
  // 2. Teacher 1
  // ---------------------------------------------------------------------------
  const teacherPassword = await hash('Teacher@123', 12)

  const teacher1User = await prisma.user.upsert({
    where: { email: 'gv1@school.edu.vn' },
    update: {},
    create: {
      email: 'gv1@school.edu.vn',
      passwordHash: teacherPassword,
      role: 'TEACHER',
      isActive: true,
    },
  })

  const teacher1Profile = await prisma.teacherProfile.upsert({
    where: { userId: teacher1User.id },
    update: {},
    create: {
      userId: teacher1User.id,
      fullName: 'Nguyễn Thị Lan',
      dateOfBirth: new Date('1985-03-15'),
      department: 'Tổ Toán - Tin',
      teachingSince: 2008,
      isPartyMember: true,
      partyJoinDate: new Date('2012-06-15'),
    },
  })
  console.log(`  ✓ GV1: ${teacher1User.email} (${teacher1Profile.fullName})`)

  // ---------------------------------------------------------------------------
  // 3. Teacher 2
  // ---------------------------------------------------------------------------
  const teacher2User = await prisma.user.upsert({
    where: { email: 'gv2@school.edu.vn' },
    update: {},
    create: {
      email: 'gv2@school.edu.vn',
      passwordHash: teacherPassword,
      role: 'TEACHER',
      isActive: true,
    },
  })

  const teacher2Profile = await prisma.teacherProfile.upsert({
    where: { userId: teacher2User.id },
    update: {},
    create: {
      userId: teacher2User.id,
      fullName: 'Trần Văn Minh',
      dateOfBirth: new Date('1990-07-22'),
      department: 'Tổ Ngữ văn - Tiếng Anh',
      teachingSince: 2014,
      isPartyMember: false,
      partyJoinDate: null,
    },
  })
  console.log(`  ✓ GV2: ${teacher2User.email} (${teacher2Profile.fullName})`)

  // ---------------------------------------------------------------------------
  // 4. SKKN mẫu cho GV1
  // ---------------------------------------------------------------------------
  const skkn1 = await prisma.sKKN.create({
    data: {
      teacherId: teacher1Profile.id,
      title: 'Ứng dụng GeoGebra trong dạy học Hình học lớp 10',
      level: SKKNLevel.SCHOOL,
      rating: 'Tốt',
      academicYear: '2022-2023',
      status: SKKNStatus.UNUSED,
    },
  })

  const skkn2 = await prisma.sKKN.create({
    data: {
      teacherId: teacher1Profile.id,
      title: 'Phương pháp dạy học phân hóa trong môn Toán THPT',
      level: SKKNLevel.DISTRICT,
      rating: 'Xuất sắc',
      academicYear: '2023-2024',
      status: SKKNStatus.UNUSED,
    },
  })

  const skkn3 = await prisma.sKKN.create({
    data: {
      teacherId: teacher1Profile.id,
      title: 'Tích hợp tư duy lập trình vào giảng dạy Toán học',
      level: SKKNLevel.SCHOOL,
      rating: 'Khá',
      academicYear: '2024-2025',
      status: SKKNStatus.UNUSED,
    },
  })

  console.log(`  ✓ SKKN GV1: ${skkn1.title}`)
  console.log(`  ✓ SKKN GV1: ${skkn2.title}`)
  console.log(`  ✓ SKKN GV1: ${skkn3.title}`)

  // ---------------------------------------------------------------------------
  // 5. EligibilityRule — "Chiến sĩ thi đua cơ sở" (CSTĐCS)
  //
  // Điều kiện: Hoàn thành tốt nhiệm vụ (HTXS hoặc HTTốt — tức TaskResult
  // EXCELLENT hoặc GOOD) + ít nhất 1 SKKN chưa dùng trong 2 năm gần nhất.
  // Áp dụng Cách 2 (METHOD_2).
  // Căn cứ pháp lý: Nghị định 91/2017/NĐ-CP.
  // ---------------------------------------------------------------------------
  const ruleCSTD = await prisma.eligibilityRule.upsert({
    where: { id: 'rule-cstd-co-so' },
    update: {},
    create: {
      id: 'rule-cstd-co-so',
      targetTitle: 'Chiến sĩ thi đua cơ sở',
      isActive: true,
      conditions: [
        {
          type: 'TASK_RESULT',
          minCount: 1,
          statusRequired: 'ANY',
          yearConstraint: { type: 'CURRENT_YEAR' },
          consumeAfterEval: false,
          legalNote: 'Hoàn thành tốt nhiệm vụ (GOOD hoặc EXCELLENT) trong năm xét',
        },
        {
          type: 'SKKN',
          minCount: 1,
          statusRequired: 'UNUSED',
          yearConstraint: { type: 'WITHIN_N_YEARS', n: 2 },
          consumeAfterEval: true,
          legalNote:
            'Cách 2: Có 1 SKKN cấp trường trở lên chưa sử dụng trong 2 năm học gần nhất. Căn cứ: Nghị định 91/2017/NĐ-CP Điều 25',
        },
      ],
    },
  })
  console.log(`  ✓ EligibilityRule: ${ruleCSTD.targetTitle}`)

  // ---------------------------------------------------------------------------
  // 6. EligibilityRule — "Bằng khen UBND Thành phố"
  //
  // Điều kiện: Có 2 SKKN chưa dùng trong 2 năm liền kề (năm xét và năm
  // trước), consumeAfterEval = true (SKKN bị đánh dấu USED sau khi xét).
  // Căn cứ pháp lý: Nghị định 91/2017/NĐ-CP, Thông tư 12/2019/TT-BNV.
  // ---------------------------------------------------------------------------
  const ruleBangKhen = await prisma.eligibilityRule.upsert({
    where: { id: 'rule-bang-khen-ubnd-tp' },
    update: {},
    create: {
      id: 'rule-bang-khen-ubnd-tp',
      targetTitle: 'Bằng khen UBND Thành phố',
      isActive: true,
      conditions: [
        {
          type: 'SKKN',
          minCount: 2,
          statusRequired: 'UNUSED',
          yearConstraint: { type: 'WITHIN_N_YEARS', n: 2 },
          consumeAfterEval: true,
          legalNote:
            'Phải có 2 SKKN cấp trường trở lên chưa sử dụng trong 2 năm học liền kề. Căn cứ: Nghị định 91/2017/NĐ-CP Điều 72, Thông tư 12/2019/TT-BNV',
        },
        {
          type: 'COMPETITION_TITLE',
          minCount: 2,
          statusRequired: 'ANY',
          yearConstraint: { type: 'WITHIN_N_YEARS', n: 2 },
          consumeAfterEval: false,
          legalNote:
            'Đạt danh hiệu Chiến sĩ thi đua cơ sở hoặc GV Giỏi ít nhất 2 năm trong 2 năm liền kề',
        },
      ],
    },
  })
  console.log(`  ✓ EligibilityRule: ${ruleBangKhen.targetTitle}`)

  console.log('\n✅ Seed hoàn tất!')
  console.log('\nTài khoản mặc định:')
  console.log('  Admin:    admin@school.edu.vn  /  Admin@123')
  console.log('  GV1:      gv1@school.edu.vn    /  Teacher@123')
  console.log('  GV2:      gv2@school.edu.vn    /  Teacher@123')
}

main()
  .catch((e) => {
    console.error('❌ Seed thất bại:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
