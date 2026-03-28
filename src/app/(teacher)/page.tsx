export default function TeacherDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard Giáo viên</h2>
        <p className="text-muted-foreground">
          Thông tin thành tích và hồ sơ cá nhân
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-card rounded-lg border border-border">
          <h3 className="font-semibold">Hồ sơ của tôi</h3>
          <p className="text-muted-foreground text-sm">Xem và cập nhật thông tin cá nhân</p>
        </div>
        <div className="p-6 bg-card rounded-lg border border-border">
          <h3 className="font-semibold">SKKN của tôi</h3>
          <p className="text-muted-foreground text-sm">Danh sách sáng kiến kinh nghiệm</p>
        </div>
      </div>
    </div>
  )
}
