export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard Quản trị</h2>
        <p className="text-muted-foreground">
          Tổng quan hệ thống quản lý thành tích giáo viên
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-card rounded-lg border border-border">
          <h3 className="font-semibold">Giáo viên</h3>
          <p className="text-muted-foreground text-sm">Quản lý danh sách giáo viên</p>
        </div>
        <div className="p-6 bg-card rounded-lg border border-border">
          <h3 className="font-semibold">SKKN</h3>
          <p className="text-muted-foreground text-sm">Quản lý sáng kiến kinh nghiệm</p>
        </div>
        <div className="p-6 bg-card rounded-lg border border-border">
          <h3 className="font-semibold">Xét duyệt</h3>
          <p className="text-muted-foreground text-sm">Xét điều kiện danh hiệu</p>
        </div>
      </div>
    </div>
  )
}
