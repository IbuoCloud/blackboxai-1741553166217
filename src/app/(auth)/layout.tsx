import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentication | Recording Studio Management",
  description: "Authentication pages for the recording studio management system",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  )
}
