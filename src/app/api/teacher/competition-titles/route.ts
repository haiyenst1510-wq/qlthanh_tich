import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireTeacher } from '@/lib/api-helpers'

const createSchema = z.object({
  yearlyRecordId: z.string().min(1),
  type: z.enum(['CHIEN_SI_THI_DUA', 'GV_GIOI', 'GV_CN_GIOI']),
  level: z.enum(['SCHOOL', 'DISTRICT', 'CITY']).nullable().optional(),
  achievementMethod: z.enum(['METHOD_1', 'METHOD_2']).nullable().optional(),
})

// POST /api/teacher/competition-titles
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

  // Verify yearlyRecord belongs to this teacher
  const record = await db.yearlyRecord.findUnique({ where: { id: parsed.data.yearlyRecordId } })
  if (!record || record.teacherId !== teacherProfile.id) {
    return NextResponse.json({ error: 'Yearly record not found' }, { status: 404 })
  }

  const title = await db.competitionTitle.create({
    data: {
      yearlyRecordId: parsed.data.yearlyRecordId,
      type: parsed.data.type,
      level: parsed.data.level ?? null,
      achievementMethod: parsed.data.achievementMethod ?? null,
    },
  })

  return NextResponse.json(title, { status: 201 })
}
