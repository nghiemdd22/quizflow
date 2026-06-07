import React from 'react'
import { BookOpen } from 'lucide-react'

interface NavbarProps {
  isHeaderVisible: boolean
  isLoggedIn: boolean
  userEmail: string
  role: string | null
  onLogout: () => void
  onOpenLogin: () => void
  onOpenSignup: () => void
  currentView: 'landing' | 'teacher-dashboard'
  setCurrentView: (view: 'landing' | 'teacher-dashboard') => void
}

export const Navbar: React.FC<NavbarProps> = ({
  isHeaderVisible,
  isLoggedIn,
  userEmail,
  role,
  onLogout,
  onOpenLogin,
  onOpenSignup,
  currentView,
  setCurrentView
}) => {
  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${isHeaderVisible ? 'translate-y-0' : '-translate-y-[calc(100%+20px)]'}`}>
      <div className="w-full max-w-7xl mx-auto px-4 pt-6">
        <nav className="bg-white neo-card neo-header-hover px-6 py-4 flex items-center justify-between">
          {/* Logo Quizflow */}
          <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('landing'); }} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-neo-coral flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] group-hover:shadow-[3px_3px_0px_#0f172a] transition-all">
              <BookOpen className="text-white w-5 h-5" strokeWidth={3} />
            </div>
            <span className="text-2xl font-extrabold tracking-tight">Quizflow</span>
          </a>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center gap-8 font-bold text-sm">
            {currentView === 'landing' ? (
              <>
                <a href="#courses" className="hover:text-neo-green transition-colors">Courses</a>
                <a href="#why-choose" className="hover:text-neo-blue transition-colors">Teachers</a>
                <a href="#cta" className="hover:text-neo-purple transition-colors">Pricing</a>
                <a href="#footer" className="hover:text-neo-coral transition-colors">About</a>
              </>
            ) : (
              <span className="text-slate-500 font-extrabold">Teacher Dashboard</span>
            )}
          </div>

          {/* Auth Controls */}
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                {role === 'TEACHER' && currentView === 'landing' && (
                  <button
                    onClick={() => setCurrentView('teacher-dashboard')}
                    className="px-4 py-2 text-xs neo-btn bg-blue-100 hover:bg-blue-200 text-blue-800"
                  >
                    Teacher Dashboard
                  </button>
                )}
                {role === 'TEACHER' && currentView === 'teacher-dashboard' && (
                  <button
                    onClick={() => setCurrentView('landing')}
                    className="px-4 py-2 text-xs neo-btn bg-slate-100 hover:bg-slate-200 text-slate-800"
                  >
                    Home
                  </button>
                )}
                <span className="text-xs font-mono bg-slate-100 border-2 border-slate-900 px-2 py-1 rounded-md font-bold">
                  {userEmail}
                </span>
                <button
                  onClick={onLogout}
                  className="px-4 py-2 text-xs neo-btn bg-red-100 hover:bg-red-200 text-red-700"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={onOpenLogin}
                  className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-900 text-sm neo-btn"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={onOpenSignup}
                  className="px-5 py-2.5 bg-neo-green hover:bg-neo-green-hover text-white text-sm neo-btn"
                >
                  Đăng ký
                </button>
              </>
            )}
          </div>
        </nav>
      </div>
    </div>
  )
}
