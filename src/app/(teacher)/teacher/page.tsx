'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Profile {
  fullName: string
  department: string
  teachingSince: number
  isPartyMember: boolean
  dateOfBirth: string | null
  partyJoinDate: string | null
}

interface Stats {
  totalSkkn: number
  unusedSkkn: number
  totalYears: number
}

export default function TeacherProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/teacher/achievements')
        if (!res.ok) return
        const data = await res.json()
        const unusedSkkn = data.skkns.filter((s: { status: string }) => s.status === 'UNUSED').length
        setStats({
          totalSkkn: data.skkns.length,
          unusedSkkn,
          totalYears: data.yearlyRecords.length,
        })
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }

    async function loadProfile() {
      try {
        const res = await fetch('/api/teacher/profile')
        if (res.ok) {
          const data = await res.json()
          setProfile(data)
        }
      } catch {
        // ignore
      }
    }

    loadProfile()
    load()
  }, [])

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Hồ sơ của tôi</h2>
        <p className="text-sm text-gray-500 mt-1">{session?.user?.email}</p>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Thông tin cá nhân</h3>
        {loading ? (
          <p className="text-sm text-gray-500">Đang tải...</p>
        ) : profile ? (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Họ tên</dt>
              <dd className="text-sm text-gray-900 font-medium">{profile.fullName}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Tổ chuyên môn</dt>
              <dd className="text-sm text-gray-900">{profile.department}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Năm vào nghề</dt>
              <dd className="text-sm text-gray-900">{profile.teachingSince}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Đảng viên</dt>
              <dd className="text-sm text-gray-900">{profile.isPartyMember ? 'Có' : 'Không'}</dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-gray-500">Chưa có thông tin hồ sơ</p>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.totalYears}</p>
            <p className="text-xs text-gray-500 mt-1">Năm học đã nhập</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.totalSkkn}</p>
            <p className="text-xs text-gray-500 mt-1">SKKN tổng cộng</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.unusedSkkn}</p>
            <p className="text-xs text-gray-500 mt-1">SKKN chưa dùng</p>
          </div>
        </div>
      )}

      <div>
        <Link
          href="/teacher/achievements"
          className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded hover:bg-blue-700 text-sm font-medium transition-colors"
        >
          Nhập thành tích →
        </Link>
      </div>
    </div>
  )
}
