import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireTeacher } from '@/lib/api-helpers'

// DELETE /api/teacher/competition-titles/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { teacherProfile, error } = await requireTeacher()
  if (error) return error

  const title = await db.competitionTitle.findUnique({
    where: { id: params.id },
    include: { yearlyRecord: true },
  })

  if (!title || title.yearlyRecord.teacherId !== teacherProfile.id) {
    return NextResponse.json({ error: 'Competition title not found' }, { status: 404 })
  }

  await db.competitionTitle.delete({ where: { id: params.id } })
  return NextResponse.json({ message: 'Đã xóa danh hiệu' })
}
