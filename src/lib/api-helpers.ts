import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function requireAdmin() {
  const session = await auth()
  if (!session) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  if (session.user.role !== 'ADMIN') return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  return { session }
}

export async function requireAuth() {
  const session = await auth()
  if (!session) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  return { session }
}

export async function requireTeacher() {
  const session = await auth()
  if (!session) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const teacherProfile = await db.teacherProfile.findUnique({
    where: { userId: session.user.id },
  })
  if (!teacherProfile) return { error: NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 }) }
  return { session, teacherProfile }
}
