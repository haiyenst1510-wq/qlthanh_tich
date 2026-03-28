import type { Metadata } from 'next'
import './globals.css'
import { SessionProvider } from 'next-auth/react'

export const metadata: Metadata = {
  title: 'Giáo Viên Thành Tích',
  description: 'Hệ thống quản lý thành tích giáo viên',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
