import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireTeacher } from '@/lib/api-helpers'

// DELETE /api/teacher/awards/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { teacherProfile, error } = await requireTeacher()
  if (error) return error

  const award = await db.award.findUnique({ where: { id: params.id } })
  if (!award || award.teacherId !== teacherProfile.id) {
    return NextResponse.json({ error: 'Award not found' }, { status: 404 })
  }

  await db.award.delete({ where: { id: params.id } })
  return NextResponse.json({ message: 'Đã xóa khen thưởng' })
}
