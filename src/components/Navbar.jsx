import { Link, useLocation } from 'react-router-dom'
import { QrCode, UserPlus, ScanLine } from 'lucide-react'

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-violet-600 rounded-lg flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">QR Register</span>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              to="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/' ? 'bg-violet-50 text-violet-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Register
            </Link>
            <Link
              to="/validate"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/validate' ? 'bg-violet-50 text-violet-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ScanLine className="w-4 h-4" />
              Validate
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
