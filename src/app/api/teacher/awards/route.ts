import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireTeacher } from '@/lib/api-helpers'

const createSchema = z.object({
  type: z.enum(['CERTIFICATE', 'COMMENDATION']),
  issuingLevel: z.string().min(1, 'Cần ghi rõ cơ quan khen thưởng'),
  content: z.string().min(3, 'Nội dung khen thưởng quá ngắn'),
  year: z.string().regex(/^\d{4}$/, 'Năm phải có dạng YYYY'),
})

// POST /api/teacher/awards
export async function POST(request: NextRequest) {
  const { teacherProfile, error } = await requireTeacher()
  if (error) return error

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 422 })
  }

  const award = await db.award.create({
    data: { teacherId: teacherProfile.id, ...parsed.data },
  })

  return NextResponse.json(award, { status: 201 })
}
