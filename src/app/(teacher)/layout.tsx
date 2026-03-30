'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

const navLinks = [
  { href: '/teacher', label: 'Hồ sơ' },
  { href: '/teacher/achievements', label: 'Thành tích' },
  { href: '/teacher/settings', label: 'Đổi mật khẩu' },
]

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()

  async function handleLogout() {
    await signOut({ redirect: false })
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-5 py-5 border-b border-gray-200">
          <h1 className="text-sm font-bold text-gray-900 leading-tight">
            Thành tích
            <br />
            <span className="text-blue-600">Giáo viên</span>
          </h1>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map((link) => {
            const isActive =
              link.href === '/teacher'
                ? pathname === '/teacher'
                : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-gray-200">
          {session?.user?.email && (
            <p className="text-xs text-gray-500 mb-3 truncate" title={session.user.email}>
              {session.user.email}
            </p>
          )}
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-red-600 hover:text-red-700 font-medium px-3 py-2 rounded-md hover:bg-red-50 transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <span className="text-sm text-gray-500">Cổng thông tin giáo viên</span>
        </header>
        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  )
}
