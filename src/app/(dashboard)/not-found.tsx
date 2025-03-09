import Link from "next/link"
import { motion } from "framer-motion"

export default function DashboardNotFound() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[400px] flex items-center justify-center"
    >
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-6">
          <svg
            className="w-8 h-8 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Page Not Found
        </h3>
        <p className="text-gray-600 mb-6">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Return to Dashboard
        </Link>
      </div>
    </motion.div>
  )
}
