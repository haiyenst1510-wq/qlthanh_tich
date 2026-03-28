import type { Metadata } from 'next'
import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}
