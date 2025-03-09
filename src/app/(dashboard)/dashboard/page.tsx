import { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = {
  title: "Dashboard | Recording Studio Management",
  description: "View your recording studio dashboard",
}

type UpcomingSession = {
  id: string
  title: string
  startTime: Date
}

type RecentProject = {
  id: string
  name: string
  status: string
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return null
  }

  // Fetch user's upcoming sessions
  const upcomingSessions = await prisma.session.findMany({
    where: {
      userId: session.user.id,
      startTime: {
        gte: new Date(),
      },
    },
    orderBy: {
      startTime: 'asc',
    },
    take: 5,
    select: {
      id: true,
      title: true,
      startTime: true,
    }
  }) as UpcomingSession[]

  // Fetch user's recent projects
  const recentProjects = await prisma.project.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: 5,
    select: {
      id: true,
      name: true,
      status: true,
    }
  }) as RecentProject[]

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Welcome to Your Dashboard</h2>
        <p className="text-gray-600">
          Manage your recording sessions, projects, and studio equipment all in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Sessions</h3>
          {upcomingSessions.length > 0 ? (
            <ul className="space-y-4">
              {upcomingSessions.map((session: UpcomingSession) => (
                <li key={session.id} className="border-b pb-4 last:border-0 last:pb-0">
                  <p className="font-medium text-gray-900">{session.title}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(session.startTime).toLocaleDateString()} at{" "}
                    {new Date(session.startTime).toLocaleTimeString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No upcoming sessions</p>
          )}
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Projects</h3>
          {recentProjects.length > 0 ? (
            <ul className="space-y-4">
              {recentProjects.map((project: RecentProject) => (
                <li key={project.id} className="border-b pb-4 last:border-0 last:pb-0">
                  <p className="font-medium text-gray-900">{project.name}</p>
                  <p className="text-sm text-gray-500">
                    Status: {project.status.toLowerCase()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No recent projects</p>
          )}
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <button className="p-4 text-left bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
            <h4 className="font-medium text-indigo-900">Book Session</h4>
            <p className="text-sm text-indigo-700">Schedule a new recording session</p>
          </button>
          <button className="p-4 text-left bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <h4 className="font-medium text-green-900">New Project</h4>
            <p className="text-sm text-green-700">Start a new recording project</p>
          </button>
          <button className="p-4 text-left bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <h4 className="font-medium text-purple-900">View Equipment</h4>
            <p className="text-sm text-purple-700">Check available studio equipment</p>
          </button>
        </div>
      </div>
    </div>
  )
}
