export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div
        data-testid="login-form"
        className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-md"
      >
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Đăng nhập</h1>
          <p className="text-muted-foreground">
            Hệ thống quản lý thành tích giáo viên
          </p>
        </div>
        <form className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              placeholder="email@truong.edu.vn"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Mật khẩu
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
          >
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  )
}
