"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { motion } from "framer-motion"
import {
  HomeIcon,
  CalendarIcon,
  FolderIcon,
  CogIcon,
  UsersIcon,
  MusicalNoteIcon,
  ComputerDesktopIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Sessions", href: "/dashboard/sessions", icon: CalendarIcon },
  { name: "Projects", href: "/dashboard/projects", icon: FolderIcon },
  { name: "Equipment", href: "/dashboard/equipment", icon: ComputerDesktopIcon },
  { name: "Clients", href: "/dashboard/clients", icon: UsersIcon },
  { name: "Studio", href: "/dashboard/studio", icon: MusicalNoteIcon },
  { name: "Settings", href: "/dashboard/settings", icon: CogIcon },
]

export function Navigation() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Sidebar for desktop */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <h1 className="text-xl font-bold text-indigo-600">Studio Manager</h1>
            </div>
            <nav className="mt-5 flex-1 space-y-1 bg-white px-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-6 w-6 flex-shrink-0 ${
                        isActive
                          ? "text-indigo-600"
                          : "text-gray-400 group-hover:text-gray-500"
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
            <button
              onClick={() => signOut()}
              className="group flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
            >
              <ArrowLeftOnRectangleIcon
                className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                aria-hidden="true"
              />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <div className="fixed inset-0 z-40 flex">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: isMobileMenuOpen ? 0 : "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative flex w-full max-w-xs flex-1 flex-col bg-white"
          >
            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
              <div className="flex flex-shrink-0 items-center px-4">
                <h1 className="text-xl font-bold text-indigo-600">Studio Manager</h1>
              </div>
              <nav className="mt-5 flex-1 space-y-1 bg-white px-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                        isActive
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <item.icon
                        className={`mr-4 h-6 w-6 flex-shrink-0 ${
                          isActive
                            ? "text-indigo-600"
                            : "text-gray-400 group-hover:text-gray-500"
                        }`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
            <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
              <button
                onClick={() => signOut()}
                className="group flex w-full items-center px-2 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
              >
                <ArrowLeftOnRectangleIcon
                  className="mr-4 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                  aria-hidden="true"
                />
                Sign Out
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="sticky top-0 z-10 bg-white md:hidden">
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
          <h1 className="text-xl font-bold text-indigo-600">Studio Manager</h1>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {isMobileMenuOpen ? (
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </>
  )
}
