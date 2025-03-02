import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <Header />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        {/* <main className="flex-1 min-h-[calc(100vh-4rem)]"> */}
        <main className="flex-1">
          <div className="px-4 py-6 h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}