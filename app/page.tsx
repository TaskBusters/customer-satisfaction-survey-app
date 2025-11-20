"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

// Dynamically import the Vite app to avoid SSR issues
const App = dynamic(() => import("../src/App"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  ),
})

// Import styles
import "../src/index.css"
import "flowbite"

// Initialize i18n
import "../src/i18n/config.js"

export default function Page() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return <App />
}
